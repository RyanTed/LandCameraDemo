'use strict';

exports.load = function () {

};

exports.unload = function () {

};

exports.messages = {
    run () {
        Editor.Panel.open('assetcleaner');
        Editor.Metrics.trackEvent({
            category: 'Packages',
            label: 'assetcleaner',
            action: 'Panel Open'
        }, null);
    }
};