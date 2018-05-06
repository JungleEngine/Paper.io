"use strict";

// Database.
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('paperio');

// Express server.
var express = require('express');
var app = express();
var server = require('http').Server(app);

var async = require('async');
var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket'] })(server);

server.listen(14445);

var n_test_case = 0;
// Send game page for client.
app.use(express.static('public'));

var playerID = [];
var rooms = {};
// variable used to calculate players positions
// should be removed
var x = 2;

// Changes when game starts.
var game_started = false;
const room_capacity = 3; //TODO: use this..
const speed = 5; // blocks/sec
const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;
var max_available_ID = 30;
var GamePaused = false;

 function checkCredentials(data, socket)
{

    let room_name = data.room_name;
    db.serialize(function() {

        db.get("SELECT rowid AS id, username, password FROM users " +
            "where username = '"+data.username +"' and password = '" + data.password+"'", function(error, row) {
            if (row !== undefined) {

                console.log("valid player");
                // Add player in room.
                let player_parameters = addPlayer(room_name,data.username, socket.id);

                // Join new room.
                socket.join(room_name);

                // Leave his own room.
                socket.leave(socket.id);

                // Send initial parameters to connected Client
                socket.emit("initialize_game", player_parameters);
            }

            else {
                socket.emit("wrong_credentials", {"message":" wrong username or password"});
                return false;

            }

    });


    });

}

io.on('connection', (socket) => {


    socket.on('join_room', (data) => {


        //console.log(io.nsps['/'].adapter.rooms[data]);

        // CheckCredentials., return if not authorized to login.
       checkCredentials(data, socket);



    });

    socket.onclose = function(reason) {
        //console.log(socket.id);
        //console.log(reason);
        let rooms_keys = Object.keys(socket.rooms);
        //console.log("Player disconnected ", rooms_keys[rooms_keys.length - 1]);
        // console.log(rooms_keys);
        removeDeadPlayer(rooms_keys[rooms_keys.length - 1], socket.id);
        //console.log(socket.adapter.sids[socket.id]);
        Object.getPrototypeOf(this).onclose.call(this, reason);
    };

    socket.on('disconnect', (data) => {
        //console.log("on disconnect");
    });

    socket.on('pause', () => {
        GamePaused = !GamePaused;
    });

    socket.on('player_ready_to_be_simulated',(data)=>{
        console.log("player ready to be simulated");

        let rooms_keys = Object.keys(socket.rooms);
        let room_name = rooms_keys[rooms_keys.length - 1];
        let player = rooms[rooms_keys[rooms_keys.length - 1]].players[socket.id];
        rooms[rooms_keys[rooms_keys.length - 1]].players[socket.id].read_to_be_simulated = true;
        player.username = data.username;
        sendNewPlayerToRoom(room_name, player);


    });
    socket.on('validate', (dir) => {

        let new_dir_x = dir.player_dir[0];
        let new_dir_y = dir.player_dir[1];
        let rooms_keys = Object.keys(socket.rooms);
        let player = rooms[rooms_keys[rooms_keys.length - 1]].players[socket.id];

        if (player == null) {
            console.log("unknown player sending a message, either dead player or hacking");
            return;
        }
        //console.log("Key pressed: ", new_dir_x, new_dir_y);
        //console.log("Player that pressed key: ", player);

        //if x==0 && new_x == -1 || new_x ==1 && new_y==0   moving vertically and new dir = moving horizontally
        //if y==0 && new_y == -1 || new_y ==1 && new_x==0   moving horizontally and new dir = moving vertically
        if ((player.dir_x == 0 && (new_dir_x == 1 || new_dir_x == -1) && new_dir_y == 0) ||
            (player.dir_y == 0 && (new_dir_y == 1 || new_dir_y == -1) && new_dir_x == 0)) {

            //console.log("x : ", new_dir_x, " , y : ", new_dir_y);

            player.next_dir_x = new_dir_x;
            player.next_dir_y = new_dir_y;
            player.new_key = true;

            // Calculate fix position
            let fix_pos = getFixPosition(player.pos_x, player.pos_y, player.dir_x, player.dir_y);
            player.fix_pos_x = fix_pos.x;
            player.fix_pos_y = fix_pos.y;

            // If action is valid send it to everyone
            let room_name = socket.rooms[Object.keys(socket.rooms)[Object.keys(socket.rooms).length - 1]];
            io.to(room_name).emit('player_key_press', {
                "player_ID": player.ID,
                "player_next_dir": dir,
                "player_pos": [player.pos_x, player.pos_y],
                "player_fix_pos": [player.fix_pos_x, player.fix_pos_y]
            });
        } else {

        }
    });

});

