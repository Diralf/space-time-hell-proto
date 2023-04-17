import * as me from 'melonjs';
import game from './../game.js';

class TeleportEntity extends me.Entity {
    /**
     * constructor
     */
    constructor(x, y, settings) {
        // // adjust the setting size to the sprite one
        // settings.width = 3;
        // settings.height = 70;

        // // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes = [
            new me.Rect(0, 0, 30, 70)
        ];

        // // call the super constructor
        super(x, y, settings);
        
        this.targetTeleportId = settings.teleportTo;
        this.entryX = settings.entryX;
        this.entryY = settings.entryY;
        // this.body.getBounds().clear();
        // this.body.addShape(new me.Rect(12, 0, 6, 70));
        // this.body.addShape(new me.Rect(0, 0, 6, 70));

        
        // set the renderable position to bottom center
        // this.anchorPoint.set(0.5, 1.0);
        this.body.gravityScale = 0;

        this.body.setMaxVelocity(settings.velX || 1, settings.velY || 0);
        
        this.body.collisionType = game.collisionTypes.TELEPORT;
        // this.body.addShape(new me.Rect(6, 0, 6, 70));

        // set a renderable
        this.renderable = game.texture.createAnimationFromName([
            "teleport/teleport-001", "teleport/teleport-002", "teleport/teleport-003"
        ]);

        this.renderable.addAnimation ("idle", ["teleport/teleport-001", "teleport/teleport-002", "teleport/teleport-003"]);

        // set default one
        this.renderable.setCurrentAnimation("idle");
        this.renderable.scale(this.entryX, 1);
        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);


        // set a "enemyObject" type
        // this.body.collisionType = me.collision.types.WORLD_SHAPE;

        // only check for collision against player and world shape
        this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT | game.collisionTypes.BULLET);
        this.renderable.anchorPoint.set(0.5, 1.0);
    }

    update(dt) {
        if (!this.targetTeleport) {
            const teleports = me.game.world.getChildByName('TeleportEntity');
            this.targetTeleport = teleports.find((teleport) => teleport.id === this.targetTeleportId);
        }
        super.update(dt);
    }

};

export default TeleportEntity;
