/*
 * @Author: RyanJiang
 * @Date: 2021-11-16 11:04:52
 * @LastEditTime: 2023-06-14 09:40:16
 * @LastEditors: RyanJiang
 * @Description:
 * @FilePath: /LandCameraDemo/assets/scripts/ui/LandSpaceContainler.ts
 */

/**
 * 地图容器接口
 */

import { ILandSpaceContainler, LandSpace } from './LandSpace';

const { ccclass, property, inspector, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Canvas)
@inspector('packages://autoproperty/inspector.js')
export class LandSpaceContainler extends cc.Component implements ILandSpaceContainler {
    originNode: cc.Node;
    @property(cc.Prefab)
    landSpacePrefab: cc.Prefab = null;
    /**
     * 地图容器用来处理地图拖动缩放触摸事件的节点
     */
    @property(cc.Node)
    touchLayer: cc.Node = null;
    /**
     * 摄像机监听触摸事件
     */
    @property({ displayName: '摄像机监听触摸事件' })
    cameraListenTouch: boolean = true;
    /**
     * 地图容器需要沾满整个屏幕，需含有canvas组件
     */
    canvas: cc.Canvas;

    landSpace: LandSpace = null;
    onLoad() {
        this.canvas = this.getComponent(cc.Canvas);
        if (this.landSpacePrefab) {
            this.landSpace = cc.instantiate(this.landSpacePrefab).getComponent(LandSpace);
            this.landSpace.node.parent = this.node;
            this.landSpace.container = this;
        }
    }
    onDestroy() {}
}
