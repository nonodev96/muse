import {Component, OnInit} from '@angular/core';
import { interval, Subscription } from 'rxjs';
import {PlayerService} from '../../providers/player.service';
import { Song } from '../../mock/Song';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.scss']
})
export class SongComponent implements OnInit {

  public audio: HTMLAudioElement;
  public song: Song;
  public rotate_turn: number = 0;

  private audioSubscription: Subscription;
  private songSubscription: Subscription;
  private timeOut: number = 100;
  private interval;

  constructor(private _playerService: PlayerService) {
    this.audio = this._playerService.getAudio();
    this.song = this._playerService.getSong();
  }

  ngOnInit() {
    this.audioSubscription = this._playerService.getAudioObservable().subscribe((audio: HTMLAudioElement) => {
      this.audio = audio;
    });
    this.songSubscription = this._playerService.getSongObservable().subscribe((song: Song) => {
      this.song = song;
    });
    this.startTimer();
  }

  startTimer() {
    this.interval = interval(this.timeOut);
    this.interval.subscribe(() => {
      this.rotateCassete();
    });
  }

  rotateCassete() {
    if (this.audio.paused) {

      this.rotate_turn += 0.05;
      if (this.rotate_turn >= 1) {
        this.rotate_turn = 0.0;
      }

    }
  }

}
