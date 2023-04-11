import * as me from 'melonjs';
import game from './../game.js';

class ArrowEntity extends me.Entity {
    constructor(x, y, settings) {
        // call the super constructor
        super(x, y,
            Object.assign({
                image: game.texture,
                region : "cannon/arrow-0001",
                shapes :[new me.Ellipse(35 / 2, 35 / 2, 35, 35)], // coins are 35x35,
                width: 35,
                height: 35,
            })
        );

        this.body.setMaxVelocity(3, 15);
        this.body.setFriction(0, 0);
        this.body.gravityScale = 0;
    }

    // add a onResetEvent to enable object recycling
    onResetEvent(x, y, settings) {
        this.shift(x, y);
        // only check for collision against player
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT);

        this.body.vel.x = 1;
    }

    onCollision(response, other) {
        // res.y >0 means touched by something on the bottom
        // which mean at top position for this one
        if (this.alive) {
            // make it dead
            this.alive = false;
            //avoid further collision and delete it
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
            // make the body static
            this.body.setStatic(true);
            // set dead animation
            // this.renderable.setCurrentAnimation("dead");

            var emitter = new me.ParticleEmitter(this.centerX, this.centerY, {
                width: this.width / 4,
                height : this.height / 4,
                tint: this.particleTint,
                totalParticles: 32,
                angle: 0,
                angleVariation: 6.283185307179586,
                maxLife: 5,
                speed: 3
            });

            me.game.world.addChild(emitter,this.pos.z);
            me.game.world.removeChild(this);
            emitter.burstParticles();

            // dead sfx
            me.audio.play("enemykill", false);
            // give some score
            // game.data.score += 150;
        }
        return false;
    }
}

export default ArrowEntity;