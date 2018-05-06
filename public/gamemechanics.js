// Convert world coordinates to local screen pixels coordinates.
function worldToScreenCoordinates(player_global_pixel_position_x, player_global_pixel_position_y) {

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

var dummyVariable = null;
var keyboardLocked = false;

function simulate() {
    function MoveOnCells(delta, last_pos_x_or_y, last_pos, player_pos, player, indx) {


        let cell;

        while (delta > 0) {
            //console.log("Last pos X: ", last_pos.x, "Dir_x: ", player.dir.x, "---------");
            let indexI;
            let indexJ;
            let tailPos;
            if (player.dir.x !== 0) {
                tailPos = { "x": last_pos_x_or_y, "y": player.position.y };
                indexI = Math.round(last_pos_x_or_y / GameConfig.BLOCK_SIZE + (0.5 * player.dir.x));
                indexJ = Math.round(player.position.y / GameConfig.BLOCK_SIZE + (0.5 * player.dir.y));
                // cell =   GameConfig.GRID[Math.round(last_pos_x_or_y/GameConfig.BLOCK_SIZE + (0.5 * player.dir.x))]
                //     [Math.round(player.position.y/GameConfig.BLOCK_SIZE + (0.5 * player.dir.y))];
            } else {
                tailPos = { "x": player.position.x, "y": last_pos_x_or_y };
                indexI = Math.round(player.position.x / GameConfig.BLOCK_SIZE + (0.5 * player.dir.x));
                indexJ = Math.round(last_pos_x_or_y / GameConfig.BLOCK_SIZE + (0.5 * player.dir.y));
                // cell =   GameConfig.GRID[Math.round(player.position.x/GameConfig.BLOCK_SIZE + (0.5 * player.dir.x))]
                //     [Math.round(last_pos_x_or_y/GameConfig.BLOCK_SIZE + (0.5 * player.dir.y))];
            }



            //put tail in the back
            //TODO: I think this should be removed so that we wouldn't put a tail if the player died this may result in conflict
            let player_pos_on_grid = player.getPlayerPositionOnGrid(tailPos);
            let xx = player_pos_on_grid.x;
            let yy = player_pos_on_grid.y;
            if (GameConfig.GRID[xx][yy][0] != player.ID + 2) {
                GameConfig.GRID[xx][yy][0] = player.ID + 1;
            }

            // Change position according to moving direction
            if (delta > GameConfig.BLOCK_SIZE) {
                if (player_pos > last_pos_x_or_y) {
                    last_pos_x_or_y += GameConfig.BLOCK_SIZE;

                } else {
                    last_pos_x_or_y -= GameConfig.BLOCK_SIZE;
                }
            }

            if (GameConfig.GRID[indexI][indexJ][0] === 1) { // Border
                // Dies

                    //console.log("Player Died!!");
                    //removeDeadPlayer(player.ID);
                 //   return false;

            } else if (GameConfig.GRID[indexI][indexJ][0] === player.ID + 1) { // Own tail
                // Dies
                //to ensure that the player isn't right on the border of another cell so that he doesn't step on his own tail left behind
                if ((player.dir.x != 0 && tailPos.x != Math.round(tailPos.x)) || (player.dir.y != 0 && tailPos.y != Math.round(tailPos.y))) {
                    //console.log("Player Died!!");
                    //removeDeadPlayer(player.ID);
                    //return false;
                }

            } else if (GameConfig.GRID[indexI][indexJ][0] == player.ID + 2) { // Own block
                //TODO: Fill path
            } else if (GameConfig.GRID[indexI][indexJ][0] == 0 || GameConfig.GRID[indexI][indexJ][0] % 4 == 0) { // Empty || block
                // Put tail


            } else if (GameConfig.GRID[indexI][indexJ][0] != player.ID) {
                let killedPlayerID;
                if (GameConfig.GRID[indexI][indexJ][0] % 4 == 2) //other player id
                {
                    killedPlayerID = GameConfig.GRID[indexI][indexJ][0];
                } else {
                    killedPlayerID = GameConfig.GRID[indexI][indexJ][0] - 1;
                }
                // Kill
                //removeDeadPlayer(killedPlayerID);
                if (delta < 1) {
                    //GameConfig.GRID[indexI][indexJ][0] = player.ID;
                }
            }
            delta -= GameConfig.BLOCK_SIZE;
        }
    }
    // Validate player action.
    validateKeyPress();

    for(let indx of Object.keys(players)){


        let player = players[indx];
        player.updateDirFromKeyPress();
        let last_pos = { "x": player.position.x, "y": player.position.y };

        let time = window.performance.now();
        // First run
        // if (!player.last_time_stamp) {
        //     player.last_time_stamp = time;
        //     //continue;
        // }
        //
        //
        // let delta_time = (time - player.last_time_stamp) / 1000;
        // player.last_time_stamp = time;
        //
        // player.position.x += player.dir.x * GameConfig.BLOCK_SPEED*GameConfig.BLOCK_SIZE*delta_time;
        // player.position.y += player.dir.y * GameConfig.BLOCK_SPEED*GameConfig.BLOCK_SIZE*delta_time;

        player.position.x += player.dir.x * GameConfig.SPEED;
        player.position.y += player.dir.y * GameConfig.SPEED;

        // Skipped cells in x and in y
        let x_delta = Math.abs(player.position.x - last_pos.x);
        let y_delta = Math.abs(player.position.y - last_pos.y);


        // Move on skipped cells in x and in y
        let playerDied = MoveOnCells(x_delta, last_pos.x, last_pos, player.position.x, player, indx);
        if(playerDied===false) {
            continue;
        }
        playerDied= MoveOnCells(y_delta, last_pos.y, last_pos, player.position.y, player, indx);
        if(playerDied===false) {
            continue;
        }
        // Change direction when reaching the end of a cell.
        fixDir(player, last_pos);

        if (dummyVariable == null) {
            dummyVariable = "test";
            setInterval(function() {
                if (GameConfig.PAUSE)
                    return;
                let int_x = player.position.x / GameConfig.BLOCK_SIZE;
                let int_y = player.position.y / GameConfig.BLOCK_SIZE;
                // console.log("Player position x: " , int_x," Player position y: " , int_y);
                // console.log("Player direction: " , player.dir);
            }, 500);
        }
    }
}

function validateKeyPress() {
    if (keyboardLocked == true)
        return;

    let x = null;
    let y = null;
    if (keyCode == RIGHT_ARROW && players[current_player_ID].KEY_PRESSED != 'left' &&
        players[current_player_ID].KEY_PRESSED != 'right') {

        players[current_player_ID].KEY_PRESSED = 'right';
        x = 1;
        y = 0;

    } else if (keyCode == LEFT_ARROW && players[current_player_ID].KEY_PRESSED != 'right' &&
        players[current_player_ID].KEY_PRESSED != 'left') {

        players[current_player_ID].KEY_PRESSED = 'left';
        x = -1;
        y = 0;

    } else if (keyCode == UP_ARROW && players[current_player_ID].KEY_PRESSED != 'down' &&
        players[current_player_ID].KEY_PRESSED != 'up') {

        players[current_player_ID].KEY_PRESSED = 'up';
        x = 0;
        y = -1;

    } else if (keyCode == DOWN_ARROW && players[current_player_ID].KEY_PRESSED != 'up' &&
        players[current_player_ID].KEY_PRESSED != 'down') {

        players[current_player_ID].KEY_PRESSED = 'down';
        x = 0;
        y = 1;

    }

    if (x != null && y != null) {
        keyboardLocked = true;
        setTimeout(function() {
            keyboardLocked = false;
        }, 200);
        // Send updates to server (player direction, player position ).
        updates = {};
        updates["player_dir"] = [x, y];
        updates["player_pos_normalized"] = players[current_player_ID].position / block_size;

        emitUpdatesToServer(updates);
        players[current_player_ID].wait_server_response = true;

    }

}


function removeDeadPlayer(playerID) {


    delete players[playerID];


    for (let i = grid_start; i < grid_end; i++)
        for (let j = grid_start; j < grid_end; j++) {
            // If current cell is of a dead player then clear it.
            if (GameConfig.GRID[i][j][0] == playerID ||
                GameConfig.GRID[i][j][0] == playerID + 1 ||
                GameConfig.GRID[i][j][0] == playerID + 2) {
                GameConfig.GRID[i][j][0] = 0;

            }
        }
}

function drawGrid() {

    noStroke();

    let x_window_start = Math.round((players[current_player_ID].position.x - (windowWidth / 2)) / GameConfig.BLOCK_SIZE);
    let y_window_start = Math.round((players[current_player_ID].position.y - (windowHeight / 2)) / GameConfig.BLOCK_SIZE);

    noStroke();


    for (i = x_window_start - 1; i <= x_window_start + number_of_blocks_width; ++i) {
        for (j = y_window_start - 1; j <= y_window_start + number_of_blocks_height; ++j) {
            //console.log(" window_start " , x_window_start,"number  of blocks",number_of_blocks_width);
            if (GameConfig.GRID[i][j][0] !== 0) {


                if (GameConfig.GRID[i][j][0] == null) {
                    console.log("GameConfig.GRID[i][j][0] => ", GameConfig.GRID[i][j][0]);
                    console.log(i, j);
                }
                // Set color for filling.
                fill(color(COLORS[GameConfig.GRID[i][j][0]]));



                // Convert index in GameConfig.GRID to global pixel location.
                player_global_pixel_position_x = i * GameConfig.BLOCK_SIZE;
                player_global_pixel_position_y = j * GameConfig.BLOCK_SIZE;

                // Get player screen pixel location.
                let [player_local_pixel_position_x, player_local_pixel_position_y] = worldToScreenCoordinates(player_global_pixel_position_x, player_global_pixel_position_y);

                rect(player_local_pixel_position_x, player_local_pixel_position_y, GameConfig.BLOCK_SIZE + 1, GameConfig.BLOCK_SIZE + 1); // +1 for filling gaps between cells
            }
        }
    }

    for (let i in players) {

        // Draw player shadow.
        fill(color(COLORS[players[i].ID + 2]));

        let [player_local_pixel_position_x, player_local_pixel_position_y] = worldToScreenCoordinates(players[i].position.x, players[i].position.y);
        player_local_pixel_position_x /= GameConfig.BLOCK_SIZE;
        player_local_pixel_position_y /= GameConfig.BLOCK_SIZE;

        rect(player_local_pixel_position_x * GameConfig.BLOCK_SIZE, player_local_pixel_position_y * GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE + 1, GameConfig.BLOCK_SIZE + 5); // +1 for filling gaps between cells

        // Draw player.
        fill(color(COLORS[players[i].ID]));

        rect(player_local_pixel_position_x * GameConfig.BLOCK_SIZE, player_local_pixel_position_y * GameConfig.BLOCK_SIZE, GameConfig.BLOCK_SIZE + 1, GameConfig.BLOCK_SIZE + 1); // +1 for filling gaps between cells

        textSize(32);

        text(players[i].username, player_local_pixel_position_x * GameConfig.BLOCK_SIZE,
            player_local_pixel_position_y * GameConfig.BLOCK_SIZE);

    }
}


function updateGrid() {

    for (let i in players) {

        let x = 0;
        let y = 0;

        let player_pos_on_grid = players[i].getPlayerPositionOnGrid(players[i].position);
        x = player_pos_on_grid.x;
        y = player_pos_on_grid.y;

        // Check if grid color is my block color -> leave it.
        // Tail color.
        if (GameConfig.GRID[x][y][0] === players[i].ID + 2) {

            // TODO:: change filling flag.

        } else {
            // if(players[i].on_his_area)
            // {
            //
            //     players[i].on_his_area = false;
            //     players[i].was_on_his_area = true;
            //
            // }


            // GameConfig.GRID[x][y] = players[i].ID + 1;
            // GameConfig.GRID[x][y][0] = players[i].ID + 1;


        }
    }
}



function fixDir(player, last_pos) {


    // If direction already fixed don't fix it again.
    // if(player.direction_already_fixed)
    // {
    //
    //
    //     player.direction_already_fixed = false;
    //     return;
    // }


    let last_head = {};

    last_head.x = (last_pos.x + (GameConfig.BLOCK_SIZE * (0.5 * player.dir.x))) / GameConfig.BLOCK_SIZE;
    last_head.y = (last_pos.y + (GameConfig.BLOCK_SIZE * (0.5 * player.dir.y))) / GameConfig.BLOCK_SIZE;

    let head = {};

    head.x = (player.position.x + (GameConfig.BLOCK_SIZE * (0.5 * player.dir.x))) / GameConfig.BLOCK_SIZE;
    head.y = (player.position.y + (GameConfig.BLOCK_SIZE * (0.5 * player.dir.y))) / GameConfig.BLOCK_SIZE;



    if ( ((player.fix_pos_x/GameConfig.BLOCK_SIZE - Math.round(head.x))*player.dir.x) < 0 ||  ((player.fix_pos_y/GameConfig.BLOCK_SIZE- Math.round(head.y))*player.dir.y) < 0) {
        console.log("The rare case has happened");
        return ;
    }
    // If direction changed
    if (player.dir.x !== player.next_dir.x || player.dir.y !== player.next_dir.y) {


        // if (

        //     //Crossed Cell Right
        //     (player.dir.x === 1 && Math.floor(last_head.x) !== Math.floor(head.x)) ||
        //     //Crossed Cell Left
        //     (player.dir.x === -1 && Math.ceil(last_head.x) !== Math.ceil(head.x)) ||
        //     //Crossed Cell Up
        //     (player.dir.y === 1 && Math.floor(last_head.y) !== Math.floor(head.y)) ||
        //     //Crossed Cell Down
        //     (player.dir.y === -1 && Math.ceil(last_head.y) !== Math.ceil(head.y))) {



        // If head reached the fix cell
        if (Math.round(head.x) === (player.fix_position.x / GameConfig.BLOCK_SIZE) &&
            Math.round(head.y) === (player.fix_position.y / GameConfig.BLOCK_SIZE)) {

            //Fix head on the cell
            if (player.dir.x !== 0) {
                head.x = Math.round(head.x) - (0.5 * player.dir.x);
                head.y = Math.round(head.y);
            } else {
                head.x = Math.round(head.x);
                head.y = Math.round(head.y) - (0.5 * player.dir.y);

            }

            //Adjust head position tomatch the new direction
            head.x += player.next_dir.x * 0.5 - player.dir.x * 0.5;
            head.y += player.next_dir.y * 0.5 - player.dir.y * 0.5;


            //Set direction to new direction
            player.dir.x = player.next_dir.x;
            player.dir.y = player.next_dir.y;

            player.position.x = GameConfig.BLOCK_SIZE * (head.x - 0.5 * player.next_dir.x);
            player.position.y = GameConfig.BLOCK_SIZE * (head.y - 0.5 * player.next_dir.y);

        }
    }
    if(player.position.x/GameConfig.BLOCK_SIZE!=Math.round(player.position.x/GameConfig.BLOCK_SIZE)&&player.position.y/GameConfig.BLOCK_SIZE!=Math.round(player.position.y/GameConfig.BLOCK_SIZE))
    {
        player.position.x=Math.round(player.position.x/GameConfig.BLOCK_SIZE)*GameConfig.BLOCK_SIZE;
        player.position.y=Math.round(player.position.y/GameConfig.BLOCK_SIZE)*GameConfig.BLOCK_SIZE;
    }
}


// Check filling for every player.
// Store start and end position.
function checkFilling() {

    for (let i in players) {



        let player_pos_on_grid = players[i].getPlayerPositionOnGrid(players[i].position);
        //console.log("player pos on grid " +GameConfig.GRID[player_pos_on_grid.x][player_pos_on_grid.y][0]);

        if ((GameConfig.GRID[player_pos_on_grid.x][player_pos_on_grid.y][0] === players[i].ID + 2)) {


            // console.log("my ground.");
            // console.log("dir -> ", players[i].dir);

        }

        // Check if player left his own area.
        if ((GameConfig.GRID[player_pos_on_grid.x][player_pos_on_grid.y][0] === players[i].ID + 1) &&
            (GameConfig.GRID[player_pos_on_grid.x - players[i].last_dir.x][player_pos_on_grid.y - players[i].last_dir.y][0] ===
                players[i].ID + 2) && !players[i].record_path) {
            console.log("player leaved grid ");
            console.log(GameConfig.GRID[player_pos_on_grid.x][player_pos_on_grid.y][0]);

            // Should try to fill player area.
            players[i].last_position_on_grid = new Position(player_pos_on_grid.x - players[i].dir.x,
                player_pos_on_grid.y - players[i].dir.y);

            // Player should record its path.
            players[i].record_path = true;

            // Record this step.
            if (typeof players[i].path_vector[players[i].last_position_on_grid.y] === 'undefined')
                players[i].path_vector[players[i].last_position_on_grid.y] = [];

            // Push player last position on grid.
            if (!players[i].path_vector[players[i].last_position_on_grid.y].includes(players[i].last_position_on_grid.x))
                players[i].path_vector[players[i].last_position_on_grid.y].push(players[i].last_position_on_grid.x);


            // Record this step.
            if (typeof players[i].path_vector[player_pos_on_grid.y] === 'undefined')
                players[i].path_vector[player_pos_on_grid.y] = [];

            // Push player position now.
            if (!players[i].path_vector[player_pos_on_grid.y].includes(player_pos_on_grid.x))
                players[i].path_vector[player_pos_on_grid.y].push(player_pos_on_grid.x);


        }


        // Check if player should fill his area.
        else if (GameConfig.GRID[player_pos_on_grid.x][player_pos_on_grid.y][0] === players[i].ID + 2)
             {

            if (!players[i].record_path)
                return;
            console.log("player is back to grid");

            players[i].record_path = false;

            // Should try to fill player area.
            let path = players[i].tryToFill();
            players[i].record_path = false;

            // Record this step.
            if (typeof players[i].path_vector[player_pos_on_grid.y] === 'undefined')
                players[i].path_vector[player_pos_on_grid.y] = [];

            if (!players[i].path_vector[player_pos_on_grid.y].includes(player_pos_on_grid.x))
                players[i].path_vector[player_pos_on_grid.y].push(player_pos_on_grid.x);
            // console.log(" path vector ", players[i].path_vector);

            //console.log("path", path);

            for (let obj in path) {
                let pos_x = path[obj].x;
                let pos_y = path[obj].y;

                if (typeof players[i].path_vector[pos_y] === 'undefined')
                    players[i].path_vector[pos_y] = [];

                if (!players[i].path_vector[pos_y].includes(pos_x))
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
            /*for(let y in players[i].path_vector)
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
            }*/

            // Filling.
            for (let y in players[i].path_vector) {
                console.log(" index : ",y);
                let x_arr = players[i].path_vector[y];
                let min_x;

                x_arr.sort();
                for (let tempx = 0; tempx < x_arr.length - 1; tempx += 2) {


                    let min_x = Math.min(x_arr[tempx], x_arr[tempx + 1]);
                    let max_x = Math.max(x_arr[tempx], x_arr[tempx + 1]);

                    if (min_x === max_x - 1) {

                        GameConfig.GRID[min_x][y][0] = players[i].ID + 2;
                        tempx--;
                        continue;

                    }
                    // Fill between two points.
                    for (let curr_x = min_x; curr_x <= max_x; curr_x++) {

                        GameConfig.GRID[curr_x][y][0] = players[i].ID + 2;
                    }


                }

                // If odd number of x-values then color the last one.
                if (x_arr.length % 2 !== 0 || true) {

                    GameConfig.GRID[x_arr[x_arr.length - 1]][y][0] = players[i].ID + 2;

                }


            }
            //console.log("path -> ",path);
            // console.log("start pos  -> ",players[i].last_position_on_grid);
            // console.log("end pos  -> ",player_pos_on_grid);
            // console.log("all path -> ",players[i].path_vector);
            //console.log("all points -> ",logger);

            // Clear all arrays.
            players[i].path_vector = [];

        } else {

            // True for testing .
            if (!(players[i].dir.equal(players[i].last_dir)) || true) {

                players[i].filled = false;
                if (typeof players[i].path_vector[player_pos_on_grid.y] === 'undefined')
                    players[i].path_vector[player_pos_on_grid.y] = [];

                if (!players[i].path_vector[player_pos_on_grid.y].includes(player_pos_on_grid.x))
                    players[i].path_vector[player_pos_on_grid.y].push(player_pos_on_grid.x);

            }
        }
    }

}

function finalize() {

    for (let i in players) {

        players[i].last_dir.x = players[i].dir.x;
        players[i].last_dir.y = players[i].dir.y;

    }

}