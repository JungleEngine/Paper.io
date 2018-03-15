
class Dir{

	constructor(x,y){
		this.x = x;
		this.y = y;	
	}
	equal(f){
		console.log(f.y-this.y);
		
		if(this.x != f.x || this.y != f.y)
			return false;
		return true;
	}


}
class Position{
	constructor(x,y){
		this.x =x;
		this.y =y;
	}

}
class Player{

constructor(dir,position,id){
this.dir = dir;
this.last_dir = new Dir(dir.x,dir.y);
this.position = position;
this.area = 0;
this.name = "samir";
this.ID = id;

}
}

function HandleMovement(){
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

player.position.x +=player.dir.x * speed;
player.position.y += player.dir.y * speed;
	
}



function drawPlayers(){
	for(i = 0; i<=number_of_blocks_width; i++)
{
for( j = 0; j<=number_of_blocks_height; j++)
if(grid[i][j] !=0)
{	
	noStroke();
	fill(color(COLORS[grid[i][j]]));

	rect(i*block_size
		,j*block_size
		,block_size
		,block_size);
}
}

//player color
noStroke();
fill(color(COLORS[player.ID]));
let x = player.position.x / block_size;
let y = player.position.y / block_size;
rect(x*block_size,y*block_size,block_size,block_size);



}

function updateGrid(){
let x = Math.round(player.position.x / block_size);
let y = Math.round(player.position.y / block_size);
//tail color
grid[x][y] = player.ID+1;


}
function fixDir(){
	//console.log(player.dir.y==player.last_dir.y)
if(!player.dir.equal(player.last_dir))
{
	console.log("not ");

	player.position.x = Math.round(player.position.x / block_size) * block_size;
	player.position.y = Math.round(player.position.y / block_size)* block_size;
	
	
}
	
}


function finalize(){
player.last_dir.x = player.dir.x;
player.last_dir.y = player.dir.y;

}
