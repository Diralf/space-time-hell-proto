import * as me from 'melonjs';
import { DefaultCollisionHandler } from "./default.collision-handler";
import { EnemyCollisionHandler } from "./enemy.collision-handler";
import { PlatformCollisionHandler } from "./platform.collision-handler";
import { SlopeCollisionHandler } from "./slope.collision-handler";
import { TeleportCollisionHandler } from "./teleport.collision-handler";
import { WorldShapeCollisionHandler } from "./world-shape.collision-handler";
import { Dimension } from '../constants/dimension';

export const getCollisionHandler = (response, other) => {
    switch (other.body.collisionType) {
        case me.collision.types.WORLD_SHAPE:
            switch (other.type) {
                case 'shadow platform': 
                    return new PlatformCollisionHandler(Dimension.SHADOW);
                case 'platform': 
                    return new PlatformCollisionHandler(Dimension.REAL);
                case 'slope': 
                    return new SlopeCollisionHandler();
                case 'teleport': 
                    return new TeleportCollisionHandler();
                default: 
                    return new WorldShapeCollisionHandler();   
            }
        case me.collision.types.ENEMY_OBJECT:
            return new EnemyCollisionHandler();
        default:
            return new DefaultCollisionHandler();
    }
}