import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Song} from '../mocks/Song';
import {FileService} from './file.service';
import {IAudioMetadata} from 'music-metadata/lib/type';
import {ElectronService} from './electron.service';
import {EnumDataBase, DatabaseService, InterfacePlayList} from './database.service';
import {Utils} from '../utils/utils';


interface InterfaceDataPlayer {
  analyserNODES: WeakMap<HTMLAudioElement, AnalyserNode>;
  contextNODES: WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>;
  audio: HTMLAudioElement;
  song: Song;
  songList: Song[];
  iterator: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private analyserNODES: WeakMap<HTMLAudioElement, AnalyserNode> = new WeakMap();
  private contextNODES: WeakMap<HTMLAudioElement, MediaElementAudioSourceNode> = new WeakMap();

  private audio: HTMLAudioElement;
  private audioContext: AudioContext;
  private mediaElementAudioSourceNode: MediaElementAudioSourceNode;
  private audioContextAnalyserNode: AnalyserNode;
  private song: Song;
  private songList: Song[] = [];
  private iterator: number = -1;
  private musicFiles: string[] = [];

  private playerStatus: BehaviorSubject<string> = new BehaviorSubject('paused');
  private audioObservable: Subject<HTMLAudioElement> = new Subject<HTMLAudioElement>();
  private songListObservable: Subject<Song[]> = new Subject<Song[]>();
  private songObservable: Subject<Song> = new Subject<Song>();
  private currentTimeObservable: Subject<number> = new Subject<number>();
  private durationTimeObservable: Subject<number> = new Subject<number>();
  private elapsedTimeObservable: Subject<number> = new Subject<number>();

  private analyserNODES_Observable: Subject<WeakMap<HTMLAudioElement, AnalyserNode>>
    = new Subject<WeakMap<HTMLAudioElement, AnalyserNode>>();
  private contextNODES_Observable: Subject<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>
    = new Subject<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>();

