import * as me from 'melonjs';

export const setLayerOpacity = (opacity, layerClass) => {
    const level = me.level.getCurrentLevel();
    const shadowLayers = level.getLayers().filter((layer) => layer.class === layerClass);
    shadowLayers.forEach((layer) => layer.setOpacity(opacity));
};