// Find empty block for player
function getEmptySpaceForNewPlayer(grid) {

    let valid_pos = true;

    for (let i = grid_start+6; i < grid_end-6; i++) {
        for (let j = grid_start+6; j < grid_end-6; j++) {
            valid_pos = true;
            for(let x = i-4; x<i+4; x++)
            {
                for(let y = j-4; y<j+4; y++)
                {

                    if(grid[x][y][0]!==0)
                    {

                        valid_pos = false;
                        break;
                        console.log(" value ", grid[x][y]);

                    }

                }
                if(!valid_pos)
                {
                    break;
                }

            }
            if(valid_pos)
            {

                return {"x":i, "y":j};
            }

        }

    }

    return {"x":-1,"y":-1};

}

/**
 * Initialize new position for new connected player.
 *
 * @param room_name
 * @param socket_id
 * @returns New player's data
 */
function setInitialParametersForNewPlayer(room_name, socket_id) {

    //TODO: Generate new position for player by knowing his room.

    let player_data = {};


    let map = rooms[room_name].players;
    let number_of_players = map.size;

    // console.log("ZZZZ", number_of_players);

    //TODO: Find position for new player
    let empty_pos_to_place_player = getEmptySpaceForNewPlayer(rooms[room_name].grid);
    console.log(" pos ", empty_pos_to_place_player);

    // No empty place to place the player.
    if(empty_pos_to_place_player.x === -1 || empty_pos_to_place_player.y === -1)
    {

        console.log(" no place to place the players");
       player_data.pos_x = 70;
       player_data.pos_y = 70;

    }
    else
    {
        player_data.pos_x = empty_pos_to_place_player.x;
        player_data.pos_y = empty_pos_to_place_player.y;

    }
    player_data.last_dir = {"x":1, "y":0};
    player_data.dir_x = 1;
    player_data.dir_y = 0;
    player_data.next_dir_x = 1;
    player_data.next_dir_y = 0;
    player_data.ID = rooms[room_name].next_available_ID;
    player_data.read_to_be_simulated = false;
    // Update next available ID in this room.
        rooms[room_name].next_available_ID += 4;

    player_data.fix_pos_x = 0;
    player_data.fix_pos_y = 0;
    player_data.was_on_his_area = true;

    // For filling.
    player_data.record_path = false;
    player_data.filled = false;
    player_data.path_vector = [];
    player_data.last_position_on_grid = {"x":0, "y":0};

    // Set initial 3 cells for player
    for (let i = player_data.pos_x - 1; i <= player_data.pos_x + 1; i++) {
        for (let j = player_data.pos_y - 1; j <= player_data.pos_y + 1; j++) {
            rooms[room_name].grid[i][j][0] = player_data.ID + 2;
            if (player_data.ID == null)
                console.log("here !!!");
        }
    }

    // Insert player in the room players
    rooms[room_name].players[socket_id] = player_data;

    return player_data;
}

/**
 * Create new room with new grid and insert new player in it.
 *
 * @param room_name
 * @param socket_id
 * @returns New player ID
 */
function initNewRoom(room_name, socket_id) {

    //TODO:create a grid for each room
    var grid = [];

    // Initialize the grid with zeros.
    for (let i = 0; i < canvas_length; ++i) {

        grid[i] = [];
        for (let j = 0; j < canvas_length; ++j) {

            grid[i][j] = [];
            grid[i][j][0] = 0;
            grid[i][j][1] = 0;

        }

    }

    // Place game borders in grid.
    let border_start = grid_start - 1;
    let border_end = grid_end + 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[i][border_start][0] = 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[i][border_end][0] = 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[border_start][i][0] = 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[border_end][i][0] = 1;


    // Create new room.
    rooms[room_name] = {};

    // Initialize empty players array.
    rooms[room_name].players = [];

    // Insert the new grid in the room.
    rooms[room_name].grid = grid;

    // Next available ID.
    rooms[room_name].next_available_ID = 2;

    if(!game_started)
    {
        game_started = true;
        async.forever(
            function(next) {
                if (GamePaused == false)

                    try{

                    simulate();}
                    catch(exception)
                    {

                    }

                setTimeout(function() {
                    next();
                }, 30)
            },
            function(error) {
                console.log(error);
            }
        );

    }
    // Insert player in the room.
    return setInitialParametersForNewPlayer(room_name, socket_id);
}

