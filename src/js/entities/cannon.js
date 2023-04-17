import * as me from 'melonjs';
import game from './../game.js';

class CannonEntity extends me.Entity {
    constructor(x, y, settings) {
        super(x, y, settings);

        
        // set the renderable position to bottom center
        // this.anchorPoint.set(0.5, 1.0);
        // this.body.gravityScale = 0;

        // this.body.setMaxVelocity(settings.velX || 1, settings.velY || 0);
        
        
        // this.body.addShape(new me.Rect(6, 0, 6, 70));

        // set a renderable
        this.renderable = game.texture.createAnimationFromName(["cannon/wood-cannon-0001"]);

        this.renderable.addAnimation ("idle", ["cannon/wood-cannon-0001"]);

        // set default one
        this.renderable.setCurrentAnimation("idle");
        // this.renderable.scale(this.entryX, 1);
        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);
        this.renderable.anchorPoint.set(0.5, 1.0);


        // set a "enemyObject" type
        // this.body.collisionType = me.collision.types.WORLD_SHAPE;
        this.body.collisionType = me.collision.types.WORLD_SHAPE | game.collisionTypes.PUSHABLE;

        // only check for collision against player and world shape
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT);
        
        me.timer.setInterval(() => {
            // this.shoot();
        }, 1000, true);
    }

    onCollision(response, other) {
        switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                return true;
            case me.collision.types.PLAYER_OBJECT:
                return false;
            default:
                return true;
        }
    }

    shoot() {
        const bullet = me.pool.pull("ArrowEntity", this.pos.x, this.pos.y);
        me.game.world.addChild(bullet);
    }
}

export default CannonEntity;