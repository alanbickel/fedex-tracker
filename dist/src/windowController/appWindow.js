"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var appWindowBase_1 = require("../components/appWindowBase");
var eventListenerBase_1 = require("../components/eventListenerBase");
var electron = require('electron');
var dialog = require('electron').dialog;
/**
 * establish event hooks for communication between renderer and main processes
 */
var AppWindow = /** @class */ (function (_super) {
    __extends(AppWindow, _super);
    function AppWindow(parent, windowOpts) {
        var _this = _super.call(this, parent, windowOpts) || this;
        /**
         * send message to specified channel
         */
        _this.send = function (channel, data) {
            _this.window().webContents.send(channel, data);
        };
        /**
         * define listener actions
         */
        _this.initializeListenerEvents = function () {
            var appWindow = _this;
            /**
             * user wants to open a file
             */
            _this.eventListener.listen('file-select', function (sender, data) {
                var files = dialog.showOpenDialog(null, {
                    properties: ['openFile'],
                    filters: [{ name: 'Files', extensions: ['xlsx', 'txt'] }]
                }, function (file) {
                    //send request to process controller to select file
                    appWindow.controller.onLoadFileRequest(file);
                });
            });
        };
        _this.eventListener = new eventListenerBase_1["default"](parent, electron.ipcMain);
        _this.controller = parent;
        _this.initializeListenerEvents();
        return _this;
    }
    return AppWindow;
}(appWindowBase_1["default"]));
exports["default"] = AppWindow;
//# sourceMappingURL=appWindow.js.map