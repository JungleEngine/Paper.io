
var players_in_room_count = 2;

// Current Client ID.
var current_player_ID;
// Set initial  parameters for game.
function initGame(data) {

    // Initial this player position.
    player = new Player(new Dir(1, 0), new Position(block_size * data["pos_x"], block_size * data["pos_y"]), data["player_color_index"]);

    player2 = new Player(new Dir(1, 0), new Position(block_size * (data["pos_x"]-10), block_size * (data["pos_y"]+5))    , data["player_color_index"]+4);

    // Set current client to players[0].
    players[player.ID] = player;
    current_player_ID = player.ID;    
   // Set initial key pressed.
    players[player.ID].KEY_PRESSED = data["dir"];

    players[player2.ID] = player2;
    players[player2.ID].KEY_PRESSED = data["dir"];
    // Set players count.

    // Set initial grid.
    grid = data["grid"];

    // Start the game.
    startGame = true;

}


// Emit updates to server.
function emitUpdatesToServer(updates){

    // Emit client action to server to be validated.
    //console.log(data)
    socket.emit('getClientAction', updates);

}
function getGrid(data){

function getGrid(data) {

    console.log(data);
    var date = new Date();
    t = date.getMilliseconds();
    console.log(" time : ", t - currentTime);
}