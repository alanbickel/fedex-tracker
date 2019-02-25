var $ = require('jquery');
var _a = require('electron'), ipcRenderer = _a.ipcRenderer, remote = _a.remote;
var dialog = require('electron').remote.dialog;
var isProcessing = false;
$(document).ready(function () {
    // user wants to select file
    $(document).on('click', "#file-selector", function () {
        if (isProcessing) {
            dialog.showMessageBox({ title: "Fedex Tracker", type: "info", message: "Please wait until current file has finished processing" });
            return;
        }
        ipcRenderer.send('file-select', {});
    });
    // file select error
    ipcRenderer.on('file-error', function (event, data) {
        isProcessing = false;
        var message = data && data.message ? data.message : "A file error has ocurred. Please try again";
        dialog.showMessageBox({ title: "Fedex Tracker", type: 'error', message: message });
        console.log('error: ', data);
    });
    //input file has been parsed
    ipcRenderer.on('file-parsed', function (event, data) {
        isProcessing = true;
    });
    //update on tracking numbers being fetched
    ipcRenderer.on('batch-update', function (evevnt, data) {
        switch (data.status) {
            case "in-progress":
            case "lookup-complete":
                {
                    var message = data.message;
                    document.getElementById("growl-message").innerHTML = data.message;
                    $.blockUI({ message: document.getElementById("growl-loading") });
                    break;
                }
        }
    });
});
//# sourceMappingURL=script.js.map