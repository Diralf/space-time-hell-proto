import { CollisionHandler } from "./collision-handler";
import * as me from 'melonjs';

export class EnemyCollisionHandler extends CollisionHandler {
    handle(current, response, other) {
        if (!other.isMovingEnemy) {
            // spike or any other fixed danger
            current.body.vel.y -= current.body.maxVel.y * me.timer.tick;
            current.hurt();
            return true;
        }
        else {
            // a regular moving enemy entity
            if ((response.overlapV.y > 0) && current.body.falling) {
                // jump
                current.body.vel.y -= current.body.maxVel.y * 1.5 * me.timer.tick;
            }
            else {
                current.hurt();
            }
            // Not solid
            return false;
        }
    }
}