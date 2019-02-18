import {Injectable} from '@angular/core';
import {IAudioMetadata} from 'music-metadata';
import {ElectronService} from './electron.service';
import * as mm from 'music-metadata/lib/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  public isElectronApp: boolean;

  private fs;
  private dialog: Electron.Dialog;
  readonly window: Electron.BrowserWindow;
  private optionsFile: Electron.OpenDialogOptions = {
    filters: [
      {
        name: 'Music',
        extensions: ['mp3']
      }
    ],
    properties: ['openFile']
  };


  constructor(private _electronService: ElectronService) {
    this.isElectronApp = this._electronService.isElectron();

    if (this.isElectronApp) {
      this.fs = this._electronService.remote.require('fs');
      this.dialog = this._electronService.remote.dialog;
      this.window = this._electronService.remote.getCurrentWindow();
    } else {
      console.log('isElectronApp' + this.isElectronApp);
    }
  }

  public loadFileContent(): Promise<string | IAudioMetadata> {
    return new Promise((resolve) => {
      if (this.isElectronApp !== true) {
        resolve('ElectronApp false');
        return null;
      }
      this.dialog.showOpenDialog(this.window, this.optionsFile, (fileNames) => {
        if (fileNames === undefined) {
          console.log('fileNames 0');
          resolve('error');
          return null;
        }

        const stream = this.fs.createReadStream(fileNames[0]);
        mm.parseStream(stream).then((metadata: IAudioMetadata) => {
          stream.close();
          console.log(metadata);
          resolve(metadata);
        });
      });
    });
  }

  public loadAudioMetaData(path: string): Promise<string | IAudioMetadata> {
    return new Promise((resolve) => {
      if (this.isElectronApp !== true) {
        resolve('ElectronApp false');
        return null;
      }

      const stream = this.fs.createReadStream(path);
      mm.parseStream(stream).then((metadata: IAudioMetadata) => {
        stream.close();
        console.log(metadata);
        resolve(metadata);
      });
    });
  }

}
