"use strict";
exports.__esModule = true;
var appWindow_1 = require("../windowController/appWindow");
var fileParser_1 = require("./fileParser");
var httpController_1 = require("./httpController");
var fileWriter_1 = require("./fileWriter");
var path = require("path");
var electron_1 = require("electron");
/**
 * respond to user events & manage data processing workflows
 */
var ProcessController = /** @class */ (function () {
    function ProcessController(electron) {
        var _this = this;
        // validate file contents
        this.onLoadFileRequest = function (file) {
            _this.fileParser = new fileParser_1["default"](_this, file);
            if (!_this.fileParser.fileIsValid()) {
                _this.window.send('file-error', _this.fileParser.errorMessage());
                return;
            }
            //initialize response data wrapper
            _this.trackingData = {
                inTransit: [],
                delivered: [],
                actionRequired: []
            };
            //extract tracking numbers;
            _this.fileParser.parseFileContents();
        };
        //initialize file output process
        this.onDataExportRequest = function (fileFormat) {
            //verify tracking data is not empty
            var contents = false;
            var controller = _this;
            for (var i in _this.trackingData) {
                var group = _this.trackingData[i];
                if (group.length > 0)
                    contents = true;
            }
            if (!contents) {
                _this.window.send('export-request-empty-set', {});
                return;
            }
            //initialize written content
            _this.fileWriter = new fileWriter_1["default"](_this.trackingData, fileFormat);
            //get location to save
            var filter = [{
                    name: (fileFormat == "xlsx" ? "Excel Spreadsheet" : "Tab Delimited File"),
                    extensions: (fileFormat == "xlsx" ? ["xlsx"] : ["csv"])
                }];
            electron_1.dialog.showSaveDialog(null, {
                filters: filter
            }, function (absPath) {
                if (absPath === undefined)
                    return;
                var status = controller.fileWriter.writeFileContents(absPath);
                //inform user of write status
                controller.window.send('file-write-result', status);
            });
        };
        //confirm existence of header row, then load file contents
        this.loadXlsxContent = function () {
            var controller = _this;
            electron_1.dialog.showMessageBox(null, { title: "Confirm Header Rows", buttons: ['Yes', 'No'], message: "File contains Header Row?" }, function (responseIndex) {
                controller.fileParser.parseSpreadSheet(responseIndex == 0)
                    .then(function (trackingNumbers) {
                    console.log('tracking numbers: ', trackingNumbers);
                    var data = {
                        trackingNumbers: trackingNumbers
                    };
                    controller.trackingNumbers = trackingNumbers;
                    //inform browser that file has been parsed, share list of tracking numbers
                    controller.window.send('file-parsed', data);
                    //retrieve fedex content
                    controller.retrieveTrackingData();
                })["catch"](function (e) {
                    controller.window.send('file-error', { message: "Unable to parse XLSX file" });
                });
            });
        };
        // initialize HTTP request chain
        this.retrieveTrackingData = function () {
            var controller = _this;
            _this.httpController = new httpController_1["default"](_this, _this.trackingNumbers);
            _this.httpController.request()
                .then(function () {
                controller.updateClientBatchProgress(0, true);
                controller.processResponse();
            })["catch"](function (error) {
                console.log('HTTP CONTROLLER ERROR: ', error);
                controller.window.send('http-error', { flag: "unexpected-http-error", message: error ? error.message : "" });
            });
        };
        // process results of http lookup
        this.processResponse = function () {
            var responses = _this.httpController.responses;
            //concatenate responses from multiple request batches
            for (var i = 0; i < responses.length; i++) {
                var response = responses[i];
                for (var key in response) {
                    var group = response[key];
                    for (var j = 0; j < group.length; j++) {
                        _this.trackingData[key].push(group[j]);
                    }
                }
            }
            //transmit data to client
            _this.window.send('processing-complete', { contents: _this.trackingData });
        };
        // emit HTTP error to client
        this.emitHttpError = function (url, flag) {
            _this.window.send('http-error', { url: url, flag: flag });
        };
        // emit current status to client
        this.updateClientBatchProgress = function (currentBatchNumber, isComplete) {
            //count total number of batches 
            var totalBatches = 1;
            var totalTrackingNumbers = _this.trackingNumbers.length;
            while (totalTrackingNumbers > 30) {
                totalBatches++;
                totalTrackingNumbers -= 30;
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
        // application window
        this.window = new appWindow_1["default"](this);
        // view
        this.window.init(path.join(__dirname, "../../view/index.html"));
    }
    return ProcessController;
}());
exports["default"] = ProcessController;
module.exports = ProcessController;
//# sourceMappingURL=processController.js.map