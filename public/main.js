var KEY_PRESSED;
var aspect_ratio;
var view_blocks_number = 40;
var block_width;
var block_height;
var number_of_blocks_height;
var number_of_blocks_width;
var player;

var COLORS = [ 'empty', '#edeff4'
    // Blue Player.
    , '#0041a1', '#076bff', '#d81178 ', '#002c6e'
    // Red Player.
    , '#190000', '#ff3333', '#660000', '#ff8080' ];

var socket;
var currentTime = 0;
var ValidAction = true;
const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;
const border_to_block_ratio = 0.5;
var startGame = false;

const curr_client_indx = 0;

var game_started = false;


// TODO: function to be called by SocketIO to initialize players localhost array.
function setup() {
    //click button1 to connect
    document.getElementById("button1").onclick = function() {
        socket = io();

        //try to send an action and wait for connected response

        socket.emit("client_action");


        //if connected is received from the server then create another button to join a room
        socket.on('connect', function(data) {
            var date = new Date();
            currentTime = date.getMilliseconds();


            socket.on("player_key_press", onPlayerKeyPress);
            socket.on("player_change_direction", onPlayerChangeDir);

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
            document.body.insertAdjacentHTML('beforeend',"<h1> room name  </h1>");
            document.body.insertAdjacentHTML('beforeend',"<input type='text' id='room_name' >");

            document.body.appendChild(btn);

            btn.onclick = function() {
                // Remove own button
                btn.parentNode.removeChild(btn);

                let room_name = document.getElementById('room_name').value;
                document.body.innerHTML= "";


                socket.emit("join_room", room_name);

                // Wait for initial map.
                socket.on("initialize_game", initGame);

                // New player joined the room.
                socket.on("new_player",newPlayerJoinedTheRoom);
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
    GameConfig.BLOCK_SIZE = block_size;
    // game_config.BLOCK_SIZE = block_size;
    //   game_config.SPEED = speed;

    number_of_blocks_height = Math.ceil(windowHeight / block_size);
    number_of_blocks_width = Math.ceil(windowWidth / block_size);


    //  game_config.NUMBER_OF_BLOCKS_HEIGHT = number_of_blocks_height;
    // game_config.NUMBER_OF_BLOCKS_WIDTH = number_of_blocks_width;


    createCanvas(windowWidth, windowHeight);
}

 function keyReleased() {
   if (keyCode == 87) {
       GameConfig.PAUSE = !GameConfig.PAUSE;
       pauseServer();
   }
   return false; // prevent any default behavior
 }
function draw() {
    GameConfig.UPDATE_SPEED(getFrameRate());
    // Make speed adapts to change in frame rate

    //speed  =  block_size / 200 * (1000/frameRate())

    if (startGame ) {

        if(GameConfig.PAUSE)
            return;

        // Clear screen.
        background(255);

        simulate();

        updateGrid();

        drawGrid();

        checkFilling();
        finalize();

    }

}