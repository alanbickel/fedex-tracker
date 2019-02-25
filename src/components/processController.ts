import AppWindow from "../windowController/appWindow"; 
import FileParser from "./fileParser"; 
import HttpController from "./httpController"; 
import FileWriter from "./fileWriter"; 
import * as path from "path"; 
import {App, dialog }from "electron"; 
import TrackingDataWrapper from "../interface/trackingDataWrapper"; 

/**
 * respond to user events & manage data processing workflows
 */
export default class ProcessController {

  electron:App; 
  window:AppWindow; 
  //manage file ingest
  fileParser:FileParser; 
  //save contents to disk
  fileWriter:FileWriter; 
  //array of tracking numbers from file
  trackingNumbers:string[]; 
  // manage http request
  httpController:HttpController; 
  //parsed content from fedex site
  trackingData:TrackingDataWrapper; 

  constructor(electron:App) {

    this.electron = electron; 
    this.trackingNumbers = []; 
    this.httpController = null; 
    // application window
    this.window = new AppWindow(this); 
    // view
    this.window.init(path.join(__dirname, "../../view/index.html")); 
  }
  
  // validate file contents
  onLoadFileRequest = (file?:any):void =>  {

    this.fileParser = new FileParser(this, file); 

    if ( ! this.fileParser.fileIsValid()) {
      this.window.send('file-error', this.fileParser.errorMessage()); 
      return; 
    }
    //initialize response data wrapper
    this.trackingData =  {
      inTransit:[], 
      delivered:[], 
      actionRequired:[]
    }
    //extract tracking numbers;
    this.fileParser.parseFileContents(); 
  }
  //initialize file output process
  onDataExportRequest = (fileFormat:string):void =>  {
    //verify tracking data is not empty
    let contents = false; 
    let controller = this; 
    for (let i in this.trackingData) {
      let group = this.trackingData[i]; 
      if (group.length > 0)
        contents = true; 
    }
    if ( ! contents) {
      this.window.send('export-request-empty-set',  {}); 
      return; 
    }
    //initialize written content
    this.fileWriter = new FileWriter(this.trackingData, fileFormat); 
    //get location to save
    let filter = [ {
        name:(fileFormat == "xlsx"?"Excel Spreadsheet":"Tab Delimited File"), 
        extensions:(fileFormat == "xlsx"?["xlsx"]:["csv"])
      }]; 
    dialog.showSaveDialog(null,  < any >  {
        filters:filter
      }, 
      (absPath) =>  {
        if(absPath === undefined)
          return;
      let status = controller.fileWriter.writeFileContents(absPath);
      //inform user of write status
      controller.window.send('file-write-result', status);
    }); 
  }
  //confirm existence of header row, then load file contents
  loadXlsxContent = ():void =>  {
    let controller = this; 

    dialog.showMessageBox(null,  {title:"Confirm Header Rows", buttons:['Yes', 'No'], message:"File contains Header Row?"}, 
    function (responseIndex) {

      controller.fileParser.parseSpreadSheet(responseIndex == 0)
      .then(trackingNumbers =>  {

        let data =  {
          trackingNumbers:trackingNumbers 
        }
        controller.trackingNumbers = trackingNumbers; 
        //inform browser that file has been parsed, share list of tracking numbers
        controller.window.send('file-parsed', data); 
        //retrieve fedex content
        controller.retrieveTrackingData(); 
      })
      //unable to parse spreadsheet
      .catch((e) =>  {
        controller.window.send('file-error',  {message:"Unable to parse XLSX file"}); 
      }); 
    }); 
  }

  // initialize HTTP request chain
  retrieveTrackingData = ():void =>  {
    let controller = this; 
    this.httpController = new HttpController(this, this.trackingNumbers); 
    this.httpController.request()
    .then(() =>  {
      controller.updateClientBatchProgress(0, true); 
      controller.processResponse(); 
    })
    .catch(error =>  {
      controller.window.send('http-error',  {flag:"unexpected-http-error", message:error?error.message:""}); 
    })
  }
  // process results of http lookup
  processResponse = ():void =>  {
    let responses = this.httpController.responses; 
    //concatenate responses from multiple request batches
    for (let i = 0; i < responses.length; i++) {
      let response = responses[i]; 

      for (let key in response) {
        let group = response[key]; 

        for (let j = 0; j < group.length; j++) {
          this.trackingData[key].push(group[j]); 
        }
      }
    }
    //transmit data to client
    this.window.send('processing-complete',  {contents:this.trackingData}); 
  }
  // emit HTTP error to client
  emitHttpError = (url:string, flag:string):void =>  {
    this.window.send('http-error',  {url:url, flag:flag}); 
  }
  // emit current status to client
  updateClientBatchProgress = (currentBatchNumber:number | string, isComplete?:boolean):void =>  {
    //count total number of batches 
    let totalBatches = 1; 
    let totalTrackingNumbers = this.trackingNumbers.length; 

    while (totalTrackingNumbers > 30) {
      totalBatches++; 
      totalTrackingNumbers -= 30; 
    }
  
    let message = "Fetching batch " + currentBatchNumber + " of " + totalBatches; 
    let status = isComplete?"lookup-complete":'in-progress'; 

    if (isComplete)
      message = "Processing data, please wait a moment."; 

    this.window.send('batch-update',  {status:status, message:message}); 
  }
  
}
module.exports = ProcessController; 