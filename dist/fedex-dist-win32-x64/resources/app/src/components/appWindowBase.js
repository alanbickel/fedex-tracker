"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var AppWindowBase = /** @class */ (function () {
    function AppWindowBase(parent, windowOpts) {
        if (windowOpts === void 0) { windowOpts = { width: 800, height: 800 }; }
        var _this = this;
        this.bind = function (event, callback) {
            _this.browserWindow.on(event, callback);
        };
        this.init = function (htmlFile) {
            _this.browserWindow.loadFile(htmlFile);
        };
        this.window = function () {
            return _this.browserWindow;
        };
        this.close = function () {
        };
        this.parent = parent;
        // default browserOpts
        this.windowOpts = windowOpts;
        this.browserWindow = new electron_1.BrowserWindow(this.windowOpts);
        // this.browserWindow.setMenu(null);
    }
    return AppWindowBase;
}());
exports["default"] = AppWindowBase;
//# sourceMappingURL=appWindowBase.js.map