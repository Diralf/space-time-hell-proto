import { CollisionHandler } from "./collision-handler";

export class SlopeCollisionHandler extends CollisionHandler {
    handle(current, response, other) {
        // Always adjust the collision response upward
        response.overlapV.y = Math.abs(response.overlap);
        response.overlapV.x = 0;

        // Respond to the slope (it is solid)
        return true;
    }
}