import { BaseTeleportHandler } from "./base.teleport-handler";
import { getAnchorCoords, getMask, getTargetSign, isEntityOverlaps } from "./teleport-entity.utils";

export class ReverseTeleportHandler extends BaseTeleportHandler {
    onTeleportExit() {
        super.onTeleportExit();
        this.entity.reversed = false;
    }

    onInsideTeleport() {
        if (this.targetTeleport && this.sourceTeleport) {
            const ownerAnchor = getAnchorCoords(this.entity);
            const sourceAnchor = getAnchorCoords(this.sourceTeleport);
            const xDiff = sourceAnchor.x - ownerAnchor.x;

            if (!this.isTeleportBlocked && !this.entity.reversed && Math.sign(this.sourceTeleportSide) !== Math.sign(xDiff)) {
                const sideToMove = getTargetSign(this.sourceTeleportSide, this.sourceTeleport.entryX, this.targetTeleport.entryX);
                const anotherAnchor = getAnchorCoords(this.targetTeleport);
                const isReversedDirection = Math.sign(sideToMove) !== Math.sign(this.sourceTeleportSide);
                const reversePositionX = isReversedDirection ? xDiff * 2 : 0;
                const newPos = {
                    x: this.entity.pos.x + anotherAnchor.x - sourceAnchor.x + reversePositionX,
                    y: this.entity.pos.y + anotherAnchor.y - sourceAnchor.y,
                }
                this.entity.pos.x = newPos.x;
                this.entity.pos.y = newPos.y;
                this.entity.reversed = Math.sign(sideToMove) !== Math.sign(this.sourceTeleportSide);
                this.isTeleportBlocked = true;
                this.sourceTeleportSide = -sideToMove
                this.entity.renderable.mask = undefined;
            }
        }
    }
}