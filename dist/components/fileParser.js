"use strict";
exports.__esModule = true;
var fs = require('fs');
var XLSX = require('xlsx');
var fileValidator_1 = require("./fileValidator");
/**
 * extract validated file's contents
 */
var FileParser = /** @class */ (function () {
    function FileParser(parent, file) {
        var _this = this;
        this.fileIsValid = function () {
            return _this.validator.isValid();
        };
        this.errorMessage = function () {
            return _this.error;
        };
        /**
         * should only be called if file has been validated
         */
        this.parseFileContents = function () {
            if (!_this.validator.isValid())
                throw new Error('Cannot Parse Invalid File');
            switch (_this.fileExtension) {
                case ".xlsx": {
                    // if xlsx, ask user if header row is present
                    _this.parent.loadXlsxContent();
                    break;
                }
                case ".csv": {
                    //confirmation of header row from client
                    _this.parent.loadXlsxContent();
                    break;
                }
            }
        };
        this.parseSpreadSheet = function (headerRows) {
            _this.trackingNumbers = [];
            var workbook = XLSX.readFile(_this.fileName);
            return new Promise(function (resolve, reject) {
                for (var i in workbook.Sheets) {
                    var sheet = workbook.Sheets[i];
                    //parse nodes
                    for (var s in sheet) {
                        var node = sheet[s];
                        var row = _this.getRow(s);
                        var col = _this.getCol(s);
                        if (s == ' ! ref')
                            continue;
                        if (headerRows && row == 1)
                            continue;
                        switch (col) {
                            case "A": {
                                var len = node.v.toString().trim().length;
                                if (node.v && len > 0) {
                                    _this.trackingNumbers.push(node.v);
                                }
                                break;
                            }
                            default:
                                continue;
                        }
                    }
                }
                _this.trackingNumbers.length > 0 ? resolve(_this.trackingNumbers) : reject();
            });
        };
        this.parseCsv = function (headerRows) {
            _this.trackingNumbers = [];
            var workbook = XLSX.readFile(_this.fileName);
            for (var i in workbook.Sheets) {
                var sheet = workbook.Sheets[i];
                //parse nodes
                for (var s in sheet) {
                    var node = sheet[s];
                    var row = _this.getRow(s);
                    var col = _this.getCol(s);
                    if (s == ' ! ref')
                        continue;
                    if (headerRows && row == 1)
                        continue;
                    // console.log('ROW: ', row);
                    // console.log('COL: ', col);
                    // console.log('NODE', node);
                    switch (col) {
                        case "A": {
                            if (node.v && node.v.length > 0) {
                                _this.trackingNumbers.push(node.v);
                            }
                            break;
                        }
                        default:
                            continue;
                    }
                }
            }
            // console.log(this.trackingNumbers);
            process.exit();
            return new Promise(function (resolve, reject) { reject(); });
            //process.exit();
        };
        /**
         * parse row number from excel coordinate
         */
        this.getRow = function (coords) {
            return parseInt(coords.replace(/[^0-9]/g, ""));
        };
        /**
         * parse column number from spreadsheet
         */
        this.getCol = function (coords) {
            return coords.replace(/[0-9]/g, "");
        };
        this.parent = parent;
        this.validator = new fileValidator_1["default"](this, file);
        this.error = this.validator.error();
        this.fileName = this.validator.getFileName();
        this.fileExtension = this.validator.getExtension();
    }
    return FileParser;
}());
exports["default"] = FileParser;
//# sourceMappingURL=fileParser.js.map