/*
 * @Author: RyanJiang
 * @Date: 2020-11-09 20:31:21
 * @LastEditTime: 2023-06-14 09:40:08
 * @LastEditors: RyanJiang
 * @Description:
 * @FilePath: /LandCameraDemo/assets/scripts/ui/LandSpace.ts
 */



import { LandCamera } from './LandCamera';

const { ccclass, property, inspector } = cc._decorator;

export interface ILandSpaceContainler extends cc.Component {
    touchLayer: cc.Node;
    cameraListenTouch: boolean;
    /**
     * 地图容器需要沾满整个屏幕，需含有canvas组件
     */
    canvas: cc.Canvas;

    landSpace: LandSpace;
    /**地图原点 */
    originNode: cc.Node;
}

@ccclass
@inspector('packages://autoproperty/inspector.js')
export class LandSpace extends cc.Component {
    private _land: cc.Node = null;
    private _lateInit: boolean;
    @property(cc.Node)
    public get land(): cc.Node {
        return this._land;
    }
    public set land(value: cc.Node) {
        this.updateCanvas();
        if (value?.isValid) {
            this._land = value;
            this._land.setPosition(cc.Vec2.ZERO);
            this._land.parent = this.node;
            this.node.setContentSize(this.land.getContentSize());
            this.LandCamera?.node.setPosition(cc.Vec2.ZERO);
            this.LandCamera?.zoom(this.LandCamera.defaultZoom);
            this.LandCamera?.refreshLand();
        }
    }
    private _LandCamera: LandCamera = null;
    public get LandCamera(): LandCamera {
        if (!cc.isValid(this._LandCamera)) {
            this._LandCamera = this.getComponentInChildren(LandCamera);
        }
        return this._LandCamera;
    }

    container: ILandSpaceContainler = null;

    static activeInstance: LandSpace;
    updateCanvas() {
        if (this.container?.canvas && !!this.LandCamera) {
            this.LandCamera._canvas = this.container.canvas.node;
            if (this.container?.touchLayer) {
                this.LandCamera.touchLayer = this.container.touchLayer;
            }
        } else {
            this._lateInit = true;
        }
    }

    onLoad() {}
    onShowYard() {
        this.node.active = true;
    }
    start() {
        if (this._lateInit) {
            this.updateCanvas();
            this.LandCamera?.refreshLand();
        }
    }
    onEnable() {
        if (LandSpace.activeInstance?.isValid && LandSpace.activeInstance != this) {
            LandSpace.activeInstance.node.active = false;
        }
        LandSpace.activeInstance = this;
    }
    onDisable() {
        // LandSpace.activeInstance = null;
    }
    // update (dt) {}
    onDestroy() {}
}
