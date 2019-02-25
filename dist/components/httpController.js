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
        /**
         * scrape page contents
         */
        this.clientEval = function () {
            var response = {
                actionRequired: [],
                inTransit: [],
                delivered: []
            };
            var getKey = function (element) {
                if (element.hasAttribute("data-mps-status"))
                    return 'status';
                if (element.hasAttribute("data-mps-delivered-date"))
                    return 'deliveryDate';
                if (element.hasAttribute("data-mps-ship-date"))
                    return 'shipDate';
                if (element.hasAttribute("data-mps-shipper"))
                    return 'shipperLocation';
                if (element.hasAttribute("data-mps-recipient"))
                    return 'recipientLocation';
                if (element.hasAttribute("data-mps-origin"))
                    return 'originTerminal';
                if ($(element).find("a.tank-fxg-link").length > 0)
                    return 'trNo';
                if (element.hasAttribute('data-mps-hide') || element.hasAttribute('data-mps-desktop-hide'))
                    return false;
            };
            var tableRows = document.getElementsByTagName('tr');
            for (var i = 0; i < tableRows.length; i++) {
                var row = tableRows[i];
                var meta = {};
                var isHeader = row.getElementsByTagName('th').length > 0;
                if (isHeader)
                    continue;
                for (var c = 0; c < row.children.length; c++) {
                    var child = row.children[c];
                    var key = getKey(child);
                    if (typeof key == 'string') {
                        console.log("key: ", key, 'value: ', child.innerText);
                        meta[key] = child.innerText;
                    }
                }
                switch (meta['status']) {
                    case "DELIVERED": {
                        response.delivered.push(meta);
                        break;
                    }
                    case "IN TRANSIT": {
                        response.inTransit.push(meta);
                        break;
                    }
                    default: {
                        response.actionRequired.push(meta);
                    }
                }
            }
            return JSON.stringify(response);
        };
        this.parent = parent;
        this.trackingNumbers = trackingNumbers;
        this.maxindex = this.trackingNumbers.length - 1;
        this.index = 0;
        this.batchSize = 30;
        this.responses = [];
        this.currentBatch = 1;
        this.defaultTimeout = 15000;
    }
    HttpController.prototype.request = function () {
        return __awaiter(this, void 0, void 0, function () {
            var controller;
            var _this = this;
            return __generator(this, function (_a) {
                //inform user of which batch we are requesting
                this.parent.updateClientBatchProgress(this.currentBatch);
                controller = this;
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var paramNums, i, trackingNumber, browser, page, numStr, baseUrl, url, e_1, e_2, results, complete;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    paramNums = [];
                                    //build tracking numbers url param string
                                    for (i = 0; i < this.batchSize; i++) {
                                        if (this.index < this.maxindex) {
                                            trackingNumber = this.trackingNumbers[this.index];
                                            paramNums.push(trackingNumber);
                                            this.index++;
                                        }
                                    }
                                    //console.log("PEP> ", puppeteer.executablePath());
                                    this.parent.window.send('path-comm', { path: puppeteer.executablePath() });
                                    this.parent.window.send('batch-update', { status: 'browser-status-update', message: 'Initializing Http Controller' });
                                    return [4 /*yield*/, puppeteer.launch({ headless: true, executablePath: puppeteer.executablePath() })];
                                case 1:
                                    browser = _a.sent();
                                    return [4 /*yield*/, browser.newPage()];
                                case 2:
                                    page = _a.sent();
                                    numStr = paramNums.join(",");
                                    baseUrl = "https://www.fedex.com/apps/fedextrack/?action=track&trackingnumber=";
                                    url = baseUrl + numStr;
                                    this.parent.window.send('batch-update', { status: 'browser-status-update', message: 'Sending request' });
                                    _a.label = 3;
                                case 3:
                                    _a.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, page.goto(url, { timeout: controller.defaultTimeout })];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    e_1 = _a.sent();
                                    controller.parent.emitHttpError(url, "page-load-failue");
                                    return [2 /*return*/, reject()];
                                case 6:
                                    this.parent.window.send('batch-update', { status: 'browser-status-update', message: 'Scraping data' });
                                    _a.label = 7;
                                case 7:
                                    _a.trys.push([7, 9, , 10]);
                                    return [4 /*yield*/, page.waitForSelector("td.redesignPageableTableTVC", { timeout: controller.defaultTimeout })];
                                case 8:
                                    _a.sent();
                                    return [3 /*break*/, 10];
                                case 9:
                                    e_2 = _a.sent();
                                    controller.parent.emitHttpError(url, "await-selector-failure");
                                    return [2 /*return*/, reject()];
                                case 10:
                                    this.parent.window.send('batch-update', { status: 'browser-status-update', message: 'Evaluating contents' });
                                    return [4 /*yield*/, page.evaluate(controller.clientEval)];
                                case 11:
                                    results = _a.sent();
                                    //save response data
                                    controller.responses.push(JSON.parse(results));
                                    this.parent.window.send('batch-update', { status: 'browser-status-update', message: 'Closing connection' });
                                    return [4 /*yield*/, browser.close()];
                                case 12:
                                    _a.sent();
                                    complete = controller.index == (controller.maxindex);
                                    if (complete)
                                        return [2 /*return*/, resolve()];
                                    //we have another batch to process
                                    controller.currentBatch++;
                                    return [2 /*return*/, controller.request()];
                            }
                        });
                    }); })];
            });
        });
    };
    return HttpController;
}());
exports["default"] = HttpController;
//# sourceMappingURL=httpController.js.map