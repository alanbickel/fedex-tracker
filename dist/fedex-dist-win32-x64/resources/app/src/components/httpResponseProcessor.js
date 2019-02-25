"use strict";
exports.__esModule = true;
var fs = require('fs');
var HttpResponseProcessor = /** @class */ (function () {
    function HttpResponseProcessor(responseArray) {
        this.trackingData = [];
        for (var i = 0; i < responseArray.length; i++) {
            var response = responseArray[i];
            fs.writeFileSync('output-' + i + ".txt", response);
        }
    }
    return HttpResponseProcessor;
}());
exports["default"] = HttpResponseProcessor;
//# sourceMappingURL=httpResponseProcessor.js.map