  constructor(private _fileService: FileService,
              private _databaseService: DatabaseService,
              private _electronService: ElectronService
  ) {
    this.song = new Song();
    this.audio = new Audio();
    this.audio.volume = 0.5;
    this.audioContext = new AudioContext();

    this.mediaElementAudioSourceNode = this.audioContext.createMediaElementSource(this.audio);
    this.audioContextAnalyserNode = this.audioContext.createAnalyser();

    this.mediaElementAudioSourceNode.connect(this.audioContextAnalyserNode);
    this.audioContextAnalyserNode.connect(this.audioContext.destination);

    this.contextNODES.set(this.audio, this.mediaElementAudioSourceNode);
    this.analyserNODES.set(this.audio, this.audioContextAnalyserNode);

    this.ipcRendererSelectedFiles();
    this.attachListeners();
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

  public getAnalyserNODESObservable(): Observable<WeakMap<HTMLAudioElement, AnalyserNode>> {
    return this.analyserNODES_Observable.asObservable();
  }

  public getContextNODESObservable(): Observable<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>> {
    return this.contextNODES_Observable.asObservable();
  }

  public updateSongSubscription() {
    this.songObservable.next(this.song);
  }

  public updateSongListSubscription() {
    this.songListObservable.next(this.songList);
  }

  public updateAudioSubscription() {
    this.audioObservable.next(this.audio);
  }

  public updateAnalyserNODESSubscription() {
    this.analyserNODES_Observable.next(this.analyserNODES);
  }

  public updateContextNODESSubscription() {
    this.contextNODES_Observable.next(this.contextNODES);
  }

  public playerTogglePlayPause() {
    if (this.audio.paused === true) {
      let playPromise = this.audio.play();
      playPromise.then(() => {

      }).catch((error) => {

      });
    } else {
      this.audio.pause();
    }
    this.songObservable.next(this.song);
    this.audioObservable.next(this.audio);
    this.analyserNODES_Observable.next(this.analyserNODES);

    return this.audio.paused;
  }

  public setPreviousSong() {
    if (this.iterator === 0) {
      this.iterator = this.songList.length;
    }
    this.iterator--;
    let song: Song = this.songList[this.iterator];
    this.setPlayer(song);
  }

  public setNextSong() {
    this.iterator++;
    this.iterator = this.iterator % this.songList.length;
    let song: Song = this.songList[this.iterator];
    this.setPlayer(song);
  }

  public setPlayer(song: Song) {
    this.setSong(song);

    if (this._electronService.isElectron()) {
      this.audio.src = 'file:///' + song.src;
    } else {
      this.audio.src = './assets/02. Copacabana.mp3';
    }
    // this.audio.srcOb

    if (this.analyserNODES.has(this.audio)) {
      this.mediaElementAudioSourceNode = this.contextNODES.get(this.audio);
      this.audioContextAnalyserNode = this.analyserNODES.get(this.audio);
    } else {
      this.audioContext = new AudioContext();
      this.mediaElementAudioSourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.audioContextAnalyserNode = this.audioContext.createAnalyser();

      this.mediaElementAudioSourceNode.connect(this.audioContextAnalyserNode);
      this.audioContextAnalyserNode.connect(this.audioContext.destination);

      this.analyserNODES.set(this.audio, this.audioContextAnalyserNode);
      this.contextNODES.set(this.audio, this.mediaElementAudioSourceNode);
    }
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

  private setPlayerStatus(key) {
    switch (key) {
      case 'playing':
        this.playerStatus.next('playing');
        break;
      case 'pause':
        this.playerStatus.next('paused');
        break;
      case 'waiting':
        this.playerStatus.next('loading');
        break;
      case 'ended':
        this.playerStatus.next('ended');
        break;
      default:
        this.playerStatus.next('paused');
        break;
    }
  }

  private attachListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeObservable.next(this.audio.currentTime);
      this.durationTimeObservable.next(this.audio.duration);
      this.elapsedTimeObservable.next(this.audio.duration - this.audio.currentTime);
    });
    this.audio.addEventListener('playing', () => {
      this.setPlayerStatus('playing');
    });
    this.audio.addEventListener('waiting', () => {
      this.setPlayerStatus('waiting');
    });
    this.audio.addEventListener('pause', () => {
      this.setPlayerStatus('pause');
    });
    this.audio.addEventListener('ended', () => {
      this.setPlayerStatus('ended');
      this.setNextSong();
      this.playerTogglePlayPause();
    });
  }

  public getData(): InterfaceDataPlayer {
    return {
      'analyserNODES': this.analyserNODES,
      'contextNODES': this.contextNODES,
      'audio': this.audio,
      'song': this.song,
      'songList': this.songList,
      'iterator': this.iterator
    };
  }

  private initPlayerFromMusicFiles(musicFiles: string[]) {
    let differenceMusicFiles: string[] = <string[]>Array.from(Utils.setDifference(new Set(musicFiles), new Set(this.musicFiles)));
    this.musicFiles = <string[]>Array.from(Utils.setUnion(new Set(this.musicFiles), new Set(musicFiles)));
    // console.log(differenceMusicFiles);
    this._databaseService.addSongsPathToPlayList(EnumDataBase.songsLoad, differenceMusicFiles).then(value => {

      // console.log(value);

    });

    for (let index in differenceMusicFiles) {
      let pathFile: string = differenceMusicFiles[index];
      this._fileService.loadAudioMetaDataFromPath(pathFile).then(
        (audioMetadataValue: IAudioMetadata) => {

          let newSong = new Song({
            id: '1',
            title: audioMetadataValue.common.title,
            album: audioMetadataValue.common.album,
            artist: audioMetadataValue.common.artist,
            src: pathFile,
            audioMetadata: audioMetadataValue
          });
          if (audioMetadataValue.common.picture !== undefined) {
            let picture = audioMetadataValue.common.picture[0];
            if (picture !== undefined) {
              newSong.imgData = 'data:' + picture.format + ';base64,' + picture.data.toString('base64');
            }
          }

          this.songList.push(newSong);

          this.songListObservable.next(this.songList);
        });
    }
  }

  /**
   * Electron tunel
   */
  private ipcRendererSelectedFiles() {
    this._databaseService.getPlayListsByName(EnumDataBase.songsLoad).then((songsLoad: InterfacePlayList) => {
      // console.log(songsLoad);
      if (songsLoad.paths.length > 0) {
        this.initPlayerFromMusicFiles(songsLoad.paths);
      } else {
        console.log('no hay canciones cargadas');
      }

      this._electronService.ipcRenderer.on('selected-files', (event, args) => {
        console.log('es esto un evento?');
        if (args.musicFiles.length > 0) {
          let arrayMusicFiles: string[] = [...args.musicFiles];
          this.initPlayerFromMusicFiles(arrayMusicFiles);
        }
      });

      this._electronService.ipcRenderer.on('media-controls', (event, args) => {
        console.log(args);
        switch (args.status) {
          case 'next':
            this.setNextSong();
            this.playerTogglePlayPause();
            break;
          case 'previous':
            this.setPreviousSong();
            this.playerTogglePlayPause();
            break;
          case 'playPause':
            this.playerTogglePlayPause();
            break;
        }

      });


    });
  }

  private debug() {
    console.log(this.getData());
  }
}
