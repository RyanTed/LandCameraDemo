/*
 * @Author: RyanJiang
 * @Date: 2021-08-23 16:32:52
 * @LastEditTime: 2023-06-14 09:41:38
 * @LastEditors: RyanJiang
 * @Description: 编辑器按钮
 * @FilePath: /LandCameraDemo/assets/scripts/editor/EditorButton.ts
 */

import { ButtonEvent } from '../framework/utils/CocosHelper';

const { ccclass, property, inspector } = cc._decorator;

export enum EditorButtonColor {
    green,
    red,
}

@ccclass
@inspector('packages://autoproperty/inspector.js')
export class EditorButton extends cc.Component {
    @property([cc.SpriteFrame])
    frame: cc.SpriteFrame[] = [];
    @property(cc.Label)
    label: cc.Label = null;

    @property({ type: cc.Enum(EditorButtonColor) })
    private _color: EditorButtonColor = EditorButtonColor.green;
    public get color(): EditorButtonColor {
        return this._color;
    }
    @property({ type: cc.Enum(EditorButtonColor) })
    public set color(value: EditorButtonColor) {
        this._color = value;
        const sprite = this.getComponent(cc.Sprite);
        if (!!this.frame[this._color] && !!sprite) {
            sprite.spriteFrame = this.frame[this._color];
        }
    }
    button: cc.Button;
    buttonCallback: (btn: EditorButton) => void;
    onLoad() {
        this.button = this.getComponent(cc.Button);
    }
    start() {
        this.button.node.on(ButtonEvent.click, () => {
            this.buttonCallback?.(this);
        });
    }
}
