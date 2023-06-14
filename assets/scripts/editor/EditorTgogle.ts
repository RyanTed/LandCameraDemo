/*
 * @Author: RyanJiang
 * @Date: 2021-08-10 18:30:52
 * @LastEditTime: 2023-06-14 09:41:20
 * @LastEditors: RyanJiang
 * @Description: UI开关组件
 * @FilePath: /LandCameraDemo/assets/scripts/editor/EditorTgogle.ts
 */

const { ccclass, property, inspector, requireComponent } = cc._decorator;
@ccclass
@inspector('packages://autoproperty/inspector.js')
@requireComponent(cc.Toggle)
export class EditorTgogle extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;
    toggle: cc.Toggle;
    onLoad() {
        this.toggle = this.getComponent(cc.Toggle);
    }
}
