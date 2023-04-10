import * as me from 'melonjs';
import { TeleportCollisionHandler } from "./teleport.collision-handler";

const getAnchorCoords = (entity) => {
    const x = entity.pos.x + entity.anchorPoint.x * entity.body.getBounds().width;
    const y = entity.pos.y + entity.anchorPoint.y * entity.body.getBounds().height;
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
    return targetSign * ((sourceSign * sideSign));
}

const getMask = (entity, sprite, teleport) => {
    const bounds = sprite.getBounds();
    const entityAnchor = getAnchorCoords(entity);
    const teleportAnchor = getAnchorCoords(teleport);
    const xDiff = teleportAnchor.x - entityAnchor.x;
    const rightSide = xDiff > 0 ? bounds.max.x - xDiff : 0;
    const leftSide = xDiff < 0 ? bounds.min.x - xDiff : 0;
    return {
        originalMask: new me.Rect(bounds.min.x - leftSide, bounds.min.y, bounds.width + leftSide - rightSide, bounds.height),
        secondMask: Math.abs(leftSide) > 0
            ? new me.Rect(bounds.min.x, bounds.min.y, -leftSide, bounds.height)
            : new me.Rect(bounds.max.x - rightSide, bounds.min.y, rightSide, bounds.height)
    };
}

export class TeleportEntityComponent {
    constructor(owner, settings) {
        this.owner = owner;
        this.settings = settings;
        this.sourceTeleport = null;
        this.targetTeleport = null;
        this.sourceTeleportSide = null;
        this.targetTeleportSide = null;
        this.sourceSideX = null;
        this.targetSideX = null;
        this.isTeleportBlocked = false;
        this.secondMask = null;
    }

    /**
     * get colision handler
     */
    getCollisionHandler(response, other) {
        if (other.body.collisionType === me.collision.types.WORLD_SHAPE && other.type === 'teleport') {
            const targetTeleport = other?.targetTeleport;
            const ownerAnchor = getAnchorCoords(this.owner);
            const sourceAnchor = getAnchorCoords(other);
            const xDiff = sourceAnchor.x - ownerAnchor.x;
            
            if (!this.sourceTeleport) {
                this.onTeleportEnter(other);
            }
            if (this.targetTeleport && this.sourceTeleport) {
                if (!this.isTeleportBlocked && !this.owner.reversed && Math.sign(this.sourceTeleportSide) !== Math.sign(xDiff)) {
                    const sideToMove = getTargetSign(this.sourceTeleportSide, other.entryX, targetTeleport.entryX);
                    const anotherAnchor = getAnchorCoords(targetTeleport);
                    const isReversedDirection = Math.sign(sideToMove) !== Math.sign(this.sourceTeleportSide);
                    const reversePositionX = isReversedDirection ? xDiff * 2 : 0;
                    const newPos = {
                        x: this.owner.pos.x + anotherAnchor.x - sourceAnchor.x + reversePositionX,
                        y: this.owner.pos.y + anotherAnchor.y - sourceAnchor.y,
                    }
                    this.owner.pos.x = newPos.x;
                    this.owner.pos.y = newPos.y;
                    this.owner.reversed = Math.sign(sideToMove) !== Math.sign(this.sourceTeleportSide);
                    this.isTeleportBlocked = true;
                    this.sourceTeleportSide = -sideToMove
                    this.owner.renderable.mask = undefined;
                }
            }

            return new TeleportCollisionHandler();
        }
        return null;
    }

    onTeleportEnter(sourceTeleport) {
        const targetTeleport = sourceTeleport?.targetTeleport;
        const ownerAnchor = getAnchorCoords(this.owner);
        const sourceAnchor = getAnchorCoords(sourceTeleport);
        const xDiff = sourceAnchor.x - ownerAnchor.x;

        this.sourceTeleport = sourceTeleport;
        this.targetTeleport = targetTeleport;
        this.sourceTeleportSide = xDiff;
        this.targetTeleportSide = getTargetSign(this.sourceTeleportSide, sourceTeleport.entryX, targetTeleport.entryX);
    }

    onTeleportExit() {
        this.sourceTeleport = null;
        this.targetTeleport = null;
        this.sourceTeleportSide = null;
        this.owner.reversed = false;
        this.owner.renderable.mask = undefined;
        this.secondMask = null;
    }

    onPostTeleported() {
        const inT = this.sourceTeleport;
        this.sourceTeleport = this.targetTeleport;
        this.targetTeleport = inT;

        const { originalMask, secondMask } = getMask(this.owner, this.owner.renderable, this.sourceTeleport);
        this.owner.renderable.mask = originalMask;
        this.secondMask = secondMask;
    }

    update(dt) {
        if (this.sourceTeleport) {
            const { originalMask, secondMask } = getMask(this.owner, this.owner.renderable, this.sourceTeleport);
            this.owner.renderable.mask = originalMask;
            this.secondMask = secondMask;
            if (!isEntityOverlaps(this.owner, this.sourceTeleport)) {
                if (isEntityOverlaps(this.owner, this.targetTeleport)) {
                    this.onPostTeleported();
                } else {
                    this.onTeleportExit();
                } 
            }
        }
        this.isTeleportBlocked = false;
    }

    draw(renderer) {
        if (this.targetTeleport) {
            renderer.save();
            const orignalMask = this.owner.renderable.mask;
            this.owner.renderable.mask = this.secondMask;

            const ownerAnchor = getAnchorCoords(this.owner);
            const otherAnchor = getAnchorCoords(this.sourceTeleport);
            const anotherAnchor = getAnchorCoords(this.targetTeleport);

            // renderer.translate(this.toTeleport.pos.x - this.owner.renderable.pos.x - this.owner.pos.x, newPos.y - this.owner.renderable.pos.y - this.owner.pos.y);
            renderer.translate(
                anotherAnchor.x - otherAnchor.x,
                anotherAnchor.y - otherAnchor.y,
            );

            this.owner.renderable.preDraw(renderer);
            this.owner.renderable.draw(renderer);
            this.owner.renderable.postDraw(renderer);

            this.owner.renderable.mask = orignalMask;
            renderer.restore();
        }
    } 
}