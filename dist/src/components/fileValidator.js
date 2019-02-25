"use strict";
exports.__esModule = true;
/**
 * wrapper for simple file validation
 */
var FileValidator = /** @class */ (function () {
    /**
     * @param parent  - file parser
     * @param fileObj  - array returned from system file select dialog
     */
    function FileValidator(parent, fileObj) {
        var _this = this;
        this.getFileName = function () {
            return _this.fileName;
        };
        this.getExtension = function () {
            return _this.extension;
        };
        /**
         * make sure only one file of the correct extension is selected
         */
        this.validate = function (filObject) {
            if (filObject == undefined) {
                _this.errorMessage = "Error selecting file";
                return;
            }
            if (filObject.length > 1) {
                _this.errorMessage = "Please select one file.";
                return;
            }
            _this.fileName = filObject[0];
            var validFile = false;
            for (var e = 0; e < _this.vaildExtensions.length; e++) {
                if (_this.fileName.indexOf(_this.vaildExtensions[e]) != -1) {
                    validFile = true;
                    _this.extension = _this.vaildExtensions[e];
                }
            }
            if (!validFile) {
                _this.errorMessage = "Must choose .xlsx or .txt file";
                return;
            }
            //clean file name
            _this.isValidFile = true;
            _this.errorMessage = null;
        };
        this.isValid = function () {
            return _this.isValidFile;
        };
        this.error = function () {
            return _this.errorMessage;
        };
        this.parent = parent;
        this.isValidFile = false;
        this.errorMessage = "No File Selected";
        this.fileName = null;
        this.extension = null;
        var fileExists = !!fileObj;
        this.vaildExtensions = [".xlsx", ".txt"];
        if (fileExists)
            this.validate(fileObj);
    }
    return FileValidator;
}());
exports["default"] = FileValidator;
//# sourceMappingURL=fileValidator.js.map