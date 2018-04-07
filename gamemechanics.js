
// Convert world coordinates to local screen pixels coordinates.
function worldToScreenCoordinates(   player_global_pixel_position_x
                                    ,player_global_pixel_position_y) 
{
    // All players to this player distance.
    let another_player_x_distance = player.position.x - player_global_pixel_position_x;
    let another_player_y_distance = player.position.y - player_global_pixel_position_y;

    // Get screen pixel coordintes from 0,0.
    return [(windowWidth / 2) - another_player_x_distance, (windowHeight / 2) - another_player_y_distance];
}

function globalize() {
    let x_distance = (windowWidth / 2) - x;
    let y_distance = (windowHeight / 2) - y;
    return [player.position.x - x_distance, player.position.y - y_distance];
}

function handleMovement()
{

    if (keyIsDown(RIGHT_ARROW) && KEY_PRESSED != 'left') {
        KEY_PRESSED = 'right';
    }

    if (keyIsDown(LEFT_ARROW) && KEY_PRESSED != 'right') {
        KEY_PRESSED = 'left';;
    }

    if (keyIsDown(UP_ARROW) && KEY_PRESSED != 'down') {
        KEY_PRESSED = 'up';
    }

    if (keyIsDown(DOWN_ARROW) && KEY_PRESSED != 'up') {
        KEY_PRESSED = 'down';
    }

    // Change direction when reaching the end of a cell
    if (player.position.x % block_size < speed && player.position.y % block_size < speed) {
        if (KEY_PRESSED == 'right') {
            player.dir.x = 1;
            player.dir.y = 0;
        }

        if (KEY_PRESSED == 'left') {
            player.dir.x = -1;
            player.dir.y = 0;
        }

        if (KEY_PRESSED == 'up') {
            player.dir.x = 0;
            player.dir.y = -1;
        }

        if (KEY_PRESSED == 'down') {
            player.dir.x = 0;
            player.dir.y = 1;
        }
    }

    // Update player position.
    player.position.x += player.dir.x * speed;
    player.position.y += player.dir.y * speed;

    // Update other players positions.
    for( i = 0; i < players_in_room_count; i++)
    {
        players[i].position.x += player.dir.x * speed;
        players[i].position.y += player.dir.y * speed;

    }

    // -------------------- Checking for lose ------------------------------

    let x = 0;
    let y = 0;

    // Player moving down.
    if (player.dir.equal(new Dir(0, 1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.ceil(player.position.y / block_size);
    }

    // Player moving up.
    if (player.dir.equal(new Dir(0, -1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.floor(player.position.y / block_size);
    }

    // Player moving left.
    if (player.dir.equal(new Dir(1, 0))) {
        x = Math.ceil(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Player moving right.
    if (player.dir.equal(new Dir(-1, 0))) {
        x = Math.floor(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Hit your tail or border = lose.
    if (grid[x][y] == player.ID + 1 || grid[x][y] == 1) {
        window.alert('Game over!');
        socket.disconnect();
        location.reload();
    }
}


function drawGrid() 
{

    noStroke();

    let x_window_start = Math.round((player.position.x - (windowWidth / 2)) / block_size);
    let y_window_start = Math.round((player.position.y - (windowHeight / 2)) / block_size);

    noStroke();

    for (i = x_window_start - 1; i <= x_window_start + number_of_blocks_width; ++i) {
        for (j = y_window_start - 1; j <= y_window_start + number_of_blocks_height; ++j) {
            if (grid[i][j] != 0) {

                // Set color for filling.
                fill(color(COLORS[grid[i][j]]));

                // Convert index in grid to global pixel location.
                player_global_pixel_position_x = i * block_size;
                player_global_pixel_position_y = j * block_size;

                // Get player screen pixel location.
                let [player_local_pixel_position_x
                    ,player_local_pixel_position_y] = worldToScreenCoordinates( player_global_pixel_position_x
                                                                               ,player_global_pixel_position_y);

                rect(player_local_pixel_position_x, player_local_pixel_position_y, block_size + 1, block_size + 1); // +1 for filling gaps between cells 
            }
        }
    }

    // Draw player shadow.
    fill(color(COLORS[player.ID + 2]));

    let [player_local_pixel_position_x
        ,player_local_pixel_position_y] = worldToScreenCoordinates(  player.position.x
                                                                    ,player.position.y);
    player_local_pixel_position_x /= block_size;
    player_local_pixel_position_y /= block_size;

    rect(player_local_pixel_position_x * block_size, player_local_pixel_position_y * block_size, block_size + 1, block_size + 5); // +1 for filling gaps between cells

    // Draw player. 
    fill(color(COLORS[player.ID]));

    rect(player_local_pixel_position_x * block_size, player_local_pixel_position_y * block_size, block_size + 1, block_size + 1); // +1 for filling gaps between cells
}


function updateGrid() 
{

    let x = 0;
    let y = 0;

    // Player moving down. 
    if (player.dir.equal(new Dir(0, 1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.floor(player.position.y / block_size);
    }

    // Player moving up.
    if (player.dir.equal(new Dir(0, -1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.ceil(player.position.y / block_size);
    }

    // Player moving left. 
    if (player.dir.equal(new Dir(1, 0))) {
        x = Math.floor(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Player moving right.
    if (player.dir.equal(new Dir(-1, 0))) {
        x = Math.ceil(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Tail color.
    grid[x][y] = player.ID + 1;
}


function fixDir() 
{

    if (!player.dir.equal(player.last_dir)) {
        player.position.x = Math.round(player.position.x / block_size) * block_size;
        player.position.y = Math.round(player.position.y / block_size) * block_size;
    }
}


function finalize() 
{
    
    player.last_dir.x = player.dir.x;
    player.last_dir.y = player.dir.y;
}