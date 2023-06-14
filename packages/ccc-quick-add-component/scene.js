module.exports = {

    /**
     * 获取所有组件
     * @param {*} event 
     */
    'get-all-components': function (event) {
        // 获取所有组件
        const components = getAllComponents();
        // 返回结果给主进程
        event.reply(null, components);
    },

    /**
     * 添加组件
     * @param {*} event 
     * @param {{ uuids: string[], name: string }} data 数据
     */
    'add-component': function (event, data) {
        // 获取组件 id
        const id = getComponentId(data.name);
        if (!id) {
            event.reply(null);
            return;
        }
        // 添加组件到节点
        Editor.Ipc.sendToPanel('scene', 'scene:add-component', data.uuids, id);
        event.reply(null);
    },

}

/**
 * 获取所有组件
 * @returns {string[]}
 */
function getAllComponents() {
    // 组件菜单数据
    const items = cc._componentMenuItems;
    // 组件名列表
    const components = items.map(item => cc.js.getClassName(item.component));
    return components;
}

/**
 * 获取组件 id
 * @param {string} name 组件名称
 * @returns {string}
 */
function getComponentId(name) {
    const items = cc._componentMenuItems;
    for (let i = 0, l = items.length; i < l; i++) {
        const component = items[i].component;
        if (cc.js.getClassName(component) === name) {
            return cc.js._getClassId(component);
        }
    }
    return null;
}
