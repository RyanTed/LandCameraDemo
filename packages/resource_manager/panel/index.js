/*
 * @Author: eycode
 * @Date: 2021-08-04 11:12:11
 * @LastEditTime: 2021-08-09 18:50:21
 * @LastEditors: eycode
 * @Description: 
 * @Other: 
 */

/** 包名 */
const PACKAGE_NAME = 'resource_manager';

/**项目路径 */
const ProjectPath = Editor.Project.path;

const Fs = require('fs');
const Path = require('path');
const sizeOf = Editor.require('packages://' + PACKAGE_NAME + '/node_modules/image-size');

/**项目资源目录 */
const AssetsPath = Path.join(ProjectPath, 'assets');

Editor.Panel.extend({
    // 导入css文件
    style: Fs.readFileSync(Editor.url('packages://' + PACKAGE_NAME + '/panel/index.css', 'utf8')),

    // 导入html文件
    template: Fs.readFileSync(Editor.url('packages://' + PACKAGE_NAME + '/panel/index.html', 'utf8')),

    messages: {
        'file_path': function (event, path) {
            Fs.stat(path, (err, stats) => {
                if (err) {
                    return Editor.log('file_err', err);
                };

                // 获取对应的类型
                let fileList = [];
                if (stats.isFile()) {
                    // 获取该文件的大小，单位Kb
                    const fileSize = Math.round(stats.size / 1024) + 'KB';
                    fileList.push(this.getFileInfo(path, fileSize));

                    // 根据类型类判断展示的方式
                    this.app.isDir = false;
                    this.app.isFile = true;
                    this.app.isBack = false;
                } else {
                    // 是目录，并获取这个目录下的所有文件和目录
                    Fs.readdir(path, (err, files) => {
                        files.forEach((file) => {
                            const filePath = Path.join(path, file);
                            const data = this.getFileInfo(filePath);
                            if (data) fileList.push(this.getFileInfo(filePath));
                        });
                    });

                    // 根据类型类判断展示的方式
                    this.app.isDir = true;
                    this.app.isFile = false;

                    // 获取目录路径
                    this.app.dirPath = path;

                    // 上一级
                    if (AssetsPath == path) {
                        this.app.isBack = false;
                    } else {
                        this.app.isBack = true;
                    };
                };

                this.app.fileList = fileList;
            });
        },
    },

    /**
     * : 获取文件信息
     * @param {*} path 文件路径
     * @return {*}
     */
    getFileInfo(path, size = 0) {
        // 根据文件的类型来判断文件展示的路径
        const fileType = Path.extname(path);
        const filepath = this.getFilePath(fileType);

        // 获取该文件的uuid
        const fileUuid = Editor.remote.assetdb.fspathToUuid(path);

        // 如果是图片，则获取其分辨率数据
        let resolution = "";
        if (filepath === 'img') { const img = sizeOf(path); resolution = img.width + 'x' + img.height; };

        // 非meta资源
        if (filepath !== 'meta') {
            return {
                name: Path.basename(path),
                icon: filepath === 'img' ? path : filepath,
                path: path,
                uuid: fileUuid,
                size: size,
                resolution: resolution,
                type: fileType
            }
        };

        return false;
    },

    ready() {
        this.app = new window.Vue({
            el: this.shadowRoot,
            data: {
                filePath: "",
                fileList: [],

                // 是否是文件
                isFile: false,

                // 是否是目录
                isDir: false,

                // 上一级icon
                backIcon: Editor.url('packages://' + PACKAGE_NAME + '/icon/goback.png', 'utf8'),

                // 当前的目录路径
                dirPath: "",

                // 支持返回上一级
                isBack: false,
            },

            methods: {
                /**
                 * : 选择文件
                 * @param {*} event
                 * @return {*}
                 */
                selectFile(event, item) {
                    Editor.Ipc.sendToAll('assets:hint', item.uuid);

                    // 向panel面板发送事件
                    Editor.Ipc.sendToPanel(PACKAGE_NAME, 'file_path', item.path);
                },

                /**
                 * : 返回上一级
                 * @param {*}
                 * @return {*}
                 */
                gobackBtn() {
                    // 获取上一级的目录路径
                    const path = Path.resolve(this.dirPath, '..');

                    // 最高到项目的父目录
                    Editor.Ipc.sendToPanel(PACKAGE_NAME, 'file_path', path);
                },

                /**
                 * : 拖拉开始
                 * @param {*} event
                 * @param {*} item
                 * @return {*}
                 */
                dragstart(event, item) {
                    event.stopPropagation();
                    Editor.UI.DragDrop.start(event.dataTransfer, {
                        buildImage: !0,
                        effect: "copyMove",
                        type: "asset",
                        items: [{
                            id: item.uuid,
                            name: item.name
                        }]
                    })
                },

                /**
                 * : 结束拖拉
                 * @param {*}
                 * @return {*}
                 */
                dragend() {
                    Editor.UI.DragDrop.end();
                },
            },
        });
    },

    /**
     * : 获取文件路径
     * @param {*} type 文件后缀
     * @return {*}
     */
    getFilePath(type) {
        if (type === '.meta') {
            // 资源
            return 'meta';
        };

        if (!type) {
            // 目录
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/mulu.png', 'utf8');
        }

        if (type === '.png' || type === '.jpg') {
            // 图片
            return 'img';
        };

        if (type === '.mp3' || type === '.wma') {
            // 音频
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/bgm.png', 'utf8');
        };

        if (type === '.ts' || type === '.js') {
            // 脚本
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/jiaoben.png', 'utf8');
        };

        if (type === '.pac') {
            // 图集
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/tuji.png', 'utf8');
        };

        if (type === '.fire') {
            // 场景
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/changjing.png', 'utf8');
        };

        if (type === '.json') {
            // json文件
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/json.png', 'utf8');
        };

        if (type === '.prefab') {
            // 预制体
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/prefab.png', 'utf8');
        };

        if (type === '.plist') {
            // 粒子效果
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/plist.png', 'utf8');
        };

        if (type === '.anim') {
            // 动画
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/anim.png', 'utf8');
        };

        if (type === '.fnt' || type === '.ttf') {
            // 字体
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/fnt.png', 'utf8');
        };

        if (type === '.effect') {
            // effect
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/effect.png', 'utf8');
        }

        if (type === '.mtl') {
            // 材质
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/mtl.png', 'utf8');
        }

        if (type === '.fbx' || type === '.gltf') {
            // 模型
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/fbx.png', 'utf8');
        }

        if (type === '.mesh') {
            // 纹理
            return Editor.url('packages://' + PACKAGE_NAME + '/icon/mesh.png', 'utf8');
        }
    },
});