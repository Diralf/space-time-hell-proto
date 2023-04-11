import { BaseTeleportHandler } from "./base.teleport-handler";
import { getAnchorCoords, getMask, getTargetSign, isEntityOverlaps } from "./teleport-entity.utils";

export class ForwardTeleportHandler extends BaseTeleportHandler {
    getTargetPosition() {
        const sourceAnchor = getAnchorCoords(this.sourceTeleport);
        const targetAnchor = getAnchorCoords(this.targetTeleport);
        return {
            x: this.entity.pos.x + targetAnchor.x - sourceAnchor.x,
            y: this.entity.pos.y + targetAnchor.y - sourceAnchor.y,
        };
    }
}