module.exports=(()=>{"use strict";var t={462:function(t,e,i){var s=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:true});const r=s(i(137));class Circle extends r.default{constructor(t){super(t);this._radius=100;this.shape=this.root.circle(this._radius)}radius(t){this._radius=t;this.shape.radius(t);this._resize();return this}}e.default=Circle},290:function(t,e,i){var s=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:true});const r=s(i(137));class Line extends r.default{constructor(t){super(t);this._start=[0,0];this._end=[100,100];this.shape=this.root.line(0,0,100,100)}_resize(){this.children.forEach(function(t){t.shape.center(t.parent.shape.cx(),t.parent.shape.cy())},this)}line(t,e){this._start=t;this._end=e;this.shape.plot(t.x,t.y,e.x,e.y);this._resize();return this}}e.default=Line},826:function(t,e,i){var s=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:true});const r=s(i(137));class Polygon extends r.default{constructor(t,e){super(t);this._vertexes="0,0 -50,50 50,50";this.shape=e?this.root.polygon(this._vertexes):this.root.polyline(this._vertexes).fill("none").stroke({width:1})}_resize(){this.children.forEach(function(t){t.shape.center(t.parent.shape.cx(),t.parent.shape.cy())},this)}vertexes(t){let e="";t.forEach(function(t){e+=t.x+","+t.y+" "},this);this._vertexes=e;this.shape.plot(e);this._resize();return this}}e.default=Polygon},137:(t,e)=>{Object.defineProperty(e,"__esModule",{value:true});class Shape{constructor(t){this.parent=t;this.children=[];this.isRoot=false;this._position=[0,0];this._rotate=0;this._scale=1;this._visible=true;if(t.root!==undefined){this.root=t.root.group();t.children.push(this)}else{this.isRoot=true;this.root=t.group()}}position(t,e){this._position=[t,e];this.root.move(t,e);return this}rotate(t){this._angle=t;this.root.rotate(t);return this}scale(t){this._scale=t;this.root.scale(t);return this}color(t,e){if(t===null){this.shape.stroke("none")}else{this.shape.stroke({color:t})}if(e===null){this.shape.fill("none")}else{this.shape.fill({color:e})}return this}lineStytle(t){this.shape.attr({"stroke-width":t});return this}cursorStytle(t,e){this.shape.attr({cursor:t,"pointer-events":e});return this}visible(t){this._visible=t;if(t)this.shape.show();else this.shape.hide();return this}_resize(){if(!this.isRoot)this.shape.center(this.parent.shape.cx(),this.parent.shape.cy());else this.shape.center(0,0);this.children.forEach(function(t){t.shape.center(t.parent.shape.cx(),t.parent.shape.cy())},this)}onClick(t){this.shape.on("click",t.bind(this));return this}onMousedown(t){this.shape.on("mousedown",t.bind(this));return this}onMouseup(t){this.shape.on("mouseup",t.bind(this));return this}onMousemove(t){this.shape.on("mousemove",t.bind(this));return this}onMouseover(t){this.shape.on("mouseover",t.bind(this));return this}onMouseout(t){this.shape.on("mouseout",t.bind(this));return this}}e.default=Shape},420:function(t,e,i){var s=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:true});const r=s(i(826));const o=s(i(290));const n=s(i(462));class PolygonMask extends Editor.Gizmo{onCreateRoot(){cc.log("onCreateRoot");this.fillArea=new r.default(this._root.group(),true).color(null,"rgba(0,128,255,0.2)").cursorStytle("move","fill");Editor.GizmosUtils.addMoveHandles(this.fillArea.shape,this.setOffset());this.lines=[];for(let t=0;t<this.target.vertexes.length;++t){this.lines[t]=new o.default(this._root.group()).color("rgba(0,128,255,1)").lineStytle(2).cursorStytle("pointer");Editor.GizmosUtils.addMoveHandles(this.lines[t].shape,this.addVertexe())}this.points=[];for(let t=0;t<this.target.vertexes.length;++t){this.points[t]=new n.default(this._root.group()).color(null,"rgba(0,128,255,1)").cursorStytle("pointer").radius(3);Editor.GizmosUtils.addMoveHandles(this.points[t].shape,this.moveOrDeleteVertexe())}this._targetEditing=!this.target.editing}moveOrDeleteVertexe(){let t;return{start:function(e,i,s){this.pressx=e;this.pressy=i;this.updated=false;let r=s.currentTarget.instance;t=-1;for(let e=0;e<this.points.length;++e){if(this.points[e].shape===r){t=e;break}}let o=s.ctrlKey||s.metaKey;if(o){_Scene.Undo.recordNode(this.node.uuid);let e=this.target.vertexes;e.splice(t,1);this.target.vertexes=e;this.points[0].visible(false);this.points.splice(0,1);this.lines[0].visible(false);this.lines.splice(0,1);this._view.repaintHost();return}}.bind(this),update:function(e,i,s){if(e===0&&i===0){return}this.updated=true;let r=s.ctrlKey||s.metaKey;if(r){return}let o=this.node;_Scene.Undo.recordNode(o.uuid);let n=this.pressx+e,h=this.pressy+i;let l=this._view.pixelToWorld(cc.v2(n,h));l=o.convertToNodeSpaceAR(l).sub(this.target.offset);let a=Editor.Math.numOfDecimalsF(1/this._view.scale);l.x=Editor.Math.toPrecision(l.x,a);l.y=Editor.Math.toPrecision(l.y,a);this.target.vertexes[t]=l;this.target.vertexes=this.target.vertexes;this._view.repaintHost()}.bind(this),end:function(t){if(this.updated){_Scene.Undo.commit()}}.bind(this)}}setOffset(){let t,e,i,s;return{start:function(r,o,n){let h=this._view.pixelToWorld(cc.v2(r,o));h=this.node.convertToNodeSpaceAR(h);let l=Editor.Math.numOfDecimalsF(1/this._view.scale);h.x=Editor.Math.toPrecision(h.x,l);h.y=Editor.Math.toPrecision(h.y,l);t=h;e=r;i=o;s=this.target.offset}.bind(this),update:function(r,o,n){_Scene.Undo.recordNode(this.node.uuid);let h=e+r;let l=i+o;let a=this._view.pixelToWorld(cc.v2(h,l));a=this.node.convertToNodeSpaceAR(a);let u=Editor.Math.numOfDecimalsF(1/this._view.scale);a.x=Editor.Math.toPrecision(a.x,u);a.y=Editor.Math.toPrecision(a.y,u);this.target.offset=s.add(a.sub(t))}.bind(this),end:function(t){}.bind(this)}}addVertexe(){return{start:function(t,e,i){_Scene.Undo.recordNode(this.node.uuid);let s=this._view.pixelToWorld(cc.v2(t,e));s=this.node.convertToNodeSpaceAR(s).sub(this.target.offset);let r=Editor.Math.numOfDecimalsF(1/this._view.scale);s.x=Editor.Math.toPrecision(s.x,r);s.y=Editor.Math.toPrecision(s.y,r);let h=i.currentTarget.instance;let l=this.target.vertexes;let a=-1;for(let t=0;t<this.lines.length;++t){if(this.lines[t].shape===h){a=t+1;break}}let u=new o.default(this._root.group()).color("rgba(0,128,255,1)").lineStytle(2).cursorStytle("pointer");Editor.GizmosUtils.addMoveHandles(u.shape,this.addVertexe());this.lines.push(u);let d=new n.default(this._root.group()).color(null,"rgba(0,128,255,1)").cursorStytle("pointer").radius(3);Editor.GizmosUtils.addMoveHandles(d.shape,this.moveOrDeleteVertexe());this.points.push(d);l.splice(a,0,s);this.target.vertexes=l;this._view.repaintHost()}.bind(this),update:function(t,e,i){}.bind(this),end:function(t){}.bind(this)}}onUpdate(){if(this.target.editing){this.enterEditing()}else{this.leaveEditing()}if(this.target.vertexes.length<=0)return;let t=this.node;let e=Editor.GizmosUtils.snapPixelWihVec2(this._view.worldToPixel(t.convertToWorldSpaceAR(this.target.offset)));let i=[];for(let e=0;e<this.target.vertexes.length;++e){i[e]=Editor.GizmosUtils.snapPixelWihVec2(this._view.worldToPixel(t.convertToWorldSpaceAR(this.target.vertexes[e].add(this.target.offset))))}this.fillArea.vertexes(i);for(let t=0;t<i.length;t++){let e=this.lines[t];if(!e){e=new o.default(this._root.group()).color("rgba(0,128,255,1)").lineStytle(2).cursorStytle("pointer");this.lines[t]=e;Editor.GizmosUtils.addMoveHandles(e.shape,this.addVertexe())}e.visible(true);e.line(i[t],i[t===i.length-1?0:t+1])}if(this.lines.length>i.length){for(let t=i.length;t<this.lines.length;t++){this.lines[t].visible(false)}}for(let t=0;t<i.length;t++){let e=this.points[t];if(!e){e=new n.default(this._root.group()).color(null,"rgba(0,128,255,1)").cursorStytle("pointer").radius(3);this.points[t]=e;Editor.GizmosUtils.addMoveHandles(e.shape,this.moveOrDeleteVertexe())}e.visible(true);e.position(i[t].x,i[t].y)}if(this.points.length>i.length){for(let t=i.length;t<this.points.length;t++){this.points[t].visible(false)}}}enterEditing(){if(this._targetEditing){return}this.fillArea.visible(true);for(let t=0;t<this.points.length;++t){this.points[t].visible(true)}this._targetEditing=true}leaveEditing(){if(!this._targetEditing){return}this.fillArea.visible(false);for(let t=0;t<this.points.length;++t){this.points[t].visible(false)}this._targetEditing=false}visible(){return true}}e.default=PolygonMask;t.exports=PolygonMask}};var e={};function __nccwpck_require__(i){if(e[i]){return e[i].exports}var s=e[i]={exports:{}};var r=true;try{t[i].call(s.exports,s,s.exports,__nccwpck_require__);r=false}finally{if(r)delete e[i]}return s.exports}__nccwpck_require__.ab=__dirname+"/";return __nccwpck_require__(420)})();