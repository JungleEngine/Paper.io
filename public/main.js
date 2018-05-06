var KEY_PRESSED;
var aspect_ratio;
var view_blocks_number = 40;
var block_width;
var block_height;
var number_of_blocks_height;
var number_of_blocks_width;
var player;

// player_color : tail : block_color : shadow.
var COLORS = ['empty', '#edeff4'
    // Blue Player.
    , '#0041a1', '#076bff', '#d81178 ', '#002c6e'
    // Red Player.
    , '#190000', '#ff3333', '#020151', '#ff8080'
    // Green player.
    , '#0a3801', '#49f925', '#0a2804','#245b19'
    // Purple.
    , '#450877', '#8c10f2', '#23073a', '#23073a'
    // Yellow.
    , '#7b8710', '#c0d12e', '#454c06', '#9daa23'
    // Pink.
    , '#991d5b', '#ff63b1', '#590730', '#a8346e'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Yelloww
    , '#9b8d0f', '#efde45', '#7a6e01', '#91872e'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'
    // Light blue.
    , '#196852', '#56efc6', '#023a2b', '#4eb297'




];

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
        GameConfig.SOCKET = io();

        //try to send an action and wait for connected response

        GameConfig.SOCKET.emit("client_action");


        //if connected is received from the server then create another button to join a room
        GameConfig.SOCKET.on('connect', function(data) {
            var date = new Date();
            currentTime = date.getMilliseconds();


            GameConfig.SOCKET.on("player_key_press", onPlayerKeyPress);
            GameConfig.SOCKET.on("player_change_direction", onPlayerChangeDir);
            GameConfig.SOCKET.on("area_filling", onPlayerFillArea)

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
            document.body.insertAdjacentHTML('beforeend', "<h1>ROOM NAME</h1>");
            document.body.insertAdjacentHTML('beforeend', "<input type='text' id='room_name' >");


            document.body.insertAdjacentHTML('beforeend', "<h1>LOGIN</h1>");

            document.body.insertAdjacentHTML('beforeend', "<input type='text' id='username' >");
            document.body.insertAdjacentHTML('beforeend', "<input type='password' id='password' >");

            document.body.appendChild(btn);

            btn.onclick = function() {
                // Remove own button
                btn.parentNode.removeChild(btn);

                let username =  document.getElementById('username').value;
                let password =  document.getElementById('password').value;

                let room_name = document.getElementById('room_name').value;
                document.body.innerHTML = "";


                GameConfig.SOCKET.emit("join_room", {"room_name": room_name, "username": username, "password":password});

                // Wait for initial map.
                GameConfig.SOCKET.on("initialize_game", initGame);

                GameConfig.SOCKET.on("wrong_credentials",handleWrongCredentials);
                // New player joined the room.
                GameConfig.SOCKET.on("new_player", newPlayerJoinedTheRoom);
                GameConfig.SOCKET.on("player_died", playerDied);
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
        //GameConfig.PAUSE = !GameConfig.PAUSE;
        //pauseServer();
    }
    return false; // prevent any default behavior
}

function draw() {
    GameConfig.UPDATE_SPEED(getFrameRate());
    // Make speed adapts to change in frame rate

    //speed  =  block_size / 200 * (1000/frameRate())

    if (startGame) {

        if (GameConfig.PAUSE)
            return;

        // Clear screen.
        background(255);

        simulate();

        updateGrid();

        drawGrid();

        //checkFilling();
        finalize();

    }

}
