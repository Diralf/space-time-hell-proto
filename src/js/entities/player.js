import * as me from 'melonjs';
import game from './../game.js';
import { Dimension } from '../constants/dimension.js';
import { setLayerOpacity } from '../utils/level';
import { changeDimension } from '../utils/dimension';
import { PlatformCollisionHandler } from '../collision-handlers/platform.collision-handler';
import { SlopeCollisionHandler } from '../collision-handlers/slope.collision-handler';
import { TeleportCollisionHandler } from '../collision-handlers/teleport.collision-handler';
import { EnemyCollisionHandler } from '../collision-handlers/enemy.collision-handler';
import { getCollisionHandler } from '../collision-handlers/get-collision-handler.util';
import { TeleportEntityComponent } from '../components/teleport-entity.component';

class PlayerEntity extends me.Entity {
    constructor(x, y, settings) {
        // call the constructor
        super(x, y , settings);

        this.components = [
            new TeleportEntityComponent(this, settings),
        ];

        // set a "player object" type
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;

        // player can exit the viewport (jumping, falling into a hole, etc.)
        this.alwaysUpdate = true;

        // walking & jumping speed
        this.body.setMaxVelocity(3, 15);
        this.body.setFriction(0.4, 0);

        this.dying = false;

        this.multipleJump = 1;

        changeDimension(this, Dimension.REAL);

        // set the viewport to follow this renderable on both axis, and enable damping
        me.game.viewport.follow(this, me.game.viewport.AXIS.BOTH, 0.1);
        

        // enable keyboard
        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.X,     "jump", true);
        me.input.bindKey(me.input.KEY.UP,    "jump", true);
        me.input.bindKey(me.input.KEY.SPACE, "jump", true);
        me.input.bindKey(me.input.KEY.DOWN,  "down");

        me.input.bindKey(me.input.KEY.A,     "left");
        me.input.bindKey(me.input.KEY.D,     "right");
        me.input.bindKey(me.input.KEY.W,     "jump", true);
        me.input.bindKey(me.input.KEY.S,     "down");

        me.input.bindKey(me.input.KEY.C,     "dimension", true);

