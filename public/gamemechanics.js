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

    else if (keyIsDown(LEFT_ARROW) && players[current_player_ID].KEY_PRESSED != 'right'
        && players[current_player_ID].KEY_PRESSED != 'left')
    {

        players[current_player_ID].KEY_PRESSED = 'left';
        x = -1;
        y = 0;

    }

    else if (keyIsDown(UP_ARROW) && players[current_player_ID].KEY_PRESSED != 'down' &&
        players[current_player_ID].KEY_PRESSED != 'up')
    {

        players[current_player_ID].KEY_PRESSED = 'up';
        x = 0;
        y = -1;

    }

    else if (keyIsDown(DOWN_ARROW) && players[current_player_ID].KEY_PRESSED != 'up' &&
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
        players[i].updateDirFromKeyPress();

        players[i].position.x += players[i].dir.x * GameConfig.SPEED;
        players[i].position.y += players[i].dir.y * GameConfig.SPEED;
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
        if (GameConfig.GRID[x][y] == 1 ||  GameConfig.GRID[x][y] == players[i].ID + 1 )
        {

            //window.alert('Game over!');
            //socket.disconnect();
            //location.reload();

        }

        // Check killing another client ( block ).
        else if ( ( GameConfig.GRID[x][y] - 2 ) % 4 == 0)
        {
            //  To remove player from GameConfig.GRID later, head collision.
            players_to_remove.push(GameConfig.GRID[x][y])

        }

        // TO remove player from GameConfig.GRID later, tail collision.
        else if ( ( GameConfig.GRID[x][y] - 3 ) % 4 == 0)
        {
            //  To remove player from GameConfig.GRID later.
            players_to_remove.push(GameConfig.GRID[x][y] - 1)

        }


    }

    // Remove dead players from GameConfig.GRID.
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
            if(    dead_players.indexOf(GameConfig.GRID[i][j]   ) != -1
                || dead_players.indexOf(GameConfig.GRID[i][j] - 1 ) != -1
                || dead_players.indexOf(GameConfig.GRID[i][j] - 2  ) != -1 )
            {

                GameConfig.GRID[i][j] = 0;

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
            //console.log(" window_start " , x_window_start,"number  of blocks",number_of_blocks_width);
            if (GameConfig.GRID[i][j] != 0) {


                // Set color for filling.
                fill(color(COLORS[GameConfig.GRID[i][j]]));

                // Convert index in GameConfig.GRID to global pixel location.
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

        let player_pos_on_grid = players[i].getPlayerPositionOnGrid();
        x = player_pos_on_grid.x;
        y = player_pos_on_grid.y;

        // Check if grid color is my block color -> leave it.
        // Tail color.
        if(GameConfig.GRID[x][y] == players[i].ID+2)
        {

            // TODO:: change filling flag.

        }
        else
        {
            // if(players[i].on_his_area)
            // {
            //
            //     players[i].on_his_area = false;
            //     players[i].was_on_his_area = true;
            //
            // }

            GameConfig.GRID[x][y] = players[i].ID + 1;

        }
    }
}


function fixDir()
{

    for ( let i in players)
    {

        // Do not fix direction if the server already fixed it before.
        if(players[i].direction_already_fixed)
        {

            players[i].direction_already_fixed = false;
            continue;
        }
        if (!players[i].dir.equal(players[i].last_dir))
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

            players[i].position.x = x * block_size;
            players[i].position.y = y * block_size;

        }

    }

}

// Check filling for every player.
// Store start and end position.
function checkFilling()
{

    for ( let i in players)
    {

        let player_pos_on_grid = players[i].getPlayerPositionOnGrid();

        // Check if player left his own area.
        if((GameConfig.GRID[player_pos_on_grid.x][player_pos_on_grid.y] === players[i].ID+1)
            && (GameConfig.GRID[player_pos_on_grid.x - players[i].dir.x][player_pos_on_grid.y - players[i].dir.y]
                ===players[i].ID+2))
        {

            // Should try to fill player area.
            players[i].last_position_on_grid = new Position(player_pos_on_grid.x - players[i].dir.x,
                player_pos_on_grid.y - players[i].dir.y);

            // Player should record its path.
            players[i].record_path = true;

            // Record this step.
            if(typeof players[i].path_vector[players[i].last_position_on_grid.y] === 'undefined')
                players[i].path_vector[players[i].last_position_on_grid.y] = [];

            if(!players[i].path_vector[players[i].last_position_on_grid.y].includes(players[i].last_position_on_grid.x))
                players[i].path_vector[players[i].last_position_on_grid.y].push(players[i].last_position_on_grid.x)

        }

        // Check if player should fill his area.
        else if((GameConfig.GRID[player_pos_on_grid.x][player_pos_on_grid.y] === players[i].ID+2)
        && (GameConfig.GRID[player_pos_on_grid.x - players[i].dir.x][player_pos_on_grid.y - players[i].dir.y]
        ===players[i].ID+1))
        {
            if(!players[i].record_path)
                return;
            players[i].record_path = false;

            // Should try to fill player area.
            let path = players[i].tryToFill();
            players[i].record_path = false;

            // Record this step.
            if(typeof players[i].path_vector[player_pos_on_grid.y] === 'undefined')
                players[i].path_vector[player_pos_on_grid.y] = [];

            if(!players[i].path_vector[player_pos_on_grid.y].includes(player_pos_on_grid.x))
                players[i].path_vector[player_pos_on_grid.y].push(player_pos_on_grid.x);
           // console.log(" path vector ", players[i].path_vector);

            //console.log("path", path);

            for( let obj in path)
            {
                let pos_x = path[obj].x;
                let pos_y = path[obj].y;

                if(typeof players[i].path_vector[pos_y] === 'undefined')
                            players[i].path_vector[pos_y] = [];

                if(!players[i].path_vector[pos_y].includes(pos_x))
                    players[i].path_vector[pos_y].push(pos_x);

            }

            // for(let x in path)
            // {
            //     for( let y in path[x])
            //     {
            //         if(typeof players[i].path_vector[path[x][y]] === 'undefined')
            //             players[i].path_vector[path[x][y]] = [];
            //         players[i].path_vector[path[x][y]].push(x);
            //     }
            //
            //
            // }
            let logger = [];
            for(let y in players[i].path_vector)
            {
                for(let x in players[i].path_vector[y])
                {
                    //if(x<players[i].path_vector[y].length()-1)
                   // let tempx_min =
                    for(let tempx =players[i].path_vector[y][x]; tempx<players[i].path_vector[y].length-1; tempx++)
                    {
                        GameConfig.GRID[players[i].path_vector[y][x]][y]=players[i].ID+2;

                        if(logger[[players[i].path_vector[y][x],y]]== null)
                        {
                            logger.push([players[i].path_vector[y][x],y]);
                        }
                    }
                }
            }
            console.log("path -> ",path);
            console.log("start pos  -> ",players[i].last_position_on_grid);
            console.log("end pos  -> ",player_pos_on_grid);
            console.log("all path -> ",players[i].path_vector);
            console.log("all points -> ",logger);

        }
        else {

            if(!players[i].dir.equal(players[i].last_dir))
            {

            players[i].filled = false;
            if(typeof players[i].path_vector[player_pos_on_grid.y] === 'undefined')
                players[i].path_vector[player_pos_on_grid.y] = [];

            players[i].path_vector[player_pos_on_grid.y].push(player_pos_on_grid.x);
            }
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