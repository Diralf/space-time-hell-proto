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

const getTargetSign = (side, sourceEntry, targetEntry) => {
    const sideSign = Math.sign(side);
    const sourceSign = Math.sign(sourceEntry);
    const targetSign = Math.sign(targetEntry);
    return sideSign;
}

export class TeleportEntityComponent {
    constructor(owner, settings) {
        this.owner = owner;
        this.settings = settings;
        this.inTeleport = null;
        this.toTeleport = null;
        this.teleportSide = null;
        this.sourceSideX = null;
        this.targetSideX = null;
        this.teleportBlock = false;
    }

    /**
     * get colision handler
     */
    getCollisionHandler(response, other) {
        if (other.body.collisionType === me.collision.types.WORLD_SHAPE && other.type === 'teleport') {
            const anotherTeleport = other?.targetTeleport;
            const ownerAnchor = getAnchorCoords(this.owner);
            const otherAnchor = getAnchorCoords(other);
            const anotherAnchor = getAnchorCoords(anotherTeleport);
            const xDiff = otherAnchor.x - ownerAnchor.x;
            const yDiff = otherAnchor.y - ownerAnchor.y;
            
            if (!this.inTeleport) {
                this.inTeleport = other;
                this.toTeleport = anotherTeleport;
                this.teleportSide = xDiff;
            }
            if (anotherTeleport && this.inTeleport) {
                if (!this.teleportBlock && Math.sign(this.teleportSide) !== Math.sign(xDiff)) {
                    const sideToMove = getTargetSign(this.teleportSide, other.entryX, anotherTeleport.entryX);
                    const padding = Math.abs(xDiff) + 1;
                    const anotherAnchor = getAnchorCoords(anotherTeleport);
                    const newOwnerAnchor = { x: anotherAnchor.x + padding * sideToMove, y: anotherAnchor.y };
                    const newPos = getPosFromAnchorCoords(newOwnerAnchor, this.owner);
                    console.log({ anotherAnchorX: anotherAnchor.x, xDiff, teleportSide: this.teleportSide, newOwnerAnchorX: newOwnerAnchor.x, newPosX: newPos.x, })
                    this.owner.pos.x = newPos.x;
                    this.owner.pos.y = newPos.y;
                    this.teleportBlock = true;
                }
            }

            return new TeleportCollisionHandler();
        }
        return null;
    }

    update(dt) {
        if (this.inTeleport) {
            if (!isEntityOverlaps(this.owner, this.inTeleport)) {
                if (isEntityOverlaps(this.owner, this.toTeleport)) {
                    const inT = this.inTeleport;
                    this.inTeleport = this.toTeleport;
                    this.toTeleport = inT;
                    this.teleportSide = -this.teleportSide;
                } else {
                    this.inTeleport = null;
                    this.toTeleport = null;
                    this.teleportSide = null;
                } 
            }
        }
        this.teleportBlock = false;
    }

    draw(renderer) {
        if (this.inTeleport) {
            if (this.teleportSide > 0) {
                renderer.setColor('lime');
            } else {
                renderer.setColor('blue');
            }
            renderer.stroke(new me.Rect(0, 0, 20, -20), true);

            const ownerAnchor = getAnchorCoords(this.owner);
            renderer.stroke(new me.Rect(this.sourceSideX - ownerAnchor.x, 200, 1, -400), true);
            renderer.stroke(new me.Rect(this.targetSideX - ownerAnchor.x, 200, 1, -400), true);
        }
    }
}