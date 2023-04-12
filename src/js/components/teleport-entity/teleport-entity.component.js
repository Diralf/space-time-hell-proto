import * as me from 'melonjs';
import { TeleportCollisionHandler } from "./teleport.collision-handler";
import { ForwardTeleportHandler } from './forward.teleport-handler';
import { ReverseTeleportHandler } from './reverse.teleport-handler';
import game from '../../game';

export class TeleportEntityComponent {
    constructor(owner) {
        this.owner = owner;
        this.teleport = null;
    }

    /**
     * get colision handler
     */
    getCollisionHandler(response, other) {
        if (other.body.collisionType === game.collisionTypes.TELEPORT) {
            if (!this.teleport) {
                this.onTeleportEnter(other);
            }

            return new TeleportCollisionHandler();
        }
        return null;
    }

    onTeleportEnter(sourceTeleport) {
        const targetTeleport = sourceTeleport?.targetTeleport;
        if (sourceTeleport && targetTeleport) {7
            if (sourceTeleport.entryX === targetTeleport.entryX) {
                this.teleport = new ForwardTeleportHandler(this.owner, sourceTeleport, targetTeleport);
            } else {
                this.teleport = new ReverseTeleportHandler(this.owner, sourceTeleport, targetTeleport);
            }
            this.teleport.onTeleportEnter(sourceTeleport);
        }
    }

    onTeleportExit() {
        this.teleport = null;
    }

    update(dt) {
        if (this.teleport) {
            this.teleport.onUpdate();
            if (!this.teleport.isActive) {
                this.onTeleportExit();
            }
        }
    }

    draw(renderer) {
        if (this.teleport) {
            this.teleport.onSecondPartDraw(renderer);
        }
    } 
}