/**
 * Insert new player in room and notify other room players.
 *
 * @param room_name
 * @param socket_id
 * @returns New player ID
 */
function updateCurrentRoom(room_name, socket_id) {

    //TODO: Send new player to players in the room

    // Insert player in the room.
    return setInitialParametersForNewPlayer(room_name, socket_id);
}

function sendNewPlayerToRoom(room_name, player_data) {
    console.log(" new player ");
    io.to(room_name).emit('new_player', player_data);
}

/**
 * Adds player in existing room or create new room and insert the player in it
 *
 * @param room_name
 * @param username
 * @param socket_id
 */
function addPlayer(room_name,username, socket_id) {

    // Initial parameters to be sent to new player.
    let player_parameters = {};
        player_parameters.username = username;

    // If room does not exist, create new room.
    if (!io.nsps['/'].adapter.rooms[room_name]) {
        let player_data = initNewRoom(room_name, socket_id);
        player_parameters.player_id = player_data.ID;
        player_parameters.grid = rooms[room_name].grid;
        player_parameters.username = username;

    } else {
        let player_data = updateCurrentRoom(room_name, socket_id);
        player_parameters = Object.assign({}, player_data);
        player_parameters.player_id = player_data.ID;
        player_parameters.username = username;
        player_parameters.grid = rooms[room_name].grid;
    }


    // Make array of players to be sent to the client.
    let players = [];
    let map = rooms[room_name].players;
    for (let key of Object.keys(map)) {
        players.push(map[key]);
    }
    player_parameters.players = players;

    return player_parameters;
}

/**
 * Simulates players actions and movements in the room
 * TODO: Make this function general for each room
 *
 * Player attributes:
 * 1 = ID
 * 2 = Tail
 * 3 = Block
 * 4 = Shadow
 *
 * @param room_name
 */


