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
    if (keyIsDown(RIGHT_ARROW)) {
        player.dir.x = 1;
        player.dir.y = 0;
    }

    if (keyIsDown(LEFT_ARROW)) {
        player.dir.x = -1;
        player.dir.y = 0;
    }

    if (keyIsDown(UP_ARROW)) {
        player.dir.x = 0;
        player.dir.y = -1;
    }

    if (keyIsDown(DOWN_ARROW)) {
        player.dir.x = 0;
        player.dir.y = 1;
    }

    player.position.x += player.dir.x * speed;
    player.position.y += player.dir.y * speed;
}


function drawGrid() {

    noStroke();

    let x_start = Math.round((player.position.x - (windowWidth / 2)) / block_size);
    let y_start = Math.round((player.position.y - (windowHeight / 2)) / block_size);

    noStroke();

    for (i = x_start - 1; i <= x_start + number_of_blocks_width; ++i) {
        for (j = y_start - 1; j <= y_start + number_of_blocks_height; ++j) {
            if (grid[i][j] != 0) {
                fill(color(COLORS[grid[i][j]]));
                let [i_local, j_local] = localize(i * block_size, j * block_size);
                rect(i_local, j_local, block_size + 1, block_size + 1); // +1 for filling gaps between cells 
            }
        }
    }

    // Player color
    fill(color(COLORS[player.ID]));
    let [x, y] = localize(player.position.x, player.position.y);
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