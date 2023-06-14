const ChromaJs=require("chroma-js"),Message=require("../Message.js"),Path=require("fire-path"),Fs=require("fire-fs"),ParticleData=require("../game/particleData.js"),ImageSize=require(Editor.url("packages://cocos-particle2d/node_modules/image-size")),FsExtra=Editor.require("packages://cocos-particle2d/node_modules/fs-extra"),Plist=require("plist");let Electron=require("electron"),SvgTools=require("../game/svg-tools.js");window.Vue||(Vue=require("vue/dist/vue")),window.plugin=new window.Vue({el:"#app",created(){var e=setInterval(function t(){if(window&&window.particle&&window.particle.script){let i=window.particle.script.stopped;i&&(clearInterval(e),setTimeout(function(){window.particle.script.resetSystem(),e=setInterval(t,200)},2e3))}},200)},init(){Vue.nextTick(function(){this.setDevice(1);let e={id:"GameCanvas",debugMode:cc.debug?cc.debug.DebugMode.INFO:cc.DebugMode.INFO,showFPS:!0,frameRate:60};cc.game.run(e,function(){require("../game/index.js").init(this.game.width,this.game.height),this._initShotKey(),this.particleData=ParticleData.data}.bind(this))}.bind(this))},data:{test:"",fileSaveName:"",particleTexture:{filePath:null,fileName:null,uuid:null,width:0,height:0},game:{width:360,height:600},particleData:{},tempData:{preEmitterTime:0},isAreaSizeTool:!1,isPositionTool:!1,isGravityTool:!1,isAngleTool:!1,isRadiusTool:!1,tips:"",isDeviceRotation:!1,devices:[{id:1,name:"default",width:400,height:600},{id:2,name:"Apple iPhone 4",width:320,height:480,ratio:2},{id:3,name:"Apple iPhone 5",width:320,height:568,ratio:2},{id:4,name:"Apple iPhone 6",width:375,height:667,ratio:2},{id:5,name:"Apple iPhone 6 Plus",width:414,height:736,ratio:3},{id:6,name:"Apple iPad",width:1024,height:768,ratio:2},{id:7,name:"Apple iPad Mini",width:1024,height:768,ratio:1},{id:8,name:"Huawei P9",width:540,height:960,ratio:2},{id:9,name:"Huawei Mate9 Pro",width:720,height:1280,ratio:2},{id:10,name:"Goolge Nexus 4",width:384,height:640,ratio:2},{id:11,name:"Goolge Nexus 5",width:360,height:640,ratio:3},{id:12,name:"Goolge Nexus 6",width:412,height:732,ratio:3.5},{id:13,name:"Goolge Nexus 7",width:960,height:600,ratio:2}],deviceID:null,temps:[{id:1,name:"默认",plist:"atom.plist"},{id:2,name:"星空1",plist:"galaxy1.plist"},{id:3,name:"星空2",plist:"galaxy2.plist"},{id:4,name:"星空3",plist:"galaxy3.plist"},{id:5,name:"星星1",plist:"star1.plist"},{id:6,name:"星星2",plist:"star2.plist"},{id:7,name:"流星1",plist:"meteor1.plist"},{id:8,name:"流星2",plist:"meteor2.plist"},{id:9,name:"火柱",plist:"fire1.plist"},{id:10,name:"火苗",plist:"fire2.plist"},{id:11,name:"火焰-着火",plist:"fire3.plist"},{id:12,name:"火焰-尾巴喷火",plist:"fire4.plist"},{id:13,name:"太阳",plist:"sun.plist"},{id:14,name:"爆炸1",plist:"boom1.plist"},{id:15,name:"爆炸2",plist:"boom2.plist"},{id:16,name:"烟雾-点状",plist:"smoke1.plist"},{id:17,name:"烟雾-区域",plist:"smoke2.plist"},{id:18,name:"烟花1",plist:"fireworks1.plist"},{id:19,name:"烟花2",plist:"fireworks2.plist"},{id:20,name:"气泡",plist:"bubble.plist"},{id:21,name:"喷泉",plist:"geyser.plist"},{id:22,name:"水柱",plist:"spout.plist"},{id:23,name:"下雨",plist:"rain.plist"},{id:24,name:"下雪",plist:"snow.plist"}],tempID:null},methods:{onHelpDoc(){Electron.shell.openExternal("https://tidys.github.io/plugin-docs-oneself/docs/particle2d/")},onHelpQQ(){Electron.shell.openExternal("http://wpa.qq.com/msgrd?v=3&uin=774177933&site=qq&menu=yes")},_initShotKey(){},onClickAngleTool(){SvgTools._updateTools({keyCode:SvgTools.ShortKey.EmmitAngle})},onClickEmitterModelTool(){SvgTools._updateTools({keyCode:SvgTools.ShortKey.GravityRadius})},onClickPositionTool(){SvgTools._updateTools({keyCode:SvgTools.ShortKey.Position})},onClickAreaSizeTool(){SvgTools._updateTools({keyCode:SvgTools.ShortKey.AreaSize})},_getTempData(e){let t=null;for(let i=0;i<this.temps.length;i++){let a=this.temps[i];if(a.id.toString()===e.toString()){t=a;break}}return t},onChangeLoadTemp(e){let t=e.currentTarget.value;this.tempID=t,this.onBtnClickLoadTemp(null)},onBtnClickLoadTemp(e){if(null!==this.tempID){let e=this._getTempData(this.tempID);e&&this._loadTempParticle(e.plist)}},_loadTempParticle(e){let t=Editor.url("packages://cocos-particle2d/template"),i=Path.join(t,e);Fs.existsSync(i)?cc.loader.load(i,function(e,a){if(e);else{let e=Plist.parse(Fs.readFileSync(i,"utf-8")),a=Path.join(t,e.textureFileName);cc.loader.load(a,function(e,t){if(e)Editor.error(`[cocos-particle-2d] 加载模版粒子(${a})纹理失败!`);else{window.particle.script.resetSystem(),window.particle.script.file={nativeUrl:i,texture:t};let e=this.setTextureFilePath(a);cc.rect(0,0,e.with,e.height);window.particle.script.setTextureWithRect(t),SvgTools.refresh(),setTimeout(function(){ParticleData.init()},100)}}.bind(this))}}.bind(this)):Editor.error("[cocos-particle-2d] 载入粒子模版失败!文件不存在:"+i)},onUpdateSaveName(e){let t=e.currentTarget.value;null!==t&&""!==t||(t=Path.basenameNoExt(this.particleTexture.filePath)),this.fileSaveName=t},setDevice(e){this.deviceID=e;for(let t=0;t<this.devices.length;t++){let i=this.devices[t];i.id.toString()===e.toString()&&(this.game.width=i.width,this.game.height=i.height)}},getAppClass(){return this.isDeviceRotation?"layout vertical flex-1":"layout horizontal flex-1"},onClickRotationPhone(e){e.currentTarget.value;this.isDeviceRotation=!this.isDeviceRotation;let t=this.game.height;this.game.height=this.game.width,this.game.width=t,this._changeDevice()},onChangeDevices(e){let t=e.currentTarget.value;this.setDevice(t),this._changeDevice()},_changeDevice(){let e=this.game.width,t=this.game.height,i=document.getElementById("game-preview-editor");i.style.width=e,i.style.height=t,cc.view.resizeWithBrowserSize(!0),cc.view.setCanvasSize(e,t),cc.view.setDesignResolutionSize(e,t,cc.ResolutionPolicy.SHOW_ALL),SvgTools.resize(e,t)},_genPlistSaveDir(){let e=Path.join(Editor.remote.projectInfo.path,"temp/cocos-particle2d");return FsExtra.mkdirsSync(e),FsExtra.emptyDirSync(e),e},onClickGen(){let e=require("plist");let t=function(e){let t=Object.keys(e).sort(),i={};for(let a=0;a<t.length;a++)i[t[a]]=e[t[a]];return i}(this.particleData);ParticleData.deleteUnUseKey(t);this.fileSaveName;let i=Path.basename(this.particleTexture.filePath),a=Path.basenameNoExt(this.particleTexture.filePath);t.textureFileName=i;let r=e.build(t),l=this._genPlistSaveDir(),s=Path.join(l,`${a}.plist`);Fs.writeFileSync(s,r,"utf-8"),FsExtra.copySync(this.particleTexture.filePath,Path.join(l,i)),Editor.info(`[cocos-particle-2d] 生成粒子文件成功: ${s}`),Electron.shell.showItemInFolder(s),Electron.shell.beep()},onSelectParticleTextureFile(){},onStop(){event.stopPropagation(),event.preventDefault()},onChangeEmitterType(e){e.stopPropagation(),e.preventDefault();let t=e.currentTarget.value;this.particleData.emitterType=parseInt(t.toString());let i=this.particleData.emitterType;i===cc.ParticleSystem.EmitterMode.GRAVITY?(window.particle.script.emitterMode=cc.ParticleSystem.EmitterMode.GRAVITY,SvgTools._updateTools({keyCode:SvgTools.ShortKey.GravityRadius})):i===cc.ParticleSystem.EmitterMode.RADIUS&&(window.particle.script.emitterMode=cc.ParticleSystem.EmitterMode.RADIUS,SvgTools._updateTools({keyCode:SvgTools.ShortKey.GravityRadius}))},onChangeParticleCount(e){let t=e.currentTarget.value;this.particleData.maxParticles=t,window.particle.script.totalParticles=t},onChangeParticleLife(e){let t=e.currentTarget.value;this.particleData.particleLifespan=t,window.particle.script.life=t},onChangeParticleLifeVar(e){let t=e.currentTarget.value;this.particleData.particleLifespanVariance=t,window.particle.script.lifeVar=t},isEmitterForever(){return-1===this.particleData.duration},onChangeEmitterTimeForever(e){let t=-1;t=e.currentTarget.value?-1:this.tempData.preEmitterTime,this.particleData.duration=t,window.particle.script.resetSystem(),window.particle.script.duration=t},onChangeEmitterTime(e){let t=e.currentTarget.value;this.tempData.preEmitterTime=this.particleData.duration,this.particleData.duration=t,window.particle.script.resetSystem(),window.particle.script.duration=t},onChangeEmitterAngle(e){let t=e.currentTarget.value;this.particleData.angle=t,window.particle.script.angle=t,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateAngle,data:t})},onChangeEmitterAngleVar(e){let t=e.currentTarget.value;this.particleData.angleVariance=t,window.particle.script.angleVar=t,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateAngleVar,data:t})},onChangeParticleSpeed(e){let t=e.currentTarget.value;this.particleData.speed=t,window.particle.script.speed=t,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateGravitySpeed,data:t})},onChangeParticleSpeedVar(e){let t=e.currentTarget.value;this.particleData.speedVariance=t,window.particle.script.speedVar=t},_updateGravity(){window.particle.script.gravity.x=this.particleData.gravityx,window.particle.script.gravity.y=this.particleData.gravityy,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateGravity,data:{x:this.particleData.gravityx,y:this.particleData.gravityy}})},onChangeParticleGravityX(e){let t=e.currentTarget.value;this.particleData.gravityx=t,this._updateGravity()},onChangeParticleGravityY(e){let t=e.currentTarget.value;this.particleData.gravityy=t,this._updateGravity()},onChangeEmmitAreaSizeWidth(e){let t=e.currentTarget.value;this.particleData.sourcePositionVariancex=t/2,window.particle.script.posVar.x=t/2,this.particleData.emmitAreaSize.width=t,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateEmmitAreaSize,data:{w:this.particleData.emmitAreaSize.width,h:this.particleData.emmitAreaSize.height}})},onChangeEmmitAreaSizeHeight(e){let t=e.currentTarget.value;this.particleData.sourcePositionVariancey=t/2,window.particle.script.posVar.y=t/2,this.particleData.emmitAreaSize.height=t,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateEmmitAreaSize,data:{w:this.particleData.emmitAreaSize.width,h:this.particleData.emmitAreaSize.height}})},onChangeEndRadius(e){let t=e.currentTarget.value;window.particle.script.endRadius=t,this.particleData.minRadius=t,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateRadius,data:{start:this.particleData.maxRadius,end:this.particleData.minRadius}})},onChangeEndRadiusVariance(e){let t=e.currentTarget.value;window.particle.script.endRadiusVar=t,this.particleData.minRadiusVariance=t},onChangeStartRadius(e){let t=e.currentTarget.value;window.particle.script.startRadius=t,this.particleData.maxRadius=t,this.$emit(Message.MessagePipe,{msg:Message.MessageUpdateRadius,data:{start:this.particleData.maxRadius,end:this.particleData.minRadius}})},onChangeEndRadiusVariance(e){let t=e.currentTarget.value;window.particle.script.startRadiusVar=t,this.particleData.maxRadiusVariance=t},onChangeRotatePerSecond(e){let t=e.currentTarget.value;window.particle.script.rotatePerS=t,this.particleData.rotatePerSecond=t},onChangeRotatePerSecondVariance(e){let t=e.currentTarget.value;window.particle.script.rotatePerSVar=t,this.particleData.rotatePerSecondVariance=t},onChangeParticleStartSpin(e){let t=e.currentTarget.value;window.particle.script.startSpin=t,this.particleData.rotationStart=t},onChangeParticleStartSpinVar(e){let t=e.currentTarget.value;window.particle.script.startSpinVar=t,this.particleData.rotationStartVariance=t},onChangeParticleEndSpin(e){let t=e.currentTarget.value;window.particle.script.endSpin=t,this.particleData.rotationEnd=t},onChangeParticleEndSpinVar(e){let t=e.currentTarget.value;window.particle.script.endSpinVar=t,this.particleData.rotationEndVariance=t},onDrop(e){e.preventDefault(),e.stopPropagation();let t=e.dataTransfer,i=null;if(void 0!==t.items)for(let e=0;e<t.items.length;e++){let a=t.items[e];if("file"===a.kind&&"image/png"===a.type){let e=a.getAsFile();i=e;break}}if(i){this.particleTexture.filePath=null;let e=i.path;this.setTextureFilePath(e),cc.loader.load(e,function(t,i){if(t)this.particleTexture.filePath=null;else{this.particleTexture.filePath=e,window.particle.script.setTextureWithRect(i)}}.bind(this))}},setTextureFilePath(e){this.particleTexture.filePath=e,this.particleTexture.fileName=Path.basename(e);let t=ImageSize(e);return this.particleTexture.width=t.width,this.particleTexture.height=t.height,t},onDragEnter(e){e.preventDefault(),e.stopPropagation()},onDragLeave(e){e.preventDefault(),e.stopPropagation()},onDragOver(e){e.preventDefault(),e.stopPropagation()},onChangeStartColor(e){let t=e.currentTarget.value,i=cc.color(t[0],t[1],t[2],t[3]);this.particleData.startColor=i.toCSS("#rrggbb"),window.particle.setStartColor(i.toCSS("#rrggbb"))},onChangeStartColorVar(e){let t=e.currentTarget.value,i=cc.color(t[0],t[1],t[2],t[3]);this.particleData.startColorVar=i.toCSS("#rrggbb"),window.particle.setStartColorVar(i.toCSS("#rrggbb"))},onChangeEndColor(e){let t=e.currentTarget.value,i=cc.color(t[0],t[1],t[2],t[3]);this.particleData.endColor=i.toCSS("#rrggbb"),window.particle.setEndColor(i.toCSS("#rrggbb"))},onChangeEndColorVar(e){let t=e.currentTarget.value,i=cc.color(t[0],t[1],t[2],t[3]);this.particleData.endColorVar=i.toCSS("#rrggbb"),window.particle.setEndColorVar(i.toCSS("#rrggbb"))},onChangeStartParticleSize(e){let t=e.currentTarget.value;this.particleData.startParticleSize=t,window.particle.script.startSize=t},onChangeStartParticleSizeVariance(e){let t=e.currentTarget.value;this.particleData.startParticleSizeVariance=t,window.particle.script.startSizeVar=t},onChangeEndParticleSize(e){let t=e.currentTarget.value;this.particleData.finishParticleSize=t,window.particle.script.endSize=t},onChangeEndParticleSizeVariance(e){let t=e.currentTarget.value;this.particleData.finishParticleSizeVariance=t,window.particle.script.endSizeVar=t}}});