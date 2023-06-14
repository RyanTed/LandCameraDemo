/*
 * @Author: RyanJiang
 * @Date: 2021-08-10 18:42:22
 * @LastEditTime: 2023-06-14 09:41:04
 * @LastEditors: RyanJiang
 * @Description: 编辑器单选框
 * @FilePath: /LandCameraDemo/assets/scripts/editor/EditorToggleContainer.ts
 */


import { ButtonEvent, ToggleEvent } from '../framework/utils/CocosHelper';
import { EditorTgogle } from './EditorTgogle';

const { ccclass, property, inspector, requireComponent } = cc._decorator;

export enum EditorToggleContainerStyle {
    static,
    pulldown
}

export class EditorToggleContainerData {
    callback: (type: number) => void;
    title: string;
    content: Map<number, string>;
    selectIndex: number = 0;
    style: EditorToggleContainerStyle = EditorToggleContainerStyle.pulldown;
}

@ccclass
@inspector('packages://autoproperty/inspector.js')
export class EditorToggleContainer extends cc.Component {
    @property(cc.Prefab)
    prefabToggle: cc.Prefab = null;
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    content: cc.Node = null;
    @property(cc.Button)
    arrowdown: cc.Button = null;
    @property(cc.Button)
    arrowup: cc.Button = null;

    @property({ type: cc.Enum(EditorToggleContainerStyle) })
    private _style: EditorToggleContainerStyle =
        EditorToggleContainerStyle.pulldown;
    @property({ type: cc.Enum(EditorToggleContainerStyle) })
    public get style(): EditorToggleContainerStyle {
        return this._style;
    }
    public set style(value: EditorToggleContainerStyle) {
        this._style = value;
        this.arrowdown.node.active =
            this._style == EditorToggleContainerStyle.pulldown;
        this.arrowup.node.active =
            this._style == EditorToggleContainerStyle.pulldown;
        if (EditorToggleContainerStyle.static == this._style) {
            this.showContent();
        } else {
            this.hideContent();
        }
    }

    toggle = new Map<number, EditorTgogle>();
    data: EditorToggleContainerData;
    onLoad() {
        this.arrowdown.node.on(ButtonEvent.click, this.showContent, this);
        this.arrowup.node.on(ButtonEvent.click, this.hideContent, this);
    }
    start() {
        if (this.style == EditorToggleContainerStyle.pulldown) {
            this.hideContent();
        }
    }
    showContent() {
        for (const node of this.content.children) {
            node.active = true;
        }
        if (this.style == EditorToggleContainerStyle.pulldown) {
            this.arrowdown.node.active = false;
            this.arrowup.node.active = true;
        }
    }
    hideContent() {
        for (const node of this.content.children) {
            node.active = node.getComponent(cc.Toggle)?.isChecked;
        }
        if (this.style == EditorToggleContainerStyle.pulldown) {
            this.arrowdown.node.active = true;
            this.arrowup.node.active = false;
        }
    }
    setData(data: EditorToggleContainerData) {
        this.data = data;
        this.label.string = data.title;
        this.content.destroyAllChildren();
        for (const [index, title] of data.content) {
            const node = cc.instantiate(this.prefabToggle);
            node.parent = this.content;
            const toggle = node.getComponent(EditorTgogle);
            this.toggle.set(index, toggle);
            toggle.label.string = title;
            toggle.toggle.node.on(
                ToggleEvent.toggle,
                () => {
                    data.callback(index);
                },
                toggle.toggle
            );
        }
        this.toggle.get(data.selectIndex).toggle.check();
        this.style = data.style;
    }
}
