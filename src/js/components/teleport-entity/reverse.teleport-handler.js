import { BaseTeleportHandler } from "./base.teleport-handler";
import { getAnchorCoords, getMask, getTargetSign, isEntityOverlaps } from "./teleport-entity.utils";

export class ReverseTeleportHandler extends BaseTeleportHandler {
    onTeleportExit() {
        super.onTeleportExit();
        this.entity.reversed = false;
    }

    shouldWrap() {
        const shouldWrapBase = super.shouldWrap();
        return shouldWrapBase && !this.entity.reversed;
    }

    getTargetPosition() {
        const ownerAnchor = getAnchorCoords(this.entity);
        const sourceAnchor = getAnchorCoords(this.sourceTeleport);
        const targetAnchor = getAnchorCoords(this.targetTeleport);
        const xDiff = sourceAnchor.x - ownerAnchor.x;
        const reversePositionX = xDiff * 2;
        return {
            x: this.entity.pos.x + targetAnchor.x - sourceAnchor.x + reversePositionX,
            y: this.entity.pos.y + targetAnchor.y - sourceAnchor.y,
        };
    }

    onJustTeleported() {
        super.onJustTeleported();
        const sideToMove = getTargetSign(this.sourceTeleportSide, this.sourceTeleport.entryX, this.targetTeleport.entryX);
        this.entity.reversed = Math.sign(sideToMove) !== Math.sign(this.sourceTeleportSide);
    }
}