class Dir {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equal(f) {
        if (this.x != f.x || this.y != f.y)
            return false;
        return true;
    }
}


class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class Player {

    constructor(dir, position, id) {
        this.dir = dir;
        this.last_dir = new Dir(dir.x, dir.y);
        this.position = position;
        this.area = 0;
        this.name = "samir";
        this.ID = id;
    }
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

    for (i = 0; i <= number_of_blocks_width; ++i) {
        for (j = 0; j <= number_of_blocks_height; ++j) {
            if (grid[i][j] == 2) {
                noStroke();
                fill(color(COLORS[grid[i][j]]));
                rect(i * block_size, j * block_size, block_size + 1, block_size + 1); // +1 for filling gaps between cells 
            }
        }
    }

    // Player color
    fill(color(COLORS[player.ID]));

    let x = player.position.x / block_size;
    let y = player.position.y / block_size;
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