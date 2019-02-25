
import ProcessController from "./processController";

/**
 * wrapper for inter process comm 
 * streamline event binding
 */
export default class EventListenerBase{

  private parent : ProcessController;
  private ipc :Electron.IpcMain;

  /**
   * 
   * @param parent electron main process controller
   * @param ipcMain inter process comm module
   */
  constructor(parent : any, ipcMain : Electron.IpcMain){
    this.parent = parent;
    this.ipc = ipcMain;
  }

  /**
   * bind listener action to event channel
   */
  listen = (channel : string, callback : Function) : void => {
    this.ipc.on(channel, callback);
  };
}