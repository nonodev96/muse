import {Injectable} from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import {ipcRenderer, webFrame, remote} from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';


@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;

  private _electron: Electron.RendererInterface;

  constructor() {
    // Conditional imports
    if (ElectronService.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  private get electron(): Electron.RendererInterface {
    if (!this._electron) {
      if (window && window.require) {
        this._electron = window.require('electron');
        return this._electron;
      }
      return null;
    }
    return this._electron;
  }

  public static isElectron() {
    return window && window.process && window.process.type;
  }

  public static isServer(): boolean {
    let location_href = window.location.href;
    let localhost = 'http://localhost:4200/';
    return location_href.includes(localhost);
  }

  // New 2
  public static get isElectronApp(): boolean {
    return !!window.navigator.userAgent.match(/Electron/);
  }

  public static get isPiPAvailable(): boolean {
    // @ts-ignore
    return !!window.document.pictureInPictureEnabled;
  }

  public static get isMacOS(): boolean {
    return ElectronService.isElectronApp && process.platform === 'darwin';
  }

  public static get isWindows(): boolean {
    return ElectronService.isElectronApp && process.platform === 'win32';
  }

  public static get isLinux(): boolean {
    return ElectronService.isElectronApp && process.platform === 'linux';
  }

  public static get isX86(): boolean {
    return ElectronService.isElectronApp && process.arch === 'ia32';
  }

  public static get isX64(): boolean {
    return ElectronService.isElectronApp && process.arch === 'x64';
  }

  public get desktopCapturer(): Electron.DesktopCapturer {
    return this.electron ? this.electron.desktopCapturer : null;
  }

  public get clipboard(): Electron.Clipboard {
    return this.electron ? this.electron.clipboard : null;
  }

  public get crashReporter(): Electron.CrashReporter {
    return this.electron ? this.electron.crashReporter : null;
  }

  public get process(): any {
    return this.remote ? this.remote.process : null;
  }

  public get nativeImage(): typeof Electron.nativeImage {
    return this.electron ? this.electron.nativeImage : null;
  }

  public get screen(): Electron.Screen {
    return this.electron ? this.electron.screen : null;
  }

  public get shell(): Electron.Shell {
    return this.electron ? this.electron.shell : null;
  }
}