function MoveOnCells(delta, last_pos_x_or_y, last_pos, player_pos, player, indx, room_name) {


    let cell;
    let xx;
    let yy;

    while (delta > 0) {
        let head = {};



        let indexI;
        let indexJ;
        let tailPos;
        //console.log("Last pos X: ", last_pos.x, "Dir_x: ", player.dir_x, "---------");
        if (player.dir_x != 0) {
            tailPos = { "x": last_pos_x_or_y, "y": player.pos_y };
            indexI = Math.round(last_pos_x_or_y + (0.5 * player.dir_x));
            indexJ = Math.round(player.pos_y + (0.5 * player.dir_y));
            // cell = rooms[room_name].grid[Math.round(last_pos_x_or_y + (0.5 * player.dir_x))][Math.round(player.pos_y + (0.5 * player.dir_y))];
        } else {
            tailPos = { "x": player.pos_x, "y": last_pos_x_or_y };
            indexI = Math.round(player.pos_x + (0.5 * player.dir_x));
            indexJ = Math.round(last_pos_x_or_y + (0.5 * player.dir_y));
            // cell = rooms[room_name].grid[Math.round(player.pos_x + (0.5 * player.dir_x))][Math.round(last_pos_x_or_y + (0.5 * player.dir_y))];
        }


        // Put tail in the back
        //TODO: I think this should be removed so that we wouldn't put a tail if the player died this may result in conflict
        let player_pos_on_grid = getPlayerPositionOnGrid(player, tailPos);
        xx = player_pos_on_grid.x;
        yy = player_pos_on_grid.y;
        if (rooms[room_name].grid[xx][yy][0] != player.ID + 2) {
            rooms[room_name].grid[xx][yy][0] = player.ID + 1;
        }

        // Change position according to moving direction
        if (delta > 1) {
            if (player_pos > last_pos_x_or_y) {
                last_pos_x_or_y++;

            } else {
                last_pos_x_or_y--;
            }
        }


        head.x = tailPos.x + (0.5 * player.dir_x);
        head.y = tailPos.y + (0.5 * player.dir_y);
        if (Math.round(head.x) === player.fix_pos_x && Math.round(head.y) === player.fix_pos_y) {
            return ;
        }
        if (rooms[room_name].grid[indexI][indexJ][0] == 1) { // Border
            // Dies
                console.log("Player hit border!!");
                removeDeadPlayer(room_name, indx);
                return false;

        } else if (rooms[room_name].grid[indexI][indexJ][0] == player.ID + 1) { // Own tail
            // Dies

            //to ensure that the player isn't right on the border of another cell so that he doesn't step on his own tail left behind
            if ((player.dir_x != 0 && tailPos.x != Math.round(tailPos.x)) || (player.dir_y != 0 && tailPos.y != Math.round(tailPos.y))) {

                console.log("Player stepped on his own tail!!");
                removeDeadPlayer(room_name, indx);
                return false;
            }


        } else if (rooms[room_name].grid[indexI][indexJ][0] == player.ID + 2) { // Own block
            //TODO: Fill path
        } else if (rooms[room_name].grid[indexI][indexJ][0] == 0 || rooms[room_name].grid[indexI][indexJ][0] % 4 == 0) { // Empty || block


        } else if (rooms[room_name].grid[indexI][indexJ][0] != player.ID) {
            let killedPlayerID;
            if (rooms[room_name].grid[indexI][indexJ][0] % 4 == 2) //other player id
            {
                killedPlayerID = rooms[room_name].grid[indexI][indexJ][0];
            } else {

                killedPlayerID = rooms[room_name].grid[indexI][indexJ][0] - 1;
            }
            console.log("player killed someone or himself and we effed up");
            // Kill
            // console.log(rooms[room_name].grid[indexI][indexJ][0]);
            //console.log(rooms[room_name].grid[indexI][indexJ][0]);
            removeDeadPlayer(room_name, getSocketIDfromPlayerID(killedPlayerID, room_name));
            // if (delta < 1) {
            //     rooms[room_name].grid[indexI][indexJ][0] = player.ID;
            // }
        }
        delta--;
    }
    return {"x":xx, "y":yy};
}

// Filling.
function tryToFill(room_name, socket_ID, player_pos_on_grid_x, player_pos_on_grid_y) {

    n_test_case +=1;
    if(n_test_case>=3)
    {
        let sa  = 3;
        console.log(sa);
    }
    else {
        console.log("test cases , ",n_test_case);
    }
    let player = rooms[room_name].players[socket_ID];

    // if (player.filled)
    //     return;

    //TODO:create a grid for each room
    let visited = [];

    // Initialize the grid with zeros.
    for (let i = 0; i < canvas_length; ++i) {
        visited[i] = [];
        for (let j = 0; j < canvas_length; ++j) {
            visited[i][j] = 0;
        }
    }
    rooms[room_name].players[socket_ID].filled = true;
    let path = isConnectedPath(visited, room_name, player, player_pos_on_grid_x, player_pos_on_grid_y);

    return path;

}

