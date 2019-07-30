import { app, BrowserWindow, dialog, Menu, nativeImage, screen, TouchBar, TouchBarConstructorOptions } from 'electron';
import * as path from 'path';
import * as url from 'url';

const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;


const fs = require('fs');
const args = process.argv.slice(1);
let win;
let serve = args.some(val => val === '--serve');


function createWindow() {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true
    },
    icon: path.join(__dirname, 'src/assets/icons/512x512.png')
  });

  let template: any = [
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        }, {
          role: 'redo'
        }, {
          type: 'separator'
        }, {
          role: 'cut'
        }, {
          role: 'copy'
        }, {
          role: 'paste'
        }, {
          role: 'pasteandmatchstyle'
        }, {
          role: 'delete'
        }, {
          role: 'selectall'
        }
      ]
    },
    {
      label: 'Cargar',
      submenu: [
        {
          label: 'Cargar Música',
          accelerator: 'CommandOrControl+L',
          click() {
            openFolderDialog();
          }
        }, {
          label: 'touch bar',
          click() {

          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.reload();
            }
          }
        }, {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        }, {
          type: 'separator'
        }, {
          role: 'resetzoom'
        }, {
          role: 'zoomin'
        }, {
          role: 'zoomout'
        }, {
          type: 'separator'
        }, {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        }, {
          role: 'close'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            require('electron').shell.openExternal('http://electron.atom.io').then(r => {
            });
          }
        },
        {
          label: 'Toggle Dev Tools',
          click() {
            win.webContents.toggleDevTools();
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          role: 'about'
        }, {
          type: 'separator'
        }, {
          role: 'services'
        }, {
          type: 'separator'
        }, {
          role: 'hide'
        }, {
          role: 'hideothers'
        }, {
          role: 'unhide'
        }, {
          type: 'separator'
        }, {
          role: 'quit'
        }
      ]
    });

    // Edit menu.
    template[ 1 ].submenu.push(
      {
        type: 'separator'
      }, {
        label: 'Speech',
        submenu: [
          {
            role: 'startspeaking'
          }, {
            role: 'stopspeaking'
          }
        ]
      }
    );

    // Window menu.
    template[ 3 ].submenu = [
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }, {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }, {
        label: 'Zoom',
        role: 'zoom'
      }, {
        type: 'separator'
      }, {
        label: 'Bring All to Front',
        role: 'front'
      }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
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
      if (musicFiles) {
        win.webContents.send('selected-files', { musicFiles });
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

  if (serve) {
    win.webContents.openDevTools();
  }

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
  app.on('ready', () => {
    createWindow();
    if (process.platform === 'darwin') {

      const iconPlayPause = nativeImage.createFromNamedImage('NSTouchBarPlayPauseTemplate', [ -1, 0, 1 ]);
      const iconNext = nativeImage.createFromNamedImage('NSTouchBarSkipToEndTemplate', [ -1, 0, 1 ]);
      const iconPrevious = nativeImage.createFromNamedImage('NSTouchBarSkipToStartTemplate', [ -1, 0, 1 ]);

      let next = new TouchBarButton({
        icon: iconNext,
        click: () => {
          win.webContents.send('media-controls', {
            status: 'next'
          });
        }
      });

      let previous = new TouchBarButton({
        icon: iconPrevious,
        click: () => {
          win.webContents.send('media-controls', {
            status: 'previous'
          });
        }
      });

      let playPause = new TouchBarButton({
        icon: iconPlayPause,
        click: () => {
          win.webContents.send('media-controls', {
            status: 'playPause'
          });
        }
      });

      let info = new TouchBarLabel({
        label: 'Muse uJaén',
        textColor: '#ffd51f'
      });

      let options: TouchBarConstructorOptions = {
        items: [ previous, playPause, next, info ]
      };

      let touchBar = new TouchBar(options);
      win.setTouchBar(touchBar);
    }
  });

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
