import { CollisionHandler } from "./collision-handler";

export class NoCollisionHandler extends CollisionHandler {
    handle(current, response, other) {
        return false;
    }
}