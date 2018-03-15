// White, Border, Player1, Player1_Tail, Player1_Shadow, Player2, Player2_Tail, ...
var COLORS = ['empty', '#edeff4', '#0041a1', '#076bff', '#002c6e'];
var KEY_PRESSED;
var grid = [];
var aspect_ratio;
var view_blocks_number = 40;
var block_width;
var block_height;
var number_of_blocks_height;
var number_of_blocks_width;
var player;
var speed;
var block_size;
const canvas_length = 200;
const grid_start = 50;
const grid_length = 100;
const grid_end = grid_start + grid_length;
const border_to_block_ratio = 0.5;

function initGrid() {
    for (i = 0; i < canvas_length; ++i) {
        grid[i] = [];
        for (j = 0; j < canvas_length; ++j) {
            grid[i][j] = 0;
        }
    }

    // Draw border in grid 
    let start = grid_start - 1;
    let end = grid_end + 1;

    for (i = start; i <= end; ++i)
        grid[i][start] = 1;
    for (i = start; i <= end; ++i)
        grid[i][end] = 1;
    for (i = start; i <= end; ++i)
        grid[start][i] = 1;
    for (i = start; i <= end; ++i)
        grid[end][i] = 1;
}

function setup() {

    aspect_ratio = windowWidth / windowHeight;

    // block_size = Math.round(view_blocks_number * (Math.max(windowWidth, windowHeight) / 1000));
    // number_of_blocks_height = Math.ceil(windowHeight / block_size);
    // number_of_blocks_width = Math.ceil(windowWidth / block_size);

    block_size = Math.round(Math.max(windowWidth, windowHeight) / view_blocks_number);
    block_size = (Math.round(block_size / 10) * 10);
    speed = block_size / 10;
    number_of_blocks_height = Math.ceil(windowHeight / block_size);
    number_of_blocks_width = Math.ceil(windowWidth / block_size);

    player = new Player(new Dir(1, 0), new Position(block_size * 50, block_size * 50), 2);

    KEY_PRESSED = 'right';

    createCanvas(windowWidth, windowHeight);

    initGrid();

}

function draw() {

    // Clear screen
    background(255);

    // Change players positions;
    handleMovement();

    fixDir();

    updateGrid();

    drawGrid();

    finalize();
}