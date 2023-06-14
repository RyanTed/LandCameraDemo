let CCTransform = cc.Class({
    name: 'CCTransform',
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
    name: 'SwitchState',
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
    name: 'TargetNode',
    properties: {
        guid: {
            default: "",
        },
        node: {
            default: null,
            type: cc.Node
        }
    },
});

module.exports.default = cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        inspector: "packages://ui_switcher/inspector/switcher/switcher.js",
        playOnFocus: true,
        executeInEditMode: true, // 允许当前组件在编辑器模式下运行。
        menu: 'custom/UISwitcher'
    },
    properties: {
        targetNodes: {
            default: [],
            type: [cc.TargetNode]
        },
        switchStates: {
            default: [],
            type: [cc.SwitchState]
        },
        onSwitchStatesChange: {
            type: cc.Boolean,
            get() {
                return false
            },
            set(value) {
                if (value) {
                    let states = []
                    for (let i = 0; i < value.length; i++) {
                        let item = value[i]
                        let state = new SwitchState()
                        state.uuid = item.uuid
                        state.name = item.name
                        states.push(state)
                    }
                    this.switchStates = states
                }
            }
        },
        onRemoveSwitchState: {
            type: cc.Boolean,
            get() {
                return false
            },
            set(value) {
                if (value) {
                    let states = []
                    for (let i = 0; i < this.switchStates.length; i++) {
                        if (value != this.switchStates[i].uuid) {
                            states.push(this.switchStates[i])
                        }
                    }
                    this.switchStates = states
                    let transforms = []
                    for (let i = 0; i < this.ccTransforms.length; i++) {
                        if (this.ccTransforms[i].stateUuid != value) {
                            transforms.push(this.ccTransforms[i])
                        }
                    }
                    this.ccTransforms = transforms
                } else {
                    cc.error("删除目标值错误")
                }
            }
        },
        onAddSwitchState: {
            type: cc.Boolean,
            get() {
                return false
            },
            set(value) {
                if (value) {
                    let state = new SwitchState()
                    state.uuid = value
                    state.name = ""
                    this.switchStates.push(state)
                    this._removeStateByUuid(value)
                    this._addStateByUuid(value)
                }
            }
        },
        curState: {
            default: 0,
        },
        onCurStateChange: {
            type: cc.Integer,
            get() {
                return this.curState
            },
            set(index) {
                this.curState = index
                this._onCurStateChange(index)
            }
        },
        ccTransforms: {
            default: [],
            type: [cc.CCTransform],
        },
        onTransChange: {
            type: cc.Boolean,
            get() {
                return false
            },
            set(value) {
                if (value) {
                    let transforms = []
                    let stateUuid = value[0].stateUuid
                    for (let i = 0; i < this.ccTransforms.length; i++) {
                        if (this.ccTransforms[i].stateUuid != stateUuid) {
                            transforms.push(this.ccTransforms[i])
                        }
                    }
                    for (let i = 0; i < value.length; i++) {
                        let item = value[i]
                        let trans = new CCTransform()
                        trans.nodeUuid = item.nodeUuid
                        trans.guid = item.guid
                        trans.stateUuid = item.stateUuid
                        trans.active = item.active
                        trans.position = item.position
                        trans.rotation = item.rotation
                        trans.scale = item.scale
                        trans.anchor = item.anchor
                        trans.size = item.size
                        trans.color = item.color
                        trans.opacity = item.opacity
                        transforms.push(trans)
                    }
                    this.ccTransforms = transforms
                }
            }
        },
        onRemoveTarget: {
            type: cc.Boolean,
            get() {
                return false
            },
            set(value) {
                if (value) {
                    let nodes = []
                    for (let i = 0; i < this.targetNodes.length; i++) {
                        if (this.targetNodes[i].guid != value) {
                            nodes.push(this.targetNodes[i])
                        }
                    }
                    this.targetNodes = nodes
                    let transforms = []
                    for (let i = 0; i < this.ccTransforms.length; i++) {
                        if (this.ccTransforms[i].guid != value) {
                            transforms.push(this.ccTransforms[i])
                        }
                    }
                    this.ccTransforms = transforms
                }
            }
        },
        onAddTarget: {
            type: cc.Boolean,
            get() {
                return false
            },
            set(value) {
                if (value) {
                    this._changeTargetByGuid(value[0], value[1])
                } else {
                    cc.error("添加目标值错误")
                }
            }
        },
        onChangeTarget: {
            type: cc.Boolean,
            get() {
                return false
            },
            set(value) {
                if (value) {
                    this._changeTargetByGuid(value[0], value[1])
                } else {
                    cc.error("修改目标值错误")
                }
            }
        }
    },
    changeStateByIndex(index) {
        this.curState = index
        this._onCurStateChange(index)
    },
    changeStateByName(name) {
        for (let i = 0; i < this.switchStates.length; i++) {
            if (name == this.switchStates[i].name) {
                this.changeStateByIndex(i)
                break
            }
        }
    },
    _onStatesChange() {
        let transforms = []
        let states = []
        for (let i = 0; i < this.switchStates.length; i++) {
            states.push(this.switchStates[i].uuid)
        }
        for (let i = 0; i < this.ccTransforms.length; i++) {
            if (states.indexOf(this.ccTransforms[i].stateUuid) >= 0) {
                transforms.push(this.ccTransforms[i])
            } else {
                cc.log(this.ccTransforms[i].stateUuid)
            }
        }
        this.ccTransforms = transforms
    },
    _onCurStateChange(index) {
        let curState = this.switchStates[index]
        let transforms = this.ccTransforms
        for (let i = 0; i < transforms.length; i++) {
            let trans = transforms[i]
            if (trans.stateUuid != curState.uuid) {
                continue
            }
            let child = this._getNodeByGuid(trans.guid)
            if (child) {
                child.active = trans.active
                child.position = trans.position
                child.angle = trans.rotation
                child.scale = trans.scale
                child.setAnchorPoint(trans.anchor.x, trans.anchor.y)
                child.setContentSize(trans.size.x, trans.size.y)
                child.color = new cc.Color(trans.color.x, trans.color.y, trans.color.z)
                child.opacity = trans.opacity
            } else {
                cc.warn("没有找到此节点：" + trans.guid)
            }
        }
    },
    _getNodeByGuid(guid) {
        for (let i = 0; i < this.targetNodes.length; i++) {
            if (this.targetNodes[i].guid == guid) {
                return this.targetNodes[i].node
            }
        }
        return null
    },
    _changeTargetByGuid(newUuid, guid) {
        this._removeTargetTransByUuid(guid)
        this._changeTargetTransByUuid(newUuid, guid)
    },
    _removeTargetTransByUuid(guid) {
        let transforms = []
        for (let i = 0; i < this.ccTransforms.length; i++) {
            if (this.ccTransforms[i].guid != guid) {
                transforms.push(this.ccTransforms[i])
            }
        }
        this.ccTransforms = transforms
    },
    _changeTargetTransByUuid(uuid, guid) {
        let node = this._getNodeByUuid(uuid)
        if (!node && uuid != "") {
            cc.warn("未找到此node:" + uuid)
            return
        }
        let has = false
        for (let i = 0; i < this.targetNodes.length; i++) {
            if (this.targetNodes[i].guid == guid) {
                this.targetNodes[i].node = node
                has = true
            }
        }
        if (!has) {
            let tNode = new TargetNode()
            tNode.guid = guid
            tNode.node = node
            this.targetNodes.push(tNode)
        }

        for (let i = 0; i < this.switchStates.length; i++) {
            let trans = new CCTransform()
            trans.nodeUuid = uuid
            trans.guid = guid
            trans.stateUuid = this.switchStates[i].uuid
            trans.active = node.active
            trans.position = new cc.Vec2(node.position.x, node.position.y)
            trans.rotation = node.angle
            trans.color = new cc.Vec3(node.color.r, node.color.g, node.color.b)
            trans.opacity = node.opacity
            trans.scale = new cc.Vec2(node.scaleX, node.scaleY)
            trans.anchor = new cc.Vec2(node.anchorX, node.anchorY)
            let size = node.getContentSize()
            trans.size = new cc.Vec2(size.width, size.height)
            this.ccTransforms.push(trans)
        }
    },
    _removeStateByUuid(uuid) {
        let transforms = []
        for (let i = 0; i < this.ccTransforms.length; i++) {
            if (this.ccTransforms[i].stateUuid != uuid) {
                transforms.push(this.ccTransforms[i])
            }
        }
        this.ccTransforms = transforms
    },
    _addStateByUuid(uuid) {
        for (let i = 0; i < this.targetNodes.length; i++) {
            let nodeUuid = this.targetNodes[i].node.uuid
            let node = this._getNodeByUuid(nodeUuid)
            if (!node) {
                continue
            }
            let trans = new CCTransform()
            trans.nodeUuid = nodeUuid
            trans.stateUuid = uuid
            trans.guid = this.targetNodes[i].guid
            trans.active = node.active
            trans.position = new cc.Vec2(node.position.x, node.position.y)
            trans.rotation = node.angle
            trans.color = new cc.Vec3(node.color.r, node.color.g, node.color.b)
            trans.opacity = node.opacity
            trans.scale = new cc.Vec2(node.scaleX, node.scaleY)
            trans.anchor = new cc.Vec2(node.anchorX, node.anchorY)
            let size = node.getContentSize()
            trans.size = new cc.Vec2(size.width, size.height)
            this.ccTransforms.push(trans)
        }
    },
    _findNodeFromChildByUuid(uuid, parent) {
        if (parent.uuid == uuid) {
            return parent
        }
        for (let i = 0; i < parent.childrenCount; i++) {
            let child = parent.children[i]
            let result = this._findNodeFromChildByUuid(uuid, child)
            if (result) {
                return result
            }
        }
        return null
    },
    _getNodeByUuid(uuid) {
        return cc.engine.getInstanceById(uuid)
        if (!this._tempUuidNodeMap) {
            this._tempUuidNodeMap = {}
        }
        if (this._tempUuidNodeMap[uuid]) {
            return this._tempUuidNodeMap[uuid]
        }
        let child = this._findNodeFromChildByUuid(uuid, this.node)
        if (child) {
            this._tempUuidNodeMap[uuid] = child
            return child
        } else {
            return null
        }
    }
});


