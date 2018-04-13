"use strict";

var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket'] }).listen(8080);
const room_capacity = 3;

var playerID = [];

var rooms = {};

io.on('connection', (socket) => {
    let arr = []
    for(let i = 0; i <10000; i++)
        arr[i] = i;
    socket.emit("get_grid",arr)

    // Joining a room callback.
    socket.on('join_room', (data) => {


        //console.log(io.nsps['/'].adapter.rooms[data]);

        // Check if room  is empty, else get current room grid and send it .
        let grid_to_send;
        let new_player_initial_parameters;
       
        if (!io.nsps['/'].adapter.rooms[data])
            grid_to_send = initNewGrid(data);
        else {
            grid_to_send = getCurrentRoomGrid(data);
        }

        // Set initial parameters  for new connected client.
        new_player_initial_parameters = getInitialParametersForNewPlayer(data);
        new_player_initial_parameters["grid"] = rooms[data].grid;
        
        // Join room.
        socket.join(data);

        // Leave his own room.
        socket.leave(socket.id);

        console.log(socket.rooms)
        // Send initial parameters to connected Client
        socket.emit("initialize_game",new_player_initial_parameters);

        // Get client rooms
        let room = io.nsps['/'].adapter.rooms[data];
        //console.log("user:", socket.id, "Joined a room!");
        //console.log(" room capacity : ",room.length)
        
        //console.log(" rooms ",io.nsps['/'].adapter.rooms);
        //socket.leave(socket.rooms[key]);
    });

    socket.on('client_action', (data) => {
        //let keys = Object.keys(socket.rooms);

        //this is used to transmit to all the connected users in the room
        //io.to(socket.rooms[keys[0]]).emit('action', data);
        //this is to emit to the user who triggered the action
        socket.emit('action',data);
        //io.to(socket.rooms[keys[0]]).emit('connected', "you're connected!");
        socket.emit('connected', "you're connected!");
    });

    socket.on('disconnect',(data)=>{
        console.log("Player disconnected ",io.nsps['/'].adapter.rooms );
        
    });
    socket.on('getClientAction', (data) => {
        //console.log(data);
        console.log(Object.keys(socket.rooms)[0]);

        //TODO:if action is valid send it to the everyone and send
    });

});


const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;

//TODO:create a grid for each room


function initNewGrid(data) {

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

    // Set rooms[room_name]["grid"] = grid. 
    rooms[data] = {};
    rooms[data].grid = grid
    return grid;
    //Simulate();


}

function getCurrentRoomGrid(room_name){

}

// Initialize new position for new connected player.
// TODO: generate new position for player by knowing his room.
function getInitialParametersForNewPlayer(room_name){
    
    let data = {}
    data["pos_x"] = 100;
    data["pos_y"] = 100;
    data["dir"] = 'right';
    data["player_color_index"] = 2;

    // Set initial 5 cells for player
    for(let i = data["pos_x"]-1; i <= data["pos_x"] + 1; i++) 
    for(let j = data["pos_y"]-1; j <= data["pos_y"] + 1; j++)
        rooms[room_name].grid[i][j] = data["player_color_index"]+2

  
    return data;
}
//TODO:make this function general for each room
function simulate() {
    while (true) {

    }
}