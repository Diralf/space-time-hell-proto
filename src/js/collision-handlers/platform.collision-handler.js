import { CollisionHandler } from "./collision-handler";
import * as me from 'melonjs';

export class PlatformCollisionHandler extends CollisionHandler {

    constructor(dimension) {
        super();
        this.dimension = dimension;
    }

    handle(current, response, other) {
        if (current.dimension === this.dimension) {
            if (current.body.falling &&
                !me.input.isKeyPressed("down") &&
                // Shortest overlap would move the player upward
                (response.overlapV.y > 0) &&
                // The velocity is reasonably fast enough to have penetrated to the overlap depth
                (~~current.body.vel.y >= ~~response.overlapV.y)
            ) {
                // Disable collision on the x axis
                response.overlapV.x = 0;
                // Repond to the platform (it is solid)
                return true;
            }
        }
        // Do not respond to the platform (pass through)
        return false;
    }
}