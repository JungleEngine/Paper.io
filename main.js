// White, Border, Player1, Player1_Tail, Player1_Shadow, Player2, Player2_Tail, ...
var COLORS = ['empty', '#edeff4', '#0041a1', '#076bff', '#002c6e'];
var KEY_PRESSED;
var grid = [];
var aspect_ratio;
var view_blocks_number = 40;
var block_width;
var block_height;
var number_of_blocks_height;
var number_of_blocks_width;
var player;
var speed;
var block_size;
var socket;
var currentTime = 0;
var ValidAction = true;
const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;
const border_to_block_ratio = 0.5;
var startGame = false;
// TODO: get number of players in room.
var players_in_room_count = 0;

var game_started = false;
//players in room
var players = [];

// TODO: function to be called by SocketIO to initialize players array.
function setup() {
    //click button1 to connect
    document.getElementById("button1").onclick = function() {
        socket = io('http://192.168.1.28:8080');
        //try to send an action and wait for connected response

        socket.emit("client_action");


        //if connected is received from the server then create another button to join a room
        socket.on('connect', function(data) {
            var date = new Date();
            currentTime = date.getMilliseconds();
            socket.on("get_grid", getGrid);
            //delete the previous button
            document.getElementById("button1").parentNode.removeChild(document.getElementById("button1"));

            //TODO:make this a separate function

            //create button to start game and join room
            btn = document.createElement("button");
            btn.innerHTML = "Start!";
            btn.id = "button2";
            btn.name = "but";
            btn.width = 200;
            btn.height = 200;
            document.body.appendChild(btn);

            btn.onclick = function() {
                // Remove own button
                btn.parentNode.removeChild(btn);
                socket.emit("join_room", "Room1");

                // Wait for initial map.
                socket.on("initialize_game", initGame);
                initializeLocal();
            }
        });
    }
}

//initializes local game
function initializeLocal() {
    //aspect_ratio = windowWidth / windowHeight;

    block_size = Math.round(Math.max(windowWidth, windowHeight) / view_blocks_number);
    block_size = (Math.round(block_size / 10) * 10);

    speed = block_size / 10;

    number_of_blocks_height = Math.ceil(windowHeight / block_size);
    number_of_blocks_width = Math.ceil(windowWidth / block_size);


    createCanvas(windowWidth, windowHeight);
}

function draw() {

    // Make speed adapts to change in frame rate
    speed = block_size / 200 * (1000 / frameRate())

    if (startGame) { // Clear screen.

        background(255);

        // Change players positions.
        handleMovement();

        fixDir();

        updateGrid();

        drawGrid();

        finalize();
        //console.log(getFrameRate());
    }
}