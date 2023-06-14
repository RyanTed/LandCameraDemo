/*
 * @Author: RyanJiang
 * @Date: 2021-08-23 15:21:01
 * @LastEditTime: 2023-06-14 09:41:44
 * @LastEditors: RyanJiang
 * @Description:
 * @FilePath: /LandCameraDemo/assets/scripts/editor/EditorArrow.ts
 */

const { ccclass, property, inspector } = cc._decorator;
@ccclass
@inspector('packages://autoproperty/inspector.js')
export class EditorArrow extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;
}
