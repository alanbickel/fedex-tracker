import AppWindowBase  from "../components/appWindowBase"; 
import EventListener from "../components/eventListenerBase"; 
import ProcessController from "../components/processController";
import { IpcRenderer } from "electron";

const electron = require('electron'); 
const { dialog } = require('electron');

/**
 * establish event hooks for communication between renderer and main processes
 */
export default class AppWindow extends AppWindowBase {
  //communicate with renderer process
  eventListener:EventListener; 
  //parent
  controller : ProcessController;
 
  constructor(parent:ProcessController) {

    super(parent); 
    this.eventListener = new EventListener(parent, electron.ipcMain); 
    this.controller = parent;

    this.initializeListenerEvents(); 
  }

  /**
   * send message to specified channel
   */

   send = (channel : string, data? : any): void => {
      this.window().webContents.send(channel, data);
   }
  /**
   * define listener actions
   */
  initializeListenerEvents = ():void =>  {
    let appWindow = this;
    // user wants to open a file
    this.eventListener.listen('file-select', (sender:IpcRenderer, data?:any) =>  {
      dialog.showOpenDialog(null,  {
        properties:['openFile'], 
        filters: [{name: 'Files', extensions: ['xlsx','csv']}]
        }, 
        (file) => {
          //send request to process controller to select file
          appWindow.controller.onLoadFileRequest(file);
        }); 
    });
    
    //user wants to export data to file
    this.eventListener.listen('data-export', (sender:IpcRenderer, data?:any)=>{
      appWindow.controller.onDataExportRequest(data.format);
    })
  }
}