GameConfig = {
    BLOCK_SIZE : 5,
    CANVAS_SIZE:200,
    PAUSE :false,
    GRID : [],
    SPEED : null,
    BLOCK_SPEED:5,
    GRID_START : 50,
    GRID_END : 150,

    UPDATE_SPEED : function(frame_rate)
    {
        GameConfig.SPEED = GameConfig.BLOCK_SPEED * GameConfig.BLOCK_SIZE  /frame_rate ;

    },

    REMOVE_DEAD_PLAYER : function(playerID)
    {

    for (let i = this.GRID_START; i < this.GRID_END; i++)
        for (let j = this.GRID_START; j < this.GRID_END; j++) {
            // If current cell is of a dead player then clear it.
            if (GameConfig.GRID[i][j][0] === playerID ||
                GameConfig.GRID[i][j][0] === playerID + 1 ||
                GameConfig.GRID[i][j][0] === playerID + 2) {
                GameConfig.GRID[i][j][0] = 0;

            }
        }



    },

    FILL : function(path_vector, color_index)
    {

        for(let i = 0 ; i < path_vector.length-1; i+=2)
        {
            let y = path_vector[i];
            let x_arr = path_vector[i+1];

                console.log("x arr : ",x_arr);
                x_arr.sort();
            for (let tempx = 0; tempx < x_arr.length - 1; tempx += 2) {


                let min_x = Math.min(x_arr[tempx], x_arr[tempx + 1]);
                let max_x = Math.max(x_arr[tempx], x_arr[tempx + 1]);

                if (min_x === max_x - 1) {

                    this.GRID[min_x][y][0] = color_index;
                    tempx--;
                    continue;

                }
                // Fill between two points.
                for (let curr_x = min_x; curr_x <= max_x; curr_x++) {

                    this.GRID[curr_x][y][0] = color_index;
                }


            }

            // If odd number of x-values then color the last one.
            if (x_arr.length % 2 !== 0 || true) {

                this.GRID[x_arr[x_arr.length - 1]][y][0] = color_index;

            }


        }

    }
};


