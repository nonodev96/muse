import { Component, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { PlayerService } from '../../providers/player.service';
import { Subscription } from 'rxjs';
import { Song } from '../../mocks/Song';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: [ './player.component.scss' ]
})
export class PlayerComponent implements OnInit, OnDestroy {
  @HostBinding('class') menuClass = 'player';

  public audio: HTMLAudioElement;
  public song: Song;
  public volume: number;
  public durationTime: number;
  public elapsedTime: number;
  public currentTime: number;
  public isPaused: boolean;

  private audioSubscription: Subscription;
  private songSubscription: Subscription;
  private dataCurrentTimeSubscription: Subscription;
  private dataTotalTimeSubscription: Subscription;
  private dataElapsedTimeSubscription: Subscription;

  constructor(private _playerService: PlayerService) {
    this.audio = this._playerService.getAudio();
    this.song = this._playerService.getSong();
    this.volume = this._playerService.getVolume();
    this.isPaused = false;
    console.log('construct');
  }

  @HostListener('window:keyup', [ '$event' ])
  keyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.pTogglePlayStop();
    } else if (event.code === 'ArrowUp') {
      this.volume = (this.volume + 0.05 < 1) ? this.volume + 0.05 : 1;
      this.setVolume(this.volume);
    } else if (event.code === 'ArrowDown') {
      this.volume = (this.volume - 0.05 > 0) ? this.volume - 0.05 : 0;
      this.setVolume(this.volume);
    } else if (event.code === 'ArrowLeft') {
      this.pStepBackward();
    } else if (event.code === 'ArrowRight') {
      this.pStepForward();
    }
  }

  ngOnInit(): void {
    this.audioSubscription = this._playerService.getAudioObservable()
      .subscribe((audio: HTMLAudioElement) => {
        this.audio = audio;
        this.isPaused = !this.audio.paused;
      });
    this.songSubscription = this._playerService.getSongObservable()
      .subscribe((song: Song) => {
        this.song = song;
      });
    this.dataCurrentTimeSubscription = this._playerService.getCurrentTimeObservable()
      .subscribe((currentTimeObservableValue: number) => {
        this.currentTime = currentTimeObservableValue;
      });
    this.dataTotalTimeSubscription = this._playerService.getDurationTimeObservable()
      .subscribe((totalTimeObservableValue: number) => {
        this.durationTime = totalTimeObservableValue;
      });
    this.dataElapsedTimeSubscription = this._playerService.getElapsedTimeObservable()
      .subscribe((elapsedTimeObservableValue: number) => {
        this.elapsedTime = elapsedTimeObservableValue;
      });
  }

  ngOnDestroy(): void {
    this.audioSubscription.unsubscribe();
    this.songSubscription.unsubscribe();
    this.dataCurrentTimeSubscription.unsubscribe();
    this.dataTotalTimeSubscription.unsubscribe();
    this.dataElapsedTimeSubscription.unsubscribe();
  }

  /**
   * Previous song
   */
  public pStepBackward() {
    this._playerService.setPreviousSong();
    this._playerService.playerTogglePlayPause();
  }

  /**
   * Play Pause song
   */
  public pTogglePlayStop() {
    this._playerService.playerTogglePlayPause();
  }

  /**
   * Next song
   */
  public pStepForward() {
    this._playerService.setNextSong();
    this._playerService.playerTogglePlayPause();
  }

  private setCurrentTime(value: number) {
    this._playerService.setCurrentTime(value);
  }

  private setVolume(value: number) {
    this._playerService.setVolume(value);
  }

  /***
   * Modificar el tiempo en el reproductor
   * @param $event
   */
  public onInputChangeTimeSong($event: MatSliderChange) {
    this.setCurrentTime($event.value);
  }

  /***
   * Modificar el volumen del reproductor
   * @param $event
   */
  public onInputChangeVolume($event: MatSliderChange) {
    this.setVolume($event.value);
  }

  public getFormatTimeLikeSpotify(time: number) {
    if (typeof time === 'undefined' || isNaN(time)) {
      time = 0;
    }
    const sec_num: any = parseInt(time + '', 10); // don't forget the second param
    const hours: any = Math.floor(sec_num / 3600);
    let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds: any = sec_num - (hours * 3600) - (minutes * 60);

    if (hours >= 1) {
      minutes += 60;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  }
}
