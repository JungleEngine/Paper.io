"use strict";

var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket'] }).listen(8080);
const room_capacity = 3;

var playerID = [];

io.on('connection', (socket) => {

    //TODO: create process to handle each room individually
    socket.on('join_room', (data) => {

        console.log(io.nsps['/'].adapter.rooms[data]);
        // Check if room  is empty.
        if (!io.nsps['/'].adapter.rooms[data])
            initGrid();

        console.log(socket.rooms);

        // Join room.
        socket.join(data);

        // Get client room
        let room = io.nsps['/'].adapter.rooms[data];
        console.log("User ", socket.id, " joined a room!");
        console.log("Room capacity: ", room.length)

        console.log("Rooms: ", room);
        //socket.leave(socket.rooms[key]);

    });

    socket.on('client_action', (data) => {
        //let keys = Object.keys(socket.rooms);

        //this is used to transmit to all the connected users in the room
        //io.to(socket.rooms[keys[0]]).emit('action', data);
        //this is to emit to the user who triggered the action
        socket.emit('action', data);
        //io.to(socket.rooms[keys[0]]).emit('connected', "you're connected!");
        socket.emit('connected', "you're connected!");
    });

    socket.on('disconnect', (data) => {
        console.log("Disconnected!");
        console.log(data);
    });
    socket.on('validate', (data) => {
        console.log(data);
        //TODO:if action is valid send it to the everyone and send
    });

});


const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;

//TODO:create a grid for each room
var grid = [];

function initGrid() {
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

    //Simulate();
}

//TODO:make this function general for each room
function simulate() {
    while (true) {

    }
}