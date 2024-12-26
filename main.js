const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let floatWindow;

// 仅在开发模式下启用热更新
require("electron-reload")(path.join(__dirname, ".."), {
  electron: require(`${__dirname}/node_modules/electron`),
  hardResetMethod: "exit",
});

app.whenReady().then(createFloatWindow);

function createFloatWindow() {
  floatWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    devTools: true, // 启用开发者工具
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 使用绝对路径
      contextIsolation: true, // 启用上下文隔离
      enableRemoteModule: false, // 禁用远程模块
    },
  });

  floatWindow.loadURL("file://" + __dirname + "/index.html");

  // 设置窗口位置为屏幕左下角
  const { screen } = require("electron");
  const { width, height } = screen.getPrimaryDisplay().workAreaSize; // 获取屏幕可用区域的大小
  floatWindow.setBounds({ x: width - 200, y: height - 200 }); // 将窗口放置在左下角

  // 打开调试面板
  // floatWindow.webContents.openDevTools();

  floatWindow.on("closed", (e) => {
    e.preventDefault();
    floatWindow = null;
  });
}

function sendCommandToFloatIns(command) {
  if (floatWindow) {
    floatWindow.webContents.send(command);
  }
}

ipcMain.on("start-running", sendCommandToFloatIns.bind(this, "start-running"));
ipcMain.on("stop-running", sendCommandToFloatIns.bind(this, "stop-running"));
ipcMain.on("reset-running", sendCommandToFloatIns.bind(this, "reset-running"));

ipcMain.on("move-float-icon", (event, position) => {
  if (floatWindow) {
    const { x, y } = position;
    floatWindow.setBounds({
      x,
      y,
      width: floatWindow.getBounds().width,
      height: floatWindow.getBounds().height,
    });
    console.log(`Icon moved to: x=${x}, y=${y}`);
  }
});

ipcMain.on("open-main-window", () => {
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    devTools: true, // 启用开发者工具
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 使用绝对路径
      contextIsolation: true, // 启用上下文隔离
      enableRemoteModule: false, // 禁用远程模块
    },
  });
  mainWindow.loadURL("file://" + __dirname + "/page.html");
  // 打开调试面板
  mainWindow.webContents.openDevTools();
  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
});
