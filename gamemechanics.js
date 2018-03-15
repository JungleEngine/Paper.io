function localize(x, y) {
    let x_distance = player.position.x - x;
    let y_distance = player.position.y - y;
    return [(windowWidth / 2) - x_distance, (windowHeight / 2) - y_distance];
}

function globalize(x, y) {
    let x_distance = (windowWidth / 2) - x;
    let y_distance = (windowHeight / 2) - y;
    return [player.position.x - x_distance, player.position.y - y_distance];
}

function handleMovement() {
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

    // Update player position
    player.position.x += player.dir.x * speed;
    player.position.y += player.dir.y * speed;


    // -------------------- Checking for lose ------------------------------

    let x = 0;
    let y = 0;

    // Player moving down 
    if (player.dir.equal(new Dir(0, 1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.ceil(player.position.y / block_size);
    }

    // Player moving up
    if (player.dir.equal(new Dir(0, -1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.floor(player.position.y / block_size);
    }

    // Player moving left 
    if (player.dir.equal(new Dir(1, 0))) {
        x = Math.ceil(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Player moving right
    if (player.dir.equal(new Dir(-1, 0))) {
        x = Math.floor(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Hit your tail or border = lose
    if (grid[x][y] == player.ID + 1 || grid[x][y] == 1)
        window.alert('Game over!');
}


function drawGrid() {

    noStroke();

    let x_local_start = Math.round((player.position.x - (windowWidth / 2)) / block_size);
    let y_local_start = Math.round((player.position.y - (windowHeight / 2)) / block_size);

    noStroke();

    for (i = x_local_start - 1; i <= x_local_start + number_of_blocks_width; ++i) {
        for (j = y_local_start - 1; j <= y_local_start + number_of_blocks_height; ++j) {
            if (grid[i][j] != 0) {
                fill(color(COLORS[grid[i][j]]));
                let [i_local, j_local] = localize(i * block_size, j * block_size);
                rect(i_local, j_local, block_size + 1, block_size + 1); // +1 for filling gaps between cells 
            }
        }
    }

    // Draw player shadow
    fill(color(COLORS[player.ID + 2]));
    let [x, y] = localize(player.position.x, player.position.y);
    x /= block_size;
    y /= block_size;
    rect(x * block_size, y * block_size, block_size + 1, block_size + 5); // +1 for filling gaps between cells

    // Draw player 
    fill(color(COLORS[player.ID]));
    [x, y] = localize(player.position.x, player.position.y);
    x /= block_size;
    y /= block_size;
    rect(x * block_size, y * block_size, block_size + 1, block_size + 1); // +1 for filling gaps between cells

}


function updateGrid() {

    let x = 0;
    let y = 0;

    // Player moving down 
    if (player.dir.equal(new Dir(0, 1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.floor(player.position.y / block_size);
    }

    // Player moving up
    if (player.dir.equal(new Dir(0, -1))) {
        x = Math.round(player.position.x / block_size);
        y = Math.ceil(player.position.y / block_size);
    }

    // Player moving left 
    if (player.dir.equal(new Dir(1, 0))) {
        x = Math.floor(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Player moving right
    if (player.dir.equal(new Dir(-1, 0))) {
        x = Math.ceil(player.position.x / block_size);
        y = Math.round(player.position.y / block_size);
    }

    // Tail color
    grid[x][y] = player.ID + 1;

}


function fixDir() {

    if (!player.dir.equal(player.last_dir)) {
        player.position.x = Math.round(player.position.x / block_size) * block_size;
        player.position.y = Math.round(player.position.y / block_size) * block_size;
    }
}


function finalize() {
    player.last_dir.x = player.dir.x;
    player.last_dir.y = player.dir.y;
}