function isConnectedPath(visited, room_name, player, player_pos_on_grid_x, player_pos_on_grid_y) {


    let delta_x = [0, 1, -1, 0];
    let delta_y = [1, 0, 0, -1];
    let queue = [];
    let pos_on_grid = {"x":player_pos_on_grid_x, "y":player_pos_on_grid_y};
    let curr_node = pos_on_grid;

    queue.push(pos_on_grid);
    visited[curr_node.x][curr_node.y] = 1;

    let parent = new Map();

    while (queue.length > 0) {

        curr_node = queue.shift();

        let last = player.last_position_on_grid;

        if (curr_node.x === last.x && curr_node.y === last.y) {
            let path = [];
            path.push(curr_node);

            while (!(curr_node.x ===pos_on_grid.x && curr_node.y === pos_on_grid.y )) {

                path.push(parent[[curr_node.x, curr_node.y]]);
                curr_node = parent[[curr_node.x, curr_node.y]];

            }
            path.push(curr_node);
            return path;
        }

        for (let i = 0; i < delta_x.length; i++) {
            // TODO:: replace true
            if (visited[curr_node.x + delta_x[i]][curr_node.y + delta_y[i]] === 0 && true) {

                if (rooms[room_name].grid[curr_node.x + delta_x[i]][curr_node.y + delta_y[i]][0] === player.ID + 2
                ) {

                    visited[curr_node.x + delta_x[i]][curr_node.y + delta_y[i]] = 1;


                    // if(parent[curr_node.x + delta_x[i]]==null)
                    //     parent[curr_node.x + delta_x[i]]=[];

                    parent[[curr_node.x + delta_x[i], curr_node.y + delta_y[i]]] = curr_node;

                    queue.push({"x":curr_node.x + delta_x[i], "y":curr_node.y + delta_y[i]});


                }


            }
        }
    }
    return false;
}

// Check filling for every player.
// Store start and end position.
function checkFilling(room_name, player_pos_on_grid_x, player_pos_on_grid_y, player_ID, socket_ID) {

    let player = rooms[room_name].players[socket_ID];

    //
    // console.log(" player_pos.x : ",player_pos_on_grid_x, " pos.y : ", player_pos_on_grid_y);

    // console.log("grid : ", rooms[room_name].grid[player_pos_on_grid_x][player_pos_on_grid_y][0] );
    // console.log("dir.x : ",player.dir_x, "dir.y : ",player.dir_y);
    // console.log("grid of pos - dir : ",rooms[room_name].grid[player_pos_on_grid_x - player.dir_x][player_pos_on_grid_y - player.dir_y][0]);
    // Check if player left his own area.
    if(rooms[room_name].grid[player_pos_on_grid_x][player_pos_on_grid_y][0] === player_ID+2 && !player.record_path)
    {

        rooms[room_name].players[socket_ID].was_on_his_area = true;
        rooms[room_name].players[socket_ID].last_position_on_grid = {"x":player_pos_on_grid_x, "y":player_pos_on_grid_y};

    }
    if ((rooms[room_name].grid[player_pos_on_grid_x][player_pos_on_grid_y][0] !== player_ID + 2) &&
        (player.was_on_his_area)&& !player.record_path ) {

        console.log(" leaving his grid ");
        if(player.record_path)
            return;
        console.log("player leaved grid  & recorded path = false");

            // Should try to fill player area.


        // Player should record its path.
        rooms[room_name].players[socket_ID].record_path = true;



        // Record this step.
        if (typeof player.path_vector[player.last_position_on_grid.y] === 'undefined')
            rooms[room_name].players[socket_ID].path_vector[player.last_position_on_grid.y] = [];

        // Push player last position on grid.
        if (!player.path_vector[player.last_position_on_grid.y]
            .includes(player.last_position_on_grid.x))
            rooms[room_name].players[socket_ID].path_vector[player.last_position_on_grid.y]
                .push(player.last_position_on_grid.x);

        // Record this step.
        if (typeof player.path_vector[player_pos_on_grid_y] === 'undefined')
            rooms[room_name].players[socket_ID].path_vector[player_pos_on_grid_y] = [];

        // Push player position now.
        if (!player.path_vector[player_pos_on_grid_y].includes(player_pos_on_grid_x))
            rooms[room_name].players[socket_ID].path_vector[player_pos_on_grid_y].push(player_pos_on_grid_x);


    }

    // Check if player should fill his area.
    else if (rooms[room_name].grid[player_pos_on_grid_x][player_pos_on_grid_y][0] === player_ID + 2)  {

        if (!player.record_path)
            return;

        console.log("player is back to grid");

        rooms[room_name].players[socket_ID].record_path = false;
       // console.log("old path ", rooms[room_name].players[socket_ID].path_vector);
        // Should try to fill player area.
        let path =tryToFill(room_name, socket_ID, player_pos_on_grid_x, player_pos_on_grid_y);
        console.log(" bfs path : ", path);
        console.log("try to fill");
        rooms[room_name].players[socket_ID].record_path = false;

        // Record this step.
        if (typeof player.path_vector[player_pos_on_grid_y] === 'undefined')
            player.path_vector[player_pos_on_grid_y] = [];

        if (!player.path_vector[player_pos_on_grid_y].includes(player_pos_on_grid_x))
            player.path_vector[player_pos_on_grid_y].push(player_pos_on_grid_x);
        // console.log(" path vector ", players[i].path_vector);

        //console.log("path", path);

        for (let obj in path) {
            let pos_x = path[obj].x;
            let pos_y = path[obj].y;

            if (typeof player.path_vector[pos_y] === 'undefined')
                rooms[room_name].players[socket_ID].path_vector[pos_y] = [];

            if (!player.path_vector[pos_y].includes(pos_x))
                rooms[room_name].players[socket_ID].path_vector[pos_y].push(pos_x);

        }


        let object_to_send_to_players = [];
        // Filling.
        for (let y in player.path_vector) {

            let x_arr = player.path_vector[y];

            object_to_send_to_players.push(y);
            object_to_send_to_players.push(x_arr);

            let min_x;

            x_arr.sort();
            for (let tempx = 0; tempx < x_arr.length - 1; tempx += 2) {


                let min_x = Math.min(x_arr[tempx], x_arr[tempx + 1]);
                let max_x = Math.max(x_arr[tempx], x_arr[tempx + 1]);

                if (min_x === max_x - 1) {

                    rooms[room_name].grid[min_x][y][0] = player_ID + 2;
                    tempx--;
                    continue;

                }
                // Fill between two points.
                for (let curr_x = min_x; curr_x <= max_x; curr_x++) {

                    rooms[room_name].grid[curr_x][y][0] = player_ID + 2;
                }


            }

            // If odd number of x-values then color the last one.
            if (x_arr.length % 2 !== 0 || true) {

                rooms[room_name].grid[x_arr[x_arr.length - 1]][y][0] = player_ID + 2;

            }


        }

        // Send Updates to other players.
        io.to(room_name).emit("area_filling",{"path_vector": object_to_send_to_players,
            "color_index":player_ID + 2});
        //, "grid":rooms[room_name].grid, "record_path":rooms[room_name].players[socket_ID].path_vector });

        // Clear all arrays.
        rooms[room_name].players[socket_ID].path_vector = [];

    } else if(rooms[room_name].grid[player_pos_on_grid_x][player_pos_on_grid_y][0] !== player_ID+2 && player.record_path){


        // True for testing .
        if (true) {

            if (typeof player.path_vector[player_pos_on_grid_y] === 'undefined')
                rooms[room_name].players[socket_ID].path_vector[player_pos_on_grid_y] = [];

            if (!player.path_vector[player_pos_on_grid_y].includes(player_pos_on_grid_x))
                rooms[room_name].players[socket_ID].path_vector[player_pos_on_grid_y].push(player_pos_on_grid_x);

        }
    }

}



