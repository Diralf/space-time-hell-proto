import * as me from 'melonjs';
import game from './../game.js';
import { TeleportEntityComponent } from '../components/teleport-entity/teleport-entity.component';

class ArrowEntity extends me.Entity {
    constructor(x, y, settings = {}) {
        // save the area size defined in Tiled
        const width = 40;
        const height = 10;

        // adjust the setting size to the sprite one
        settings.width = width;
        settings.height = height;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes = [new me.Rect(0, 0, width, height)];
        // call the super constructor
        super(x, y, settings);

        this.renderable = game.texture.createAnimationFromName([
            "cannon/arrow-0001"
        ]);

        this.renderable.addAnimation ("idle", ["cannon/arrow-0001"]);

        // set default one
        this.renderable.setCurrentAnimation("idle");
        this.anchorPoint.set(0.5, 0.5);

        this.body.setMaxVelocity(2, 15);
        this.body.setFriction(0, 0);
        this.body.gravityScale = 0;
        
        this.body.collisionType = game.collisionTypes.BULLET | me.collision.types.ENEMY_OBJECT;

        this.components = [
            new TeleportEntityComponent(this),
        ];
        
        this.init();
    }

    // add a onResetEvent to enable object recycling
    onResetEvent(x, y, settings) {
        console.log('onResetEvent', this.id);
        this.shift(x, y);
        // only check for collision against player
        this.init();
    }

    update(dt) {
        super.update(dt);
        this.components.forEach((component) => component.update(dt));
    }

    init() {
        this.body.force.set(2, 0);
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT | game.collisionTypes.TELEPORT);
        this.body.setStatic(false);
        this.alive = true;


        if (this.timer) {
            me.timer.clearTimeout(this.timer);
        }
        this.timer = me.timer.setTimeout(() => {
            this.hit();
        }, 5000, true);
    }

    onCollision(response, other) {
        const componentHandler = this.components
            .filter(component => component.getCollisionHandler)
            .map(component => component.getCollisionHandler(response, other))
            [0];
        if (componentHandler) {
            return componentHandler.handle(this, response, other);
        }
        this.hit();
        return false;
    }

    hit() {
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
                speed: 3,
                image: game.particleImage,
            });

            me.game.world.addChild(emitter,this.pos.z);
            me.game.world.removeChild(this);
            emitter.burstParticles();

            // dead sfx
            me.audio.play("enemykill", false);
            // give some score
            // game.data.score += 150;

            // me.game.world.removeChild(emitter);
        }
    }

    draw(renderer) {
        super.draw(renderer);
        this.components.forEach((component) => component.draw(renderer));
    }
}

export default ArrowEntity;