/*
 * @Author: RyanJiang
 * @Date: 2021-07-05 18:28:28
 * @LastEditTime: 2022-10-31 18:26:52
 * @LastEditors: RyanJiang
 * @Description: 引用库声明
 * @FilePath: /dbay-game-homeland-client/global.d.ts
 */
/// <reference path="node_modules/minigame-api-typings/index.d.ts" />
/// <reference path="node_modules/date-fns/typings.d.ts" />
/// <reference path="jsts.d.ts" />

// / <reference types="jssm" />
declare const qq = wx;

declare namespace WechatMinigame {
    interface Wx {
        subscribeAppMsg({});
    }
}

declare module 'ui_switcher' {
    /* eslint-disable eqeqeq */
    declare class ui_switcher extends cc.Component {
        changeStateByIndex(index: number): void;
        changeStateByName(name: string): void;
        readonly curState: number;
        readonly switchStates: any[];
    }
    export = ui_switcher;
}

interface Logger {
    old: {
        log: typeof console.log;
        error: typeof console.error;
        table: typeof console.table;
        warn: typeof console.warn;
    };
}

declare var Log: Logger;
declare var callbackObject;
declare var networkParam;
declare var token: string;
declare var payMessage;

declare namespace welove520 {
    interface CallJson {
        methodName: string;
        paramsJson?: string;
        context?: string;
    }
    function call(callJson: string): void;
}

declare interface Window {
    webkit: any;
    welove: any;
    bridgeCallback: CallableFunction;
}

declare namespace dragonBones {
    export class CocosSlot extends Slot {
        _color: cc.Color;
    }
}

declare class HashSet<K, T> {
    map: Map<K, T>;
}

declare class ArrayList<T> {
    array: Array<T>;
}
declare interface CCNodePoolDelegate extends cc.Component {
    unuse(): void;
    reuse(): void;
}