        //me.input.registerPointerEvent("pointerdown", this, this.onCollision.bind(this));
        //me.input.bindPointer(me.input.pointer.RIGHT, me.input.KEY.LEFT);

        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_1}, me.input.KEY.UP);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_2}, me.input.KEY.UP);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.DOWN}, me.input.KEY.DOWN);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_3}, me.input.KEY.DOWN);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.FACE_4}, me.input.KEY.DOWN);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.LEFT}, me.input.KEY.LEFT);
        me.input.bindGamepad(0, {type: "buttons", code: me.input.GAMEPAD.BUTTONS.RIGHT}, me.input.KEY.RIGHT);

        // map axes
        me.input.bindGamepad(0, {type:"axes", code: me.input.GAMEPAD.AXES.LX, threshold: -0.5}, me.input.KEY.LEFT);
        me.input.bindGamepad(0, {type:"axes", code: me.input.GAMEPAD.AXES.LX, threshold: 0.5}, me.input.KEY.RIGHT);
        me.input.bindGamepad(0, {type:"axes", code: me.input.GAMEPAD.AXES.LY, threshold: -0.5}, me.input.KEY.UP);

        // set a renderable
        this.renderable = game.texture.createAnimationFromName([
            "character/walk0001", "character/walk0002", "character/walk0003",
            "character/walk0004", "character/walk0005", "character/walk0006",
            "character/walk0007", "character/walk0008", "character/walk0009",
            "character/walk0010", "character/walk0011"
        ]);

        // define a basic walking animatin
        this.renderable.addAnimation("stand", [{ name: "character/walk0001", delay: 100 }]);
        this.renderable.addAnimation("walk",  [{ name: "character/walk0001", delay: 100 }, { name: "character/walk0002", delay: 100 }, { name: "character/walk0003", delay: 100 }]);
        this.renderable.addAnimation("jump",  [{ name: "character/walk0004", delay: 150 }, { name: "character/walk0005", delay: 150 }, { name: "character/walk0006", delay: 150 }, { name: "character/walk0007", delay: 150 }, { name: "character/walk0001", delay: 150 }]);

        // set as default
        this.renderable.setCurrentAnimation("walk");

        // set the renderable position to bottom center
        this.anchorPoint.set(0.5, 1.0);
    }

    /**
     ** update the force applied
     */
    update(dt) {
        this.components.forEach((component) => component.update(dt));

        if (me.input.isKeyPressed(this.reversed ? 'right' : "left")){
            if (this.body.vel.y === 0) {
                this.renderable.setCurrentAnimation("walk");
            }
            this.body.force.x = -this.body.maxVel.x;
            this.renderable.flipX(true);
        } else if (me.input.isKeyPressed(this.reversed ? 'left' : "right")) {
            if (this.body.vel.y === 0) {
                this.renderable.setCurrentAnimation("walk");
            }
            this.body.force.x = this.body.maxVel.x;
            this.renderable.flipX(false);
        }

        if (this.reversed && this.body.force.x === 0) {
            this.reversed = false;
        }

        if (me.input.isKeyPressed("jump")) {
            this.renderable.setCurrentAnimation("jump");
            this.body.jumping = true;
            if (this.multipleJump <= 2) {
                // easy "math" for double jump
                this.body.force.y = -this.body.maxVel.y * this.multipleJump++;
                me.audio.stop("jump");
                me.audio.play("jump", false);
            }
        } else {
            if (!this.body.falling && !this.body.jumping) {
                // reset the multipleJump flag if on the ground
                this.multipleJump = 1;
            }
            else if (this.body.falling && this.multipleJump < 2) {
                // reset the multipleJump flag if falling
                this.multipleJump = 2;
            }
        }


        if (this.body.force.x === 0 && this.body.force.y === 0) {
            this.renderable.setCurrentAnimation("stand");
        }

        // check if we fell into a hole
        if (!this.inViewport && (this.pos.y > me.video.renderer.getHeight())) {
            // if yes reset the game
            me.game.world.removeChild(this);
            me.game.viewport.fadeIn("#fff", 150, function(){
                me.audio.play("die", false);
                me.level.reload();
                me.game.viewport.fadeOut("#fff", 150);
            });
            return true;
        }

        if (me.input.isKeyPressed("dimension")) {
            changeDimension(this, this.dimension === Dimension.REAL ? Dimension.SHADOW : Dimension.REAL);
        }

        // check if we moved (an "idle" animation would definitely be cleaner)
        if (this.body.vel.x !== 0 || this.body.vel.y !== 0 ||
            (this.renderable && this.renderable.isFlickering())
        ) {
            super.update(dt);
            return true;
        }
        return false;
    }


    /**
     * colision handler
     */
    onCollision(response, other) {
        const componentHandler = this.components
            .filter(component => component.getCollisionHandler)
            .map(component => component.getCollisionHandler(response, other))
            [0];
        const handler = componentHandler ?? getCollisionHandler(response, other);
        return handler.handle(this, response, other);
    }

    /**
     * ouch
     */
    hurt() {
        var sprite = this.renderable;

        if (!sprite.isFlickering()) {

            // tint to red and flicker
            sprite.tint.setColor(255, 192, 192);
            sprite.flicker(750, function () {
                // clear the tint once the flickering effect is over
                sprite.tint.setColor(255, 255, 255);
            });

            // flash the screen
            me.game.viewport.fadeIn("#FFFFFF", 75);
            me.audio.play("die", false);
        }
    }

    draw(renderer) {
        super.draw(renderer);

        // console.log(renderer);
        // renderer.setMask(new me.Rect(0, 0, 40, -40));
        
        this.components.forEach((component) => component.draw(renderer));
    }
};

export default PlayerEntity;
