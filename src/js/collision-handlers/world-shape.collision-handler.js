import { CollisionHandler } from "./collision-handler";

export class WorldShapeCollisionHandler extends CollisionHandler {
    handle(current, response, other) {
        return true;
    }
}