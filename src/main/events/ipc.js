import { app, dialog, BrowserWindow } from "electron";
import { CreateBrowserWindow, ipcMain } from "../utils/index";

const _ipcMain = ipcMain();

export default {
  init(appManager) {
    const getWindow = (name) => appManager.windows[name].win;
    const mainWindow = getWindow("main");

    _ipcMain.on("hello", async (event, arg) => {
      console.log("hellohellohellohello");
      mainWindow.webContents.send("replyHello", "hellohellohellohello");
    });

    _ipcMain.on("open-window", (e, name = "", data = null, options = {}) => {
      let subWindow = appManager.windows[name];
      if (!subWindow) {
        subWindow = new CreateBrowserWindow(name);
      }
      subWindow.init(data, options);
    });

    _ipcMain.on("close-window", async (e, name) => {
      getWindow(name).close();
    });

    _ipcMain.on("app-exit", async () => {
      app.exit();
    });
    _ipcMain.on('select-folder', (event) => {
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory']
      }).then(result => {
        console.log(result.canceled)
        if (!result.canceled) {
          event.sender.send('dialog-result', result.filePaths)
        }

      }).catch(err => {
        console.log(err)
      })
    })
    _ipcMain.on('select-exe', (event) => {
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Executable Files', extensions: ['exe'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        // console.log(result.canceled)
        if (!result.canceled) {
          event.sender.send('dialog-exe-result', result.filePaths)
        }

      }).catch(err => {
        console.log(err)
      })
    })
     _ipcMain.on('select-folder-batch', (event) => {
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory']
      }).then(result => {
        // console.log(result.canceled)
        if (!result.canceled) {
          event.sender.send('dialog-result-batch', result.filePaths)
        }

      }).catch(err => {
        console.log(err)
      })
    })


    // 操作开发者工具
    // _ipcMain.on(
    //   "toggleDevTools",
    //   (e, { win = mainWindow, params = {} } = {}) => {
    //     toggleDevTools(win, params);
    //   }
    // );
  },
};
