"use strict";

// Express server.
var express = require('express');
var app = express();
var server = require('http').Server(app);

var async = require('async');
var io = require('socket.io', {rememberTransport: false, transports: ['WebSocket']})(server);

server.listen(8080);

// Send game page for client.
app.use(express.static('public'));

var playerID = [];
var rooms = {};
// variable used to calculate players positions
// should be removed
var x = 2;

const room_capacity = 3; //TODO: use this..
const speed = 3; // blocks/sec
const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;

io.on('connection', (socket) => {

    socket.on('join_room', (room_name) => {

        //console.log(io.nsps['/'].adapter.rooms[data]);

        // Add player in room.
        let player_parameters = addPlayer(room_name, socket.id);

        // Join new room.
        socket.join(room_name);

        // Leave his own room.
        socket.leave(socket.id);

        // Send initial parameters to connected Client
        socket.emit("initialize_game", player_parameters);

    });

    socket.onclose = function(reason){
        console.log(socket.id);
        let rooms_keys = Object.keys(socket.rooms);
        //console.log("Player disconnected ", rooms_keys[rooms_keys.length - 1]);
        removeDeadPlayer(rooms_keys[rooms_keys.length - 1],socket.id);
        //console.log(socket.adapter.sids[socket.id]);
        Object.getPrototypeOf(this).onclose.call(this,reason);
    }
    socket.on('disconnect', (data) => {
    //console.log("on disconnect");
    });

    socket.on('validate', (dir) => {

        let new_dir_x = dir.player_dir[0];
        let new_dir_y = dir.player_dir[1];
        let rooms_keys = Object.keys(socket.rooms);
        let player = rooms[rooms_keys[rooms_keys.length - 1]].players[socket.id];

        if(player==null)
        {
            console.log("unknown player sending a message, either dead player or hacking");
            return;
        }
        //console.log("Key pressed: ", new_dir_x, new_dir_y);
        //console.log("Player that pressed key: ", player);

        //if x==0 && new_x == -1 || new_x ==1 && new_y==0   moving vertically and new dir = moving horizontally
        //if y==0 && new_y == -1 || new_y ==1 && new_x==0   moving horizontally and new dir = moving vertically
        if ((player.dir_x == 0 && (new_dir_x == 1 || new_dir_x == -1) && new_dir_y == 0) ||
            (player.dir_y == 0 && (new_dir_y == 1 || new_dir_y == -1) && new_dir_x == 0)) {
            console.log("x : ",new_dir_x, " , y : ",new_dir_y);
            player.next_dir_x = new_dir_x;
                player.next_dir_y = new_dir_y;

            player.new_key=true;
            // If action is valid send it to the everyone
            let room_name = socket.rooms[Object.keys(socket.rooms)[Object.keys(socket.rooms).length-1]];
            io.to(room_name).emit('player_key_press', {
                "player_ID": player.ID,
                "player_next_dir": dir,
                "player_pos": [player.pos_x, player.pos_y]
            });
        }
    });

});


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
    let i = x;
    x += 4;

    //TODO: Find position for new player
    player_data.pos_x = 70;
    player_data.pos_y = 70;
    player_data.dir_x = 1;
    player_data.dir_y = 0;
    player_data.next_dir_x = 1;
    player_data.next_dir_y = 0;
    player_data.ID = i;

    // Set initial 3 cells for player
    for (let i = player_data.pos_x - 1; i <= player_data.pos_x + 1; i++) {
        for (let j = player_data.pos_y - 1; j <= player_data.pos_y + 1; j++) {
            rooms[room_name].grid[i][j] = player_data.ID + 2;
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
            grid[i][j] = 0;
        }
    }

    // Place game borders in grid.
    let border_start = grid_start - 1;
    let border_end = grid_end + 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[i][border_start] = 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[i][border_end] = 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[border_start][i] = 1;
    for (let i = border_start; i <= border_end; ++i)
        grid[border_end][i] = 1;


    // Create new room.
    rooms[room_name] = {};

    // Initialize empty players array.
    rooms[room_name].players = [];

    // Insert the new grid in the room.
    rooms[room_name].grid = grid;

    async.forever(
        function (next) {
            simulate(room_name);
            setTimeout(function () {
                next();
            }, 30)
        },
        function (error) {
            console.log(error);
        }
    );

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
    io.to(room_name).emit('new_player',player_data);
}

/**
 * Adds player in existing room or create new room and insert the player in it
 *
 * @param room_name
 * @param socket_id
 */
