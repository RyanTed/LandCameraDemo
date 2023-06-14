'use strict';

const fs = require('fs');
const Path = require('path');
const AssetCleaner = Editor.require('packages://assetcleaner/cleanUtil/AssetCleaner');
const AssetSize = Editor.require('packages://assetcleaner/cleanUtil/AssetSize');
const FileHelper = Editor.require('packages://assetcleaner/cleanUtil/FileHelper')
let Electron = require('electron');
let projectPath = Editor.projectPath || (Editor.Project && Editor.Project.path);
let buildPath = Path.join(projectPath, 'build/');
let packageName = "assetcleaner";
const ignoreName = ['.svn', '.git', '.DS_Store'];

const color = ['#222222', '#2d2d2d'];
const Func = {
    showAllFileInfo: 0,
    searchNoBindFile: 1,
    findRepeatFile: 2,
}

let sharpPath;
if (Editor.dev) {
    sharpPath = 'sharp';
} else {
    sharpPath = Editor.url('unpack://utils/sharp');
}
const Sharp = require(sharpPath);

var PATH = {
    html: Editor.url('packages://assetcleaner/panel/panel.html'),
    style: Editor.url('packages://assetcleaner/panel/less.css')
};

let data = {
    uuid: '',
    nodeId: null,
    items: [],
    msg: '',
    input: '',
    imgSizeInfo: {},
    repeatInfo:[],

    funcIndex: Func.searchNoBindFile, //功能索引
    allFile: [], //所有的文件
    showItems: [], //需要展示的文件
    fileTypes: [],
    curFileType: '.all', //当前选中的文件类型
    showStr: '', //显示的字符

    noBindFile: [], //未绑定的资源
    noLoadFile: [], //非动态调用的资源

    noBindFileInfo: '',
    noLoadFileInfo: '',

    noBindCheckIndex: [],

    isNoBindFileAllChecked: false, //是否全部选中
    isNoLoadFileAllChecked: false,
    tipColor: '#C0BFBA'
};

// Editor.require("packages://" + packageName + "/panel/file-item.js")(data);
// module.exports = data;


