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