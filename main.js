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
const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;
const border_to_block_ratio = 0.5;
var startGame = false;
// TODO: get number of players in room.
var players_in_room_count = 0;

//players in room
var players = [];

function initGrid() {
    // Initialize the grid with zeros.
    for (i = 0; i < canvas_length; ++i) {
        grid[i] = [];

        for (j = 0; j < canvas_length; ++j) {

            grid[i][j] = 0;
        }
    }

    // Draw game borders in grid.
    let border_start = grid_start - 1;
    let border_end = grid_end + 1;

    for (i = border_start; i <= border_end; ++i)
        grid[i][border_start] = 1;

    for (i = border_start; i <= border_end; ++i)
        grid[i][border_end] = 1;

    for (i = border_start; i <= border_end; ++i)
        grid[border_start][i] = 1;

    for (i = border_start; i <= border_end; ++i)
        grid[border_end][i] = 1;
}

// TODO: function to be called by SocketIO to initialize players array.
function setup() {
    //click button1 to connect
    document.getElementById("button1").onclick = function() {
        socket = io('http://localhost:8080');
        //try to send an action and wait for connected respnse 
        socket.emit("client_action");

        //if connected is recieved from the server then create another button to join a room
        socket.on('connect', function(data) {
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
                //remove own button
                btn.parentNode.removeChild(btn);
                socket.emit("join_room", "Room1");
                startGame = true;

                //TODO:make this a separate function
                //aspect_ratio = windowWidth / windowHeight;

                block_size = Math.round(Math.max(windowWidth, windowHeight) / view_blocks_number);
                block_size = (Math.round(block_size / 10) * 10);

                speed = block_size / 10;

                number_of_blocks_height = Math.ceil(windowHeight / block_size);
                number_of_blocks_width = Math.ceil(windowWidth / block_size);

                // Initial this player position.
                player = new Player(new Dir(1, 0), new Position(block_size * 50, block_size * 50), 2);

                // Set initial key pressed.
                KEY_PRESSED = 'right';

                createCanvas(windowWidth, windowHeight);

                initGrid();
            }


        });
    }
}

function draw() {

    if (startGame) { // Clear screen.


        background(255);

        // Change players positions.
        handleMovement();

        fixDir();

        updateGrid();

        drawGrid();

        finalize();
    }
}