var dummyVariable = null;

function simulate() {

    for(let room_name of Object.keys(rooms))
    {

        let map = rooms[room_name].players;
        for (let indx of Object.keys(map)) {

            let player = map[indx];

            if(player===undefined)
                continue;
            if(!player.read_to_be_simulated)
                continue;

            let last_pos = { "x": player.pos_x, "y": player.pos_y };
            let time = process.hrtime();
            let socket_ID = indx;
            // time = secs * 10^9 + nanoseconds
            time = time[0] * 1000000000 + time[1];

            // First run
            if (!player.last_time_stamp) {
                player.last_time_stamp = time;
                //continue;
            }


        let delta_time = (time - player.last_time_stamp) / 1000000000;
        player.last_time_stamp = time;

        // Update player position according to speed and delta time.
        player.pos_x += speed * player.dir_x * delta_time;
        player.pos_y += speed * player.dir_y * delta_time;

        let pos_on_grid = getPlayerPositionOnGrid(player, {"x":player.pos_x, "y":player.pos_y});

        let player_pos_on_grid_x = pos_on_grid.x;
        let player_pos_on_grid_y = pos_on_grid.y;
        let player_last_pos_on_grid_x = Math.floor(last_pos.x);
        let player_last_pos_on_grid_y = Math.floor(last_pos.y);
        //
        // console.log("Player position x: ", player.pflooros_x);
        // console.log("Player position y: ", player.pos_y);

        // Skipped cells in x and in y
        let x_delta = Math.abs(player.pos_x - last_pos.x);
        let y_delta = Math.abs(player.pos_y - last_pos.y);


        // Move on skipped cells in x and in y
        if(MoveOnCells(x_delta, last_pos.x, last_pos, player.pos_x, player, indx, room_name)==false)
            continue;
        if(MoveOnCells(y_delta, last_pos.y, last_pos, player.pos_y, player, indx, room_name)==false)
            continue;
        // Change direction when reaching the end of a cell.
        fixDir(player, last_pos, room_name);

        checkFilling(room_name, player_pos_on_grid_x, player_pos_on_grid_y, player.ID, socket_ID);

        if (dummyVariable == null) {
            dummyVariable = "test";
            setInterval(function () {
                if (GamePaused == true)
                    return;
                let x = player.pos_x;
                let y = player.pos_y;
                let dir_y = player.dir_y;
                let dir_x = player.dir_x;

                // console.log("player pos_on_grid : ", player.pos_x);
                // console.log("Player position(pixel) x: ", x);
                // console.log("Player position y: ", y);
                // console.log("Player direction x: ", player.dir_x);
                // console.log("Player direction y: ", player.dir_y);
            }, 500);
        }
        }
    }



}


