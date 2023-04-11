import * as me from 'melonjs';

export const getAnchorCoords = (entity) => {
    const x = entity.pos.x + entity.anchorPoint.x * entity.body.getBounds().width;
    const y = entity.pos.y + entity.anchorPoint.y * entity.body.getBounds().height;
    return { x, y };
}

export const isEntityOverlaps = (entityA, entityB) => {
    const bounds = entityB.body.getBounds().clone();
    bounds.translate(entityB.pos.x - entityA.pos.x, entityB.pos.y - entityA.pos.y);
    return bounds.overlaps(entityA.body.getBounds());
}

export const getTargetSign = (side, sourceEntry, targetEntry) => {
    const sideSign = Math.sign(side);
    const sourceSign = Math.sign(sourceEntry);
    const targetSign = Math.sign(targetEntry);
    return targetSign * (sourceSign * sideSign);
}

export const getMask = (entity, sprite, teleport) => {
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