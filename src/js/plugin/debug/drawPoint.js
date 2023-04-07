import * as me from 'melonjs';

export const drawCrossPoint = (renderer, x, y) => {
    renderer.stroke(new me.Rect(x - 1, y - 20, 2, 40));
    renderer.stroke(new me.Rect(x - 20, y - 1, 40, 2));
};