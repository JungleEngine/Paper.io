GameConfig = {
    BLOCK_SIZE : 5,
    CANVAS_SIZE:200,
    GRID : [],
    SPEED : null,
    UPDATE_SPEED : function(frame_rate, speed_value)
    {
        GameConfig.SPEED = speed_value * GameConfig.BLOCK_SIZE  /frame_rate ;

    }
};


