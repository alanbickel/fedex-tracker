import FileParser from "./fileParser";
/**
 * wrapper for simple file validation
 */
export default class FileValidator{
  parent : FileParser;
  isValidFile : boolean;
  errorMessage :string;
  fileName : string;
  vaildExtensions : string[];
  extension : string;

  /**
   * @param parent  - file parser
   * @param fileObj  - array returned from system file select dialog
   */
  constructor(parent : FileParser, fileObj? : any){
    this.parent = parent;
    this.isValidFile = false;
    this.errorMessage = "No File Selected";
    this.fileName = null;
    this.extension = null;
    let fileExists = !!fileObj;

    this.vaildExtensions = [".xlsx", ".csv"];

    if(fileExists)
      this.validate(fileObj);
  }

  getFileName = () : string => {
    return this.fileName;
  }

  getExtension = (): string => {
    return this.extension;
  }
  /**
   * make sure only one file of the correct extension is selected
   */
  validate = (filObject: any) : void => {

    if(filObject == undefined){
      this.errorMessage = "Error selecting file";
      return;
    }
    if (filObject.length > 1) {
      this.errorMessage = "Please select one file."; 
      return; 
    }

    this.fileName = filObject[0];
    let validFile = false; 
    for (let e = 0; e < this.vaildExtensions.length; e++) {
      if (this.fileName.indexOf(this.vaildExtensions[e]) != -1) {
        validFile = true; 
        this.extension = this.vaildExtensions[e];
      }
    }
    if ( ! validFile) {
      this.errorMessage =  "Must choose .xlsx or .txt file"; 
      return; 
    }
    //clean file name
    this.isValidFile = true;
    this.errorMessage = null;
  }

  isValid = () : boolean => {
    return this.isValidFile;
  }

  error = () :string | null => {
    return this.errorMessage;
  }
}