function fixDir(player, last_pos, room_name) {

    // let last_head = {};

    // last_head.x = last_pos.x + (0.5 * player.dir_x);
    // last_head.y = last_pos.y + (0.5 * player.dir_y);

    let head = {};

    head.x = player.pos_x + (0.5 * player.dir_x);
    head.y = player.pos_y + (0.5 * player.dir_y);





    // If direction changed
    if (player.dir_x !== player.next_dir_x || player.dir_y !== player.next_dir_y) {


        // if (
        //     //Crossed Cell Right
        //     (player.dir_x === 1 && Math.floor(last_head.x) !== Math.floor(head.x)) ||
        //     //Crossed Cell Left
        //     (player.dir_x === -1 && Math.ceil(last_head.x) !== Math.ceil(head.x)) ||
        //     //Crossed Cell Up
        //     (player.dir_y === 1 && Math.floor(last_head.y) !== Math.floor(head.y)) ||
        //     //Crossed Cell Down
        //     (player.dir_y === -1 && Math.ceil(last_head.y) !== Math.ceil(head.y))) {

        // If head reached the fix cell
        if (Math.round(head.x) === player.fix_pos_x && Math.round(head.y) === player.fix_pos_y) {

            //Fix head on the cell
            if (player.dir_x != 0) {
                head.x = Math.round(head.x) - (0.5 * player.dir_x);
                head.y = Math.round(head.y);
            } else {
                head.x = Math.round(head.x);
                head.y = Math.round(head.y) - (0.5 * player.dir_y);

            }

            //Adjust head position to match the new direction
            head.x += player.next_dir_x * 0.5 - player.dir_x * 0.5;
            head.y += player.next_dir_y * 0.5 - player.dir_y * 0.5;


            // Set old direction.
            player.last_dir = {"x":player.dir_x, "y": player.dir_y};
            //Set direction to new direction
            player.dir_x = player.next_dir_x;
            player.dir_y = player.next_dir_y;

            player.pos_x = head.x - (0.5 * player.next_dir_x);
            player.pos_y = head.y - (0.5 * player.next_dir_y);

            if (player.new_key != null && player.new_key == true) {
                player.new_key = false;
                // console.log(" position ", player.pos_x, player.pos_y);

                io.to(room_name).emit('player_change_direction', {
                    "player_ID": player.ID,
                    "player_dir": [player.next_dir_x, player.next_dir_y],
                    "player_pos": [player.pos_x, player.pos_y]//,
                    // "grid": rooms[room_name].grid

                });

            }
        }
    }
    // if(player.pos_x!=Math.round(player.pos_x)&&player.pos_y!=Math.round(player.pos_y))
    // {
    //     player.pos_x=Math.round(player.pos_x);
    //     player.pos_y=Math.round(player.pos_y);
    // }

}

