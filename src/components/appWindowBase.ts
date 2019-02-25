import { BrowserWindow } from "electron";

export default class AppWindowBase {

  htmlFile : string;
  browserWindow : Electron.BrowserWindow;
  windowOpts : any;
  parent : any;

  constructor(parent : any){
    this.parent = parent;

    // default browserOpts
    this.browserWindow = new BrowserWindow();
   // this.browserWindow.setMenu(null);
   this.browserWindow.maximize();
  }

  bind = (event : any, callback : Function) : void => {
    this.browserWindow.on(event, callback);
  }

  init = (htmlFile : string) : void => {
    
    this.browserWindow.loadFile(htmlFile);
  }

  window = () : Electron.BrowserWindow => {
    return this.browserWindow;
  }

  close = () => {
    
  }
}