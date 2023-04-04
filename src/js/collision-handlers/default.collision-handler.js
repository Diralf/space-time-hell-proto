import { CollisionHandler } from "./collision-handler";

export class DefaultCollisionHandler extends CollisionHandler {
    handle(current, response, other) {
        return false;
    }
}