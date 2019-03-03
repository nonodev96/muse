import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Song } from '../mock/Song';
import { SONGS } from '../mock/mock-examples';
import { FileService } from './file.service';
import { IAudioMetadata } from 'music-metadata/lib/type';
import { ElectronService } from './electron.service';
import { forEach } from '@angular/router/src/utils/collection';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio: HTMLAudioElement;
  private song: Song;
  public songList: { files: any, path: any } = { files: {}, path: {} };
  // private tonePlayer: Tone.Player;

  private songObservable = new Subject<Song>();
  private currentTimeObservable = new Subject<number>();
  private durationTimeObservable = new Subject<number>();
  private elapsedTimeObservable = new Subject<number>();

  constructor(private _fileService: FileService, private _electronService: ElectronService) {
    this.audio = new Audio();
    this.ipcRendererSelectedFiles();
  }

  public getSongObservable(): Observable<Song> {
    return this.songObservable.asObservable();
  }

  public getSong() {
    this.songObservable.next(this.song);
  }

  public getCurrentTimeObservable(): Observable<number> {
    return this.currentTimeObservable.asObservable();
  }

  public getDurationTimeObservable(): Observable<number> {
    return this.durationTimeObservable.asObservable();
  }

  public getElapsedTimeObservable(): Observable<number> {
    return this.elapsedTimeObservable.asObservable();
  }

  public setPlayer(song: Song) {
    console.log(song);
    this.song = song;
    this.audio.src = song.src;
    this.audio.load();
    this.getMusicMetaData();

    this.songObservable.next(song);
    this.currentTimeObservable.next(0);
    this.durationTimeObservable.next(0);
    this.elapsedTimeObservable.next(0);
  }

  public setVolume(volume: number) {
    this.audio.volume = volume;
  }

  public setCurrentTime(time: number) {
    this.audio.currentTime = time;
  }

  public playerTogglePlayPause() {
    if (this.audio.paused === true) {
      this.audio.play();
    } else {
      this.audio.pause();
    }

    return this.audio.paused;
  }


  private attachListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeObservable.next(
        this.audio.currentTime
      );
      this.durationTimeObservable.next(
        this.audio.duration
      );
      this.elapsedTimeObservable.next(
        this.audio.duration - this.audio.currentTime
      );
    });
  }

  private getMusicMetaData() {
    this._fileService.loadAudioMetaData(this.song.src).then((value: IAudioMetadata) => {
      this.song.audioMetadata = value;
      console.log(value);
      this.songObservable.next(this.song);
    });
  }

  public getData() {
    let data: any;
    data = {
      'audio': this.audio,
      'song': this.song
    };

    return data;
  }

  private startPlayer(args) {
    this.songList = { ...args };
    console.log(this.songList);
    if (this.songList.files.length > 0) {
      let songInit = new Song({
        id: 1,
        title: args.path + '/' + this.songList.files[ 0 ],
        album: '',
        artist: '',
        src: args.path + '/' + this.songList.files[ 0 ]
      });
      this.setPlayer(songInit);
    }
  }

  private ipcRendererSelectedFiles() {
    this._electronService.ipcRenderer.on('selected-files', (event, args) => {
      if (args.files.length > 0 && args.path.length > 0) {
        this.startPlayer(args);
      }
    });
  }
}
