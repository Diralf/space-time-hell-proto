import * as me from 'melonjs';
import { NoCollisionHandler } from "./no.collision-handler";
import { EnemyCollisionHandler } from "./enemy.collision-handler";
import { PlatformCollisionHandler } from "./platform.collision-handler";
import { SlopeCollisionHandler } from "./slope.collision-handler";
import { WorldShapeCollisionHandler } from "./world-shape.collision-handler";
import { Dimension } from '../constants/dimension';
import { hasCollisionType } from '../utils/collision-type';

export const getCollisionHandler = (response, other) => {
    const type = other.body.collisionType;
    if (hasCollisionType(type, me.collision.types.WORLD_SHAPE)) {
        switch (other.type) {
            case 'shadow platform': 
                return new PlatformCollisionHandler(Dimension.SHADOW);
            case 'platform': 
                return new PlatformCollisionHandler(Dimension.REAL);
            case 'slope': 
                return new SlopeCollisionHandler();
            default: 
                return new WorldShapeCollisionHandler();   
        }
    } else if (hasCollisionType(type, me.collision.types.ENEMY_OBJECT)) {
        return new EnemyCollisionHandler();
    }
    return new NoCollisionHandler();
}