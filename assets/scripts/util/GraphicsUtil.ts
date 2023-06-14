/*
 * @Author: RyanJiang
 * @Date: 2021-09-02 17:48:44
 * @LastEditTime: 2023-06-14 09:42:11
 * @LastEditors: RyanJiang
 * @Description: cc.Graphics 工具
 * @FilePath: /LandCameraDemo/assets/scripts/util/GraphicsUtil.ts
 */

export function drawLine({
    points,
    strokeColor,
    gra,
    lineWidth = 2,
}: {
    points: cc.Vec2[];
    strokeColor: cc.Color;
    gra: cc.Graphics;
    lineWidth?: number;
}) {
    gra.lineWidth = lineWidth;
    gra.strokeColor = strokeColor;
    gra.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index++) {
        const element = points[index];
        gra.lineTo(element.x, element.y);
    }
    gra.stroke();
}
export function drawRect({
    rect,
    fillColor,
    strokeColor,
    gra,
    lineWidth = 2,
}: {
    rect: cc.Rect;
    fillColor: cc.Color;
    strokeColor: cc.Color;
    gra: cc.Graphics;
    lineWidth?: number;
}) {
    gra.lineWidth = lineWidth;
    gra.fillColor = fillColor;
    gra.strokeColor = strokeColor;
    gra.rect(rect.x, rect.y, rect.width, rect.height);
    gra.fill();
    gra.stroke();
}
export function drawPolygon({
    polygon,
    gra,
    fillColor,
    strokeColor,
    lineWidth = 2,
}: {
    gra: cc.Graphics;
    polygon: cc.Vec2[][];
    fillColor: cc.Color;
    strokeColor: cc.Color;
    lineWidth?: number;
}) {
    gra.lineWidth = lineWidth;
    gra.fillColor = fillColor;
    gra.strokeColor = strokeColor;
    for (const shape of polygon) {
        if (shape.length > 0) {
            gra.moveTo(shape[0].x, shape[0].y);
            for (let index = 1; index < shape.length; index++) {
                const p = shape[index];
                gra.lineTo(p.x, p.y);
            }
            gra.close();
        }
    }
    gra.fill();
    gra.stroke();
}

// TS
export function drawLineOfDashes({
    g,
    from,
    to,
    stroke = true,
    length = 8,
    interval = 4,
    fillColor,
    strokeColor,
    lineWidth = 2,
}: {
    g: cc.Graphics;
    from: cc.Vec2;
    to: cc.Vec2;
    stroke?: boolean;
    length?: number;
    interval?: number;
    fillColor: cc.Color;
    strokeColor: cc.Color;
    lineWidth?: number;
}): void {
    if (g) {
        g.lineWidth = lineWidth;
        g.fillColor = fillColor;
        g.strokeColor = strokeColor;
        let off = to.sub(from);
        let dir = off.normalize();
        let dis = off.mag();
        let delta = dir.mul(length + interval);
        let delta1 = dir.mul(length);
        let n = Math.floor(dis / (length + interval));
        for (let i = 0; i < n; ++i) {
            let start = from.add(delta.mul(i));
            g.moveTo(start.x, start.y);
            let end = start.add(delta1);
            g.lineTo(end.x, end.y);
        }
        let start1 = from.add(delta.mul(n));
        g.moveTo(start1.x, start1.y);
        if (length < dis - (length + interval) * n) {
            let end = start1.add(delta1);
            g.lineTo(end.x, end.y);
        } else {
            g.lineTo(to.x, to.y);
        }
        if (stroke) g.stroke();
    }
}
