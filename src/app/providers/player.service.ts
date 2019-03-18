import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Song } from '../mock/Song';
import { FileService } from './file.service';
import { IAudioMetadata } from 'music-metadata/lib/type';
import { ElectronService } from './electron.service';
import { DataBase, DatabaseService, InterfacePlayList } from './database.service';


interface InterfaceDataPlayer {
  audio: HTMLAudioElement;
  song: Song;
  songList: Song[];
  iterator: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio: HTMLAudioElement;
  private songList: Song[] = [];
  private song: Song;
  private iterator: number = -1;

  private audioObservable = new Subject<HTMLAudioElement>();
  private songListObservable = new Subject<Song[]>();
  private songObservable = new Subject<Song>();
  private currentTimeObservable = new Subject<number>();
  private durationTimeObservable = new Subject<number>();
  private elapsedTimeObservable = new Subject<number>();
  private musicFiles: string[] = [];

  constructor(private _fileService: FileService,
              private _databaseService: DatabaseService,
              private _electronService: ElectronService
  ) {
    console.log('init player service');
    this.song = new Song();
    this.audio = new Audio();
    this.audio.volume = 1;
    this.ipcRendererSelectedFiles();
  }

  public getSongListObservable(): Observable<Song[]> {
    return this.songListObservable.asObservable();
  }

  public getAudioObservable(): Observable<HTMLAudioElement> {
    return this.audioObservable.asObservable();
  }

  public getSongObservable(): Observable<Song> {
    return this.songObservable.asObservable();
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

  public playerTogglePlayPause() {
    if (this.audio.paused === true) {
      let playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {

        }).catch(function (error) {

        });
      }
    } else {
      this.audio.pause();
    }
    this.audioObservable.next(this.audio);
    this.songObservable.next(this.song);

    return this.audio.paused;
  }

  public setPreviousSong() {
    if (this.iterator === 0) {
      this.iterator = this.songList.length;
    }
    this.iterator--;
    let song: Song = this.songList[ this.iterator ];
    this.setPlayer(song);
  }

  public setNextSong() {
    this.iterator++;
    this.iterator = this.iterator % this.songList.length;
    let song: Song = this.songList[ this.iterator ];
    this.setPlayer(song);
  }

  public setPlayer(song: Song) {
    this.setSong(song);
    // this.audio.src = song.src;
    this.audio.src = './assets/Izal - 02 - Copacabana.mp3';
    this.audio.load();
    this.debug();

    // this.songObservable.next(this.song);
    // this.audioObservable.next(this.audio);

    this.attachListeners();
  }

  public getAudio(): HTMLAudioElement {
    return this.audio;
  }

  public setAudio(audio: HTMLAudioElement) {
    this.audio = audio;
  }

  public getSongList(): Song[] {
    return this.songList;
  }

  public setSongList(songList: Song[]) {
    this.songList = songList;
  }

  public getSong(): Song {
    return this.song;
  }

  public setSong(song: Song) {
    this.song = song;
  }

  public getVolume(): number {
    return this.audio.volume;
  }

  public setVolume(volume: number) {
    this.audio.volume = volume;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime;
  }

  public setCurrentTime(time: number) {
    this.audio.currentTime = time;
  }

  private attachListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeObservable.next(this.audio.currentTime);
      this.durationTimeObservable.next(this.audio.duration);
      this.elapsedTimeObservable.next(this.audio.duration - this.audio.currentTime);
    });
  }

  public getData(): InterfaceDataPlayer {
    return {
      'audio': this.audio,
      'song': this.song,
      'songList': this.songList,
      'iterator': this.iterator
    };
  }

  private initPlayerFromMusicFiles(musicFiles: string[]) {
    let differenceMusicFiles: string[] = <string[]>Array.from(this.setDifference(new Set(musicFiles), new Set(this.musicFiles)));
    this.musicFiles = <string[]>Array.from(this.setUnion(new Set(this.musicFiles), new Set(musicFiles)));
    // console.log(differenceMusicFiles);
    this._databaseService.addSongsPathToPlayList(DataBase.songsLoad, differenceMusicFiles).then(value => {

      // console.log(value);

    });

    for (let index in differenceMusicFiles) {
      let pathFile: string = differenceMusicFiles[ index ];
      this._fileService.loadAudioMetaDataFromPath(pathFile).then(
        (audioMetadataValue: IAudioMetadata) => {
          this.songList.push(new Song({
            id: '1',
            title: audioMetadataValue.common.title,
            album: audioMetadataValue.common.album,
            artist: audioMetadataValue.common.artist,
            src: pathFile,
            audioMetadata: audioMetadataValue
          }));
          this.songListObservable.next(this.songList);
        });
    }
  }

  /**
   * Electron tunel
   */
  private ipcRendererSelectedFiles() {
    this._databaseService.getPlayListsByName(DataBase.songsLoad).then((songsLoad: InterfacePlayList) => {
      console.log(songsLoad);
      if (songsLoad.paths.length > 0) {
        this.initPlayerFromMusicFiles(songsLoad.paths);
      } else {
        console.log('no hay canciones cargadas');
      }

      this._electronService.ipcRenderer.on('selected-files', (event, args) => {
        console.log('es esto un evento?');
        if (args.musicFiles.length > 0) {
          let arrayMusicFiles: string[] = [ ...args.musicFiles ];
          this.initPlayerFromMusicFiles(arrayMusicFiles);
        }
      });

    });
  }

  private toConsumableArray(arr): any {
    return this.arrayWithoutHoles(arr) || this.iterableToArray(arr) || this.nonIterableSpread();
  }

  private nonIterableSpread() {
    throw new TypeError('Invalid attempt to spread non-iterable instance');
  }

  private iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === '[object Arguments]') {
      return Array.from(iter);
    }
  }

  private arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      let arr2 = new Array(arr.length);
      for (let i = 0; i < arr.length; i++) {
        arr2[ i ] = arr[ i ];
      }
      return arr2;
    }
  }

  private setDifference(a, b) {
    return new Set(this.toConsumableArray(a).filter(function (x) {
      return !b.has(x);
    }));
  }

  private setIntersection(a, b) {
    return new Set(this.toConsumableArray(a).filter(function (x) {
      return b.has(x);
    }));
  }

  private setUnion(a, b) {
    return new Set([].concat(this.toConsumableArray(a), this.toConsumableArray(b)));
  }

  private debug() {
    console.log(this.getData());
  }
}
