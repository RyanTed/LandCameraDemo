/*
 * @Author: RyanJiang
 * @Date: 2020-11-09 20:31:11
 * @LastEditTime: 2023-05-24 19:44:52
 * @LastEditors: RyanJiang
 * @Description: 地图相机
 * @FilePath: /LandCameraDemo/assets/scripts/ui/LandCamera.ts
 */

import { LandSpace } from './LandSpace';

const { ccclass, property, requireComponent, disallowMultiple } = cc._decorator;

function MID(a: number, min: number, max: number) {
    if (a < min) {
        return min;
    } else if (a > max) {
        return max;
    }
    return a;
}

export interface CameraView {
    pos: cc.Vec2;
    zoom: number;
    size?: cc.Size;
    posRangeRect?: cc.Rect;
    movePos?: cc.Vec2;
}

const MinTouchMoveDistance = 7;

@ccclass
@requireComponent(cc.Camera)
@disallowMultiple
export class LandCamera extends cc.Component {
    /**
     * 地图相机同时应只有一个实例
     */
    public static instance: LandCamera = null;

    @property(cc.Float)
    maxZoom = 2;

    @property(cc.Float)
    minZoom = 0.3;

    @property(cc.Float)
    defaultZoom = 0.6;

    @property(cc.Float)
    mouse_scale_delta: number = 0.1;

    // 边缘回弹
    @property(cc.Boolean)
    enable_bounce = false;

    @property(cc.Vec2)
    bounceSpace = cc.v2(300, 200);

    /**
     * 是否开启滚动惯性。
     */
    @property(cc.Boolean)
    inertia = true;
    /**
     * 开启惯性后，在用户停止触摸后滚动多快停止，0表示永不停止，1表示立刻停止。
     */
    @property({ type: cc.Float, range: [0, 1] })
    brake = 0.5;

    _camera: cc.Camera = null;
    _last_post_pos: cc.Vec2;
    _last_post_view_size: cc.Size;
    private _last_touch_time: Date;
    public get camera() {
        return this._camera;
    }
    _canvas: cc.Node = null;

    private _land: LandSpace = null;
    public get land(): LandSpace {
        return this._land;
    }
    public set land(value: LandSpace) {
        this._land = value;
        if (this.enabled) {
            this.onEnable();
        }
    }

    private _touchLayer: cc.Node = null;
    public get touchLayer(): cc.Node {
        return this._touchLayer;
    }
    public set touchLayer(value: cc.Node) {
        if (this.enabled && this._touchLayer) {
            this.onDisable();
        }
        this._touchLayer = value;
        if (this.enabled) {
            this.onEnable();
        }
    }
    // 摄像机最终位置范围
    _displayRangeRect: cc.Rect = null;
    // 摄像机可以拖动位置范围
    _moveRangeRect: cc.Rect = null;
    private _realMaxZoom: number;
    private _realMinZoom: number;

    public set realMinZoom(zoom: number) {
        this._realMinZoom = zoom;
    }

    public get realMinZoom() {
        return this._realMinZoom;
    }

    private _last_pos: cc.Vec2;
    private _last_view_size: cc.Size;
    private _scrollAnim: any;
    private _scrollAction: any;
    private _touchMoved: boolean;
    private _autoScroll: boolean = false;
    private _autoScrollDelta: cc.Vec2;

    public get cameraView(): CameraView {
        return this.getCameraView();
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._camera = this.getComponent(cc.Camera);
        this.node.setScale(1);
        LandCamera.instance = this;
    }

    start() {
        this.refreshLand();
        this.zoom(this.defaultZoom);
    }
    onDestroy() {
        LandCamera.instance = null;
    }
    update(dt) {
        if (!cc.isValid(this.land) || !cc.isValid(this._canvas)) {
            return;
        }
        if (this.isAutoScrolling()) {
            const curPos = this.node.getPosition();
            this.node.setPosition(curPos.sub(this._autoScrollDelta));
            this._autoScrollDelta = this._autoScrollDelta.sub(
                this._autoScrollDelta.mul(this.brake)
            );
            if (this._autoScrollDelta.lengthSqr() < 3) {
                this.stopAutoScroll();
            }
        }
        if (this.isCameraChange()) {
            this.updateSight();
        }
    }

    onEnable() {
        if (!cc.isValid(this.land) || !cc.isValid(this.touchLayer)) {
            return;
        }
        if (this.land.container.cameraListenTouch) {
            this.touchLayer.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
            this.touchLayer.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
            this.touchLayer.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
            this.touchLayer.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        }
    }

