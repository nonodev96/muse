import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Song } from '../mock/Song';
import { FileService } from './file.service';
import { IAudioMetadata } from 'music-metadata/lib/type';
import { ElectronService } from './electron.service';
import { forEach } from '@angular/router/src/utils/collection';
import { iterator } from 'rxjs/internal-compatibility';


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

  constructor(private _fileService: FileService, private _electronService: ElectronService) {
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

  public getSongList(): Song[] {
    return this.songList;
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
    this.audioObservable.complete();
    this.songObservable.next(this.song);
    this.songObservable.complete();

    return this.audio.paused;
  }

  public setNextSong() {
    if (this.iterator < this.songList.length) {
      this.iterator += 1;
    }
    this.debug();
    if (this.iterator >= this.songList.length) {
      this.iterator = 0;
    }
    let song: Song = this.songList[ this.iterator ];
    this.setSong(song);
  }

  public getSong(): Song {
    return this.song;
  }

  public setSong(song: Song) {
    this.song = song;
    this.audio.src = song.src;
    this.audio.load();
    this.debug();

    this.songObservable.next(this.song);
    this.audioObservable.next(this.audio);

    this.attachListeners();
  }

  public getVolume(): number {
    return this.audio.volume;
  }

  public setVolume(volume: number) {
    this.audio.volume = volume;
  }

  public setCurrentTime(time: number) {
    this.audio.currentTime = time;
  }

  private attachListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeObservable.next(this.audio.currentTime);
      this.currentTimeObservable.complete();
      this.durationTimeObservable.next(this.audio.duration);
      this.durationTimeObservable.complete();
      this.elapsedTimeObservable.next(this.audio.duration - this.audio.currentTime);
      this.elapsedTimeObservable.complete();
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

  private initPlayerFromMusicFiles(musicFiles) {
    console.log({ ...musicFiles });

    let title, album, artist, data_song;
    for (let pathFile of musicFiles) {
      this._fileService.loadAudioMetaDataFromPath(pathFile).then(
        (value: IAudioMetadata) => {

          data_song = value;
          title = value.common.title;
          album = value.common.album;
          artist = value.common.artist;
          let addToList = new Song({
            id: pathFile.index,
            title: title,
            album: album,
            artist: artist,
            src: pathFile,
            audioMetadata: data_song
          });
          this.songList.push(addToList);
          this.songListObservable.next(this.songList);
          this.songListObservable.complete();
        });
    }
  }

  private ipcRendererSelectedFiles() {
    this._electronService.ipcRenderer.on('selected-files', (event, args) => {
      if (args.musicFiles.length > 0) {
        this.initPlayerFromMusicFiles(args.musicFiles);
      }
    });
  }

  private debug() {
    console.log(this.getData());
  }
}
