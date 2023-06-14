/*
 * @Author: RyanJiang
 * @Date: 2023-05-24 19:50:59
 * @LastEditTime: 2023-06-14 09:39:40
 * @LastEditors: RyanJiang
 * @Description: Cocos 一些方法的封装，常量、接口的定义
 * @FilePath: /LandCameraDemo/assets/scripts/framework/utils/CocosHelper.ts
 */
export class GameObject {
    constructor(node: cc.Node, script: cc.Component, name: string = 'gameobject') {
        this.node = node;
        this.script = script;
        this.name = name;
    }

    public name: string = '';
    public node: cc.Node = null;
    public script: cc.Component = null;
}

const MoveEpsilon: number = 3;

export class CocosHelper {
    constructor() {}

    public static Epsilon: number = 0.1;

    public static async createSpriteAsync(resourcePath: string): Promise<cc.Node> {
        return new Promise((resolve, reject) => {
            cc.loader.loadRes(
                resourcePath,
                cc.SpriteFrame,
                (error: any, spriteFrame: cc.SpriteFrame) => {
                    if (error) {
                        console.error(`Load SpriteFrame fail ${resourcePath}`, error);
                        reject(error);
                        return;
                    }
                    let node: cc.Node = new cc.Node('NewSprite');
                    node.addComponent(cc.Sprite).spriteFrame = spriteFrame;
                    resolve(node);
                }
            );
        });
    }

    public static createSpriteBySpriteFrame(spriteFrame: cc.SpriteFrame): cc.Node {
        let node: cc.Node = new cc.Node('NewSprite');
        node.addComponent(cc.Sprite).spriteFrame = spriteFrame;
        return node;
    }

    public static createVec2(x: number, y: number): cc.Vec2 {
        return new cc.Vec2(x, y);
    }

    public static createSize(width: number, height: number): cc.Size {
        return new cc.Size(width, height);
    }

    public static enableButton(button: cc.Button): void {
        button.interactable = true;
        // button.target.color = cc.color(255, 255, 255);
    }

    public static disableButton(button: cc.Button): void {
        button.interactable = false;
        // button.target.color = cc.color(200, 200, 200);
    }

    public static addTouchListener(node: cc.Node, handler: Function): void {
        node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event) => {
            handler(event);
        });
        node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event) => {
            handler(event);
        });
        node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event) => {
            handler(event);
        });
        node.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event) => {
            handler(event);
        });
    }

    public static addTapListener(node: cc.Node, handler: Function): void {
        let isCancel: boolean = false;
        let tapFilter: Function = (event: any) => {
            if (event.type === 'touchstart') {
                isCancel = false;
            } else if (event.type === 'touchmove') {
                let delta: cc.Vec2 = event.getTouches()[0].getDelta();
                if (Math.abs(delta.x) >= MoveEpsilon || Math.abs(delta.y) >= MoveEpsilon) {
                    isCancel = true;
                }
            } else if (event.type === 'touchend') {
                if (isCancel) {
                    return;
                }
                handler();
            } else if (event.type === 'touchcancel') {
            } else {
            }
        };

        node.on(cc.Node.EventType.TOUCH_START, tapFilter);
        node.on(cc.Node.EventType.TOUCH_MOVE, tapFilter);
        node.on(cc.Node.EventType.TOUCH_END, tapFilter);
        node.on(cc.Node.EventType.TOUCH_CANCEL, tapFilter);
    }

    public static isVecEqual(lhs: cc.Vec2, rhs: cc.Vec2): boolean {
        return Math.abs(lhs.x - rhs.x) <= MoveEpsilon && Math.abs(lhs.y - rhs.y) <= MoveEpsilon;
    }

    public static isEqualZero(value: number): boolean {
        return Math.abs(value - 0.0) >= this.Epsilon ? false : true;
    }

    public static getNodeWorldPosition(node: cc.Node): cc.Vec2 {
        if (!node.parent) return this.createVec2(0, 0);
        return node.parent.convertToWorldSpaceAR(node.getPosition());
    }

    /** 获取把 node1移动到 node2位置后的坐标 */
    public static convertNodeSpaceAR(node1: cc.Node, node2: cc.Node) {
        return node1.parent.convertToNodeSpaceAR(
            node2.parent.convertToWorldSpaceAR(node2.position)
        );
    }

    /**
     * 更新Widget对齐
     * @param node
     */
    public static updateAlignment(node: cc.Node) {
        if (!node) return;
        let widget: cc.Widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.updateAlignment();
        }
    }
}

export enum EditboxEvent {
    editing_return = 'editing-return',
    text_changed = 'text-changed',
    editing_did_ended = 'editing-did-ended',
    editing_did_began = 'editing-did-began',
}

export enum ButtonEvent {
    click = 'click',
}

export enum ToggleEvent {
    toggle = 'toggle',
    click = 'click',
}

export enum ToggleContainerEvent {
    click = 'click',
}

export enum VideoEvent {
    ready_to_play = 'ready-to-play',
    meta_loaded = 'meta-loaded',
    clicked = 'clicked',
    playing = 'playing',
    paused = 'paused',
    stopped = 'stopped',
    completed = 'completed',
}

export enum SliderEvent {
    slide = 'slide',
}

export interface CCBundleLoadProgressCallback {
    (finish: number, total: number, item: cc.AssetManager.RequestItem): void;
}

// 龙骨动画修改插槽颜色
// export function dragonBonesChangeSlotColor(slot:dragonBones.CocosSlot, color: cc.Color) {
// 	slot._color = color;
// }
