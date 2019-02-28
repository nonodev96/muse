import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Song} from '../mock/Song';
import {SONGS} from '../mock/mock-examples';
import {FileService} from './file.service';
import {IAudioMetadata} from 'music-metadata/lib/type';
import { ElectronService } from './electron.service';


@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audio: HTMLAudioElement;
  private song: Song;
  // private tonePlayer: Tone.Player;

  private songObservable = new Subject<Song>();
  private currentTimeObservable = new Subject<number>();
  private durationTimeObservable = new Subject<number>();
  private elapsedTimeObservable = new Subject<number>();

  constructor(private _fileService: FileService, private _electronService: ElectronService) {
    this.audio = new Audio();
    this.setPlayer(SONGS[0]);
    this.attachListeners();
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
    this.song = song;
    this.audio.srcObject = this._fileService.loadFileBuffer(song.src);

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
}
