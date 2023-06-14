/*
 * @Author: RyanJiang
 * @Date: 2021-07-27 10:46:12
 * @LastEditTime: 2023-05-24 19:56:14
 * @LastEditors: RyanJiang
 * @Description:
 * @FilePath: /LandCameraDemo/assets/scripts/scene/BuildingEditorScene.ts
 */

import { ILandSpaceContainler, LandSpace } from '../ui/LandSpace';
import { LandSpaceContainler } from '../ui/LandSpaceContainler';
import { EditorArrow } from '../editor/EditorArrow';
import { LandCamera } from '../ui/LandCamera';

const { ccclass, property, inspector, requireComponent } = cc._decorator;

enum EditMod {
    move,
    drawFloor,
    drawWall,
    deleteFloor,
    select,
    measure,
    gate,
}

@ccclass
@requireComponent(LandSpaceContainler)
@inspector('packages://autoproperty/inspector.js')
export class BuildingEditorScene extends cc.Component implements ILandSpaceContainler {
    originNode: cc.Node;
    cameraListenTouch: boolean = true;
    @property(LandSpace)
    landSpace: LandSpace = null;
    @property(cc.Node)
    touchLayer: cc.Node = null;
    @property(cc.Node)
    land: cc.Node = null;
    @property(cc.Node)
    uiLayer: cc.Node = null;
    @property(cc.Label)
    labelFloor: cc.Label = null;
    @property(cc.Button)
    arrowdown: cc.Button = null;
    @property(cc.Button)
    arrowup: cc.Button = null;
    @property(EditorArrow)
    startArrow: EditorArrow = null;
    @property(EditorArrow)
    EditorArrow: EditorArrow = null;
    @property(cc.Label)
    measureLabel: cc.Label = null;
    @property(cc.Graphics)
    mapDraw: cc.Graphics = null;

    canvas: cc.Canvas;

    mod: EditMod = EditMod.move;
    public onLoad(): void {
        this.canvas = this.getComponent(cc.Canvas);
        this.landSpace.container = this;
        this.landSpace.land = this.land;
        this.originNode = this.land;
        this.mapDraw.node.setSiblingIndex(1);
        this.startArrow.node.active = false;
    }
    onDestroy() {}
    start() {
        this.enableTouch();
    }

    private enableTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchEventCallback, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchEventCallback, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEventCallback, this);
    }
    disableTouch() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchEventCallback, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchEventCallback, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEventCallback, this);
    }

    private _lastIp: cc.Vec2;
    touchEventCallback(event: cc.Event.EventTouch) {
        switch (event.getType()) {
            case cc.Node.EventType.TOUCH_START:
                LandCamera.instance.onTouchStart(event);
                break;
            case cc.Node.EventType.TOUCH_MOVE:
                LandCamera.instance.onTouchMove(event);
                break;
            case cc.Node.EventType.TOUCH_END:
                LandCamera.instance.onTouchEnd(event);
                break;
            case cc.Node.EventType.TOUCH_CANCEL:
                LandCamera.instance.onTouchEnd(event);
                break;
            default:
                break;
        }
    }

    drawLine(points: cc.Vec2[], strokeColor: cc.Color, gra: cc.Graphics) {
        gra.lineWidth = 2;
        gra.strokeColor = strokeColor;
        gra.moveTo(points[0].x, points[0].y);
        for (let index = 1; index < points.length; index++) {
            const element = points[index];
            gra.lineTo(element.x, element.y);
        }
        gra.stroke();
    }
    drawRect(rect: cc.Rect, fillColor: cc.Color, strokeColor: cc.Color, gra: cc.Graphics) {
        gra.lineWidth = 10;
        gra.fillColor = fillColor;
        gra.strokeColor = strokeColor;
        gra.rect(rect.x, rect.y, rect.width, rect.height);
        gra.fill();
        gra.stroke();
    }
    drawPolygon(
        polygon: cc.Vec2[][],
        fillColor: cc.Color,
        strokeColor: cc.Color,
        gra: cc.Graphics
    ) {
        gra.lineWidth = 10;
        gra.fillColor = fillColor;
        gra.strokeColor = strokeColor;
        for (const shape of polygon) {
            gra.moveTo(shape[0].x, shape[0].y);
            for (let index = 1; index < shape.length; index++) {
                const p = shape[index];
                gra.lineTo(p.x, p.y);
            }
            gra.close();
        }
        gra.fill();
        gra.stroke();
    }
}
