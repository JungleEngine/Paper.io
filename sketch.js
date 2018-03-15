var x = 0;
var KEY_PRESSED = false;
var COLORS=['#990000','#ff6666'];
var grid =[];
var inner_width;
var inner_height;
var aspect_ratio = 16/9; 	
var view_blocks_number =30;
var block_width;
var block_height;
var number_of_blocks_height;
var number_of_blocks_width;
var player ;
var speed = 3;
var block_size;
function setup() {

	player = new Player(new Dir(0,0),new Position(0,0),0);
	

	aspect_ratio = windowWidth / windowHeight;

	block_size=view_blocks_number * (Math.max(windowWidth,windowHeight)/1000);
	number_of_blocks_height=Math.round(windowHeight/block_size);
	number_of_blocks_width=Math.round(windowWidth/block_size);
	console.log(block_size)
	console.log(number_of_blocks_height)
	
	createCanvas(windowWidth,windowHeight);
//console.log((Math.max(block_width,block_height)/100));
//console.log(windowHeight);

for(i = 0; i<100; i++)
{
	grid[i]=[];
for( j = 0; j<100; j++)
{
grid[i][j] = 0;
}
}
//createCanvas(,1);
  background(200);
///  line(15, 25, 70, 90);
}

function draw() {
//clear screen
 background(255);
//change positions;
HandleMovement();
fixDir();

updateGrid();
//draw players
 drawPlayers();
 finalize();

}
