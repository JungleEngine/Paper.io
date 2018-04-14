"use strict";

// variable used to calculate players positions
// should be removed
var x = 2;

const speed = 1.5; // blocks/sec
var async = require('async');
var io = require('socket.io', {rememberTransport: false, transports: ['WebSocket']}).listen(8080);
const room_capacity = 3;

var playerID = [];

var rooms = {};

io.on('connection', (socket) => {
    let arr = [];
    for (let i = 0; i < 10000; i++)
        arr[i] = i;
    socket.emit("get_grid", arr);

    // Joining a room callback.
    socket.on('join_room', (data) => {

        console.log(io.nsps['/'].adapter.rooms[data]);

        console.log(socket.rooms);

        // Add player in room.
        let player_parameters = addPlayer(data,socket.id);

        socket.join(data);

        // Leave his own room.
        socket.leave(socket.id);

        // Send initial parameters to connected Client
        socket.emit("initialize_game", player_parameters);
    });

    socket.on('disconnect', (data) => {
        console.log("Player disconnected ", io.nsps['/'].adapter.rooms);
    });

    socket.on('validate', (data) => {


        let new_dir_x = data.player_dir[0];
        let new_dir_y = data.player_dir[1];
        console.log("Key pressed: ", new_dir_x, new_dir_y);
        let key = Object.keys(socket.rooms);

        player = rooms[key[key.length - 1]].players[socket.id];
        console.log(rooms[key[key.length - 1]].players);

        if (!new_dir_x - player.dir_x > 1 && !new_dir_y - player.dir_y > 1) {
            player.next_dir_x = new_dir_x;
            player.next_dir_y = new_dir_y;

            //TODO:if action is valid send it to the everyone and send
            io.to(rooms[key[key.length - 1]]).emit('player_key_press', [player.ID, data, [player.pos_x, player.pos_y]]);
        }
    });

});


const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;

//TODO:create a grid for each room

function initNewRoom(room_name,socket_id) {

    var grid = [];

    // Initialize the grid with zeros.
    for (let i = 0; i < canvas_length; ++i) {
        grid[i] = [];
        for (let j = 0; j < canvas_length; ++j) {
            grid[i][j] = 0;
        }
    }

    // Draw game borders in grid.
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


    //simulate();

    let y = x;
    x += 4;
    // Insert player in the room.
    return setInitialParametersForNewPlayer(room_name, y,socket_id);


    // Check if room  is empty, else get current room grid and send it .
    //let grid_to_send;
    //let new_player_initial_parameters;
    // Set initial parameters  for new connected client.
    //new_player_initial_parameters = getInitialParametersForNewPlayer(data);
    //new_player_initial_parameters["grid"] = rooms[data].grid;
}

function updateCurrentRoom(room_name,socket_id) {

    // Insert player in the room.
    let y = x;
    x += 4;
    return setInitialParametersForNewPlayer(room_name, y,socket_id);
}

// Initialize new position for new connected player.
// TODO: generate new position for player by knowing his room.
function setInitialParametersForNewPlayer(room_name, i,socket_id) {

    let player_data = {};
    player_data["pos_x"] = ((20 * i) % 150) + 50;
    player_data["pos_y"] = ((20 * i) % 150) + 50;
    player_data["dir_x"] = 1;
    player_data["dir_y"] = 0;
    player_data["ID"] = i;

    // Set initial 5 cells for player
    for (let i = player_data["pos_x"] - 1; i <= player_data["pos_x"] + 1; i++)
        for (let j = player_data["pos_y"] - 1; j <= player_data["pos_y"] + 1; j++) {


            try {
                rooms[room_name].grid[i][j] = player_data["player_color_index"];
            } catch (e) {
                console.log("error in initializing blocks for the player in: ", i, j);
            }

        }

    rooms[room_name].players[socket_id] = player_data;

    return player_data.ID;
}

