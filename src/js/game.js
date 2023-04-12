import * as me from 'melonjs';

/**
 * hold all game specific data
 */
var game = {

    /**
     * object where to store game global scole
     */
    data : {
        // score
        score : 0
    },

    // a reference to the texture atlas
    texture: null,
    particleImage: null,

    collisionTypes: {
        TELEPORT : me.collision.types.USER << 0,
        CANNON   : me.collision.types.USER << 1,
        BULLET   : me.collision.types.USER << 2,
    },
};

export default game;
