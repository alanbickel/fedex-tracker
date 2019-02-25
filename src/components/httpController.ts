const https = require('https'); 
const fs = require('fs'); 
const puppeteer = require('puppeteer'); 


import ProcessController from "./processController"; 

export default class HttpController {
  parent:ProcessController; 
  trackingNumbers:string[]; 
  index:number; 
  batchSize:number; 
  responses:any[]; 
  currentBatch:number; 
  defaultTimeout:number; 

  constructor(parent:ProcessController, trackingNumbers:string[]) {
    this.parent = parent; 
    this.trackingNumbers = trackingNumbers; 
    this.index = 0; 
    this.batchSize = 30; 
    this.responses = []; 
    this.currentBatch = 1; 
    this.defaultTimeout = 15000; 
  }


  async request ():Promise < any >  {

    //inform user of which batch we are requesting
    this.parent.updateClientBatchProgress(this.currentBatch); 

    let controller = this; 
    return new Promise(async (resolve, reject) =>  {
      //build url
      let paramNums = []; 
      //build tracking numbers url param string
      for (let i = 0; i < this.batchSize; i++) {
        if (this.index < this.trackingNumbers.length) {
          
          let trackingNumber = this.trackingNumbers[this.index]; 
          paramNums.push(trackingNumber); 
          this.index++; 
        }
      }
      this.parent.window.send('path-comm', {path:puppeteer.executablePath() })
      this.parent.window.send('batch-update', { status : 'browser-status-update', message : 'Initializing Http Controller'});
      const browser = await puppeteer.launch( {headless:true, executablePath:puppeteer.executablePath()}); 
      const page = await browser.newPage(); 
    
      //we've accumulated a max of 30 tracking numbers, now build request
      let numStr = paramNums.join(",");
      let baseUrl = "https://www.fedex.com/apps/fedextrack/?action=track&trackingnumber=";
      let url = baseUrl + numStr;

      this.parent.window.send('batch-update', { status : 'browser-status-update', message : 'Sending request'});

      try{await page.goto(url, {timeout :controller.defaultTimeout})}
      catch(e){
        controller.parent.emitHttpError(url, "page-load-failue");
        return reject();
      }

      this.parent.window.send('batch-update', { status : 'browser-status-update', message : 'Scraping data'});
      
      try {await page.waitForSelector("td.redesignPageableTableTVC", {timeout :controller.defaultTimeout})}
      catch(e){
        controller.parent.emitHttpError(url, "await-selector-failure");
        return reject();
      }

      this.parent.window.send('batch-update', { status : 'browser-status-update', message : 'Evaluating contents'});      
      let results = await page.evaluate(controller.clientEval);
      //save response data
      controller.responses.push(JSON.parse(results));

      this.parent.window.send('batch-update', { status : 'browser-status-update', message : 'Closing connection'}); 
      await browser.close();

      let complete = controller.index == (controller.trackingNumbers.length);
      if(complete)
        return resolve();
      //we have another batch to process
      controller.currentBatch++;
      return controller.request();
    });
  }

  /**
   * scrape page contents
   */
  clientEval = () : string => {

    let response: any = {
      actionRequired : [], 
      inTransit : [], 
      delivered : []
    };

    let getKey = function(element: HTMLElement): string | boolean{
      if(element.hasAttribute("data-mps-status"))
        return 'status';
      if(element.hasAttribute("data-mps-delivered-date"))
        return 'deliveryDate';
      if(element.hasAttribute("data-mps-ship-date"))
        return 'shipDate';
      if(element.hasAttribute("data-mps-shipper"))
        return 'shipperLocation';
      if(element.hasAttribute("data-mps-recipient"))
        return 'recipientLocation';
      if(element.hasAttribute("data-mps-origin"))
        return 'originTerminal';
      if($(element).find("a.tank-fxg-link").length > 0)
        return 'trNo';
      if(element.hasAttribute('data-mps-hide') || element.hasAttribute('data-mps-desktop-hide') )
        return false;
    }
    
    let tableRows = document.getElementsByTagName('tr');

    for(let i = 0; i < tableRows.length; i++){
      
      let row = tableRows[i];
      let meta: any = {};
      let isHeader = row.getElementsByTagName('th').length > 0;
      if(isHeader) continue;

      for(let c = 0; c < row.children.length; c++){
        let child = <HTMLElement>row.children[c];
        let key = getKey(child);
        if(typeof key == 'string'){
          meta[key] = child.innerText;
        }
      }

      switch(meta['status']){
        case "DELIVERED": {
          response.delivered.push(meta);
          break;
        }
        case "IN TRANSIT": {
          response.inTransit.push(meta);
          break;
        }
        default : {
          response.actionRequired.push(meta);
        }
      }
    }
    return JSON.stringify(response);
  }
}