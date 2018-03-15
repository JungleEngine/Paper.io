var KEY_PRESSED = false;
var COLORS = ['reserved', '#990000', '#ff6666']; // Player1, Player1_Tail, Player2, Player2_Tail, ...
var grid = [];
var aspect_ratio;
var view_blocks_number = 30;
var block_width;
var block_height;
var number_of_blocks_height;
var number_of_blocks_width;
var player;
var speed = 3;
var block_size;
const canvas_length = 150;
//const grid_length = 100;
const border_width_cells = 2;

function initGrid() {
    for (i = 0; i < canvas_length; ++i) {
        grid[i] = [];
        for (j = 0; j < canvas_length; ++j) {
            grid[i][j] = 0;
        }
    }
}

function setup() {

    player = new Player(new Dir(0, 0), new Position(0, 0), 1);

    aspect_ratio = windowWidth / windowHeight;

    block_size = view_blocks_number * (Math.max(windowWidth, windowHeight) / 1000);
    number_of_blocks_height = Math.ceil(windowHeight / block_size);
    number_of_blocks_width = Math.ceil(windowWidth / block_size);

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