    onDisable() {
        if (!cc.isValid(this.land) || !cc.isValid(this.touchLayer)) {
            return;
        }
        this.touchLayer.targetOff(this);
        this.stopAutoScroll();
    }

    refreshLand() {
        if (!cc.isValid(this._canvas)) {
            return;
        }
        this.node.stopAllActions();
        this.land = this.node.parent.getComponent(LandSpace);
        this._moveRangeRect = this.land.node.getBoundingBox();
        this._displayRangeRect = cc.instantiate(this._moveRangeRect);
        if (this.enable_bounce) {
            this._displayRangeRect.xMin += this.bounceSpace.x;
            this._displayRangeRect.xMax -= this.bounceSpace.x;
            this._displayRangeRect.yMin += this.bounceSpace.y;
            this._displayRangeRect.yMax -= this.bounceSpace.y;
        }
        let landParentMatrix = cc.mat4();
        this.land.node.parent.getWorldMatrix(landParentMatrix);
        this._displayRangeRect.transformMat4(this._displayRangeRect, landParentMatrix);

        let parentMatrix = cc.mat4();
        this.node.getWorldMatrix(parentMatrix);
        parentMatrix.invert(parentMatrix);
        this._displayRangeRect.transformMat4(this._displayRangeRect, parentMatrix);
        let zoom_width = this.land.node.width / this._canvas.width;
        let zoom_height = this.land.node.height / this._canvas.height;

        if (this.enable_bounce) {
            zoom_width = (this.land.node.width - 2 * this.bounceSpace.x) / this._canvas.width;
            zoom_height = (this.land.node.height - 2 * this.bounceSpace.y) / this._canvas.height;
        }

        this._realMaxZoom = this.maxZoom;
        this._realMinZoom = Math.max(this.minZoom, 1 / zoom_width, 1 / zoom_height);
        this.recordPosAndSize();
        this.recordPostSightPosAndSize();
    }
    updateSight() {
        if (!cc.isValid(this.land) || !cc.isValid(this._canvas)) {
            return;
        }
        let view = this.checkView();
        if (!this.inertia || !this.enable_bounce || !this.isAutoScrolling()) {
            this.node.setPosition(view.movePos);
        }
        if (this.isAutoScrolling() && !view.posRangeRect.contains(view.movePos)) {
            this.node.setPosition(view.movePos);
            this.stopAutoScroll();
        }
        this.node.setContentSize(view.size);
        this.recordPosAndSize();
    }
    getCameraSight(): cc.Rect {
        return this.node.getBoundingBoxToWorld();
    }
    getCameraView(): CameraView {
        return {
            pos: this.node.getPosition(),
            zoom: this._camera.zoomRatio,
            size: this.node.getContentSize(),
        };
    }
    checkView(view?: CameraView): CameraView {
        if (!view) {
            view = this.getCameraView();
        }
        view.zoom = this.checkZoom(view.zoom);
        if (this._displayRangeRect) {
            let viewSize = cc.v2(this._canvas.width, this._canvas.height).mul(1 / view.zoom);
            let halfViewSize = viewSize.mul(0.5);
            let getRect = (range: cc.Rect) => {
                let minP = range.origin.add(halfViewSize);
                let maxP = range.origin.add(cc.v2(range.width, range.height)).sub(halfViewSize);
                return cc.Rect.fromMinMax(minP, maxP);
            };
            let moveRangeRect = getRect(this._moveRangeRect);
            let movePos = cc.v2(view.pos);
            if (!moveRangeRect.contains(view.pos)) {
                movePos.x = MID(movePos.x, moveRangeRect.xMin, moveRangeRect.xMax);
                movePos.y = MID(movePos.y, moveRangeRect.yMin, moveRangeRect.yMax);
            }
            let posRangeRect = getRect(this._displayRangeRect);
            if (!posRangeRect.contains(view.pos)) {
                view.pos.x = MID(view.pos.x, posRangeRect.xMin, posRangeRect.xMax);
                view.pos.y = MID(view.pos.y, posRangeRect.yMin, posRangeRect.yMax);
            }
            return {
                pos: view.pos,
                zoom: view.zoom,
                size: cc.size(viewSize.x, viewSize.y),
                posRangeRect: posRangeRect,
                movePos: movePos,
            };
        } else {
            return view;
        }
    }
    recordPosAndSize() {
        this._last_pos = this.node.getPosition();
        this._last_view_size = this.node.getContentSize();
    }
    recordPostSightPosAndSize() {
        this._last_post_pos = this.node.getPosition();
        this._last_post_view_size = this.node.getContentSize();
    }
    isCameraChange() {
        return (
            !this._last_pos?.equals(cc.v2(this.node.getPosition())) ||
            !this._last_view_size?.equals(this.node.getContentSize())
        );
    }
    shouldPostChangeSightMsg() {}
    // touch event handler
    onTouchStart(event: cc.Event.EventTouch) {
        if (!this.enabledInHierarchy) return;
        this._touchMoved = false;
        this.stopAutoScroll();
    }
    onTouchMove(event: cc.Event.EventTouch) {
        if (!this.enabledInHierarchy) return;
        if (!cc.isValid(this.land) || !cc.isValid(this._canvas)) {
            return;
        }
        if (!this.enabled) {
            return;
        }
        let touch = event.touch;
        let deltaMove = touch.getLocation().sub(touch.getStartLocation());
        //FIXME: touch move delta should be calculated by DPI.
        if (deltaMove.mag() > MinTouchMoveDistance) {
            if (!this._touchMoved && event.target !== this.node) {
                // Simulate touch cancel for target node
                let cancelEvent = new cc.Event.EventTouch(event.getTouches(), event.bubbles);
                cancelEvent.type = cc.Node.EventType.TOUCH_CANCEL;
                cancelEvent.touch = event.touch;
                // cancelEvent.simulate = true;
                event.target.dispatchEvent(cancelEvent);
                this._touchMoved = true;
            }
        }
        let touches = event.getTouches();
        if (touches.length == 1) {
            this.scroll({ delta: event.getDelta() });
            if (this.inertia) {
                let time = new Date();
                this._last_touch_time = time;
                this.calculateAutoScrollDelta(event);
            }
        } else {
            let curDistance = touches[0].getLocation().sub(touches[1].getLocation()).mag();
            let preDistance = touches[0]
                .getPreviousLocation()
                .sub(touches[1].getPreviousLocation())
                .mag();
            let newzoomRatio = (this._camera.zoomRatio * curDistance) / preDistance;
            this.zoom(newzoomRatio);
            this.updateSight();
        }
    }
    onTouchEnd(event: cc.Event.EventTouch) {
        if (!this.enabledInHierarchy) return;
        if (this._touchMoved) {
            event.stopPropagation();
        }
        let view = this.checkView();
        this.node.setPosition(view.movePos);
        if (this.inertia) {
            this._autoScroll = true;
        }
        if (this.enable_bounce) {
            if (!view.posRangeRect.contains(view.movePos)) {
                cc.tween(this.node)
                    .to(0.5, { position: cc.v3(view.pos) }, { easing: 'sineInOut' })
                    .start();
            }
        } else if (this.inertia) {
            let touches = event.getTouches();
            if (touches.length == 1) {
                this.scroll({ delta: event.getDelta() });
                let time = new Date();
                if (this._last_touch_time) {
                    if (time.getTime() - this._last_touch_time.getTime() > 100) {
                        this.stopAutoScroll();
                    }
                }
                this._last_touch_time = null;
            }
        }
    }
    onMouseWheel(event: cc.Event.EventMouse) {
        if (!cc.isValid(this.land) || !cc.isValid(this._canvas)) {
            return;
        }
        if (!this.enabled) {
            return;
        }
        let zoomRatio =
            this._camera.zoomRatio +
            (this.mouse_scale_delta * event.getScrollY()) / Math.abs(event.getScrollY());
        this.zoom(zoomRatio);
        this.updateSight();
    }
    /**
     * 摄像机移动
     * @param {cc.Vec2} delta 世界坐标系下的 touch delta
     * @param {Boolean} anim 是否使用动画
     * @param {Function} cb 多次调用动画回调
     */
    scroll({
        delta,
        anim,
        cb,
    }: {
        delta: cc.Vec2;
        anim?: boolean;
        cb?: (delta: cc.Vec2) => void;
    }): void {
        let trsf = new cc.Mat4();
        trsf = this._camera.getScreenToWorldMatrix2D(trsf);
        delta = delta.scaleSelf(cc.v2(trsf.getScale(new cc.Vec3())));
        if (anim) {
            if (!cc.isValid(this._scrollAnim)) {
                this._scrollAnim = [];
            }
            this._scrollAnim.push({
                delta: delta,
                cb: cb,
            });
            if (!cc.isValid(this._scrollAction)) {
                this._scrollAction = cc
                    .tween(this.node)
                    .delay(0)
                    .call(() => {
                        delete this._scrollAction;
                        this.performScrollAnim();
                    })
                    .start();
            }
        } else {
            const newPos = this.node.getPosition().sub(delta);
            let view = this.checkView({
                pos: newPos,
                zoom: this.camera.zoomRatio,
            });
            this.node.setPosition(view.movePos);
        }
    }
    performScrollAnim() {
        this.node.stopAllActions();
        let delta = cc.Vec2.ZERO;
        let cbs = [];
        for (const iterator of this._scrollAnim) {
            delta.addSelf(iterator.delta);
            if (iterator.cb) {
                cbs.push(iterator.cb);
            }
        }
        this._scrollAnim = [];
        let movetime = 0.5;
        let t = cc.tween(this.node);
        t.by(
            movetime,
            {
                position: cc.v3(delta.neg()),
            },
            {
                easing: 'cubicOut',
            }
        );
        if (cbs.length > 0) {
            t.call(() => {
                for (const cb of cbs) {
                    cb(delta);
                }
            });
        }
        t.start();
    }
    focus({
        pos,
        zoom = 1,
        useAnimation = true,
        cb,
    }: {
        pos: cc.Vec2;
        zoom?: number;
        useAnimation?: boolean;
        cb?: Function;
    }) {
        let view = this.checkView({ pos, zoom });
        if (useAnimation) {
            this.node.stopAllActions();
            let movetime = 0.5;
            let t = cc.tween(this.node).to(
                movetime,
                {
                    position: cc.v3(view.pos),
                },
                {
                    easing: 'cubicOut',
                }
            );
            cc.tween(this._camera)
                .to(
                    movetime,
                    { zoomRatio: view.zoom },
                    {
                        easing: 'cubicOut',
                    }
                )
                .start();
            if (cb) {
                t.call(cb);
            }
            t.start();
        } else {
            this.node.setPosition(view.pos);
            this._camera.zoomRatio = view.zoom;
            if (cb) {
                cb();
            }
        }
    }
    zoom(newzoomRatio: number) {
        if (this._camera) {
            this._camera.zoomRatio = this.checkZoom(newzoomRatio);
            let view = this.checkView();
            this._camera.zoomRatio = view.zoom;
            this.node.setPosition(view.pos);
            return this._camera.zoomRatio;
        }
    }
    private checkZoom(newzoomRatio: number): number {
        return MID(newzoomRatio, this._realMinZoom, this._realMaxZoom);
    }

