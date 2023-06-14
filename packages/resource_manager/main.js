/*
 * @Author: eycode
 * @Date: 2021-08-04 10:48:46
 * @LastEditTime: 2021-08-09 16:00:44
 * @LastEditors: eycode
 * @Description: 
 * @Other: https://juejin.cn/post/6844903641594216455#heading-17
 */

// 包名
const PACKAGENAME = 'resource_manager';
module.exports = {

    load() {},

    unload() {},

    messages: {
        'open' () {
            Editor.Panel.open('resource_manager');
        },
        'selection:selected' (event, type, uuid) {
            if (type === 'asset') {
                // 获取绝对路径
                const path = Editor.assetdb.uuidToFspath(uuid[0]);

                // 向panel面板发送事件
                Editor.Ipc.sendToPanel('resource_manager', 'file_path', path);
            }
        },
    },
}