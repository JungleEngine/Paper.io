// Convert world coordinates to local screen pixels coordinates.
function worldToScreenCoordinates(player_global_pixel_position_x
    , player_global_pixel_position_y) {
    // All players to this player distance.
    let another_player_x_distance = players[current_player_ID].position.x - player_global_pixel_position_x;
    let another_player_y_distance = players[current_player_ID].position.y - player_global_pixel_position_y;

    // Get screen pixel coordintes from 0,0.
    return [(windowWidth / 2) - another_player_x_distance, (windowHeight / 2) - another_player_y_distance];
}

function globalize() {
    let x_distance = (windowWidth / 2) - x;
    let y_distance = (windowHeight / 2) - y;
    return [player.position.x - x_distance, player.position.y - y_distance];
}


function validateKeyPress() 
{

    let x = null;
    let y = null;
    if (keyIsDown(RIGHT_ARROW) && players[current_player_ID].KEY_PRESSED != 'left' 
        && players[current_player_ID].KEY_PRESSED != 'right') 
    {
    
        players[current_player_ID].KEY_PRESSED = 'right';
        x = 1;
        y = 0;
    
    }

    if (keyIsDown(LEFT_ARROW) && players[current_player_ID].KEY_PRESSED != 'right' 
        && players[current_player_ID].KEY_PRESSED != 'left') 
    {
    
        players[current_player_ID].KEY_PRESSED = 'left';
        x = -1;
        y = 0;
    
    }

    if (keyIsDown(UP_ARROW) && players[current_player_ID].KEY_PRESSED != 'down' && 
        players[current_player_ID].KEY_PRESSED != 'up') 
    {
    
        players[current_player_ID].KEY_PRESSED = 'up';
        x = 0;
        y = -1;
    
    }

    if (keyIsDown(DOWN_ARROW) && players[current_player_ID].KEY_PRESSED != 'up' && 
        players[current_player_ID].KEY_PRESSED != 'down') 
    {
     
        players[current_player_ID].KEY_PRESSED = 'down';
        x = 0;
        y = 1;
    
    }
    
    if (x != null && y != null) {

        // Send updates to server (player direction, player position ).
        updates = {};
        updates["player_dir"] = [x, y];
        updates["player_pos_normalized"] = players[current_player_ID].position / block_size;
        emitUpdatesToServer(updates);
    }

}

function handleMovement() 
{

    // Players to be removed.
    players_to_remove = [];

    // Validate player action.
    validateKeyPress();

    for ( let i in players )
    {

    // Change direction when reaching the end of a cell.
        if ( players[i].position.x % block_size < speed && players[i].position.y % block_size < speed)
        {
            
            if (players[i].KEY_PRESSED == 'right')
            {
            
                players[i].dir.x = 1;
                players[i].dir.y = 0;
            
            }

            if (players[i].KEY_PRESSED == 'left')
            {
            
                players[i].dir.x = -1;
                players[i].dir.y = 0;
            
            }

            if (players[i].KEY_PRESSED == 'up')
            {
            
                players[i].dir.x = 0;
                players[i].dir.y = -1;
            
            }

            if (players[i].KEY_PRESSED == 'down')
            {
            
                players[i].dir.x = 0;
                players[i].dir.y = 1;
            
            }

        }

      //  console.log("player # " + i + " position " + players[i].position.x)
        players[i].position.x += players[i].dir.x * speed;
        players[i].position.y += players[i].dir.y * speed;


    // -------------------- Checking for loss ------------------------------

    let x = 0;
    let y = 0;

    // players[i] moving down.
    if (players[i].dir.equal(new Dir(0, 1))) 
    {
    
        x = Math.round(players[i].position.x / block_size);
        y = Math.ceil(players[i].position.y / block_size);
    
    }

    // players[i] moving up.
    if (players[i].dir.equal(new Dir(0, -1)))
    {
    
        x = Math.round(players[i].position.x / block_size);
        y = Math.floor(players[i].position.y / block_size);
    
    }

    // players[i] moving left.
    if (players[i].dir.equal(new Dir(1, 0))) 
    {
    
        x = Math.ceil(players[i].position.x / block_size);
        y = Math.round(players[i].position.y / block_size);
    
    }

    // players[i] moving right.
    if (players[i].dir.equal(new Dir(-1, 0)))
    {
    
        x = Math.floor(players[i].position.x / block_size);
        y = Math.round(players[i].position.y / block_size);
    
    }

    // Hit your tail or border or = lose.
    if (grid[x][y] == 1 ||  grid[x][y] == players[i].ID + 1 )
    {

        window.alert('Game over!');
        socket.disconnect();
        location.reload();
    
    }

    // Check killing another client ( block ).
    else if ( ( grid[x][y] - 2 ) % 4 == 0) 
    {
       //  To remove player from grid later, head collision.
       players_to_remove.push(grid[x][y])   

    }

    // TO remove player from grid later, tail collision.
    else if ( ( grid[x][y] - 3 ) % 4 == 0) 
    {
       //  To remove player from grid later.
       players_to_remove.push(grid[x][y] - 1)   

    }


    }

    // Remove dead players from grid.
   // removeDeadPlayers(players_to_remove);
}

