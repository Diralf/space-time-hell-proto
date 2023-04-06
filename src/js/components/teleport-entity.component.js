import * as me from 'melonjs';
import { TeleportCollisionHandler } from "../collision-handlers/teleport.collision-handler";

export class TeleportEntityComponent {
    constructor(owner, settings) {
        this.owner = owner;
        this.settings = settings;
    }

    /**
     * get colision handler
     */
    getCollisionHandler(response, other) {
        if (other.body.collisionType === me.collision.types.WORLD_SHAPE && other.type === 'teleport') {
            const anotherTeleport = other?.targetTeleport;
            console.log(this.owner, other, anotherTeleport, anotherTeleport?.id);
            if (anotherTeleport) {
                this.owner.pos.x = anotherTeleport.pos.x;
                this.owner.pos.y = anotherTeleport.pos.y;
            }

            return new TeleportCollisionHandler();
        }
        return null;
    }
}