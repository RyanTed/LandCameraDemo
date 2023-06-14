## UI快捷切换工具所解决的问题
1、解决在编辑UI的时候需要根据不同的状态去显示；如：牌桌中2人、3人、4人玩法 座位特效位置等显示都不一样，一般情况下有两种解决方案
（1）将UI复制出3份，分别用在2人、3人、4人，然后在脚本中去切换，这种会导致预制变大很多，脚本量也不少。
（2）全部用脚本去改变需要改变节点的属性，这种则需要写大量脚本，而且cocoscreator没有预览结果你懂的。

UI快捷工具解决方案：
在状态列表中添加多个状态切换，在编辑器中将需要改变的节点放入修改列表，编辑完每个状态保存，可在编辑器中预览，运行时只需要一句脚本即可。

## 安装方法
1、下载插件到projectName/packages文件夹下
2、将projectName/packages/ui_switcher/ui_switcher.js脚本复制到projectName/assets下自己放脚本的文件夹（可随意）即安装完成

## 使用方法
1、将ui_switcher脚本挂在场景节点上即可开始编辑
2、工具分成2部分：状态列表和修改列表

状态列表：用户自定义多个状态，命名后可根据状态名切换否则只能根据状态index切换即(0、1、2...)，按钮+点击添加状态；左边选择框按钮点击切换状态；右边x按钮点击删除该状态
；右边勾按钮点击保存该状态

修改列表：按钮+点击添加；将需要修改状态的节点都拖入列表中；右边按钮x点击删除

脚本中调用
@property(UISwitcher)
switcher: UISwitcher = null
 1、 this.switcher.changeStateByIndex(0) //根据index切换到状态1
 2、 this.switcher.changeStateByName("状态2")//根据状态名切换到状态2


## 注意事项
1、暂时支持修改的节点属性包括：active、position、rotation、scale、anchor、size、color、opacity

2、暂时修改节点只支持挂载ui_switcher脚本节点下的子节点

3、注意每个状态编辑完后要点按钮勾保存，否则不保存修改。

## QQ:496897327