'use strict';
const path      = require('path');
const electron  = require('electron');
const exec 		= require('child_process').exec;
let fs 			= require("fs");


let _lastUuid ;//最后打开的预制节点,记录当前打开层的uuid
module.exports = 
{

  load () {
	// 上次加载事件未释放
	if(global._simpleCodeMain){
		this.unload.bind(global._simpleCodeMain)()
	}

	// 执行扩展逻辑
	this.initExtend();
	this.runExtendFunc("onLoad",this);

	try{
		this.changeConfig();
	} catch (exception) {
		Editor.error("配置插件config.js出错:,",exception);
	} 
	global._simpleCodeMain = this;
  },

  // 2.4.4 发现保存后不会刷新
  unload () {
	delete global._simpleCodeMain
	this.scripts.forEach((obj)=>
	{ 
		for(let name in obj.messages)
		{
			let state = electron.ipcMain.removeListener( name.indexOf(':') == -1 ? "simple-code:"+name : name,obj.messages[name] ) ; 
		}

		try {
			if(obj.onDestroy){
				obj.onDestroy()
			}
		} catch (error) {
			Editor.error(error);
		}
	})
  }, 


  changeConfig(){

  	// let packageJson = JSON.parse( fs.readFileSync(Editor.url("packages://simple-code/package.json")) );
  	// let cfg 		= eval( fs.readFileSync(Editor.url("packages://simple-code/config.js")).toString() );
  	// let menuCfg 	= cfg["main-menu"]
  	// let menuCfgOld 	= packageJson["main-menu"];
  	// let isNeedSave  = false;

  	// for (let key in menuCfg) 
  	// {
  	// 	let v = menuCfg[key];
  	// 	if (menuCfgOld[key] == null || v.accelerator != menuCfgOld[key].accelerator || v.message != menuCfgOld[key].message)
  	// 	{
  	// 		isNeedSave = true;
  	// 		break;
  	// 	}
  	// }

  	// if (isNeedSave){
  	// 	packageJson["main-menu"] = menuCfg;
  	// 	Editor.log("替换编辑器插件快捷方式",Editor.url("packages://simple-code/package.json"),JSON.stringify( packageJson , null, "\t"))
  	// 	fs.writeFile(Editor.url("packages://simple-code/package.json"),JSON.stringify( packageJson , null, "\t"), 'utf-8');
  	// }
  },

  // 读取扩展逻辑文件
  initExtend()
  {
  	const fe     = Editor.require('packages://simple-code/tools/tools.js'); 

	this.scripts = [];
	let fileList = fe.getDirAllFiles(Editor.url("packages://simple-code/extensions"),[]);
	fileList.forEach((v)=>
	{
		if(v.substr(v.lastIndexOf(path.sep)+1) == "main_ex.js")
		{ 
			let obj = require(v);
			this.scripts.push(obj);
			for(let name in obj.messages)
			{
				obj.messages[name] = obj.messages[name].bind(obj)
				electron.ipcMain.on(name.indexOf(':') == -1 ? "simple-code:"+name : name,obj.messages[name]); 
			}
		}
	})
  },

  // 运行扩展文件的方法
  runExtendFunc(funcName,...args){
	this.scripts.forEach((obj)=>{
	  if (obj[funcName])
	  {
		obj[funcName](...args);
	  }
	})
  },

  // register your ipc messages here
  messages: { 
	'loadWidgetToCode'(){

		Editor.Ipc.sendToPanel('simple-code', 'loadWidgetToCode');
	},
	'open' () {
	  // open entry panel registered in package.json
	  Editor.Panel.open('simple-code');
	},

	'openPreview' () {
	  // open entry panel registered in package.json
	  Editor.Panel.open('simple-code.preview');
	},

	'openNodeFileByOutside' () {
	  // send ipc message to panel
	  Editor.Scene.callSceneScript('simple-code', 'open-file-by-outside' ,"", (err, event)=>{

	  } );
	},
	
	'openNodeFile' () {
	  // send ipc message to panel
	  Editor.Panel.open('simple-code');
	  Editor.Ipc.sendToPanel('simple-code', 'custom-cmd',{cmd:"openFile"});
	},

	'findFileAndOpen' () {
		Editor.Panel.open('simple-code');
		Editor.Ipc.sendToPanel('simple-code', 'custom-cmd',{cmd:"findFileAndOpen"});
	},

	'findFileGoto' () {
		Editor.Panel.open('simple-code');
		Editor.Ipc.sendToPanel('simple-code', 'custom-cmd',{cmd:"findFileGoto"});
	},

	'simple-code:selectNode'(){

		Editor.Scene.callSceneScript('simple-code', 'select-node' ,{});
	},

	'uuidToUrl'(event,a){
		if (event.reply) { 
			//if no error, the first argument should be null
			if(a.uuids)
			{
				let arrUrl = []
				a.uuids.forEach((uuid,i)=>{
					arrUrl.push(Editor.assetdb.uuidToUrl(uuid))
				})
				event.reply(null, {urls:arrUrl});
			}
		}
	},

	'getPrefabUuid'(event,a){
		if (event.reply) {
			event.reply(null, _lastUuid);
		}
	},
	
	'setting'(){
		Editor.Panel.open('simple-code');
		Editor.Ipc.sendToPanel('simple-code', 'custom-cmd',{cmd:"setting"});
	},
	
	'openConfig'(){
		// 打开配置
		const config 	= Editor.require('packages://simple-code/config.js');
		Editor.Ipc.sendToPanel('simple-code', 'open-code-file',config.getUserConfigPath(Editor.url('packages://simple-code/editor_config.js')));
	},
	
	'openKeyMap'(){
		// 打开配置
		Editor.Ipc.sendToPanel('simple-code', 'open-code-file',Editor.url("packages://simple-code/keyMap.js"));
	},

	'openConfigHitn'(){
		// 打开目录
		Editor.Ipc.sendToPanel('simple-code', 'open-code-file',Editor.url("packages://simple-code/template/hint_text.txt"));
	},

	'openConfigExtendDir'(){
		// 打开目录
		exec( (Editor.isWin32 ? "start " : "open ")+Editor.url("packages://simple-code/extensions") )
	},

	// 联系作者
	'contactAuthor'(){
		let url = 'https://qm.qq.com/cgi-bin/qm/qr?k=uha480KkJZa0P0rh_Pmrt8OkzQ6QIBqX&jump_from=webapi';
		exec(Editor.isWin32 ? "cmd /c start "+url : "open "+url);
	},

	 
	'scene:enter-prefab-edit-mode' (event,uuid) {
	   _lastUuid = uuid;
	},

	'refresh-preview'(){
		Editor.Ipc.sendToPanel('simple-code.preview','refresh-preview');
	},

  },
};