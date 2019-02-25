import trackingDataWrapper from "../interface/trackingDataWrapper"; 
const fs = require('fs');
const XLSX = require('xlsx'); 

export default class FileWriter {

  data:trackingDataWrapper; 
  format:string; 
  fileContents:any; 

  constructor(dataset:trackingDataWrapper, format:string) {
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

  buildSpreadsheet = ():any =>  {

    let wb = XLSX.utils.book_new(); 
    
    let headers = ['Tracking Number', 'Status', 'Delivery Date', 'Ship Date', 'Shipper Location', 'Recipient Location', "Original Terminal"]; 

    for (let i in this.data) {
      let group = this.data[i]; 
      let sheetName = this.getSheetName(i); 
      let sheetData = []; 
      sheetData.push(headers); 

      for (let j = 0; j < group.length; j++) {
        sheetData.push(Object.values(group[j])); 
      }

      let worksheet = XLSX.utils.aoa_to_sheet(sheetData); 
      XLSX.utils.book_append_sheet(wb, worksheet, sheetName); 
    }
    return wb; 
  }

  getSheetName = (key:string):string =>  {

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
  }
  //tab seperated (TSV)
  buildCSV = ():void =>  {

    let wb = XLSX.utils.book_new(); 

    let headers = ['Tracking Number', 'Status', 'Delivery Date', 'Ship Date', 'Shipper Location', 'Recipient Location', "Original Terminal"]; 
    let values = []; 
    values.push(headers);
    for (let i in this.data) {
      let group = this.data[i]; 
      for (let j = 0; j < group.length; j++) {
        values.push(Object.values(group[j])); 
      }
      let groupSeparator = [" ", " ", " ", " ", " ", " ", " "]; 
      values.push(groupSeparator); 
    }
    let worksheet = XLSX.utils.aoa_to_sheet(values);  
    this.fileContents = worksheet; 
  }


  writeFileContents = (filePath:string):any =>  {

    let response:any =  {
      success:false, 
      message:""
    }; 

    switch (this.format) {
      case "xlsx": {
        try {
          XLSX.writeFile(this.fileContents, filePath); 
          response.success = true; 
        }catch(e) {response.message = e.message}
        return response; 
      }
      case "csv": {
        try{
          var stream = XLSX.stream.to_csv(this.fileContents, {FS: "\t"});
          stream.pipe(fs.createWriteStream(filePath));
          //fs.writeFileSync(filePath, this.fileContents);
          response.success = true; 
        } 
        catch(e) {response.message = e.message}
        return response; 
      }
    }
   
  }
}
