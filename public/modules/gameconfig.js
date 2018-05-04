GameConfig = {
    BLOCK_SIZE : 5,
    CANVAS_SIZE:200,
    PAUSE :false,
    GRID : [],
    SPEED : null,
    BLOCK_SPEED:5,
    UPDATE_SPEED : function(frame_rate)
    {
        GameConfig.SPEED = GameConfig.BLOCK_SPEED * GameConfig.BLOCK_SIZE  /frame_rate ;

    }
};


