import { CollisionHandler } from "../../collision-handlers/collision-handler";

export class TeleportCollisionHandler extends CollisionHandler {
    handle(current, response, other) {
        
        return false;
    }
}