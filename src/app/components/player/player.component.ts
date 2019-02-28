import { Component, HostBinding, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { PlayerService } from '../../providers/player.service';
import { Subscription } from 'rxjs';
import { Song } from '../../mock/Song';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {
  @HostBinding('class') menuClass = 'player';

  public data_song: Song;
  public currentTime: number;
  public durationTime: number;
  public elapsedTime: number;
  public isPlaying: boolean;
  public volume: number;

  private dataSongSubscription: Subscription;
  private dataCurrentTimeSubscription: Subscription;
  private dataTotalTimeSubscription: Subscription;
  private dataElapsedTimeSubscription: Subscription;

  constructor(private _playerService: PlayerService) {
    this.isPlaying = false;
    this.volume = 1;
    this.data_song = new Song();
  }

  @HostListener('window:keyup', ['$event'])
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
    this.dataSongSubscription = this._playerService.getSongObservable().subscribe(song => this.data_song = song);
    this.dataCurrentTimeSubscription = this._playerService.getCurrentTimeObservable().subscribe(data => this.currentTime = data);
    this.dataTotalTimeSubscription = this._playerService.getDurationTimeObservable().subscribe(data => this.durationTime = data);
    this.dataElapsedTimeSubscription = this._playerService.getElapsedTimeObservable().subscribe(data => this.elapsedTime = data);
  }

  ngOnDestroy(): void {
    this.dataSongSubscription.unsubscribe();
    this.dataCurrentTimeSubscription.unsubscribe();
    this.dataTotalTimeSubscription.unsubscribe();
    this.dataElapsedTimeSubscription.unsubscribe();
  }

  public pStepBackward() {
    console.log('pStepBackward');
  }

  public pTogglePlayStop() {
    console.log('pTogglePlayStop');
    this.isPlaying = !this._playerService.playerTogglePlayPause();
  }

  public pStepForward() {
    console.log('pStepForward');
  }

  private setCurrentTime(value: number) {
    this._playerService.setCurrentTime(value);
  }

  private setVolume(value: number) {
    this._playerService.setVolume(value);
  }

  public onInputChangeTimeSong($event: MatSliderChange) {
    this.setCurrentTime($event.value);
  }

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
