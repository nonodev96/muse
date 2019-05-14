import {Injectable} from '@angular/core';
import {IAudioMetadata, IOptions} from 'music-metadata';
import {ElectronService} from './electron.service';
import * as mm from 'music-metadata/lib/core';
import * as mmb from 'music-metadata-browser';
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
        extensions: ['mp3', 'm4a', 'webm', 'wav', 'aac', 'ogg', 'opus']
      }
    ],
    properties: ['openFile', 'multiSelections']
  };


  constructor(private _electronService: ElectronService) {
    this.isElectronApp = ElectronService.isElectron();

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

        const stream = this.fs.createReadStream(fileNames[0]);
        let options: IOptions = {
          native: true
        };
        mm.parseStream(stream, null, options).then((metadata: IAudioMetadata) => {
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
      mm.parseStream(stream, null, {native: true})
        .then((metadata: IAudioMetadata) => {
          stream.close();

          resolve(metadata);
        });
    });
  }

  public loadAudioMetaDataFromURL(url: string): Promise<string | IAudioMetadata> {
    return new Promise((resolve) => {
      if (this.isElectronApp !== 'renderer') {
        resolve('loadAudioMetaDataFromURL(url: string) return ElectronApp ' + this.isElectronApp);
        return null;
      }

      mmb.fetchFromUrl(url, {native: true})
        .then((metadata: IAudioMetadata) => {

          resolve(metadata);
        });
    });
  }
}
