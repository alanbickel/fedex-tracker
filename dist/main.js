"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var ProcessController = require("./components/processController");
//reference to main controller for acync callbacks
var processController = null;
/**
 * initialize controller
 */
electron_1.app.on('ready', function () {
    var displayOpts = {
        width: 1000,
        height: 850,
        nodeIntegration: true
    };
    processController = new ProcessController(electron_1.app, displayOpts);
});
electron_1.app.on('window-all-closed', function () {
    electron_1.app.quit();
});
//# sourceMappingURL=main.js.map