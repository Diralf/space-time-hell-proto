import * as me from 'melonjs';
import game from './../game.js';

class TeleportEntity extends me.Entity {
    /**
     * constructor
     */
    constructor(x, y, settings) {
        console.log(JSON.stringify(settings, null, 2));

        // adjust the setting size to the sprite one
        settings.width = 1;
        settings.height = 70;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(1, 70, 1, 70);

        // call the super constructor
        super(x, y, settings);

        // set a renderable
        this.renderable = game.texture.createAnimationFromName([
            "teleport/teleport-001", "teleport/teleport-002", "teleport/teleport-003"
        ]);

        this.renderable.addAnimation ("idle", ["teleport/teleport-001", "teleport/teleport-002", "teleport/teleport-003"]);

        // set default one
        this.renderable.setCurrentAnimation("idle");

        // set the renderable position to bottom center
        // this.anchorPoint.set(0.5, 1.0);
        this.body.gravityScale = 0;

        this.body.setMaxVelocity(settings.velX || 1, settings.velY || 0);
        
        this.body.collisionType = me.collision.types.WORLD_SHAPE;

        // set a "enemyObject" type
        // this.body.collisionType = me.collision.types.WORLD_SHAPE;

        // only check for collision against player and world shape
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
    }

};

export default TeleportEntity;
