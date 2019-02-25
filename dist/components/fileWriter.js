"use strict";
exports.__esModule = true;
var fs = require('fs');
var XLSX = require('xlsx');
var FileWriter = /** @class */ (function () {
    function FileWriter(dataset, format) {
        var _this = this;
        this.buildSpreadsheet = function () {
            var wb = XLSX.utils.book_new();
            var headers = ['Tracking Number', 'Status', 'Delivery Date', 'Ship Date', 'Shipper Location', 'Recipient Location', "Original Terminal"];
            for (var i in _this.data) {
                var group = _this.data[i];
                var sheetName = _this.getSheetName(i);
                var sheetData = [];
                sheetData.push(headers);
                for (var j = 0; j < group.length; j++) {
                    sheetData.push(Object.values(group[j]));
                }
                var worksheet = XLSX.utils.aoa_to_sheet(sheetData);
                XLSX.utils.book_append_sheet(wb, worksheet, sheetName);
            }
            return wb;
        };
        this.getSheetName = function (key) {
            switch (key) {
                case "inTransit": {
                    return "In Transit";
                }
                case "delivered": {
                    return "Delivered";
                }
                case "actionRequired": {
                    return "Action Required";
                }
            }
        };
        //tab seperated (TSV)
        this.buildCSV = function () {
            var wb = XLSX.utils.book_new();
            var headers = ['Tracking Number', 'Status', 'Delivery Date', 'Ship Date', 'Shipper Location', 'Recipient Location', "Original Terminal"];
            var values = [];
            values.push(headers);
            for (var i in _this.data) {
                var group = _this.data[i];
                for (var j = 0; j < group.length; j++) {
                    values.push(Object.values(group[j]));
                }
                var groupSeparator = [" ", " ", " ", " ", " ", " ", " "];
                values.push(groupSeparator);
            }
            var worksheet = XLSX.utils.aoa_to_sheet(values);
            _this.fileContents = worksheet;
        };
        this.writeFileContents = function (filePath) {
            var response = {
                success: false,
                message: ""
            };
            switch (_this.format) {
                case "xlsx": {
                    try {
                        XLSX.writeFile(_this.fileContents, filePath);
                        response.success = true;
                    }
                    catch (e) {
                        response.message = e.message;
                    }
                    return response;
                }
                case "csv": {
                    try {
                        var stream = XLSX.stream.to_csv(_this.fileContents, { FS: "\t" });
                        stream.pipe(fs.createWriteStream(filePath));
                        //fs.writeFileSync(filePath, this.fileContents);
                        response.success = true;
                    }
                    catch (e) {
                        response.message = e.message;
                    }
                    return response;
                }
            }
        };
        this.data = dataset;
        this.format = format;
        //create file contents
        switch (format) {
            case "xlsx": {
                this.fileContents = this.buildSpreadsheet();
                break;
            }
            case "csv": {
                this.buildCSV();
                break;
            }
        }
        //get path to save file
    }
    return FileWriter;
}());
exports["default"] = FileWriter;
//# sourceMappingURL=fileWriter.js.map