const fs = require('fs'); 
const XLSX = require('xlsx'); 

import ProcessController from "./processController"; 
import FileValidator from "./fileValidator"; 
import {resolve }from "path"; 

/**
 * extract validated file's contents
 */
export default class FileParser{

  parent :ProcessController
  validator : FileValidator;
  error : string;
  fileName : string;
  fileExtension : string;
  trackingNumbers : string[];

  constructor(parent : ProcessController, file? : any){
    this.parent = parent;
    this.validator = new FileValidator(this, file);
    this.error = this.validator.error();
    this.fileName = this.validator.getFileName();
    this.fileExtension = this.validator.getExtension();
  }

  fileIsValid = () : boolean => {
    return this.validator.isValid();
  }

  errorMessage = (): string | null => {
    return this.error;
  }
  /**
   * should only be called if file has been validated
   */
  parseFileContents = (): void => {

    if(! this.validator.isValid())
      throw new Error('Cannot Parse Invalid File');
    
      switch(this.fileExtension){
        case ".xlsx": {
          // if xlsx, ask user if header row is present
          this.parent.loadXlsxContent();
          break;
        }

        case ".csv": {
          //confirmation of header row from client
          this.parent.loadXlsxContent();
          break;
        }

      }

  }

  parseSpreadSheet = (headerRows : boolean): Promise<any> => {
    this.trackingNumbers = [];
    let workbook = XLSX.readFile(this.fileName);

    return new Promise((resolve, reject)=> {
      for(let i in workbook.Sheets){
        let sheet = workbook.Sheets[i];
        //parse nodes
        for(let s in sheet){
          let node = sheet[s];
          let row = this.getRow(s);
          let col = this.getCol(s);
          if(s == ' ! ref') continue;
          if(headerRows && row ==1) continue;
  
          switch(col){
  
            case "A": {
              let len = node.v.toString().trim().length;
              if(node.v && len > 0){
                this.trackingNumbers.push(node.v);
              }
              break;
            }
            default : 
              continue;
          }
        }
      }
      this.trackingNumbers.length  > 0 ? resolve(this.trackingNumbers) : reject();
    });    
  }
  /**
   * parse row number from excel coordinate
   */
  getRow = (coords : string): number =>{
    return parseInt(coords.replace(/[^0-9]/g, ""));
  }

  /**
   * parse column number from spreadsheet
   */
  getCol = (coords: string) : string => {
    return coords.replace(/[0-9]/g, "");
  }

}

