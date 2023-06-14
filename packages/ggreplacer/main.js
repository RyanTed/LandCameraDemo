'use strict';

var path = require('path');
var { readdir, stat, readFileSync, writeFileSync } = require("fs");
var { promisify } = require("util");

const aReadDir = promisify(readdir);
const aStat = promisify(stat);

module.exports = {
  load () {
    // execute when package loaded
  }, 

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    open () {
      Editor.Panel.open('ggreplacer');
    }, 

    'clickReplace' (_, value) {
      /** @type {string} */
      var exclude = value.excludesValue || '';
      /** @type {string} */
      var include = value.includesValue;
      /** @type {string} */
      var newAssetId = value.newAssetId || value.newUuid;
      /** @type {string} */
      var oldAssetId = value.oldAssetId || value.oldUuid;

      if (!oldAssetId || oldAssetId.length <= 0) {
        const str = '请选择旧资源 或 输入旧资源的 uuid!';
        sendPanelResult(str);
        return;
      }

      if (!newAssetId || newAssetId.length <= 0) {
        const str = '请选择新资源！';
        sendPanelResult(str);
        return;
      }

      if (newAssetId == oldAssetId) {
        const str = '不能选择同一资源';
        sendPanelResult(str);
        return;
      }

      var oldInfo = loadAssetInfo(oldAssetId);
      var newInfo = loadAssetInfo(newAssetId);

      var projectPath = getProjectPath();
      var assetsPath = path.join(projectPath, 'assets');
      var workPath = path.join(assetsPath, include || '');

      /** @type {RegExp[]} */
      var excludes = [];

      if (exclude.length > 0) {
        excludes = exclude.split(',').map(v => new RegExp(v));
      }

      var fileType = new CCFileType(workPath, excludes);
 
      fileType.load() 
        .then(v => {
          var filePaths = fileType.getFilePaths();
          if (!filePaths || !filePaths.length) {
            Editor.log(workPath);
            Editor.log('在该目录下，未找可能需要替换资源的文件！');
            return; 
          }
          
          return doReplaceFiles(filePaths, oldInfo.uuid, newInfo.uuid)
        })
        .then(filePaths => {
          if (filePaths.length > 0) {

            filePaths.forEach(path => {
                const dbUrl = Editor.assetdb.fspathToUrl(path);
                Editor.assetdb.refresh(dbUrl, (err, result) => {
                    if (err) {
                        log('替换成功，但刷新失败：', dbUrl, "错误：", err);
                    } else {
                        log('替换成功: ', dbUrl);
                    }
                });
            });

            Editor.Ipc.sendToPanel('ggreplacer', 'ggreplacer:result', {
                code: 0,
                msg: `替换了 ${filePaths.length} 个文件。\n如果有替换了正在编辑的场景/Prefab等刷新，请主动刷新。\n详情请见日志`
            });

          } else {
            Editor.log(workPath);
            Editor.log('在该目录下，未找到使用 ' + oldAssetId + ' 资源的文件！');

            Editor.Ipc.sendToPanel('ggreplacer', 'ggreplacer:result', {
                code: 0,
                msg: `未找到需要替换的文件`
            });
          }
        })
        .catch(e => { 
          Editor.error(e);
          Editor.Ipc.sendToPanel('ggreplacer', 'ggreplacer:result', {
            code: 1000,
            msg: `error: ${JSON.stringify(e)}`
        });
        });
    }
  },
};

function getProjectPath() {
  return Editor.projectPath || Editor.Project.path;
}


class CCFileType {
  getFilePaths() {return this._filePaths || [];}

  /**
   * 
   * @param {string} assetDir 
   * @param {RegExp[]} exclude
   */
  constructor(assetDir, exclude) {
    /**
     * @type {string[]} 
     */
    this._filePaths = [];
    /**
     * @type {RegExp[]}
     */
    this.exclude = exclude;
    this.assetDir = assetDir;
  }

  async load() {
    this._filePaths = await deepListDir(this.assetDir, {
        pattern: [/\\*.prefab$/, /\\*.fire$/, /\\*.anim$/],
        exclude: this.exclude,
    });
  }
}



/**
 * 
 * @param {string} dir 
 * @param {{pattern: RegExp[], exclude: RegExp[]}} options 
 * @returns {Promise<string[]>}
 */
async function deepListDir(dir, options) {
  /** @type {string[]} */
  let values = [];

  const files = await aReadDir(dir);
  for (let file of files) {
      const filePath = path.join(dir, file);
      
      const stat = await aStat(filePath);
      if (stat.isDirectory()) {
          const subs = await deepListDir(filePath, options);
          subs.forEach(v => values.push(v));
      } else {
          const patterns = options.pattern;
          const exclude = options.exclude || [];

          if (inRegs(filePath, exclude)) {
            continue;
          }

          for (let p of patterns) {
            if (p.test(filePath)) {
                values.push(filePath);
            }
          }
      }
  }

  return values;
}

/**
 * 
 * @param {string} str 
 * @param {RegExp[]} regs 
 */
function inRegs(str, regs) {
  if (!str || !regs || !regs.length) {
    return false;
  }

  for (let p of regs) {
    if (p.test(str)) {
      return true;
    }
  }  

  return false;
}

/**
 * 通过 uuid 加载其资源信息
 * @param {string} uuid 
 */
function loadAssetInfo(uuid) {
  var info = Editor.assetdb.assetInfoByUuid(uuid);
  if (!info.isSubAsset) {
    info = Editor.assetdb.subAssetInfosByUuid(uuid)[0] || info;
  }
  return info;
}

/**
 * 
 * @param {string[]} filePaths 
 * @param {string} oldUuid 
 * @param {string} newUuid 
 */
function doReplaceFiles(filePaths, oldUuid, newUuid) {
  const changedPaths = (filePaths || [])
    .map(file => doReplace(file, oldUuid, newUuid))
    .filter(path => path != null);

  return changedPaths;
}

/**
 * 开始替换
 * @param {string} filePath 
 * @param {string} oldUuid 
 * @param {string} newUuid 
 */
function doReplace(filePath, oldUuid, newUuid) {
  let str = readFileSync(filePath, {encoding: 'utf-8'});
  if (str.indexOf(oldUuid) < 0) {
    return null;
  }

  str = str.replace(new RegExp(oldUuid, 'gm'), newUuid);
  writeFileSync(filePath, str);
  return filePath;
}

function log(msg, ...subst) {
    Editor.log(msg, ...subst);
}

/**
 * 
 * @param {number} code 
 * @param {string} msg 
 */
function sendPanelResult(code, msg) {
    Editor.log(msg);
    Editor.Ipc.sendToPanel('ggreplacer', 'ggreplacer:result', {
        code: 0,
        msg: msg
    });
}