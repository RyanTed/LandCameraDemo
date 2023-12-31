const fetch = require('./node-fetch');

/**
 * 更新器
 */
const Updater = {

    /**
     * 远端地址
     * @type {string}
     */
    remoteUrl: 'https://gitee.com/mcv/simple-code-describe',

    /**
     * 获取远端的 package.json
     * @returns {Promise<object>}
     */
    async getRemotePackageJson() {
        const packageJsonUrl = `${this.remoteUrl}/raw/master/package.json`;
        // 发起网络请求
        const response = await fetch(packageJsonUrl, {
            method: 'GET',
            cache: 'no-cache',
            mode: 'no-cors',
        });
        // 请求结果
        if (response.status !== 200) {
            return null;
        }
        // 读取 json
        const json = response.json();
        return json;
    },

    async getRemoteDesc() {
        const descUrl = `${this.remoteUrl}/raw/master/README.md`;
        // 发起网络请求
        const response = await fetch(descUrl, {
            method: 'GET',
            cache: 'no-cache',
            mode: 'no-cors',
        });
        // 请求结果
        if (response.status !== 200) {
            return '';
        }
        const text = response.text();
        return text;
    },
    /**
     * 获取远端版本号
     * @returns {Promise<string>}
     */
    async getRemoteVersion() {
        const package = await this.getRemotePackageJson();
        if (!package) {
            return null;
        }
        const version = package.version || null;
        return version;
    },

    /**
     * 获取本地版本号
     * @returns {string}
     */
    getLocalVersion() {
        return require('../package.json').version;
    },

    /**
     * 拆分版本号
     * @param {string} version 版本号文本
     * @returns {number[]}
     * @example
     * splitVersionString('1.2.0');  // [1, 2, 0]
     */
    splitVersionString(version) {
        return (
            version.replace(/-/g, '.')
                .split('.')
                .map(v => (parseInt(v) || 0))
        );
    },

    /**
     * 对比版本号
     * @param {string} a 版本 a
     * @param {string} b 版本 b
     * @returns {-1 | 0 | 1}
     * @example
     * compareVersion('1.0.0', '1.0.1');    // -1
     * compareVersion('1.1.0', '1.1.0');    // 0
     * compareVersion('1.2.1', '1.2.0');    // 1
     * compareVersion('1.2.0.1', '1.2.0');  // 1
     */
    compareVersion(a, b) {
        const acs = this.splitVersionString(a),
            bcs = this.splitVersionString(b);
        const count = Math.max(acs.length, bcs.length);
        for (let i = 0; i < count; i++) {
            const ac = acs[i],
                bc = bcs[i];
            // 前者缺少分量或前者小于后者
            if (ac == null || ac < bc) {
                return -1;
            }
            // 后者缺少分量或前者大于后者
            if (bc == null || ac > bc) {
                return 1;
            }
        }
        return 0;
    },

    /**
     * 检查远端是否有新版本
     * @returns {Promise<boolean>}
     */
    async check() {
        // 远端版本号
        const remoteVersion = await this.getRemoteVersion();
        if (!remoteVersion) {
            return '';
        }
        // 本地版本号
        const localVersion = this.getLocalVersion();
        // 对比版本号
        const result = this.compareVersion(localVersion, remoteVersion);
        const remoteDesc = await this.getRemoteDesc() || '';
        return (result < 0) ? remoteDesc : '';
    },

};

module.exports = Updater;
