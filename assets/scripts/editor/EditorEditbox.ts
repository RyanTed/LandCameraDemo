/*
 * @Author: RyanJiang
 * @Date: 2021-08-23 10:54:59
 * @LastEditTime: 2023-06-14 09:41:27
 * @LastEditors: RyanJiang
 * @Description: 编辑器输入控件
 * @FilePath: /LandCameraDemo/assets/scripts/editor/EditorEditbox.ts
 */

import { EditboxEvent } from '../framework/utils/CocosHelper';

const { ccclass, property, inspector } = cc._decorator;
@ccclass
@inspector('packages://autoproperty/inspector.js')
export class EditorEditbox extends cc.Component {
    @property(cc.Label)
    title: cc.Label = null;
    @property(cc.EditBox)
    editbox: cc.EditBox = null;
    cb: (v: string) => void;
    onLoad() {
        this.editbox.node.on(EditboxEvent.text_changed, this.callback, this);
    }
    callback() {
        if (this.cb) {
            this.cb(this.editbox.string);
        }
    }
}
