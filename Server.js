//"use strict";

// variable used to calculate players positions
// should be removed
var x = 1;

const speed = 1.5; // blocks/sec

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
        let new_player_initial_parameters = addPlayer(data, socket.id);

        // Join room.
        socket.join(data);

        // Leave his own room.
        socket.leave(socket.id);

        // Send initial parameters to connected Client
        socket.emit("initialize_game", new_player_initial_parameters);
    });

    socket.on('disconnect', (data) => {
        console.log("Player disconnected ", io.nsps['/'].adapter.rooms);
    });

    socket.on('validate', (data) => {
        console.log(data);

        let new_dir_x = data[0];
        let new_dir_y = data[1];

        key = Object.keys(socket.rooms);
        player = rooms[key[key.length - 1]].players[socket.id];

        if (!new_dir_x - player.dir_x > 1 && !new_dir_y - player.dir_y > 1) {
            player.next_dir_x = new_dir_x;
            player.next_dir_y = new_dir_y;

            //TODO:if action is valid send it to the everyone and send
           socket.emit('update',[player.ID,data,[player.pos_x,player.pos_y]])
        }
    });

});


const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;

//TODO:create a grid for each room


function initNewRoom(room_name, player_id) {

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

    // Make new room with name = data.
    rooms[room_name] = {};

    // Insert the new grid in the room.
    rooms[room_name].grid = grid;

    simulate();

    // Insert player in the room.
    return setInitialParametersForNewPlayer(room_name, player_id, x++);

    // Check if room  is empty, else get current room grid and send it .
    //let grid_to_send;
    //let new_player_initial_parameters;
    // Set initial parameters  for new connected client.
    //new_player_initial_parameters = getInitialParametersForNewPlayer(data);
    //new_player_initial_parameters["grid"] = rooms[data].grid;
}

// TODO: return existing room
function updateCurrentRoom(room_name, player_id) {

    // Insert player in the room.
    return setInitialParametersForNewPlayer(room_name, player_id, x++);
}

// Initialize new position for new connected player.
// TODO: generate new position for player by knowing his room.
function setInitialParametersForNewPlayer(room_name, player_id, i) {

    let player_data = {};
    player_data["pos_x"] = 20 * i;
    player_data["pos_y"] = 20 * i;
    player_data["dir_x"] = '1';
    player_data["dir_y"] = '0';
    player_data["player_color_index"] = i + 1;

    // Set initial 5 cells for player
    for (let i = player_data["pos_x"] - 1; i <= player_data["pos_x"] + 1; i++)
        for (let j = player_data["pos_y"] - 1; j <= player_data["pos_y"] + 1; j++)
            rooms[room_name].grid[i][j] = player_data["player_color_index"]


    rooms[room_name].players=[];
    rooms[room_name].players[player_id] = player_data;

    return player_data;
}

// TODO:make this function general for each room
function simulate(room_name) {

    // Player attributes:
    // 1 = ID
    // 2 = Tail
    // 3 = Block
    // 4 = Shadow

    while (true) {
        for (player in rooms[room_name].players) {
            let time = process.hrtime();
            let delta_time = player.last_time_stamp - time;
            player.last_time_stamp = time;
            let last_position = player.position;
            player.position.x += speed * delta_time;
            player.position.y += speed * delta_time;
            let x_delta = Math.abs(player.position.x - last_position.x);
            let y_delta = Math.abs(player.position.y - last_position.y);
            while (x_delta > 0) {
                if (player.position.x > last_position.x) {
                    player.position.x--;
                } else {
                    player.position.x++;
                }
                let cell = rooms[room_name].grid[player.position.x][player.position.y];
                if (x_delta < 1) {
                    //TODO: Put head
                }
                else if (cell == 1 || cell == player.ID + 1) {    // Border || Own tail
                    //TODO: Die
                }
                else if (cell == player.ID + 2) {     // Own block
                    //TODO: Fill path
                }
                else if (cell == 0 || cell % 3 == 0) {     // Not empty
                    //TODO: Put tail
                }
                else {
                    //TODO: Kill or Eat
                }
                x_delta--;
            }
            while (y_delta > 0) {
                if (player.position.y > last_position.y) {
                    player.position.y--;
                } else {
                    player.position.y++;
                }
                let cell = rooms[room_name].grid[player.position.x][player.position.y];
                if (y_delta < 1) {
                    //TODO: Put head
                }
                else if (cell == 1 || cell == player.ID + 1) {    // Border || Own tail
                    //TODO: Die
                }
                else if (cell == player.ID + 2) {     // Own block
                    //TODO: Fill path
                }
                else if (cell == 0 || cell % 3 == 0) {     // Not empty
                    //TODO: Put tail
                }
                else {
                    //TODO: Kill or Eat
                }
                y_delta--;
            }
        }
    }
}

function addPlayer(room_name) {

    let player_parameters;

    // If room does not exist.
    if (!io.nsps['/'].adapter.rooms[room_name]) {
        player_parameters = initNewRoom(room_name);
    }
    else {
        player_parameters = updateCurrentRoom(room_name);
    }

    return player_parameters;
}