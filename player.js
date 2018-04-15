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
        this.KEY_PRESSED = 'right';
        this.alive = true
        this.dir = dir;
        this.last_dir = new Dir(dir.x, dir.y);
        this.position = position;
        this.area = 0;
        this.name = "samir";
        this.ID = id;
    }

    // Update key press from dir.
    updateKeyPressFromDir()
    {


        if (this.dir.equal(new Dir(1, 0)))
        {

            this.KEY_PRESSED = 'right';

        }

        if (this.dir.equal(new Dir(-1, 0)))
        {

            this.KEY_PRESSED = 'left';

        }

        if (this.dir.equal(new Dir(0, 1)))
        {

            this.KEY_PRESSED = 'down';

        }

        if (this.dir.equal(new Dir(0, -1)))
        {

            this.KEY_PRESSED = 'up';

        }

    }
// Update key press from dir.
    updateDirFromKeyPress()
    {
        if ( this.position.x % block_size < speed && this.position.y % block_size < speed)
        {

            if (this.KEY_PRESSED == 'right')
            {

                this.dir.x = 1;
                this.dir.y = 0;

            }

            if (this.KEY_PRESSED == 'left')
            {

                this.dir.x = -1;
                this.dir.y = 0;

            }

            if (this.KEY_PRESSED == 'up')
            {

                this.dir.x = 0;
                this.dir.y = -1;

            }

            if (this.KEY_PRESSED == 'down')
            {

                this.dir.x = 0;
                this.dir.y = 1;

            }

        }

    }

}