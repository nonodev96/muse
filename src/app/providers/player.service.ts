import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Song} from '../mock/Song';
import {FileService} from './file.service';
import {IAudioMetadata} from 'music-metadata/lib/type';
import {ElectronService} from './electron.service';
import {forEach} from '@angular/router/src/utils/collection';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio: HTMLAudioElement;
  private songList: Song[] = [];
  private song: Song;
  private iterator: number = 0;
  private iterator_length: number;

  private audioObservable = new Subject<HTMLAudioElement>();
  private songListObservable = new Subject<Song[]>();
  private songObservable = new Subject<Song>();
  private currentTimeObservable = new Subject<number>();
  private durationTimeObservable = new Subject<number>();
  private elapsedTimeObservable = new Subject<number>();

  constructor(private _fileService: FileService, private _electronService: ElectronService) {
    this.audio = new Audio();
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

  public setSong(song: Song) {
    this.song = song;
    this.audio.src = song.src;
    this.audio.load();

    this.getMusicMetaData();
    this.attachListeners();
  }

  public setNextSong() {
    if (this.iterator < this.iterator_length) {
      this.iterator += 1;
    } else {
      this.iterator = 0;
    }
    let song: Song = this.songList[this.iterator];
    this.setSong(song);
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
    this.audioObservable.next(this.audio);
    this.songObservable.next(this.song);

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
      'song': this.song,
      'songList': this.songList,
      'iterator': this.iterator
    };

    return data;
  }

  private initPlayerFromFolder(args) {
    console.log({...args});

    if (args.files.length > 0) {
      this.iterator_length = args.files.length;
      for (let file in args.files) {
        let title, album, artist, data_song;
        this._fileService.loadAudioMetaData(args.path + '/' + args.files[file]).then((value: IAudioMetadata) => {
          console.log(value);

          data_song = value;
          title = value.common.title;
          album = value.common.album;
          artist = value.common.artist;
          let addToList = new Song({
            id: 1,
            title: title,
            album: album,
            artist: artist,
            src: args.path + '/' + args.files[file],
            audioMetadata: data_song
          });
          this.songList.push(addToList);
        });
      }
      this.songListObservable.next(this.songList);
    }
  }

  private ipcRendererSelectedFiles() {
    this._electronService.ipcRenderer.on('selected-files', (event, args) => {
      if (args.files.length > 0 && args.path.length > 0) {
        this.initPlayerFromFolder(args);
      }
    });
  }
}