// TODO:make this function general for each room
function simulate(room_name) {

    // Player attributes:
    // 1 = ID
    // 2 = Tail
    // 3 = Block
    // 4 = Shadow
    // while (true) {
    //for (player,indx in rooms[room_name].players) {
    for (let [player, indx] of rooms[room_name].players.entries()) {
        let time = process.hrtime();
        let delta_time = player.last_time_stamp - time;
        let last_pos_x = player.pos_x;
        let last_pos_y = player.pos_y;
        player.last_time_stamp = time;
        player.pos_x += speed * player.dir_x * delta_time;
        player.pos_y += speed * player.dir_y * delta_time;

        // If direction changed
        if (player.dir_x != player.next_dir_x || player.dir_y != player.next_dir_y) {
            // Player crossed cell horizontally
            if (player.dir_x != 0 && Math.round(0.5 + last_pos_x) != Math.round(0.5 + player.pos_x)) {
                if (player.dir_x == 1) {    // Moving right
                    player.pos_x = Math.floor(player.pos_x) + 0.5;
                }
                else {      // Moving left
                    player.pos_x = Math.ceil(player.pos_x) - 0.5;
                }
                player.dir_x = player.next_dir_x;
                player.dir_y = player.next_dir_y;
            }
            // Player crossed cell vertically
            if (player.dir_y != 0 && Math.round(0.5 + last_pos_y) != Math.round(0.5 + player.pos_y)) {
                if (player.dir_y == 1) {    // Moving down
                    player.pos_y = Math.floor(player.pos_y) + 0.5;
                }
                else {  // Moving up
                    player.pos_y = Math.ceil(player.pos_y) - 0.5;
                }
                player.dir_x = player.next_dir_x;
                player.dir_y = player.next_dir_y;
            }
            io.to(room_name).emit('player_change_direction', [player.ID, [player.dir_x, player.dir_y], [player.pos_x, player.pos_y]]);
        }
        let x_delta = Math.abs(player.pos_x - last_pos_x);
        let y_delta = Math.abs(player.pos_y - last_pos_y);
        while (x_delta > 0) {

            let cell = rooms[room_name].grid[player.pos_x][player.pos_y];
            if (x_delta < 1) {
                //TODO: Put head
                rooms[room_name].grid[Math.round(player.pos_x + (0.5 * player.dir_x))][Math.round(player.pos_y + (0.5 * player.dir_x))] = player.ID;
            }
            else {
                if (player.pos_x > last_position.x) {
                    player.pos_x--;
                } else {
                    player.pos_x++;
                }
                if (cell == 1 || cell == player.ID + 1) {    // Border || Own tail
                    // Die
                    console.log("Player" + player.ID + "Died!");
                    removeDeadPlayer(room_name, indx);
                }
                else if (cell == player.ID + 2) {     // Own block
                    //TODO: Fill path
                }
                else if (cell == 0 || cell % 4 == 0) {     // Empty || block
                    // Put tail
                    rooms[room_name].grid[Math.round(player.pos_x + (0.5 * player.dir_x))][Math.round(player.pos_y + (0.5 * player.dir_x))] = player.ID + 1;
                }
                else {
                    // Kill
                    removeDeadPlayer(room_name, getSocketIDfromPlayerID(player.ID));
                }
            }

            x_delta--;
        }
        while (y_delta > 0) {

            let cell = rooms[room_name].grid[player.pos_x][player.pos_y];
            if (y_delta < 1) {
                //TODO: Put head
                rooms[room_name].grid[Math.round(player.pos_x + (0.5 * player.dir_x))][Math.round(player.pos_y + (0.5 * player.dir_x))] = player.ID;
            }
            else {
                if (player.pos_y > last_position.y) {
                    player.pos_y--;
                } else {
                    player.pos_y++;
                }
                if (cell == 1 || cell == player.ID + 1) {    // Border || Own tail
                    // Die
                    removeDeadPlayer(room_name, indx);
                }
                else if (cell == player.ID + 2) {     // Own block
                    //TODO: Fill path
                }
                else if (cell == 0 || cell % 4 == 0) {     // Empty || block
                    // Put tail
                    rooms[room_name].grid[Math.round(player.pos_x + (0.5 * player.dir_x))][Math.round(player.pos_y + (0.5 * player.dir_x))] = player.ID + 1;
                }
                else {
                    // Kill
                    removeDeadPlayer(room_name, getSocketIDfromPlayerID(player.ID));
                }
            }

            y_delta--;
        }
    }
    //}
}

function addPlayer(room_name,socket_id) {

    let player_parameters = {};

    // If room does not exist.
    if (!io.nsps['/'].adapter.rooms[room_name]) {
        player_parameters.player_id = initNewRoom(room_name,socket_id);
    }
    else {
        player_parameters.player_id = updateCurrentRoom(room_name,socket_id);
    }

    player_parameters.grid = rooms[room_name].grid;
    let players=[];
    console.log(rooms[room_name].players);
    let map = rooms[room_name].players;
    for(let key of Object.keys(map)){
        console.log("map[kry]" + map[key]);
        console.log("key:" + key);
        players.push(map[key]);
    }
    player_parameters.players = players;
    return player_parameters;
}

function removeDeadPlayer(room_name, player) {

    playerID = rooms[room_name].players[player].ID;

    for (let i = grid_start; i < grid_end; i++) {
        for (let j = grid_start; j < grid_end; j++) {
            // Clear cells of the dead player
            if (grid[i][j] == playerID ||
                grid[i][j] == playerID + 1 ||
                grid[i][j] == playerID + 2) {
                grid[i][j] = 0;
            }
        }
    }

    // Remove dead player from room
    delete rooms[room_name].players[player];
}

function getSocketIDfromPlayerID(playerID,room_name) {
    for (let [player, indx] of rooms[room_name].players.entries()) {
        if (player.ID == playerID) {
            return indx;
        }
    }
}