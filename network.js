
// Set initial  parameters for game.
function initGame(data){

    // Initial this player position.
    player = new Player(new Dir(0, 0), new Position(block_size * data["pos_x"], block_size * data["pos_y"]), data["player_color_index"]);

   // Set initial key pressed.
    KEY_PRESSED = data["dir"];

    // Set initial grid.
    grid = data["grid"];

    // Start the game.
    startGame = true;

}
function getGrid(data){

	console.log(data);
	var date = new Date();
	t = date.getMilliseconds();
	console.log(" time : ", t - currentTime);
}