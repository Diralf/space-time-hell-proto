import { getAnchorCoords, getMask, getTargetSign, isEntityOverlaps } from "./teleport-entity.utils";

export class BaseTeleportHandler {
    constructor(entity, sourceTeleport, targetTeleport) {
        this.entity = entity;
        this.sourceTeleport = sourceTeleport;
        this.targetTeleport = targetTeleport;
        this.isActive = false;
    }

    onTeleportEnter(sourceTeleport) {
        this.isActive = true;
        const entityAnchor = getAnchorCoords(this.entity);
        const sourceAnchor = getAnchorCoords(sourceTeleport);
        const xDiff = sourceAnchor.x - entityAnchor.x;

        this.sourceTeleportSide = xDiff;
        this.targetTeleportSide = getTargetSign(this.sourceTeleportSide, sourceTeleport.entryX, this.targetTeleport.entryX);
    }

    onTeleportExit() {
        this.sourceTeleport = null;
        this.targetTeleport = null;
        this.sourceTeleportSide = null;
        this.entity.renderable.mask = undefined;
        this.secondMask = null;
    }

    onUpdate() {
        this.onInsideTeleport();
        this.onMaskUpdate();
        if (!this.isInSourceTeleport()) {
            if (this.isInTargetTeleport()) {
                this.onPostTeleported();
                this.onMaskUpdate();
            } else {
                this.onTeleportExit();
                this.isActive = false;
            }
        }
    }

    isInSourceTeleport() {
        return isEntityOverlaps(this.entity, this.sourceTeleport);
    }

    isInTargetTeleport() {
        return isEntityOverlaps(this.entity, this.targetTeleport);
    }

    onPostTeleported() {
        const inT = this.sourceTeleport;
        this.sourceTeleport = this.targetTeleport;
        this.targetTeleport = inT;
        this.isTeleportBlocked = false;
    }

    onMaskUpdate() {
        const { originalMask, secondMask } = getMask(this.entity, this.entity.renderable, this.sourceTeleport);
        this.entity.renderable.mask = originalMask;
        this.secondMask = secondMask;
    }

    onSecondPartDraw(renderer) {
        renderer.save();
        const orignalMask = this.entity.renderable.mask;
        this.entity.renderable.mask = this.secondMask;

        const ownerAnchor = getAnchorCoords(this.entity);
        const otherAnchor = getAnchorCoords(this.sourceTeleport);
        const anotherAnchor = getAnchorCoords(this.targetTeleport);

        // renderer.translate(this.toTeleport.pos.x - this.owner.renderable.pos.x - this.owner.pos.x, newPos.y - this.owner.renderable.pos.y - this.owner.pos.y);
        renderer.translate(
            anotherAnchor.x - otherAnchor.x,
            anotherAnchor.y - otherAnchor.y,
        );

        this.entity.renderable.preDraw(renderer);
        this.entity.renderable.draw(renderer);
        this.entity.renderable.postDraw(renderer);

        this.entity.renderable.mask = orignalMask;
        renderer.restore();
    }
}
