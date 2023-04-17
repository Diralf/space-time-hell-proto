import * as me from 'melonjs';
import game from './../game.js';

class WoodBoxEntity extends me.Entity {
    constructor(x, y, settings) {
        super(x, y, settings);

        this.renderable = game.texture.createAnimationFromName(["wood_box/wood-box"]);

        this.renderable.addAnimation("idle", ["wood_box/wood-box"]);

        // set default one
        this.renderable.setCurrentAnimation("idle");
        // this.renderable.scale(this.entryX, 1);
        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);
        this.renderable.anchorPoint.set(0.5, 1.0);


        // set a "enemyObject" type
        // this.body.collisionType = me.collision.types.WORLD_SHAPE;
        this.body.collisionType = me.collision.types.WORLD_SHAPE | game.collisionTypes.PICKABLE | game.collisionTypes.PUSHABLE;

        // only check for collision against player and world shape
        this.body.setCollisionMask(me.collision.types.ALL_OBJECT);
    }

    onCollision(response, other) {
        switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                return true;
            default:
                return false;
        }
    }
}

export default WoodBoxEntity;