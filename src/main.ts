import { app, BrowserWindow } from "electron";
const ProcessController = require("./components/processController");


//reference to main controller for acync callbacks
let processController  = null;

/**
 * initialize controller
 */
app.on('ready', ()=> {

  let displayOpts = {
    width : 1000, 
    height : 850, 
    nodeIntegration: true
  };

  processController = new ProcessController(app, displayOpts);

});

app.on('window-all-closed', () => {
  app.quit();
})