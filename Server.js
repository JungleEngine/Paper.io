"use strict"

var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket'] }).listen(8080);
const room_capacity = 3;

var playerID = [];

io.on('connection', (socket) => {
    //console.log(socket.rooms);

    console.log("3li connected ", socket.id);
    socket.on('join_room', (data) => {

        let rooms = io.sockets.adapter.rooms;
        console.log(io.sockets.adapter.rooms[data]);
        //console.log(io.rooms.adapter);
        let key = Object.keys(socket.rooms)[0]; //key of initial room
        console.log("user:", socket.id, "Joined a room!");
        //socket.leave(socket.rooms[key]);
        socket.join(data);

    });

    socket.on('client_action', (data) => {
        let keys = Object.keys(socket.rooms);
        let d = new Date();
        console.log(d.getTime() - data);
        io.to(socket.rooms[keys[0]]).emit('action', data);
        io.to(socket.rooms[keys[0]]).emit('connected', "you're connected!");
    });


});
/*
io.on('connection', (socket) => {
            console.log(socket.adapter.rooms[socket.id].sockets);
            if (socket.adapter.rooms[socket.id].sockets) { // if the user is in his initial room
                console.log("New client connected!");
                console.log("d 7aga tanya ", socket.adapter.rooms[Object.keys(socket.adapter.rooms)[0]]);
            } else {
                console.log("Client joined room! ", socket.adapter.rooms[0]);
                console.log("d 7aga tanya ", socket.adapter.rooms[Object.keys(socket.adapter.rooms)[0]]);
                rooms[socket.adapter.rooms[Object.keys(socket.adapter.rooms)[0]]].push(socket.id);
            }
    console.log(socket.adapter.rooms);
    socket.on('join_room', (data) => {
        name = data["name"];
        room = data["room"];
        console.log(socket.adapter.rooms);

        if (rooms[room] == undefined) { //create a new room
            console.log("awl awl mara t7eb ya 2alby");

            rooms[room] = [];
            socket.leave(socket.adapter.rooms[socket.id]);
            socket.join(room);
        } else if (rooms[room].length >= room_capacity) {
            //TODO: send that room is full
            //io.to('some room').emit('some event');

        } else if (socket.adapter.room == undefined) {
            console.log("awl mara t7eb ya 2alby");
            socket.leave(socket.adapter.rooms[socket.id]);
            socket.join(room);
        }
        //io.to(room).emit('gablaya', '2oo2 2oo2 2aa2 2aa2');
        console.log(rooms);
    })

    socket.on('client_action', (data) => {
        console.log(socket.id);
    })

    socket.on('disconnect', () => {
        console.log("disconnected", socket.id);
        if (socket.adapter.room) { // if the user has joined a room (not just connected)
            if (rooms[socket.adapter.room]) { //this might be unnecessary but don't remove it ela lw fahem w enta msh fahem
                rooms[socket.adapter.room].pop(rooms[socket.adapter.room].indexOf(socket.id)); //remove the user from the room

                console.log(rooms[room].length); //for debugging

                if (rooms[socket.adapter.room].length == 0) { // if the room is empty remove the room
                    rooms.pop(rooms.indexOf(socket.adapter.room));
                }
            }
        }
        playerID[socket.id] = 0;
    })

})
*/