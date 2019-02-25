"use strict";
exports.__esModule = true;
/**
 * wrapper for inter process comm
 * streamline event binding
 */
var EventListenerBase = /** @class */ (function () {
    /**
     *
     * @param parent electron main process controller
     * @param ipcMain inter process comm module
     */
    function EventListenerBase(parent, ipcMain) {
        var _this = this;
        /**
         * bind listener action to event channel
         */
        this.listen = function (channel, callback) {
            _this.ipc.on(channel, callback);
        };
        this.parent = parent;
        this.ipc = ipcMain;
    }
    return EventListenerBase;
}());
exports["default"] = EventListenerBase;
//# sourceMappingURL=eventListenerBase.js.map