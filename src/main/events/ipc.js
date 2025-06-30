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
    // 选择文件夹
    _ipcMain.on('dialog:select-folder', (event) => {
      mainWindow.focus()
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory']
      }).then(result => {
        if (!result.canceled) {
          event.sender.send('dialog:dialog-result', result.filePaths)
          // _ipcMain.send('dialog:dialog-result', result.filePaths)
          mainWindow.focus()
        }

      }).catch(err => {
        console.log(err)
      })
    })
    // 选择程序
    _ipcMain.on('dialog:select-exe', (event) => {
      mainWindow.focus()
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Executable Files', extensions: ['exe'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          event.sender.send('dialog:dialog-exe-result', result.filePaths)
          mainWindow.focus()
        }
      }).catch(err => {
        console.log(err)
      })
    })
    // 选择文件夹
     _ipcMain.on('dialog:select-folder-batch', (event) => {
      mainWindow.focus()
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory']
      }).then(result => {
        if (!result.canceled) {
          event.sender.send('dialog:dialog-result-batch', result.filePaths)
          mainWindow.focus()
        }
      }).catch(err => {
        console.log(err)
      })
    })

    // 选择文件夹-可配置
     _ipcMain.on('dialog:select-folder-configuration', (event, obj) => {
      mainWindow.focus()
      dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'openDirectory']
      }).then(result => {
        if (!result.canceled) {
          event.sender.send(obj.sendKey, result.filePaths)
          mainWindow.focus()
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
