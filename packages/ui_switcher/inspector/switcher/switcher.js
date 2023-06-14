let fs = require("fire-fs");
let path = require('fire-path');
let CCTransform = cc.Class({
    properties: {
        nodeUuid: {
            default: "",
        },
        guid: {
            default: "",
        },
        stateUuid: {
            default: "",
        },
        active: {
            default: true,
        },
        position: {
            default: new cc.Vec2(0, 0),
        },
        rotation: {
            default: 0,
        },
        scale: {
            default: new cc.Vec2(0, 0),
        },
        anchor: {
            default: new cc.Vec2(0, 0),
        },
        size: {
            default: new cc.Vec2(0, 0),
        },
        color: {
            default: new cc.Vec3(255, 255, 255),
        },
        opacity: {
            default: 255,
        },
    },
});

let SwitchState = cc.Class({
    properties: {
        uuid: {
            default: "",
        },
        name: {
            default: ""
        }
    },
});

let TargetNode = cc.Class({
    properties: {
        guid: {
            default: "",
        },
        uuid: {
            default: "",
        }
    },
});


Vue.component('switcher-inspector', {
    template: fs.readFileSync(Editor.url('packages://ui_switcher/inspector/switcher/switcher.html'), 'utf8'),

    props: {
        target: {
            twoWay: true,
            type: Object,
        }
    },
    created() {
        this.states = []
        for (let i = 0; i < this.target.switchStates.value.length; i++) {
            let state = new SwitchState()
            state.uuid = this.target.switchStates.value[i].value.uuid.value
            state.name = this.target.switchStates.value[i].value.name.value
            this.states.push(state)
        }
        this.targetNodes = []
        for (let i = 0; i < this.target.targetNodes.value.length; i++) {
            let node = new TargetNode()
            node.uuid = this.target.targetNodes.value[i].value.node.value.uuid
            node.guid = this.target.targetNodes.value[i].value.guid.value
            this.targetNodes.push(node)
        }
        this.curState = this.target.curState.value
        this.transforms = []
    },
    data() {
        return {
            states: [cc.String],
            targetNodes: [cc.TargetNode],
            curState: cc.Integer,
            transforms: [CCTransform],
            isRouterAlive: true
        }
    },
    methods: {
        reload() {//刷新html页面
            this.isRouterAlive = false
            this.$nextTick(() => (this.isRouterAlive = true))
        },
        onStateNameChange() {//修改state名字
            let self = this
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: self.target.uuid.value,
                path: "onSwitchStatesChange",
                type: "Boolean",
                value: self.states,
            });
        },
        onCreateStateBtnClick() {//创建state
            let state = new SwitchState()
            state.uuid = this._guid()
            state.name = ""
            this.states.push(state)

            let self = this
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: self.target.uuid.value,
                path: "onAddSwitchState",
                type: "Boolean",
                value: state.uuid,
            });

        },
        onRemoveStateBtnClick(index) {//删除某个state
            let state = this.states[index]
            this.states.splice(index, 1);
            let self = this
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: self.target.uuid.value,
                path: "onRemoveSwitchState",
                type: "Boolean",
                value: state.uuid,
            });
        },
        onStateSaveBtnClick(index) {//保存某个state
            this._saveAppointStateTransform(index)
        },
        onChooseState(index) {
            this.curState = index
            let self = this
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: self.target.uuid.value,
                path: "onCurStateChange",
                type: "Integer",
                value: index,
            });
            this.reload()//刷新复选框的显示
        },
        onCreateTargetBtnClick() {
            let self = this
            let node = new TargetNode()
            node.uuid = ""
            node.guid = this._guid()
            this.targetNodes.push(node)
            let uuids = []
            uuids.push(node.uuid)
            uuids.push(node.guid)
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: self.target.uuid.value,
                path: "onAddTarget",
                type: "Boolean",
                value: uuids,
            });
        },
        debug() {
            Editor.log(this.targetNodes.length)
        },
        onChangeTargetBtnClick(event, index) {
            let guid = this.targetNodes[index].guid
            //let uuid = this.targetNodes[index].uuid
            let self = this
            if (event.detail.value == "" && event.currentTarget._nodeID) {//删除
                Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                    id: self.target.uuid.value,
                    path: "onRemoveTarget",
                    type: "Boolean",
                    value: guid//event.currentTarget._nodeID,
                });
                this.targetNodes.splice(index, 1);
            } else {
                if (!event.currentTarget._nodeID && event.detail.value && event.detail.value != "") {//新增
                    let uuids = []
                    uuids.push(event.detail.value)
                    uuids.push(guid)
                    this.targetNodes[index].uuid = event.detail.value
                    Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                        id: self.target.uuid.value,
                        path: "onChangeTarget",
                        type: "Boolean",
                        value: uuids,
                    });
                }
                if (event.currentTarget._nodeID && event.detail.value && event.detail.value != event.currentTarget._nodeID) {//修改
                    let ids = []
                    //ids.push(event.currentTarget._nodeID)
                    ids.push(event.detail.value)
                    ids.push(guid)
                    this.targetNodes[index].uuid = event.detail.value
                    Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                        id: self.target.uuid.value,
                        path: "onChangeTarget",
                        type: "Boolean",
                        value: ids,
                    });
                }
            }
            this.reload()
        },
        onRemoveTargetBtnClick(index) {
            let self = this
            let uuid = this.targetNodes[index].uuid
            let guid = this.targetNodes[index].guid
            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                id: self.target.uuid.value,
                path: "onRemoveTarget",
                type: "Boolean",
                value: guid,
            });
            this.targetNodes.splice(index, 1);
            this.reload()
        },
        _saveAppointStateTransform(index) {
            let self = this
            let state = this.states[index]
            let ccTrans = []
            let length = this.targetNodes.length
            for (let i = 0; i < length; i++) {
                let uuid = this.targetNodes[i].uuid
                let guid = this.targetNodes[i].guid
                let type = typeof (uuid)
                if (type == "object" || type == "") {
                    continue
                }
                Editor.Ipc.sendToPanel('scene', 'scene:query-node', uuid, (error, dump) => {
                    if (error) {
                        return Editor.error(error)
                    } else {
                        let obj = JSON.parse(dump)
                        let trans = new CCTransform()
                        trans.nodeUuid = uuid
                        trans.guid = guid
                        trans.stateUuid = state.uuid
                        trans.active = obj.value.active.value
                        trans.position = new cc.Vec2(obj.value.position.value.x, obj.value.position.value.y)
                        trans.rotation = obj.value.angle.value
                        trans.color = new cc.Vec3(obj.value.color.value.r, obj.value.color.value.g, obj.value.color.value.b)
                        trans.opacity = obj.value.opacity.value
                        trans.scale = new cc.Vec2(obj.value.scale.value.x, obj.value.scale.value.y)
                        trans.size = new cc.Vec2(obj.value.size.value.width, obj.value.size.value.height)
                        trans.anchor = new cc.Vec2(obj.value.anchor.value.x, obj.value.anchor.value.y)
                        ccTrans.push(trans)
                        if (ccTrans.length == length) {
                            Editor.Ipc.sendToPanel('scene', 'scene:set-property', {
                                id: self.target.uuid.value,
                                path: "onTransChange",
                                type: "[cc.CCTransform]",
                                value: ccTrans,
                            });
                        }
                    }
                });
            }
        },
        _guid() {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4";
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
            s[8] = s[13] = s[18] = s[23] = "-";
            var uuid = s.join("");
            return uuid;
        }
    }
});
