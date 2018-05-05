class Dir {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equal(f) {
        return !(this.x != f.x || this.y != f.y);

    }

}


class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equal(f) {
        return !(this.x != f.x || this.y != f.y);

    }
}


class Player {

    constructor(dir, position, id) {
        this.KEY_PRESSED = 'right';
        this.alive = true;
        this.wait_server_response = false;
        this.path_vector = [];
        this.record_path = false;
        this.direction_already_fixed = false;
        this.dir = dir;
        this.last_dir = new Dir(dir.x, dir.y);
        this.position = position;
        this.grid_position = new Position(0, 0);
        this.area = 0;
        this.username = "";
        this.name = "samir";
        this.filled = false;
        this.ID = id;
        this.last_position_on_grid = new Position(0, 0);
        // this.should_fill = false;
        this.on_his_area = false;
        this.was_on_his_area = false;
        this.fix_position = {};
    }

    // Update grid position.
    getPlayerPositionOnGrid(last_pos) {

        let x = 0;
        let y = 0;

        // Player moving down.
        if (this.dir.equal(new Dir(0, 1))) {

            x = Math.round(last_pos.x / GameConfig.BLOCK_SIZE);
            y = Math.floor(last_pos.y / GameConfig.BLOCK_SIZE);

        }

        // this moving up.
        if (this.dir.equal(new Dir(0, -1))) {

            x = Math.round(last_pos.x / GameConfig.BLOCK_SIZE);
            y = Math.ceil(last_pos.y / GameConfig.BLOCK_SIZE);

        }

        // this moving right.
        if (this.dir.equal(new Dir(1, 0))) {

            x = Math.floor(last_pos.x / GameConfig.BLOCK_SIZE);
            y = Math.round(last_pos.y / GameConfig.BLOCK_SIZE);

        }

        // this moving left.
        if (this.dir.equal(new Dir(-1, 0))) {

            x = Math.ceil(last_pos.x / GameConfig.BLOCK_SIZE);
            y = Math.round(last_pos.y / GameConfig.BLOCK_SIZE);

        }
        return new Position(x, y);

    }


    // Update key press from dir.
    updateKeyPressFromDir() {


        if (this.dir.equal(new Dir(1, 0))) {

            this.KEY_PRESSED = 'right';

        }

        if (this.dir.equal(new Dir(-1, 0))) {

            this.KEY_PRESSED = 'left';

        }

        if (this.dir.equal(new Dir(0, 1))) {

            this.KEY_PRESSED = 'down';

        }

        if (this.dir.equal(new Dir(0, -1))) {

            this.KEY_PRESSED = 'up';

        }

    }

    // Update key press from a given dir.
    updatePlayerKeyPressFromDir(dir_x, dir_y) {

        let dir = new Dir(dir_x, dir_y);

        if (dir.equal(new Dir(1, 0))) {

            this.KEY_PRESSED = 'right';

        }

        if (dir.equal(new Dir(-1, 0))) {

            this.KEY_PRESSED = 'left';

        }

        if (dir.equal(new Dir(0, 1))) {

            this.KEY_PRESSED = 'down';

        }

        if (dir.equal(new Dir(0, -1))) {

            this.KEY_PRESSED = 'up';

        }

    }

    // Update key press from dir.
    updateDirFromKeyPress() {

        if (this.wait_server_response)
            return;

        if (this.next_dir == null) {
            this.next_dir = { "x": 1, "y": 0 };
        }
        if (this.KEY_PRESSED == 'right') {

            this.next_dir.x = 1;
            this.next_dir.y = 0;

        }

        if (this.KEY_PRESSED == 'left') {

            this.next_dir.x = -1;
            this.next_dir.y = 0;

        }

        if (this.KEY_PRESSED == 'up') {

            this.next_dir.x = 0;
            this.next_dir.y = -1;

        }

        if (this.KEY_PRESSED == 'down') {

            this.next_dir.x = 0;
            this.next_dir.y = 1;

        }


    }

    // Check wether this player should fill or no.
    // pos_x, pos_y -> player position on grid.
    updateFillingStatus(pos_x, pos_y) {
        // if(this.was_on_his_area && GameConfig.GRID[pos_x][pos_y] === this.ID+2)
        // {
        //
        //     this.was_on_his_area = false;
        //     this.should_fill = true;
        //
        // }
        // else
        // {
        //
        //     this.should_fill = false;
        //
        // }
    }

    tryToFill() {

        if (this.filled)
            return;
        console.log(" last position on grid " + this.last_position_on_grid);

        //TODO:create a grid for each room
        let visited = [];

        // Initialize the grid with zeros.
        for (let i = 0; i < GameConfig.CANVAS_SIZE; ++i) {
            visited[i] = [];
            for (let j = 0; j < GameConfig.CANVAS_SIZE; ++j) {
                visited[i][j] = 0;
            }
        }
        this.filled = true;
        let path = this.isConnectedPath(visited);

        return path;

    }

    isConnectedPath(visited) {

        let delta_x = [0, 1, -1, 0];
        let delta_y = [1, 0, 0, -1];
        let queue = [];
        let pos_on_grid = this.getPlayerPositionOnGrid(this.position);
        let curr_node = pos_on_grid;
        queue.push(pos_on_grid);
        visited[curr_node.x][curr_node.y] = 1;

        let parent = new Map();

        while (queue.length > 0) {

            curr_node = queue.shift();

            let last = this.last_position_on_grid;

            if (curr_node.equal(this.last_position_on_grid)) {
                let path = [];
                path.push(curr_node);

                while (!curr_node.equal(pos_on_grid)) {

                    path.push(parent[[curr_node.x, curr_node.y]]);
                    curr_node = parent[[curr_node.x, curr_node.y]];

                }
                //path.push(curr_node);
                return path;
            }

            for (let i = 0; i < delta_x.length; i++) {
                // TODO:: replace true
                if (visited[curr_node.x + delta_x[i]][curr_node.y + delta_y[i]] === 0 && true) {

                    if (GameConfig.GRID[curr_node.x + delta_x[i]][curr_node.y + delta_y[i]][0] === this.ID + 2) {

                        visited[curr_node.x + delta_x[i]][curr_node.y + delta_y[i]] = 1;


                        // if(parent[curr_node.x + delta_x[i]]==null)
                        //     parent[curr_node.x + delta_x[i]]=[];

                        parent[[curr_node.x + delta_x[i], curr_node.y + delta_y[i]]] = curr_node;

                        queue.push(new Position(curr_node.x + delta_x[i], curr_node.y + delta_y[i]));


                    }


                }
            }
        }
        return false;
    }

}