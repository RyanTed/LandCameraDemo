// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: `
    :host { margin: 5px; }
    ui-asset { width: 100% }
    h2 { color: #f90; }
  `,

  // html template for panel
  template: `
    <h2>资源一键替换(基于assets目录)</h2>
    <hr />
    <div>资源选择</div>
    <br/>
    <div>旧资源：</div>
    <br/>
    <div class="layout horizontal" style="width: 100%">
      <div style="width: 40%"><ui-asset id="assetOld"  droppable="asset"></ui-asset></div>
      <span>　</span>
      <span>或 uuid：</span>
      <div style="width: 40%"><ui-input id="ipOldUuid" placeholder="未压缩的uuid" style="width: 100%"></ui-input></div>
    </div>

    <br/>
    <br/>
    <div>新资源：</div>
    <br/>
    <div class="layout horizontal" style="width: 100%">
      <div style="width: 40%"><ui-asset id="assetNew"  droppable="asset"></ui-asset></div>
      <span>　</span>
      <span>或 uuid：</span>
      <div style="width: 40%"><ui-input id="ipNewUuid" placeholder="未压缩的uuid" style="width: 100%"></ui-input></div>
    </div>
    <br/>
    

    <hr />
    <div>目录选择</div>
    <br/>
        包含的目录:  <ui-input id="ipIncludes" placeholder="asset 下需要替换资源引用的目录。例如：resources" style="width:80%"></ui-input>
    <br/>
    <br/>
        排除的文件:  <ui-input id="ipExcludes" placeholder="(以英文逗号进行分割的正则表达式。例如 .anim,.scene)" style="width:80%"></ui-input>
    <br/>
    <hr />
    <ui-button id="btn">开始替换</ui-button>
    <hr />
    <div id="divResult" style="display:block">结果: </div>
  `,

  // element and variable binding
  $: {
    btn: '#btn',
    divResult: '#divResult',
    ipIncludes: '#ipIncludes',
    ipExcludes: '#ipExcludes',
    ipOldUuid: '#ipOldUuid',
    ipNewUuid: '#ipNewUuid',
    assetOld: '#assetOld',
    assetNew: '#assetNew',
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    this.$btn.addEventListener('confirm', () => {
      var oldAssetId = this.$assetOld._value;
      var newAssetId = this.$assetNew._value;
      var includesValue = this.$ipIncludes._value;
      var excludesValue = this.$ipExcludes._value;
      var oldUuid = this.$ipOldUuid._value;
      var newUuid = this.$ipNewUuid._value;

      var value = {
        oldUuid: oldUuid,
        newUuid: newUuid,
        oldAssetId: oldAssetId,
        newAssetId: newAssetId,
        includesValue: includesValue,
        excludesValue: excludesValue,
      };

      Editor.Ipc.sendToMain('ggreplacer:clickReplace', value);
    });

    this.$divResult.style = "display:none;";
    this.$divResult.innerText = "";
  },

  // register your ipc messages here
  messages: {
    'ggreplacer:result' (event, value) {
        this.$divResult.style = "display:block;";
        this.$divResult.innerText = value.msg;
    }
  }
});