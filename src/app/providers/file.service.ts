import { Injectable } from '@angular/core';
import { IAudioMetadata } from 'music-metadata';
import { ElectronService } from './electron.service';
import * as mm from 'music-metadata/lib/core';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  public isElectronApp;

  private fs: typeof fs;
  private dialog: Electron.Dialog;
  readonly window: Electron.BrowserWindow;
  private optionsFileMusic: Electron.OpenDialogOptions = {
    filters: [
      {
        name: 'Music',
        extensions: [ 'mp3', 'm4a', 'webm', 'wav', 'aac', 'ogg', 'opus' ]
      }
    ],
    properties: [ 'openFile', 'multiSelections' ]
  };


  constructor(private _electronService: ElectronService) {
    this.isElectronApp = this._electronService.isElectron();

    if (this.isElectronApp === 'renderer') {
      this.fs = this._electronService.remote.require('fs');
      this.dialog = this._electronService.remote.dialog;
      this.window = this._electronService.remote.getCurrentWindow();
    } else {
      // console.log('isElectronApp' + this.isElectronApp);
    }
  }

  public loadFilesFromFolderContent(): Promise<string | IAudioMetadata> {
    return new Promise((resolve) => {
      if (this.isElectronApp !== 'renderer') {
        resolve('loadFileContent() return ElectronApp ' + this.isElectronApp);
        return null;
      }
      this.dialog.showOpenDialog(this.window, this.optionsFileMusic, (fileNames) => {
        // console.log(fileNames);
        if (fileNames === undefined) {
          console.log('fileNames 0');
          resolve('error');
          return null;
        }

        const stream = this.fs.createReadStream(fileNames[ 0 ]);
        mm.parseStream(stream).then((metadata: IAudioMetadata) => {
          stream.close();
          // console.log(metadata);

          resolve(metadata);
        });
      });
    });
  }

  public loadAudioMetaDataFromPath(path: string): Promise<string | IAudioMetadata> {
    return new Promise((resolve) => {
      if (this.isElectronApp !== 'renderer') {
        resolve('loadAudioMetaData(path: string) return ElectronApp ' + this.isElectronApp);
        return null;
      }

      const stream = this.fs.createReadStream(path);
      mm.parseStream(stream)
        .then((metadata: IAudioMetadata) => {
          stream.close();

          resolve(metadata);
        });
    });
  }
}