function addPlayer(room_name, socket_id) {

    // Initial parameters to be sent to new player.
    let player_parameters = {};

    // If room does not exist, create new room.
    if (!io.nsps['/'].adapter.rooms[room_name]) {
        let  player_data = initNewRoom(room_name, socket_id);
        player_parameters.player_id = player_data.ID;
    }
    else {
        let player_data = updateCurrentRoom(room_name, socket_id);
        player_parameters.player_id = player_data.ID;
        sendNewPlayerToRoom(room_name,player_parameters);
    }

    player_parameters.grid = rooms[room_name].grid;

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
var dummyVariable=null;
function simulate(room_name) {

    function MoveOnCells(delta, last_pos_x_or_y, last_pos, player_pos, player, indx) {

        //this is to keep track of current cell when hopping over more than a cell at a time
        let currentCellPosition={x:last_pos.x,y:last_pos.y};

        let cell;

        while (delta > 0) {
            //console.log("Last pos X: ", last_pos.x, "Dir_x: ", player.dir_x, "---------");
            if(player.dir_x != 0)
                cell = rooms[room_name].grid[Math.round(last_pos_x_or_y + (0.5 * player.dir_x))][Math.round(player.pos_y + (0.5 * player.dir_y))];
            else cell = rooms[room_name].grid[Math.round(player.pos_x + (0.5 * player.dir_x))][Math.round(last_pos_x_or_y + (0.5 * player.dir_y))];


            //if (delta < 1) {
                // Put head
              //  cell = player.ID;
            //}
           // else { // Player jumped more than 1 cell


                // Change position according to moving direction
                if(delta>1) {
                    if (player_pos > last_pos_x_or_y) {
                        last_pos_x_or_y++;

                    } else {
                        last_pos_x_or_y--;
                    }
                }

                    if (cell == 1 || cell == player.ID + 1) {    // Border || Own tail
                        // Dies
                        console.log("Player Died!!");
                        removeDeadPlayer(room_name, indx);
                    }
                    else if (cell == player.ID + 2) {     // Own block
                        //TODO: Fill path
                    }
                    else if (cell == 0 || cell % 4 == 0) {     // Empty || block
                        // Put tail
                        cell = player.ID + 1;
                    }
                    else if(cell!=player.ID) {
                        let killedPlayerID;
                        if(cell%4==2)//other player id
                        {
                            killedPlayerID=cell;
                        }else {
                            killedPlayerID = cell - 1;
                        }
                        // Kill
                        removeDeadPlayer(room_name, getSocketIDfromPlayerID(killedPlayerID,room_name));
                        if(delta<1) {
                            cell = player.ID;
                        }
                    }
            delta--;
        }
    }

    let map = rooms[room_name].players;
    for (let indx of Object.keys(map)) {

        let player = map[indx];
        let last_pos = {"x": player.pos_x, "y": player.pos_y};
        let time = process.hrtime();

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

        if(dummyVariable==null) {
             dummyVariable="test";
            setInterval(function () {
                let x=player.pos_x;
                let y=player.pos_y;
                let dir_y=player.dir_y;
                let dir_x=player.dir_x;
                console.log("Player position x: ", x);
                console.log("Player position y: ", y);
                console.log("Player direction x: ", player.dir_x);
                console.log("Player direction y: ", player.dir_y);
            }, 2000);
        }


        // Skipped cells in x and in y
        let x_delta = Math.abs(player.pos_x - last_pos.x);
        let y_delta = Math.abs(player.pos_y - last_pos.y);

        // Move on skipped cells in x and in y
        MoveOnCells(x_delta, last_pos.x, last_pos, player.pos_x, player, indx);
        MoveOnCells(y_delta, last_pos.y, last_pos, player.pos_y, player, indx);

        // If direction changed
        if (player.dir_x != player.next_dir_x || player.dir_y != player.next_dir_y) {
            // Player crossed cell horizontally
            if (player.dir_x != 0 && Math.round(0.5 + last_pos.x) != Math.round(0.5 + player.pos_x)) {
                if (player.dir_x == 1) {    // Moving right
                    // noinspection JSSuspiciousNameCombination
                    player.pos_y = Math.floor(player.pos_y) + 0.5;
                }
                else {      // Moving left
                    // noinspection JSSuspiciousNameCombination
                    player.pos_y = Math.ceil(player.pos_y) - 0.5;
                }
                player.dir_x = player.next_dir_x;
                player.dir_y = player.next_dir_y;
            }
            // Player crossed cell vertically
            if (player.dir_y != 0 && Math.round(0.5 + last_pos.y) != Math.round(0.5 + player.pos_y)) {
                if (player.dir_y == 1) {    // Moving down
                    player.pos_x = Math.floor(player.pos_x) + 0.5;
                }
                else {  // Moving up
                    player.pos_x = Math.ceil(player.pos_x) - 0.5;
                }
                player.dir_x = player.next_dir_x;
                player.dir_y = player.next_dir_y;
            }
            if(player.new_key!=null&&player.new_key==true) {
                player.new_key=false;
                //console.log(" position ", player.pos_x,player.pos_y);
                io.to(room_name).emit('player_change_direction', {
                    "player_ID": player.ID,
                    "player_dir": [player.next_dir_x, player.next_dir_y],
                    "player_pos": [player.pos_x, player.pos_y]
                });
            }
        }



    }
}

/**
 * Removes dead player from room players and from the grid
 *
 * @param room_name
 * @param player socket.id
 */
function removeDeadPlayer(room_name, player) {

    console.log("Player " + player + " died!");

    playerID = rooms[room_name].players[player].ID;
    console.log(rooms[room_name].players[player]);
    console.log(playerID);
    // Clear cells of the dead player
    for (let i = grid_start; i < grid_end; i++) {
        for (let j = grid_start; j < grid_end; j++) {
            if (rooms[room_name].grid[i][j] == playerID ||
                rooms[room_name].grid[i][j] == playerID + 1 ||
                rooms[room_name].grid[i][j] == playerID + 2) {
                rooms[room_name].grid[i][j] = 0;
            }
        }
    }

    // Remove dead player from room
    delete rooms[room_name].players[player];
}


/**
 * Gets the player socket.id from the player ID in the room
 *
 * @param playerID
 * @param room_name
 * @returns player socket.id
 */
function getSocketIDfromPlayerID(playerID, room_name) {
    for (let [player, indx] of rooms[room_name].players.entries()) {
        if (player.ID == playerID) {
            return indx;
        }
    }
}