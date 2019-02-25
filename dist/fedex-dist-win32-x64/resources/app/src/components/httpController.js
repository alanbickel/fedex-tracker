"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var https = require('https');
var fs = require('fs');
var puppeteer = require('puppeteer');
var HttpController = /** @class */ (function () {
    function HttpController(parent, trackingNumbers) {
        this.parent = parent;
        this.trackingNumbers = trackingNumbers;
        this.maxindex = this.trackingNumbers.length - 1;
        this.index = 0;
        this.batchSize = 30;
        this.responses = [];
        this.currentBatch = 1;
    }
    HttpController.prototype.request = function () {
        return __awaiter(this, void 0, void 0, function () {
            var controller;
            var _this = this;
            return __generator(this, function (_a) {
                //inform user of which batch we are requesting
                this.parent.updateClientBatchProgress(this.currentBatch);
                controller = this;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        //build url
                        var paramNums = [];
                        //build tracking numbers url param string
                        for (var i = 0; i < _this.batchSize; i++) {
                            if (_this.index < _this.maxindex) {
                                var trackingNumber = _this.trackingNumbers[_this.index];
                                paramNums.push(trackingNumber);
                                _this.index++;
                            }
                        }
                        var browser = yield puppeteer.launch({ executablePath: puppeteer.executablePath() });
                        var page = yield browser.newPage();
                        yield page.goto('https://example.com');
                        //we've accumulated a max of 30 tracking numbers, now build request
                        var numStr = paramNums.join(",");
                        var baseUrl = "https://www.fedex.com/apps/fedextrack/?action=track&trackingnumber=";
                        var url = baseUrl + numStr;
                        https.get(url, function (response) {
                            var data = "";
                            // A chunk of data has been recieved.
                            response.on('data', function (chunk) {
                                data = data + chunk;
                            });
                            response.on('end', function () {
                                _this.responses.push(data);
                                var complete = controller.index == (controller.maxindex);
                                if (complete)
                                    return resolve();
                                //we have another batch to process
                                controller.currentBatch++;
                                return controller.request();
                            });
                        });
                    })];
            });
        });
    };
    return HttpController;
}());
exports["default"] = HttpController;
//# sourceMappingURL=httpController.js.map