/**
 * Removes dead player from room players and from the grid
 *
 * @param room_name
 * @param player socket.id
 */
function removeDeadPlayer(room_name, player) {
    try {
    if(player ==undefined ||room_name ===undefined)
        return;

    console.log("Player " + player + " died!");

    console.log(room_name);
    console.log();
    if(rooms[room_name]==null||rooms[room_name]==undefined)
    {
        console.log("no room matches the room of the dead player");
        return;
    }
    if(rooms[room_name].players==null||rooms[room_name].players[player]==null)
    {
        console.log("no player with this socket id: ",player, " in this room: ", room_name);
        return;
    }

    playerID = rooms[room_name].players[player].ID;
    //console.log(rooms[room_name].players[player]);
    //console.log(playerID);
    // Clear cells of the dead player
    for (let i = grid_start; i < grid_end; i++) {
        for (let j = grid_start; j < grid_end; j++) {
            if (rooms[room_name].grid[i][j][0] == playerID ||
                rooms[room_name].grid[i][j][0] == playerID + 1 ||
                rooms[room_name].grid[i][j][0] == playerID + 2) {
                rooms[room_name].grid[i][j][0] = 0;
                rooms[room_name].grid[i][j][1] = 0;
            }
        }
    }

    // Make this player slot in room available.

    // Remove dead player from room
    delete rooms[room_name].players[player];
    rooms[room_name].players.splice(player,1);
    io.to(room_name).emit("player_died",{"player_ID":playerID});
    delete rooms[room_name].players[player];
    }
    catch(error)
    {

    }

}


/**
 * Gets the player socket.id from the player ID in the room
 *
 * @param playerID
 * @param room_name
 * @returns player socket.id
 */
function getSocketIDfromPlayerID(playerID, room_name) {

    let map = rooms[room_name].players;
    for (let indx of Object.keys(map))
    {

        let player = map[indx];

        if(player.ID === playerID)
            return indx;
    }

    // for (let [player, indx] of rooms[room_name].players.entries()) {
    //     // if (player.ID == playerID) {
    //     //     return indx;
    //     // }
        console.log("player ->", player.ID);
   // }
}


function getFixPosition(pos_x, pos_y, dir_x, dir_y) {

    let head = {};
    let fix_pos = {};

    head.x = pos_x + (0.5 * dir_x);
    head.y = pos_y + (0.5 * dir_y);


    // ---- Getting the end of the cell of the head ----
    // ----  then adding one cell in the direction  ----

    // Moving right
    if (dir_x == 1) {
        head.x = Math.ceil(head.x);
        head.y = Math.round(head.y);
        fix_pos.x = head.x + 1;
        fix_pos.y = head.y;
    }

    // Moving left
    if (dir_x == -1) {
        head.x = Math.floor(head.x);
        head.y = Math.round(head.y);
        fix_pos.x = head.x - 1;
        fix_pos.y = head.y;
    }

    // Moving up
    if (dir_y == -1) {
        head.x = Math.round(head.x);
        head.y = Math.floor(head.y);
        fix_pos.x = head.x;
        fix_pos.y = head.y - 1;
    }

    // Moving down
    if (dir_y == 1) {
        head.x = Math.round(head.x);
        head.y = Math.ceil(head.y);
        fix_pos.x = head.x;
        fix_pos.y = head.y + 1;
    }

    // -------------------------------------------------

    return fix_pos;

}

function getPlayerPositionOnGrid(player, last_pos) {

    let x = 0;
    let y = 0;

    // Player moving down.
    if (player.dir_x == 0 && player.dir_y == 1) {

        x = Math.round(last_pos.x);
        y = Math.floor(last_pos.y);
    }

    // this moving up.
    if (player.dir_x == 0 && player.dir_y == -1) {

        x = Math.round(last_pos.x);
        y = Math.ceil(last_pos.y);

    }

    if (player.dir_x == 1 && player.dir_y == 0) {

        x = Math.floor(last_pos.x);
        y = Math.round(last_pos.y);

    }

    // this moving right.
    if (player.dir_x == -1 && player.dir_y == 0) {

        x = Math.ceil(last_pos.x);
        y = Math.round(last_pos.y);

    }
    return { "x": x, "y": y };

}
