"use strict";
exports.__esModule = true;
var appWindow_1 = require("../windowController/appWindow");
var fileParser_1 = require("./fileParser");
var httpController_1 = require("./httpController");
var httpResponseProcessor_1 = require("./httpResponseProcessor");
var path = require("path");
var electron_1 = require("electron");
/**
 * this is the workhorse of the app - load / save file contents,  * fire http requests, respond to user events from apppWindow object */
var ProcessController = /** @class */ (function () {
    function ProcessController(electron, displayOpts) {
        var _this = this;
        /**
         * validate file contents
         */
        this.onLoadFileRequest = function (file) {
            _this.fileParser = new fileParser_1["default"](_this, file);
            //is file valid?
            if (!_this.fileParser.fileIsValid()) {
                _this.window.send('file-error', _this.fileParser.errorMessage());
                return;
            }
            //extract tracking numbers;
            _this.fileParser.parseFileContents();
        };
        /**
         * if parsing xlsx file, ask user for
         * confirmation if there is header row in document
         */
        this.confirmXlsxHeaderRow = function () {
            var controller = _this;
            electron_1.dialog.showMessageBox(null, { title: "Confirm Header Rows", buttons: ['Yes', 'No'], message: "File contains Header Row?" }, function (responseIndex) {
                controller.fileParser.parseSpreadSheet(responseIndex == 0)
                    .then(function (trackingNumbers) {
                    var data = {
                        trackingNumbers: trackingNumbers
                    };
                    controller.trackingNumbers = trackingNumbers;
                    //inform browser that file has been parsed, share list of tracking numbers
                    controller.window.send('file-parsed', data);
                    //trigger lookup
                    controller.lookup();
                })["catch"](function (e) {
                    console.log('LOOKUP ERROR: ', e);
                    controller.window.send('file-error', { message: "Unable to parse XLSX file" });
                });
            });
        };
        this.lookup = function () {
            var controller = _this;
            _this.httpController = new httpController_1["default"](_this, _this.trackingNumbers);
            _this.httpController.request()
                .then(function () {
                controller.updateClientBatchProgress(0, true);
                controller.processResponse();
            })["catch"](function (error) {
                console.log('HTTP CONTROLLER ERROR: ', error);
            });
        };
        /**
         * process response contents from http lookup
         */
        this.processResponse = function () {
            var responses = _this.httpController.responses;
            var httpResponseProcessor = new httpResponseProcessor_1["default"](responses);
        };
        /**
         * update client view to show current batch / total batches.
         */
        this.updateClientBatchProgress = function (currentBatchNumber, isComplete) {
            var totalBatches = 1;
            for (var i = 0; i < _this.trackingNumbers.length; i++) {
                if ((i + 1) % 30 == 0)
                    totalBatches++;
            }
            var message = "Fetching batch " + currentBatchNumber + " of " + totalBatches;
            var status = isComplete ? "lookup-complete" : 'in-progress';
            if (isComplete)
                message = "Processing data, please wait a moment.";
            _this.window.send('batch-update', { status: status, message: message });
        };
        this.electron = electron;
        this.trackingNumbers = [];
        this.httpController = null;
        // initialize application window
        this.window = new appWindow_1["default"](this, displayOpts ? displayOpts : { nodeIntegration: true });
        // which file to show the user
        this.window.init(path.join(__dirname, "../../view/index.html"));
    }
    return ProcessController;
}());
exports["default"] = ProcessController;
module.exports = ProcessController;
//# sourceMappingURL=processController.js.map