var createVM = function (elem) {
    return new Vue({
        el: elem,
        data: data,
        watch: {
            uuid() {
                this.refresh();
            }
        },

        created() {
            //默认查看所有文件信息
            this.showAllFileInfo();

            //this.searchNoBindFile();

            //this.findRepeatFile();
        },

        methods: {
            //文件类型切换
            switchFileType(event) {
                console.log('switchType' + event.target.value);
                this.showItems = this.getFileByExt(event.target.value);
                this.curFileType = event.target.value;
                this.showStr = AssetSize.getFileInfo(this.allFile, this.curFileType);
            },

            //显示所有的文件信息
            showAllFileInfo() {
                this.curFileType = '.all';
                this.funcIndex = Func.showAllFileInfo;
                let searchPath = Path.join(projectPath, 'assets/');
                this.allFile = AssetSize.start(searchPath);
                this.showItems = this.getFileByExt(); //默认的显示项为全部
                this.fileTypes = [];
                for (let i = 0; i < this.allFile.length; ++i) {
                    if (this.allFile[i].ext.length > 0) {
                        this.fileTypes.push(this.allFile[i].ext);
                    }
                }
                this.showStr = AssetSize.getFileInfo(this.allFile);
            },

            //查找所有未引用的资源
            searchNoBindFile() {
                this.funcIndex = Func.searchNoBindFile;
                let searchPath = Path.join(projectPath, 'assets/');
                let results = AssetCleaner.start(searchPath);
                if (results.length < 1) return;
                this.noBindFile = [];
                this.noLoadFile = [];
                for (let m = 0; m < results.length; ++m) {
                    for (let i = 0; i < results[m].length; ++i) {
                        for (let j = 0; j < results[m][i].length; ++j) {
                            results[m][i][j].color = color[i % 2];
                            let names = results[m][i][j].path.split('/');
                            let name = names[names.length - 1];
                            results[m][i][j].name = name;
                            results[m][i][j].isChecked = false;
                            results[m][i][j].showImg = results[m][i][j].ext == '.jpg' || results[m][i][j].ext == '.png';
                            if (m == 0) {
                                this.noBindFile.push(results[m][i][j]);
                            } else {
                                this.noLoadFile.push(results[m][i][j]);
                            }
                        }
                    }
                }
                this.refreshFileInof();
                //debugger;
            },

            refreshFileInof() {
                this.noBindFileInfo = AssetCleaner.getFileInfo(this.noBindFile);
                this.noLoadFileInfo = AssetCleaner.getFileInfo(this.noLoadFile);
            },


            //查找重复文件
            findRepeatFile() {
                this.funcIndex = Func.findRepeatFile;
                debugger;
                let repeatInfo = this.repeatInfo = [];
                let findArr = ['sprite-frame'];
                let pathMap = {};
                let customIgnore = this.splitInput(this.input);
                Editor.assetdb.queryAssets(null, findArr, function (err, files) {
                    files.forEach(function (file) {
                        if (file.url.indexOf('db://internal') !== -1) return;
                        for (let i = 0; i < customIgnore.length; i++) {
                            if (file.url.indexOf(customIgnore[i]) !== -1) {
                                return;
                            }
                        }

                        let names = file.url.split('/');
                        let name = names[names.length - 1];
                        if (pathMap[name] === undefined) {
                            pathMap[name] = [];
                        }
                        pathMap[name].push(file.url);
                    });

                    for (let name in pathMap) {
                        let path = pathMap[name];
                        if (path.length <= 1) continue;
                        repeatInfo.push({
                            fileName: name,
                            path: pathMap[name]
                        })
                    }

                    if (repeatInfo.length === 0) {
                        repeatInfo.push({
                            fileName: '未找到重复文件',
                            path: []
                        })
                    }
                });
            },

            //打开操作日志，如果进行误操作，可根据操作日志恢复
            openLogFile() {
                let logFilePath = Path.join(projectPath, 'packages/assetcleaner/log.txt')
                fs.exists(logFilePath, function (exist) {
                    if (!exist) {
                        FileHelper.writeFile(logFilePath, '首次创建  \n');
                    }
                })
                Electron.shell.showItemInFolder(logFilePath);
            },

            //批量移动选中的文件
            moveAllCheckedFile() {
                let fileArr = [];
                for (let i = 0; i < this.noLoadFile.length; ++i) {
                    let item = this.noLoadFile[i];
                    let isChecked = this.noLoadFile[i].isChecked;
                    if (isChecked) {
                        fileArr.push(item);
                    }
                }
                this.onMoveFile(fileArr);
            },

            //移动文件
            onMoveFile(itemArr) {
                if(itemArr.length < 1){
                    console.log('未勾选文件');
                    return;
                }
                let assetPath = Path.join(projectPath, '/assets')
                if (fs.existsSync(assetPath)) {
                    Electron.shell.beep();
                    Electron.remote.dialog.showOpenDialog(
                        {
                            buttonLabel: '确定',
                            defaultPath: assetPath,
                            properties: ['openDirectory']
                        }, (destPathArr) => {
                            if (destPathArr) {
                                for(let i = 0; i < itemArr.length; ++i){
                                    let item = itemArr[i];
                                    let srcUrl = Editor.assetdb.remote.fspathToUrl(item.path);
                                    let destUrl = Editor.assetdb.remote.fspathToUrl(destPathArr[0]) + '/' + item.name;
                                    this.delItem(item, this.noLoadFile);
                                    Editor.assetdb.move(srcUrl, destUrl, null, (err) => {
                                        let log = '成功移动  ' + item.name + '从 ' + srcUrl + '  到  ' + destUrl + '  操作时间:' + new Date().toLocaleString() + '\n';
                                        this.printLog(log);
                                    });
                                }
                                this.refreshFileInof();
                            } else {
                                console.log('取消');
                            }
                        })
                } else {
                    this._addLog("目录不存在：" + this.OutRoot);
                }
               
            },

            //删除选中资源
            deleteAllCheckedFile() {
                for (let i = 0; i < this.noBindFile.length; ++i) {
                    let item = this.noBindFile[i];
                    let isChecked = this.noBindFile[i].isChecked;
                    if (isChecked) {
                        this.deleteFile(item);
                    }
                }
            },


            deleteFile(item) {
                //进行删除
                this.delItem(item, this.noBindFile);
                let url = Editor.assetdb.remote.fspathToUrl(item.path);
                Editor.assetdb.delete([url], (err, results) => {
                    if (err) {
                        console.log(err);
                    }
                    let content = '成功删除  ' + url + '  操作时间:' + new Date().toLocaleString() + '\n';
                    this.printLog(content);
                });

                this.refreshFileInof();
            },

            //记录日志(默认会在插件目录下创建log.txt文件)
            printLog(content) {
                let logFilePath = Path.join(projectPath, 'packages/assetcleaner/log.txt')
                console.log(content);
                fs.exists(logFilePath, function (exist) {
                    if (exist) {
                        fs.appendFile(logFilePath, content, 'utf-8', function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log('日志追加成功');
                        });
                    } else {
                        FileHelper.writeFile(logFilePath, content);
                        console.log('创建并打印日志成功');
                    }
                })
            },

            //通过拓展名获得某一类型的文件
            getFileByExt(ext = '.all') {
                let searchFile = [];
                for (let i = 0; i < this.allFile.length; ++i) {
                    if (ext != '.all' && this.allFile[i].ext != ext) continue;
                    let contentFile = this.allFile[i].contentFile;
                    for (let j = 0; j < contentFile.length; ++j) {
                        let item = {};
                        item.color = color[i % 2];
                        item.size = contentFile[j].size;
                        item.path = contentFile[j].path;

                        let names = item.path.split('/');
                        let name = names[names.length - 1];

                        item.name = name;
                        item.showImg = this.allFile[i].ext == '.jpg' || this.allFile[i].ext == '.png';
                        searchFile.push(item);
                    }
                }
                return searchFile;
            },

            checkOne(item) {
                //debugger;
                item.isChecked = !item.isChecked;
                console.log('item' + JSON.stringify(item));
            },

            checkAll(itemArr) {
                let allCheck = false;
                if (itemArr == this.noBindFile) {
                    this.isNoBindFileAllChecked = !this.isNoBindFileAllChecked;
                    allCheck = this.isNoBindFileAllChecked;
                } else {
                    this.isNoLoadFileAllChecked = !this.isNoLoadFileAllChecked;
                    allCheck = this.isNoLoadFileAllChecked;
                }

                for (let i = 0; i < itemArr.length; ++i) {
                    let file = itemArr[i];
                    file.isChecked = allCheck;
                }
            },

            refresh() {
                this.nodeId = null;
                var uuid = this.uuid;
                var items = this.items = [];
                var assetVal = this.assetVal = new Map();

                Editor.assetdb.queryAssets(null, 'script', function (err, scenes) {
                    scenes.forEach(function (scene) {
                        assetVal.set(scene.uuid, scene);
                        items.push({
                            scene: scene.uuid,
                            path: scene.url,
                            uuid: scene.uuid,
                            nodeId: ''
                        });
                    });
                });
            },

            _parsingRoot() {
                let dirArr = ['AutoPacakge'];
                if (this.REMOTE_SERVER_ROOT.length > 0) {
                    let root = this.REMOTE_SERVER_ROOT.replace(/\/\//g, '/');

                    let arr = root.split('/');

                    if (arr.length > 2) {
                        arr.splice(0, 2);
                        dirArr = dirArr.concat(arr);
                    }
                }

                let dirPath = '';
                for (let i = 0; i < dirArr.length; i++) {
                    dirPath += dirArr[i] + '/';
                }

                this.OutRoot = Path.join(buildPath, dirPath);
                this.mkDir(this.OutRoot);

                this.disDir(this.showItems, this.OutRoot, '', 0);
                this.doSort();
            },

            doSort() {
                this._doSort(this.showItems);
            },

            _doSort(arr) {
                arr.sort((a, b) => {
                    return a.size > b.size ? -1 : a.size < b.size ? 1 : 0;
                });
            },

            //处理目录
            disDir(fileArr, prePath) {
                const globby = Editor.require('globby');
                let pattern = Path.join(prePath, "**/*.*");
                let results = globby.sync([pattern]);

                for (let i = 0; i < results.length; i++) {
                    let fileName = results[i];
                    // 过滤
                    if (ignoreName.indexOf(fileName) === -1) {
                        // 单个文件
                        let size = this.getFileSize(fileName);
                        this.allSize += size;

                        fileName = fileName.substring(prePath.length);
                        if (fileName.indexOf('res/') === 0) {

                            let names = fileName.split('/');
                            let name = names[names.length - 1];

                            fileArr.push({ name: name, path: fileName, size: size, isSelect: false });
                        }
                        //Editor.log(newPath, size, this.allSize);              
                    }
                }
                this._doSort(fileArr);
            },

            findAllFiles(fileArr) {
                //let repeatInfo = this.repeatInfo = [];
                Editor.assetdb.queryAssets(null, null, function (err, files) {
                    files.forEach(function (file) {
                        if (file.url.indexOf('db://internal') !== -1) return;
                        let names = file.url.split('/');
                        let name = names[names.length - 1];

                        fileArr.push({ fileName: name, path: file.url })
                    });
                });
            },

            //获得文件的大小
            getFileSize(path) {
                var stat = fs.lstatSync(path);
                return stat && stat.size || 0;
            },

            jumpRes(uuid) {
                Editor.Ipc.sendToAll('assets:hint', uuid);
            },

            jumpResByUrl(url) {
                console.log('文件跳转');
                let uuid = Editor.assetdb.remote.urlToUuid(url);
                Editor.Ipc.sendToAll('assets:hint', uuid);
                Editor.Selection.select('asset', uuid, true);
            },

            //通过绝对路径跳转
            jumpResByFsPath(path) {
                let uuid = Editor.assetdb.remote.fspathToUuid(path);
                Editor.Ipc.sendToAll('assets:hint', uuid);
                Editor.Selection.select('asset', uuid, true);
            },

            jumpScene(uuid, nodeId) {
                this.nodeId = nodeId;
                Editor.Ipc.sendToMain('prefab:open-by-uuid', uuid);
            },
            /**
             *  合并uuid为一个, 项目中找到的uuid都替换掉
             * @param {*} uuid 
             * @param {*} uuidArray 
             */
            mergeUuid(uuid, uuidArray) {

            },

            /**
             * 删除所有uuid文件
             * @param {[uuid]} uuidArr 
             */
            delUuidArr(uuidArr) {

            },
            /**
             * 删除所有无效的uuid
             * 在prefab和scene中找
             */
            findInvalidUUid(isDel) {
                isDel = isDel == true;
                var self = this;
                this.items = this.items || [];
                if (!isDel) {
                    this.items = [];
                }

                let findArr = ['prefab', 'scene'];
                Editor.assetdb.queryAssets(null, findArr, function (err, scenes) {
                    scenes.forEach(function (scene) {
                        let len = self.items.length;
                        var data = fs.readFileSync(scene.path, 'utf8');
                        data = JSON.parse(data);
                        let keyArr = [];
                        self._findInvalidUUid(data, scene.url, keyArr, isDel);
                        if (len != self.items.length && isDel) {

                            data = JSON.stringify(data);
                            Editor.assetdb.saveExists(scene.url, data);
                        }
                    });
                });

            },
            _findInvalidUUid(data, dataName, keyArr, isDel) {
                if (data == null) return;

                if (data['__uuid__'] != undefined) {
                    let isE = Editor.remote.assetdb.existsByUuid(data['__uuid__']);
                    if (!isE) {
                        if (Object.keys(data).length == 1) {
                            let keyArrStr = JSON.stringify(keyArr);
                            if (isDel) {
                                return this.items.some((val, index) => {
                                    if (val.keyArr == keyArrStr) {
                                        this.items.splice(index, 1);
                                        return true;
                                    }
                                })
                            }
                            else {
                                this.items.push({
                                    keyArr: keyArrStr,
                                    path: dataName,
                                    nodeId: data['__uuid__']
                                })
                            }

                            return false;
                        }
                        else {
                            console.log('uuid节点特殊数据', JSON.stringify(data));
                        }
                    }

                }

                for (let key in data) {
                    if (typeof (data[key]) == 'object' || Array.isArray(data[key])) {
                        keyArr.push(key);
                        if (this._findInvalidUUid(data[key], dataName, keyArr, isDel)) {
                            data[key] = null;
                        }
                        keyArr.pop();
                    }
                }

                return false;
            },
            /**
             * 删除所有无效的uuid
             * 在prefab和scene中找
             */
            delInvalidUuid() {
                this.findInvalidUUid(true);
            },


            /**
             * 删除对应的items
             * @param {} item 
             */
            delItem(item, itemArr) {
                let operateArr = itemArr || this.items;
                operateArr.forEach((val, index) => {
                    if (val == item) {
                        operateArr.splice(index, 1);
                        return true;
                    }
                });
            },

            //删除已经不是重复文件的文件
            deleteNoRepeatFile(fileName){
                for(let i = 0; i < this.repeatInfo.length; ++i){
                    if(this.repeatInfo[i].fileName == fileName){
                        this.repeatInfo.splice(i,1);
                        return ;
                    }
                }
            },

            getImgRect(url) {

                url = this.getTexUrl(url);

                let data = this.imgSizeInfo[url];
                if (data) {
                    return data.width + 'x' + data.height;
                }
                else {
                    let path = Editor.assetdb.remote.urlToFspath(url);
                    let val = Sharp(path);
                    val.metadata((res, vv) => {
                        if (vv) {
                            this.imgSizeInfo[url] = { width: vv.width, height: vv.height };
                        }
                    });

                    return '';
                }


            },

            getImgUrl(url, isUrl = false) {
                url = this.getTexUrl(url);
                if(isUrl){
                    url = Editor.assetdb.remote.urlToFspath(url);
                    console.log(url);
                }
                return url;
            },
            /**
             * 去除 ddd.png/ddd中的 /ddd
             */
            getTexUrl(url) {
                if (url) {
                    let arr = url.split('/');
                    if (arr.length > 0) {
                        let len = arr[arr.length - 1].length;
                        if (url.lastIndexOf('.') < url.lastIndexOf('/')) {
                            url = url.substring(0, url.length - len - 1);
                        }
                    }
                }

                return url;
            },

            /**
             * 查找重复文件
             *
             */
            findRepeatFiles() {
                this.funcIndex = 2;
                let repeatInfo = this.repeatInfo = [];
                let findArr = ['sprite-frame'];
                let pathMap = {};
                let customIgnore = this.splitInput(this.input);
                Editor.assetdb.queryAssets(null, findArr, function (err, files) {
                    files.forEach(function (file) {
                        if (file.url.indexOf('db://internal') !== -1) return;
                        for (let i = 0; i < customIgnore.length; i++) {
                            if (file.url.indexOf(customIgnore[i]) !== -1) {
                                return;
                            }
                        }

                        let names = file.url.split('/');
                        let name = names[names.length - 1];
                        if (pathMap[name] === undefined) {
                            pathMap[name] = [];
                        }
                        pathMap[name].push(file.url);
                    });

                    for (let name in pathMap) {
                        let path = pathMap[name];
                        if (path.length <= 1) continue;
                        repeatInfo.push({
                            fileName: name,
                            path: pathMap[name]
                        })
                    }

                    if (repeatInfo.length === 0) {
                        repeatInfo.push({
                            fileName: '未找到重复文件',
                            path: []
                        })
                    }
                });
            },

            splitInput(str) {
                if (!str) {
                    return [];
                }
                return str.split(',');
            },

            /**
             * 删除重复文件
             */
            deleteRepeatFile(fileName, url, oldUuid, isDel = true) {
                oldUuid = oldUuid || Editor.assetdb.remote.urlToUuid(url);
                let firstPath = this.getFirstPath(fileName, url);
                if (firstPath) {
                    let newUuid = Editor.assetdb.remote.urlToUuid(firstPath);
                    Editor.log('uuid替换 oldUuid=', oldUuid, ' newUuid =', newUuid);
                    this.replaceNewUuid(oldUuid, newUuid);
                    if (isDel) {
                        this.removeRepeatFile(url);
                    }
                } else {
                    console.log('不能删除最后一个');
                }
            },

            // 删除点击的文件
            onDeleteClick(fileName, url) {
                let oldUuid = Editor.assetdb.remote.urlToUuid(url);
                let texUrl = this.getTexUrl(url);
                let oldTexUuid = Editor.assetdb.remote.urlToUuid(texUrl);

                this.deleteRepeatFile(fileName, url, oldUuid);
                // 不重复删除
                this.deleteRepeatFile(fileName, this.getTexUrl(url), oldTexUuid, false);
                this.deleteNoRepeatFile(fileName); //删除其中一项，变为不重复文件，则不显示
            },

            replaceNewUuid(oldUuid, newUuid) {
                let changeData = {};
                let needDeleteFile = [];
                let reg = new RegExp(`"${oldUuid}"`, 'g');
                Editor.assetdb.queryAssets(
                    null,
                    ['animation-clip', 'prefab', 'scene'],
                    (err, files) => {
                        files.forEach((file) => {
                            if (file.url.indexOf('db://internal') !== -1) return;
                            let fileData;
                            try {
                                fileData = fs.readFileSync(file.path, 'utf-8');
                            } catch (e) {
                                console.error(e);
                                return;
                            }

                            // if(fileData.indexOf(oldUuid) !== -1){
                            //     console.log('find');
                            // }

                            if (fileData && fileData.search(reg) !== -1) {
                                console.log('发现可替换 uuid, ' + file.url);
                                let repeatStr = fileData.replace(reg, `"${newUuid}"`);
                                changeData[file.url] = repeatStr;
                            }
                        });

                        this.changeFileData(changeData);
                    }
                )
            },

            changeFileData(changeData) {
                if (!changeData) return;
                for (let path in changeData) {
                    if (!changeData.hasOwnProperty(path)) continue;
                    Editor.assetdb.saveExists(path, changeData[path], (err, meta) => {
                        if (err) {
                            console.error('资源替换失败 ', err);
                            return;
                        }
                        console.log('替换资源成功!如果已打开界面需要重新打开界面! ' + path);
                    });
                }
            },

            getFirstPath(fileName, ignorePath) {
                let pathList = this.getPathListByName(fileName);
                let firstPath = null;
                for (let i = 0; i < pathList.length; i++) {
                    if (pathList[i] !== ignorePath) {
                        firstPath = pathList[i];
                        break;
                    }
                }
                return firstPath;
            },

            getPathListByName(fileName) {
                for (let i = 0; i < this.repeatInfo.length; i++) {
                    let item = this.repeatInfo[i];
                    if (item.fileName === fileName) {
                        return item.path;
                    }
                }
            },

            removeRepeatInfoByUrl(url) {
                for (let i = 0; i < this.repeatInfo.length; i++) {
                    let pathList = this.repeatInfo[i].path;
                    let idx = pathList.indexOf(url);
                    if (idx !== -1) {
                        pathList.splice(idx, 1);
                        return;
                    }
                }
            },

            removeRepeatFile(url) {
                this.removeRepeatInfoByUrl(url);
                let textureUrl = this.getPicUrl(url);
                Editor.assetdb.delete([textureUrl], (err, results) => {
                    if (err) {
                        console.error('资源删除失败 ' + textureUrl);
                        return;
                    }
                    console.log('资源已删除 ' + textureUrl);
                    let content = '删除重复文件成功 ' + textureUrl + ' 操作时间 ' +  new Date().toLocaleString() + '\n';
                    this.printLog(content);
                });
            },

            getPicUrl(url) {
                let adb = Editor.assetdb;
                let meta = adb.remote.loadMeta(url);
                let picUrl = adb.remote.uuidToUrl(meta.rawTextureUuid);
                return picUrl;
            },

            /**
             * 移除一个文件夹
             *
             * @param {*} url
             */
            // removeRepeatDir(url){
            //     let index = url.lastIndexOf('/',url.lastIndexOf('/')-1);
            //     url = url.substring(0,index);
            //     cc.log('url',url);
            //
            //     let repeatInfo = this.repeatInfo || {};
            //     for(let key in repeatInfo){
            //
            //     }
            // },

        }
    });
};

Editor.Panel.extend({
    template: fs.readFileSync(PATH.html, 'utf-8'),
    style: fs.readFileSync(PATH.style, 'utf-8'),

    $: {
        'warp': '#warp'
    },

    ready() {
        this.vm = createVM(this.$warp);
    },
    // ipc
    messages: {
        'scene:ready'() {
            var id = this.vm.nodeId;
            if (id) {
                setTimeout(function () {
                    Editor.Selection.select('node', id);
                    Editor.Ipc.sendToAll('hierarchy:hint', id);
                }, 500);
            }
            this.nodeId = null;
        }
    }
});
