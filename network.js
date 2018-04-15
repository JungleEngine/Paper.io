var players_in_room_count = 2;
//players in room
var players = {};
// Current Client ID.
let current_player_ID;


function initGame(data)
{

    // Set initial grid.
    grid = data["grid"];
    console.log(data);
    //console.log(data)
    for ( i in data["players"])
    {

        curr_player = data["players"][i]
        //console.log(curr_player.player_color_index)
        player = new Player(new Dir(curr_player["dir_x"], curr_player["dir_y"])
                ,new Position(block_size * curr_player["pos_x"]
                ,    block_size * curr_player["pos_y"]), curr_player["ID"]);

        //player.KEY_PRESSED = curr_player["KEY_PRESSED"];
        players[player.ID] = player;

        if(int(curr_player.ID) == int(data.player_id))
        {

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
    player = new Player(new Dir(1, 0), new Position(block_size * data["pos_x"], block_size * data["pos_y"]), data["player_color_index"]);

    player2 = new Player(new Dir(0, 1), new Position(block_size * (data["pos_x"]-1), block_size * (data["pos_y"]+5))    , data["player_color_index"]+4);

    // Set current client to players[0].
    players[player.ID] = player;
    current_player_ID = player.ID;    
   // Set initial key pressed.
    players[player.ID].KEY_PRESSED = data["dir"];

    players[player2.ID] = player2;
    players[player2.ID].KEY_PRESSED = 'up';
    // Set players count.

    // Set initial grid.
    grid = data["grid"];
    console.log(players[current_player_ID])
    // Start the game.
    startGame = true;

}*/


// Emit updates to server.
function emitUpdatesToServer(updates){

    // Emit client action to server to be validated.
    //console.log(data)
    socket.emit("validate", updates);

}

function getGrid(data){

	console.log(data);
	var date = new Date();
	t = date.getMilliseconds();
	console.log(" time : ", t - currentTime);
}

function onPlayKeyPress(data)
{

console.log(" Player key press -> ", data)
}

function onPlayerChangeDir(data)
{

console.log(" player change dir -> ", data)
}