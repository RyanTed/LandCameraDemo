const fs = require('fs');
const path = require('path');
const FileHelper = Editor.require('packages://assetcleaner/cleanUtil/FileHelper')
const Utils = Editor.require('packages://assetcleaner/cleanUtil/Utils');
let projectPath = Editor.projectPath || (Editor.Project && Editor.Project.path);

let AssetSize = {
    fileMap: null,

    start(sourceFile) {
        if (!sourceFile || sourceFile.length <= 0) {
            console.error('Cleaner: invalid source or dest');
            return;
        }

        this.fileMap = new Map();

        sourceFile = FileHelper.getFullPath(sourceFile);

        this.lookupAssetDir(sourceFile, null);

        let result = this.getSortedResult(this.fileMap, sourceFile);
        return result;
    },

    // 遍历文件夹
    lookupAssetDir(srcDir, callback) {
        if (!srcDir || !fs.existsSync(srcDir)) {
            console.error("AssetSize: invalid srcDir=" + srcDir);
            return;
        }
        let files = fs.readdirSync(srcDir);
        for (let i = 0, len = files.length; i < len; i++) {
            let file = files[i];
            let curPath = path.join(srcDir, file);
            let stats = fs.statSync(curPath);

            if (stats.isDirectory()) {
                this.lookupAssetDir(curPath);
                continue;
            }

            let pathObj = path.parse(curPath);
            let value = this.fileMap.get(pathObj.ext);
            if (!value) {
                value = new Map();
                this.fileMap.set(pathObj.ext, value);
            }
            let memBytes = FileHelper.getImageMem(curPath, pathObj.ext);
            value.set(curPath, { path: curPath, size: stats.size, memBytes });
        }
    },

    //文件从大到小排序
    getSortedResult(fileMap, srcDir) {
        let allFile = [];
        fileMap.forEach((files, ext) => {
            let { totalSize, totalMem, contentFile } = this.formatByByte(files);
            allFile.push({ size: parseFloat(totalSize), mem: parseFloat(totalMem), ext, count: files.size, contentFile: contentFile });
        });

        allFile.sort(function (a, b) {
            return b.size - a.size;
        });

        return allFile;
    },

      //获得文件统计信息
      getFileInfo(allFile, ext = '.all') {
        // 输出汇总
        if (allFile.length <= 0) return '暂无文件信息';
        let allSize = 0;
        let content = '';
        for (let i = 0; i < allFile.length; i++) {
            if (ext != '.all' && allFile[i].ext != ext) continue;
            let data = allFile[i];
            content += '类型=' + data.ext + ', 个数=' + data.count + ', 占用空间=' + data.size + 'MB';
            if (data.mem > 0) {
                content += ', 预计内存=' + data.mem + 'MB';
            }
            content += '\n';
            allSize += data.size;
        }

        let searchPath = path.join(projectPath, 'assets');
        let totalStr = '总空间=' + allSize.toFixed(4) + 'MB, ' + '目录=' + searchPath + '\n\n';
        totalStr += content + '\n';

        var reg = new RegExp("\n", "g");
        let result = totalStr.replace(reg, "<br>");
        totalStr = result;
        return totalStr;
    },


    // 格式化为从大到小按MB表示
    formatByByte(files) {
        let totalSize = 0;
        let totalMem = 0;
        let newFiles = [];

        files.forEach(function (file, path) {
            totalSize += file.size;
            totalMem += file.memBytes;
            newFiles.push(file);
        });

        // 按占用空间从大到小排序
        newFiles.sort(function (a, b) {
            return b.size - a.size;
        });

        let outStr = '';
        let contentFile = [];
        for (let i = 0, len = newFiles.length; i < len; i++) {
            let file = newFiles[i];
            let size = Utils.byte2KbStr(file.size);
            outStr += '空间=' + Utils.byte2KbStr(file.size) + 'KB, 文件=' + file.path;
            contentFile.push({ size: size, path: file.path });
            if (file.memBytes > 0) {
                outStr += ', 内存=' + Utils.byte2MbStr(file.memBytes) + 'MB';
            }
            outStr += '\n';
        }


        totalSize = Utils.byte2MbStr(totalSize);
        totalMem = Utils.byte2MbStr(totalMem);
        return { totalSize, totalMem, contentFile };
    },

};

module.exports = AssetSize;

