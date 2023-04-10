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
    return targetSign * ((sourceSign * sideSign));
}

const getMask = (entity, sprite, teleport) => {
    const bounds = sprite.getBounds();
    const spriteXAnchor = entity.pos.x + sprite.pos.x + sprite.anchorPoint.x * sprite.getBounds().width;
    const entityAnchor = getAnchorCoords(entity);
    const teleportAnchor = getAnchorCoords(teleport);
    const xDiff = teleportAnchor.x - entityAnchor.x;
    const rightSide = xDiff > 0 ? bounds.max.x - xDiff : 0;
    const leftSide = xDiff < 0 ? bounds.min.x - xDiff : 0;
    // console.log({ leftSide, rightSide, bounds, xDiff, spritePosX: sprite.pos.x });
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
        this.inTeleport = null;
        this.toTeleport = null;
        this.teleportSide = null;
        this.sideToMove = null;
        this.sourceSideX = null;
        this.targetSideX = null;
        this.teleportBlock = false;
        this.secondMask = null;
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
                this.sideToMove = getTargetSign(this.teleportSide, other.entryX, anotherTeleport.entryX);
            }
            if (anotherTeleport && this.inTeleport) {
                if (!this.teleportBlock && !this.owner.reversed && Math.sign(this.teleportSide) !== Math.sign(xDiff)) {
                    const sideToMove = getTargetSign(this.teleportSide, other.entryX, anotherTeleport.entryX);
                    const padding = Math.abs(xDiff) + 10;
                    const anotherAnchor = getAnchorCoords(anotherTeleport);
                    const newOwnerAnchor = { x: anotherAnchor.x + padding * sideToMove, y: anotherAnchor.y };
                    const isReversedDirection = Math.sign(sideToMove) !== Math.sign(this.teleportSide);
                    const reversePositionX = isReversedDirection ? xDiff * 2 : 0;
                    // const newPos = getPosFromAnchorCoords(newOwnerAnchor, this.owner);
                    // console.log({ anotherAnchorX: anotherAnchor.x, xDiff, teleportSide: this.teleportSide, newOwnerAnchorX: newOwnerAnchor.x, newPosX: newPos.x, })
                    console.log({ teleportSide: this.teleportSide, sideToMove, xDiff, reversePositionX });
                    const newPos = {
                        x: this.owner.pos.x + anotherAnchor.x - otherAnchor.x + reversePositionX,
                        y: this.owner.pos.y + anotherAnchor.y - otherAnchor.y,
                    }
                    this.owner.pos.x = newPos.x;
                    this.owner.pos.y = newPos.y;
                    this.owner.reversed = Math.sign(sideToMove) !== Math.sign(this.teleportSide);
                    this.teleportBlock = true;
                    this.teleportSide = -sideToMove
                    this.owner.renderable.mask = undefined;
                }
            }

            return new TeleportCollisionHandler();
        }
        return null;
    }

    update(dt) {
        if (this.inTeleport) {
            const { originalMask, secondMask } = getMask(this.owner, this.owner.renderable, this.inTeleport);
            this.owner.renderable.mask = originalMask;
            this.secondMask = secondMask;
            if (!isEntityOverlaps(this.owner, this.inTeleport)) {
                if (isEntityOverlaps(this.owner, this.toTeleport)) {
                    const inT = this.inTeleport;
                    this.inTeleport = this.toTeleport;
                    this.toTeleport = inT;
                    const { originalMask, secondMask } = getMask(this.owner, this.owner.renderable, this.inTeleport);
                    this.owner.renderable.mask = originalMask;
                    this.secondMask = secondMask;
                } else {
                    this.inTeleport = null;
                    this.toTeleport = null;
                    this.teleportSide = null;
                    this.owner.reversed = false;
                    this.owner.renderable.mask = undefined;
                    this.secondMask = null;
                } 
            }
            
        }
        this.teleportBlock = false;
    }

    draw(renderer) {
        if (this.toTeleport) {
            renderer.save();
            const orignalMask = this.owner.renderable.mask;
            this.owner.renderable.mask = this.secondMask;

            const ownerAnchor = getAnchorCoords(this.owner);
            const otherAnchor = getAnchorCoords(this.inTeleport);
            const anotherAnchor = getAnchorCoords(this.toTeleport);

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