    getScreenToWorldPoint(p: cc.Vec2) {
        let op = new cc.Vec2();
        this._camera.getScreenToWorldPoint(p, op);
        return op;
    }
    getWorldToScreenPoint(p: cc.Vec2) {
        let op = new cc.Vec2();
        this._camera.getWorldToScreenPoint(p, op);
        return op;
    }
    /**
     * 受landCamera影响下与正常坐标系之间的转换
     * @returns {cc.Vec2} outNode坐标系下的点
     * @param {cc.Vec2} point inNode坐标系下的点
     * @param {cc.Node} inNode 不传认为 innode 是camera外，outnode是camera内
     * @param {cc.Node} outNode
     */
    translatePoint({
        point,
        inNode,
        outNode,
    }: {
        point: cc.Vec2;
        inNode?: cc.Node;
        outNode: cc.Node;
    }) {
        let worldP = inNode ? inNode.convertToWorldSpaceAR(point) : point;
        if (inNode) {
            if (this._camera.containsNode(inNode) && !this._camera.containsNode(outNode)) {
                this._camera.getWorldToScreenPoint(worldP, worldP);
            } else if (!this._camera.containsNode(inNode) && this._camera.containsNode(outNode)) {
                this._camera.getScreenToWorldPoint(worldP, worldP);
            }
        } else {
            this._camera.getScreenToWorldPoint(worldP, worldP);
        }
        return outNode.convertToNodeSpaceAR(worldP);
    }

    /**
     * !#en Query whether the ScrollView is currently scrolling because of a bounceback or inertia slowdown.
     * !#zh 当前滚动视图是否在惯性滚动
     * @method isAutoScrolling
     * @returns {Boolean} - Whether the ScrollView is currently scrolling because of a bounceback or inertia slowdown.
     */
    isAutoScrolling() {
        return (
            this._autoScroll &&
            cc.isValid(this._autoScrollDelta) &&
            this._autoScrollDelta.lengthSqr() > 0
        );
    }
    calculateAutoScrollDelta(event: cc.Event.EventTouch) {
        if (this.inertia) {
            let deltaMove = event.getDelta();
            if (this.brake < 1 && deltaMove.lengthSqr() > 10) {
                this._autoScrollDelta = deltaMove;
            }
        }
    }
    stopAutoScroll() {
        this._autoScroll = false;
        this._autoScrollDelta = null;
    }
}
