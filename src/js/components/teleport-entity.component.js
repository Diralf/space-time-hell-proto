import * as me from 'melonjs';
import { TeleportCollisionHandler } from "../collision-handlers/teleport.collision-handler";

export class TeleportEntityComponent {
    constructor(owner, settings) {
        this.owner = owner;
        this.settings = settings;
        this.teleportPair = me.game.world.getChildByProp("class", 'teleport_1');
    }

    /**
     * get colision handler
     */
    getCollisionHandler(response, other) {
        if (other.body.collisionType === me.collision.types.WORLD_SHAPE && other.type?.startsWith('teleport')) {
            if (!this.teleportPair || this.teleportPair.length === 0) {  
                this.teleportPair = me.game.world.getChildByProp("class", other.type);
            }
            const anotherTeleport = this.teleportPair.find(teleport => other.id !== teleport.id);
            console.log(this.owner, this.teleportPair, anotherTeleport.id);
            if (anotherTeleport) {
                this.owner.pos.x = anotherTeleport.pos.x;
                this.owner.pos.y = anotherTeleport.pos.y - 300;
            }

            return new TeleportCollisionHandler();
        }
        return null;
    }
}