function removeDeadPlayers(dead_players)
{

    // Remove dead players from players array.
    for( let i = 0; i < dead_players.length; i++)
    {

        delete players[dead_players[i]];

    }

    //console.log(dead_players.length);
    
    for( let i = grid_start; i < grid_end; i++)
        for( let j = grid_start; j < grid_end; j++)
        {
            // If current cell is of a dead player then clear it.
            if(    dead_players.indexOf(grid[i][j]   ) != -1
                || dead_players.indexOf(grid[i][j] - 1 ) != -1
                || dead_players.indexOf(grid[i][j] - 2  ) != -1 )
            {   
                
                grid[i][j] = 0;
            
            }
        }
}

function drawGrid()
{

    noStroke();

    let x_window_start = Math.round((players[current_player_ID].position.x - (windowWidth / 2)) / block_size);
    let y_window_start = Math.round((players[current_player_ID].position.y - (windowHeight / 2)) / block_size);

    noStroke();

    for (i = x_window_start - 1; i <= x_window_start + number_of_blocks_width; ++i) {
        for (j = y_window_start - 1; j <= y_window_start + number_of_blocks_height; ++j) {
            if (grid[i][j] != 0) {


                // Set color for filling.
                console.log("grid size ",grid.length);
                console.log("grid color ",grid[i][j],i," ",j);
                fill(color(COLORS[grid[i][j]]));

                // Convert index in grid to global pixel location.
                player_global_pixel_position_x = i * block_size;
                player_global_pixel_position_y = j * block_size;

                // Get player screen pixel location.
                let [player_local_pixel_position_x
                    , player_local_pixel_position_y] = worldToScreenCoordinates(player_global_pixel_position_x
                    , player_global_pixel_position_y);

                rect(player_local_pixel_position_x, player_local_pixel_position_y, block_size + 1, block_size + 1); // +1 for filling gaps between cells 
            }
        }
    }

    for ( let i in players)
    {

    // Draw player shadow.
    fill(color(COLORS[players[i].ID + 2]));

    let [player_local_pixel_position_x
        , player_local_pixel_position_y] = worldToScreenCoordinates(players[i].position.x
        , players[i].position.y);
    player_local_pixel_position_x /= block_size;
    player_local_pixel_position_y /= block_size;

    rect(player_local_pixel_position_x * block_size, player_local_pixel_position_y * block_size, block_size + 1, block_size + 5); // +1 for filling gaps between cells

    // Draw player.
    fill(color(COLORS[players[i].ID]));

    rect(player_local_pixel_position_x * block_size, player_local_pixel_position_y * block_size, block_size + 1, block_size + 1); // +1 for filling gaps between cells
    
    }
}


function updateGrid() {

    for ( let i in players)
    {
    
    let x = 0;
    let y = 0;

    // Player moving down. 
    if (players[i].dir.equal(new Dir(0, 1))) 
    {
    
        x = Math.round(players[i].position.x / block_size);
        y = Math.floor(players[i].position.y / block_size);
    
    }

    // players[i] moving up.
    if (players[i].dir.equal(new Dir(0, -1))) 
    {
    
        x = Math.round(players[i].position.x / block_size);
        y = Math.ceil(players[i].position.y / block_size);
    
    }

    // players[i] moving left. 
    if (players[i].dir.equal(new Dir(1, 0))) 
    {
    
        x = Math.floor(players[i].position.x / block_size);
        y = Math.round(players[i].position.y / block_size);
    
    }

    // players[i] moving right.
    if (players[i].dir.equal(new Dir(-1, 0))) 
    {
    
        x = Math.ceil(players[i].position.x / block_size);
        y = Math.round(players[i].position.y / block_size);
    
    }

    
    // Check if grid color is my block color -> leave it.
    // Tail color.
    if(grid[x][y] == players[i].ID+2)
    {
        // TODO:: change filling flag.
    }
    else
    {

    grid[x][y] = players[i].ID + 1;
    
    }
    }
}


function fixDir()
{

    for ( let i in players)
    {
    
    if (!players[i].dir.equal(players[i].last_dir)) 
    {
    
        players[i].position.x = Math.round(players[i].position.x / block_size) * block_size;
        players[i].position.y = Math.round(players[i].position.y / block_size) * block_size;
    
    }
    
    }

}


function finalize() {

    for ( let i in players)
    {
    
        players[i].last_dir.x = players[i].dir.x;
        players[i].last_dir.y = players[i].dir.y;
    
    }

}