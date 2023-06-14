const ConfigManager = require('./config-manager');
const { BrowserWindow, ipcMain } = require('electron');

/** 包名 */
const PACKAGE_NAME = 'ccc-quick-add-component';

/**
 * i18n
 * @param {string} key
 * @returns {string}
 */
const translate = (key) => Editor.T(`${PACKAGE_NAME}.${key}`);

/** 扩展名 */
const EXTENSION_NAME = translate('name');

module.exports = {

  /**
   * 搜索栏实例
   * @type {BrowserWindow}
   */
  searchBar: null,

  /**
   * 缓存
   * @type {string[]}
   */
  cache: null,

  /**
   * 扩展消息
   * @type {{ [key: string]: Function }}
   */
  messages: {

    /**
     * 打开搜索面板
     */
    'open-search-panel'() {
      if (this.getSelectedNodeUuids().length === 0) {
        Editor.log(`[${EXTENSION_NAME}]`, translate('nodeError'));
        return;
      }
      this.openSearchBar();
    },

    /**
     * 打开设置面板
     */
    'open-setting-panel'() {
      Editor.Panel.open(`${PACKAGE_NAME}.setting`);
    },

    /**
     * 读取配置
     * @param {any} event 
     */
    'read-config'(event) {
      const config = ConfigManager.read();
      event.reply(null, config);
    },

    /**
     * 保存配置
     * @param {any} event 
     * @param {any} config 
     */
    'save-config'(event, config) {
      ConfigManager.save(config);
      event.reply(null, true);
    },

  },

  /**
   * 生命周期：加载
   */
  load() {
    // 监听事件
    ipcMain.on(`${PACKAGE_NAME}:match-keyword`, this.onMatchKeywordEvent.bind(this));
    ipcMain.on(`${PACKAGE_NAME}:add-component`, this.onAddComponentEvent.bind(this));
    ipcMain.on(`${PACKAGE_NAME}:close`, this.onCloseEvent.bind(this));
  },

  /**
   * 生命周期：卸载
   */
  unload() {
    // 取消事件监听
    ipcMain.removeAllListeners(`${PACKAGE_NAME}:match-keyword`);
    ipcMain.removeAllListeners(`${PACKAGE_NAME}:add-component`);
    ipcMain.removeAllListeners(`${PACKAGE_NAME}:close`);
  },

  /**
   * （渲染进程）关键词匹配事件回调
   * @param {*} event 
   * @param {string} keyword 关键词
   */
  async onMatchKeywordEvent(event, keyword) {
    // 查找匹配关键词的组件
    const results = await this.getMatchComponents(keyword);
    event.reply(`${PACKAGE_NAME}:match-keyword-reply`, results);
  },

  /**
   * （渲染进程）添加组件事件回调
   * @param {*} event 
   * @param {string} name 组件名称
   */
  onAddComponentEvent(event, name) {
    // 获取当前选中节点 uuid
    const uuids = this.getSelectedNodeUuids();
    if (uuids.length === 0) {
      Editor.log(`[${EXTENSION_NAME}]`, translate('nodeError'));
      return;
    }
    // 调用场景脚本添加组件
    const data = { uuids, name };
    Editor.Scene.callSceneScript(PACKAGE_NAME, 'add-component', data, (error) => {
      event.reply(`${PACKAGE_NAME}:add-component-reply`);
    });
  },

  /**
   * （渲染进程）关闭事件回调
   * @param {*} event 
   */
  onCloseEvent() {
    this.closeSearchBar();
  },

  /**
   * 当前选中的节点 UUID
   */
  getSelectedNodeUuids() {
    // curGlobalActivate 只能获取单个选择
    // Editor.Selection.curGlobalActivate();
    return Editor.Selection.curSelection('node');
  },

  /**
   * 展示搜索栏
   */
  openSearchBar() {
    // 已打开则关闭
    if (this.searchBar) {
      this.closeSearchBar();
      return;
    }
    // 创建窗口
    const winSize = [500, 600],
      winPos = this.getPosition(winSize),
      win = this.searchBar = new BrowserWindow({
        width: winSize[0],
        height: winSize[1],
        x: winPos[0],
        y: winPos[1],
        frame: false,
        resizable: false,
        skipTaskbar: true,
        alwaysOnTop: true,
        transparent: true,
        opacity: 0.95,
        backgroundColor: '#00000000',
        hasShadow: false,
        show: false,
        webPreferences: {
          nodeIntegration: true
        },
      });
    // 加载页面（并传递当前语言）
    const lang = Editor.lang;
    win.loadURL(`file://${__dirname}/panels/search/index.html?lang=${lang}`);
    // 调试用的 devtools（detach 模式需要将失焦自动隐藏关掉）
    // win.webContents.openDevTools({ mode: 'detach' });
    // 监听按键（ESC 关闭）
    win.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') {
        this.closeSearchBar();
      }
    });
    // 就绪后展示（避免闪烁）
    win.on('ready-to-show', () => win.show());
    // 展示后（缓存数据）
    win.on('show', async () => (this.cache = await this.getAllComponents()));
    // 失焦后（自动关闭）
    win.on('blur', () => this.closeSearchBar());
    // 关闭后（移除引用）
    win.on('closed', () => (this.searchBar = null));
  },

  /**
   * 隐藏搜索栏
   */
  closeSearchBar() {
    if (!this.searchBar) {
      return;
    }
    // 先隐藏
    // 在 2.4.5 版本中，扩展如果安装在局部，关闭搜索栏会引发编辑器闪退
    // 原因未知，修改为先隐藏再关闭就没问题了（离谱）
    this.searchBar.hide();
    // 关闭
    this.searchBar.close();
    // 清除缓存
    this.cache = null;
  },

  /**
   * 获取窗口位置
   * @param {[number, number]} size 窗口尺寸
   * @returns {[number, number]}
   */
  getPosition(size) {
    // 根据编辑器窗口的位置和尺寸来计算
    const editorWin = BrowserWindow.getFocusedWindow(),
      editorSize = editorWin.getSize(),
      editorPos = editorWin.getPosition(),
      // 需要注意一个问题：窗口的位置值必须是整数，否则修改不会生效
      // 毕竟像素应该是显示器上的最低单位了，合理
      x = Math.floor(editorPos[0] + (editorSize[0] / 2) - (size[0] / 2)),
      y = Math.floor(editorPos[1] + 200);
    return [x, y];
  },

  /**
   * 获取组件列表
   * @returns {Promise<string[]>}
   */
  getAllComponents() {
    return new Promise((res) => {
      // 调用场景脚本查找所有组件
      Editor.Scene.callSceneScript(PACKAGE_NAME, 'get-all-components', (error, results) => {
        res(results);
      });
    });
  },

  /**
   * 获取匹配关键词的组件
   * @param {string} keyword 关键词
   * @returns {Promise<{ name: string, similarity: number }[]>}
   */
  getMatchComponents(keyword) {
    return new Promise(async (res) => {
      const results = [];
      let cache = this.cache;
      // 是否有缓存
      if (!cache || cache.length === 0) {
        // 再次获取全部组件并缓存
        cache = this.cache = await this.getAllComponents();
      }
      // 查找并匹配
      if (cache && cache.length > 0) {
        // 正则匹配（每个关键字之间可以有任意个字符，且不区分大小写）
        const pattern = keyword.split('').join('.*'),
          regExp = new RegExp(pattern, 'i');
        // 下面这行正则插入很炫酷，但是性能不好，耗时接近 split + join 的 10 倍
        // const pattern = keyword.replace(/(?<=.)(.)/g, '.*$1');
        for (let i = 0, l = cache.length; i < l; i++) {
          const name = cache[i];
          // 匹配
          if (regExp.test(name)) {
            const similarity = name.match(regExp)[0].length;
            results.push({ name, similarity });
          }
        }
        // 排序（similarity 越小，匹配的长度越短，匹配度越高）
        results.sort((a, b) => a.similarity - b.similarity);
      } else {
        Editor.warn(`[${EXTENSION_NAME}]`, translate(`${PACKAGE_NAME}.dataError`));
      }
      // Done
      res(results);
    });
  },

}
