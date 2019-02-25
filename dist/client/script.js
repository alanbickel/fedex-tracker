var $ = require('jquery');
var _a = require('electron'), ipcRenderer = _a.ipcRenderer, remote = _a.remote;
var dialog = require('electron').remote.dialog;
var isProcessing = false;
$(document).ready(function () {
    // import data from file
    $(document).on('click', "#file-selector", function () {
        if (isProcessing) {
            dialog.showMessageBox({ title: "Fedex Tracker", type: "info", message: "Please wait until current file has finished processing" });
            return;
        }
        ipcRenderer.send('file-select', {});
    });
    //export data to file
    $(document).on('click', ".export-btn", function () {
        console.log('format: ', this.dataset.format);
        ipcRenderer.send('data-export', { format: this.dataset.format });
    });
    //file write response from main process
    ipcRenderer.on('file-write-result', function (event, response) {
        var messageType = response.success ? 'info' : 'error';
        var message = response.success ? 'File created successfully.' : 'File write failed.\n' + response.message;
        dialog.showMessageBox({ title: "Fedex Tracker", type: messageType, message: message });
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
    ipcRenderer.on('batch-update', function (event, data) {
        switch (data.status) {
            case "in-progress":
            case "lookup-complete":
            case "browser-status-update": {
                document.getElementById("growl-message").innerHTML = data.message;
                if (document.getElementById('growl-loading').style.display != "block")
                    $.blockUI({ message: document.getElementById("growl-loading") });
                break;
            }
        }
    });
    //puppeteer fail - free the client and display error
    ipcRenderer.on('http-error', function (event, data) {
        var flag = data.flag;
        var container = document.getElementById("tracking-table");
        var message;
        switch (flag) {
            case "page-load-failue": {
                message = " <p> Puppeteer failed to load url: </p>  <p> " + data.url + " </p>  <p> Please check your internet connection and try again. </p> ";
                break;
            }
            case "await-selector-failure": {
                message = " <p> Puppeteer failed to parse page: </p>  <p> " + data.url + " </p>  <p> Please check that you are supplying valid tracking numbers and try again. </p> ";
                break;
            }
            case "unexpected-http-error": {
                message = "\n        <p>Puppeteer encountered an unexpected error:</p> \n        <p>" + data.message + "</p>\n        <p>Please check your internet connection and try again.</p>";
            }
        }
        container.innerHTML = message;
        $.unblockUI();
        isProcessing = false;
    });
    //processing is finished- display results
    ipcRenderer.on('processing-complete', function (event, data) {
        $.blockUI({ message: "Fetch Complete.\nRendering Results" });
        isProcessing = false;
        populateDataTable(data.contents);
        $("table").each(function () { $(this).DataTable({ searching: false, paging: false }); });
        //unlock export buttons
        document.getElementById('export-txt').disabled = false;
        document.getElementById('export-xlsx').disabled = false;
        $.unblockUI();
    });
    //attempy to write empty datasett
    ipcRenderer.on('export-request-empty-set', function (event, data) {
        dialog.showMessageBox({ title: "Fedex Tracker", type: "warning", message: "Cannot write empty dataset. Please import data from file." });
    });
});
//wrapper to build HTML contents
function populateDataTable(dataset) {
    var container = document.getElementById('tracking-table');
    container.innerHTML = "";
    //action required? 
    if (dataset.actionRequired && dataset.actionRequired.length > 0) {
        var header = "Action Required";
        createTable(container, header, dataset.actionRequired);
    }
    if (dataset.inTransit && dataset.inTransit.length > 0) {
        var header = "In Transit";
        createTable(container, header, dataset.inTransit);
    }
    if (dataset.delivered && dataset.delivered.length > 0) {
        var header = "Delivered";
        createTable(container, header, dataset.delivered);
    }
}
//create a table for subset of data
function createTable(container, headerText, data) {
    var headerContainer = document.createElement('div');
    headerContainer.classList.add('header-container');
    var header = document.createElement('h3');
    header.classList.add('header');
    header.classList.add('table-header');
    header.innerText = headerText;
    container.appendChild(header);
    var tablePane = document.createElement('div');
    tablePane.classList.add('table-pane');
    var table = document.createElement('table');
    table.classList.add('data-table');
    table.classList.add('stripe');
    table.classList.add('hover');
    var th = document.createElement('thead');
    var tableHeaders = ['Tracking', 'Delivery Date', 'Ship Date', 'Shipper Location', 'Recipient Location', 'Origin Terminal'];
    var keyArray = ['trNo', 'deliveryDate', 'shipDate', 'shipperLocation', 'recipientLocation', 'originTerminal'];
    var hr = document.createElement('tr');
    //add headers
    for (var i = 0; i < tableHeaders.length; i++) {
        var th_1 = document.createElement('th');
        th_1.innerText = tableHeaders[i];
        hr.appendChild(th_1);
    }
    th.appendChild(hr);
    table.appendChild(th);
    //add content
    var tbody = document.createElement('tbody');
    for (var d = 0; d < data.length; d++) {
        var row = data[d];
        var tr = document.createElement('tr');
        for (var k = 0; k < keyArray.length; k++) {
            var td = document.createElement('td');
            td.innerText = row[keyArray[k]];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tablePane.appendChild(table);
    container.appendChild(tablePane);
}
//# sourceMappingURL=script.js.map