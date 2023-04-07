import * as me from 'melonjs';
import { TeleportCollisionHandler } from "../collision-handlers/teleport.collision-handler";

const getAnchorCoords = (entity) => {
    const x = entity.pos.x + entity.anchorPoint.x * entity.body.getBounds().width;
    const y = entity.pos.y + entity.anchorPoint.y * entity.body.getBounds().height;
    return { x, y };
}

const getPosFromAnchorCoords = (anchor, entity) => {
    const x = anchor.x - entity.anchorPoint.x * entity.body.getBounds().width;
    const y = anchor.y - entity.anchorPoint.y * entity.body.getBounds().height;
    return { x, y };
}

const isEntityOverlaps = (entityA, entityB) => {
    const bounds = entityB.body.getBounds().clone();
    bounds.translate(entityB.pos.x - entityA.pos.x, entityB.pos.y - entityA.pos.y);
    return bounds.overlaps(entityA.body.getBounds());
}

export class TeleportEntityComponent {
    constructor(owner, settings) {
        this.owner = owner;
        this.settings = settings;
        this.inTeleport = null;
        this.teleportSide = null;
    }

    /**
     * get colision handler
     */
    getCollisionHandler(response, other) {
        if (other.body.collisionType === me.collision.types.WORLD_SHAPE && other.type === 'teleport') {
            const ownerAnchor = getAnchorCoords(this.owner);
            const otherAnchor = getAnchorCoords(other);
            const xDiff = otherAnchor.x - ownerAnchor.x;
            const yDiff = otherAnchor.y - ownerAnchor.y;
            
            if (!this.inTeleport) {
                this.inTeleport = other;
                this.teleportSide = xDiff;
            }
            const anotherTeleport = other?.targetTeleport;
            // console.log(this.owner, response, other, anotherTeleport);
            if (anotherTeleport && this.inTeleport) {
                const otherEdge = { 
                    x: this.teleportSide > 0 ? other.pos.x : other.pos.x + other.body.getBounds().width,
                    y: otherAnchor.y, 
                }
                console.log({xDiff, yDiff});
                if (Math.sign(this.teleportSide) !== Math.sign(xDiff)) {
                    const anotherAnchor = getAnchorCoords(anotherTeleport);
                    const newOwnerAnchor = { x: anotherAnchor.x + xDiff, y: anotherAnchor.y + yDiff };
                    const newPos = getPosFromAnchorCoords(newOwnerAnchor, this.owner);
                    this.owner.pos.x = newPos.x;
                    this.owner.pos.y = newPos.y;
                }
            }

            return new TeleportCollisionHandler();
        }
        return null;
    }

    update(dt) {
        if (this.inTeleport) {
            if (!isEntityOverlaps(this.owner, this.inTeleport)) {
                this.inTeleport = null;
                this.teleportSide = null;
            }
        }
    }

    draw(renderer) {
        if (this.inTeleport) {
            if (this.teleportSide > 0) {
                renderer.setColor('lime');
            } else {
                renderer.setColor('blue');
            }
            renderer.stroke(new me.Rect(0, 0, 20, -20), true);
        }
    }
}