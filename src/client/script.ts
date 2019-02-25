let $ = require('jquery'); 
let {ipcRenderer, remote} = require('electron'); 
const {dialog} = require('electron').remote; 

let isProcessing = false; 

$(document).ready(function () {

  // import data from file
  $(document).on('click', "#file-selector", function() {

    if (isProcessing) {
      dialog.showMessageBox( {title:"Fedex Tracker", type:"info", message:"Please wait until current file has finished processing"}); 
      return; 
    }
  
    ipcRenderer.send('file-select',  {}); 
  }); 

  //export data to file
  $(document).on('click', ".export-btn", function(){
    ipcRenderer.send('data-export',  {format: this.dataset.format}); 
  });
  //file write response from main process
  ipcRenderer.on('file-write-result', (event: Event, response: any)=>{

    let messageType = response.success ? 'info' : 'error';
    let message = response.success ? 'File created successfully.' : 'File write failed.\n'+response.message;

    dialog.showMessageBox( {title:"Fedex Tracker", type:messageType, message:message }); 
  })

  // file select error
  ipcRenderer.on('file-error', (event:Event, data:any) =>  {
    isProcessing = false; 
    let message = data && data.message?data.message:"A file error has ocurred. Please try again"; 
    dialog.showMessageBox( {title:"Fedex Tracker", type:'error', message:message }); 
  }); 
  //input file has been parsed
  ipcRenderer.on('file-parsed', (event:Event, data:any) =>  {
    isProcessing = true; 
  }); 
  //update on tracking numbers being fetched
  ipcRenderer.on('batch-update', (event:Event, data:any) =>  {

    switch (data.status) {
      case "in-progress":
      case "lookup-complete":
      case "browser-status-update": {
        document.getElementById("growl-message").innerHTML = data.message; 
        if(document.getElementById('growl-loading').style.display != "block")
          $.blockUI( {message:document.getElementById("growl-loading")}); 
        break; 
      }
    }
  })

  //puppeteer fail - free the client and display error
  ipcRenderer.on('http-error', function(event:Event, data:any) {
    let flag = data.flag; 
    let container = document.getElementById("tracking-table"); 
    let message; 

    switch (flag) {
      case "page-load-failue": {
        message = ` <p> Puppeteer failed to load url: </p>  <p> ` + data.url + ` </p>  <p> Please check your internet connection and try again. </p> `; 
        break; 
      }
      case "await-selector-failure": {
        message = ` <p> Puppeteer failed to parse page: </p>  <p> ` + data.url + ` </p>  <p> Please check that you are supplying valid tracking numbers and try again. </p> `; 
        break;
      }
      case "unexpected-http-error": {
        message = `
        <p>Puppeteer encountered an unexpected error:</p> 
        <p>`+ data.message+`</p>
        <p>Please check your internet connection and try again.</p>`;
      }
    }
    container.innerHTML = message; 
    $.unblockUI(); 

    isProcessing = false; 
  }); 

  //processing is finished- display results
  ipcRenderer.on('processing-complete', (event:Event, data:any) =>  {

    $.blockUI( {message:"Fetch Complete.\nRendering Results"}); 

    isProcessing = false; 
    populateDataTable(data.contents); 
    $("table").each(function(){$(this).DataTable({searching: false, paging: false})});
    //unlock export buttons
    (<HTMLButtonElement>document.getElementById('export-txt')).disabled = false;
    (<HTMLButtonElement>document.getElementById('export-xlsx')).disabled = false;
    $.unblockUI(); 
  }); 
  //attempy to write empty datasett
  ipcRenderer.on('export-request-empty-set', (event:Event, data: any)=> {

    dialog.showMessageBox( {title:"Fedex Tracker", type:"warning", message:"Cannot write empty dataset. Please import data from file."}); 
  }); 
}); 

//wrapper to build HTML contents
function populateDataTable(dataset:any) {

  let container = document.getElementById('tracking-table'); 
  container.innerHTML = ""; 
  //action required? 
  if (dataset.actionRequired && dataset.actionRequired.length > 0) {
    let header = "Action Required"; 
    createTable(container, header, dataset.actionRequired); 
  }
  if (dataset.inTransit && dataset.inTransit.length > 0) {
    let header = "In Transit"; 
    createTable(container, header, dataset.inTransit); 
  }
  if (dataset.delivered && dataset.delivered.length > 0) {
    let header = "Delivered"; 
    createTable(container, header, dataset.delivered); 
  }
  
  
}
//create a table for subset of data
function createTable(container:HTMLElement, headerText:string, data:any) {

  let headerContainer = document.createElement('div'); 
  headerContainer.classList.add('header-container'); 
  let header = document.createElement('h3'); 
  header.classList.add('header'); 
  header.classList.add('table-header')
  header.innerText = headerText; 

  container.appendChild(header); 
  let tablePane = document.createElement('div');
  tablePane.classList.add('table-pane');
  let table = document.createElement('table'); 
  table.classList.add('data-table');
  table.classList.add('stripe');
  table.classList.add('hover');
  let th = document.createElement('thead'); 
  let tableHeaders = ['Tracking',  'Delivery Date', 'Ship Date', 'Shipper Location', 'Recipient Location', 'Origin Terminal']; 
  let keyArray = ['trNo', 'deliveryDate', 'shipDate', 'shipperLocation', 'recipientLocation', 'originTerminal']; 
  let hr = document.createElement('tr'); 
  //add headers
  for (let i = 0; i < tableHeaders.length; i++) {
    let th = document.createElement('th'); 
    th.innerText = tableHeaders[i]; 
    hr.appendChild(th); 
  }
  th.appendChild(hr); 
  table.appendChild(th); 
  //add content
  let tbody = document.createElement('tbody');
 
  for (let d = 0; d < data.length; d++) {
    let row = data[d]; 
    let tr = document.createElement('tr'); 
   
    for (let k = 0; k < keyArray.length; k++) {
      let td = document.createElement('td'); 
      td.innerText = row[keyArray[k]]; 
      tr.appendChild(td); 
    }
    tbody.appendChild(tr);
   
  }
  table.appendChild(tbody); 
  tablePane.appendChild(table);
  container.appendChild(tablePane); 
}

