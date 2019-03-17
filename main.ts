import { app, dialog, BrowserWindow, screen, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';

const fs = require('fs');

const args = process.argv.slice(1);
let win;
let serve = args.some(val => val === '--serve');


function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    icon: path.join(__dirname, 'src/assets/icons/512x512.png')
  });

  let menu = Menu.buildFromTemplate([
    {
      label: 'Cargar Música',
      accelerator: 'CommandOrControl+o',
      click: function () {
        openFolderDialog();
      }
    },
    {
      label: 'Dev Tools',
      click: function () {
        win.webContents.openDevTools();
      }
    }
  ]);
  Menu.setApplicationMenu(menu);

  function openFolderDialog() {
    dialog.showOpenDialog(win, {
      filters: [
        {
          name: 'Music',
          extensions: [ 'mp3', 'm4a', 'webm', 'wav', 'aac', 'ogg', 'opus' ]
        }
      ],
      properties: [ 'openFile', 'multiSelections' ]
    }, function (musicFiles) {
      console.log(musicFiles);
      if (musicFiles) {
        win.webContents.send('selected-files', { musicFiles });
        //   scanDir(filePath);
      }
    });
  }

  function scanDir(filePath) {
    if (!filePath || filePath[ 0 ] === 'undefined') {
      return;
    }

    fs.readdir(filePath[ 0 ], function (err, files) {
      let arr = [];
      for (let i = 0; i < files.length; i++) {
        if (files[ i ].substr(-4) === '.mp3' || files[ i ].substr(-4) === '.m4a'
          || files[ i ].substr(-5) === '.webm' || files[ i ].substr(-4) === '.wav'
          || files[ i ].substr(-4) === '.aac' || files[ i ].substr(-4) === '.ogg'
          || files[ i ].substr(-5) === '.opus') {
          arr.push(files[ i ]);
        }
      }
      // console.log(filePath);
      let objToSend = {
        files: {},
        path: {}
      };
      objToSend.files = arr;
      objToSend.path = filePath;

      win.webContents.send('selected-files', objToSend);
      // console.log(win.webContents);

    });
  }

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
