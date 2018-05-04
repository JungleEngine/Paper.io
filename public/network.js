var players_in_room_count = 2;
//players in room
var players = {};
// Current Client ID.
let current_player_ID;


function initGame(data) {

    // Set initial grid.
    GameConfig.GRID = data["grid"];
    //console.log(data);
    //console.log("init game ",data);
    for (i in data["players"]) {

        curr_player = data["players"][i];
        //console.log(curr_player.player_color_index)
        player = new Player(new Dir(curr_player["dir_x"], curr_player["dir_y"]), new Position(GameConfig.BLOCK_SIZE * curr_player["pos_x"], GameConfig.BLOCK_SIZE * curr_player["pos_y"]), curr_player["ID"]);

        player.fix_position.x = 0;
        player.fix_position.y = 0;

        //player.KEY_PRESSED = curr_player["KEY_PRESSED"];
        players[player.ID] = player;

        if (int(curr_player.ID) == int(data.player_id)) {

            current_player_ID = player.ID;

        }


    }

    // Start the game.
    startGame = true;

}

/*
// Set initial  parameters for game.
function initGame(data){

    // Initial this player position.
    player = new Player(new Dir(1, 0), new Position(GameConfig.BLOCK_SIZE * data["pos_x"], GameConfig.BLOCK_SIZE * data["pos_y"]), data["player_color_index"]);

    player2 = new Player(new Dir(0, 1), new Position(GameConfig.BLOCK_SIZE * (data["pos_x"]-1), GameConfig.BLOCK_SIZE * (data["pos_y"]+5))    , data["player_color_index"]+4);

    // Set current client to players[0].
    players[player.ID] = player;
    current_player_ID = player.ID;
   // Set initial key pressed.
    players[player.ID].KEY_PRESSED = data["dir"];

    players[player2.ID] = player2;
    players[player2.ID].KEY_PRESSED = 'up';
    // Set players count.

    // Set initial grid.
    GameConfig.GRID = data["grid"];
    console.log(players[current_player_ID])
    // Start the game.
    startGame = true;

}*/

function pauseServer() {
    socket.emit("pause");
}

// Emit updates to server.
function emitUpdatesToServer(updates) {

    //console.log(updates);
    // Emit client action to server to be validated.
    socket.emit("validate", updates);

}

function onPlayerKeyPress(data) {

    console.log(" Player key press -> ", data);

    // Update target player data.
    players[data["player_ID"]].updatePlayerKeyPressFromDir(data["player_next_dir"][0], data["player_next_dir"][1]);
    players[data["player_ID"]].wait_server_response = false;

    // Update target player position.
    players[data["player_ID"]].position.x = data["player_pos"][0] * GameConfig.BLOCK_SIZE;
    players[data["player_ID"]].position.y = data["player_pos"][1] * GameConfig.BLOCK_SIZE;


    // Update fix position
    players[data["player_ID"]].fix_position.x = data["player_fix_pos"][0] * GameConfig.BLOCK_SIZE;
    players[data["player_ID"]].fix_position.y = data["player_fix_pos"][1] * GameConfig.BLOCK_SIZE;

    // Update player KEY_PRESSED from dir.

    // To avoid fixing direction more than one time per loop.
    //players[data["player_ID"]].direction_already_fixed = true;

}

function onPlayerChangeDir(data) {

    //   console.log(" player change dir -> ", data);

    // If it is not a new player.
    if (data["player_ID"] in players) {

        // Update target player data.

        players[data["player_ID"]].dir.x = data["player_dir"][0];
        players[data["player_ID"]].dir.y = data["player_dir"][1];
        //console.log(" player dir ", players[data.player_ID].dir.x," , ", players[data.player_ID].dir.y);
        //console.log(players[data.player_ID].position.x / GameConfig.BLOCK_SIZE, players[data.player_ID].position.y / GameConfig.BLOCK_SIZE);
        // Update target player position.

        //console.log(" old pos ", players[data["player_ID"]].position);
        //players[data["player_ID"]].position.x = data["player_pos"][0] * GameConfig.BLOCK_SIZE;
        //players[data["player_ID"]].position.y = data["player_pos"][1] * GameConfig.BLOCK_SIZE;
        //console.log(" new pos", players[data["player_ID"]].position);
    } else {
        //     console.log("new player connected!");
        //   console.log(data);
        player = new Player(new Dir(data["player_dir"][0], data["player_dir"][1]), new Position(GameConfig.BLOCK_SIZE * data["player_pos"][0], GameConfig.BLOCK_SIZE * data["player_pos"][1]), data["player_ID"]);

        players[player.ID] = player;

    }
    // Update player KEY_PRESSED from dir.
    players[data["player_ID"]].updateKeyPressFromDir();
    players[data["player_ID"]].wait_server_response = false;

    // To avoid fixing direction more than one time per loop.
    players[data["player_ID"]].direction_already_fixed = true;

}

function newPlayerJoinedTheRoom(data) {

    //console.log("new player added ");
    // Check if player is this player then do nothing.
    if (data["player_id"] === current_player_ID)
        return;

    //console.log("new player joined, ",data);
    GameConfig.GRID = data["grid"];

    player = new Player(new Dir(data["dir_x"], data["dir_y"]), new Position(GameConfig.BLOCK_SIZE * data["pos_x"], GameConfig.BLOCK_SIZE * data["pos_y"]), data["player_id"]);

    players[player.ID] = player;

    players[player.ID].updateKeyPressFromDir();
    players[player.ID].record_path = true;
}