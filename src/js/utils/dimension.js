import { Dimension } from "../constants/dimension";
import { setLayerOpacity } from "./level";

export const changeDimension = (player, targetDimension) => {
    const allDimensions = Object.keys(Dimension);
    const otherDimensions = allDimensions.filter(dimension => dimension !== targetDimension);
    
    player.dimension = targetDimension;

    setLayerOpacity(1, targetDimension);
    otherDimensions.forEach(dimension => {
        setLayerOpacity(0.2, dimension);
    });
}