import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Song} from '../mocks/Song';
import {FileService} from './file.service';
import {IAudioMetadata} from 'music-metadata/lib/type';
import {ElectronService} from './electron.service';
import {DataBase, DatabaseService, InterfacePlayList} from './database.service';
import {Utils} from '../utils/utils';


interface InterfaceDataPlayer {
  ANALYSER_NODES: WeakMap<HTMLAudioElement, AnalyserNode>;
  audio: HTMLAudioElement;
  song: Song;
  songList: Song[];
  iterator: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private ANALYSER_NODES: WeakMap<HTMLAudioElement, AnalyserNode> = new WeakMap();

  private audio: HTMLAudioElement;
  private audioContext: AudioContext;
  private audioContextAnalyserNode: AnalyserNode;
  private sourceMediaElementContextAudio: MediaElementAudioSourceNode;
  private song: Song;
  private songList: Song[] = [];

  private iterator: number = -1;
  private audioObservable = new Subject<HTMLAudioElement>();
  private songListObservable = new Subject<Song[]>();
  private songObservable = new Subject<Song>();
  private currentTimeObservable = new Subject<number>();
  private durationTimeObservable = new Subject<number>();
  private elapsedTimeObservable = new Subject<number>();
  private ANALYSER_NODES_Observable = new Subject<WeakMap<HTMLAudioElement, AnalyserNode>>();
  private musicFiles: string[] = [];

  constructor(private _fileService: FileService,
              private _databaseService: DatabaseService,
              private _electronService: ElectronService
  ) {
    console.log('init player service');
    this.song = new Song();
    this.audio = new Audio();
    this.audioContext = new AudioContext();
    this.audioContextAnalyserNode = this.audioContext.createAnalyser();
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

  public get_MEDIA_ELEMENT_NODES_Observable(): Observable<WeakMap<HTMLAudioElement, AnalyserNode>> {
    return this.ANALYSER_NODES_Observable.asObservable();
  }

  public updateAudioSubscription() {
    this.audioObservable.next(this.audio);
  }

  public update_ANALYSER_NODES_Subscription() {
    this.ANALYSER_NODES_Observable.next(this.ANALYSER_NODES);
  }

  public playerTogglePlayPause() {
    if (this.audio.paused === true) {
      let playPromise = this.audio.play();
      playPromise.then(() => {

      }).catch(function (error) {

      });
    } else {
      this.audio.pause();
    }
    this.songObservable.next(this.song);
    this.audioObservable.next(this.audio);
    this.ANALYSER_NODES_Observable.next(this.ANALYSER_NODES);

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
    this.audio.src = song.src;
    // this.audio.src = './assets/08 - Gibu.mp3';
    this.audio.load();

    if (this.ANALYSER_NODES.has(this.audio)) {
      this.audioContextAnalyserNode = this.ANALYSER_NODES.get(this.audio);
    } else {
      this.audioContext = new AudioContext();
      this.audioContextAnalyserNode = this.audioContext.createAnalyser();

      this.sourceMediaElementContextAudio = this.audioContext.createMediaElementSource(this.audio);
      this.sourceMediaElementContextAudio.connect(this.audioContextAnalyserNode);
      this.audioContextAnalyserNode.connect(this.audioContext.destination);

      this.ANALYSER_NODES.set(this.audio, this.audioContextAnalyserNode);
    }

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
      'ANALYSER_NODES': this.ANALYSER_NODES,
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
    this._databaseService.addSongsPathToPlayList(DataBase.songsLoad, differenceMusicFiles).then(value => {

      // console.log(value);

    });

    for (let index in differenceMusicFiles) {
      let pathFile: string = differenceMusicFiles[index];
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
          let arrayMusicFiles: string[] = [...args.musicFiles];
          this.initPlayerFromMusicFiles(arrayMusicFiles);
        }
      });

    });
  }

  private debug() {
    console.log(this.getData());
  }
}
