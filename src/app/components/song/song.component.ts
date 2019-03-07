import {Component, OnInit} from '@angular/core';
import {interval} from 'rxjs';
import {PlayerService} from '../../providers/player.service';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.scss']
})
export class SongComponent implements OnInit {

  public rotate_turn: number = 0;

  private isPlaying;
  private timeOut: number = 100;
  private interval;

  constructor(private _playerService: PlayerService) {
    this.isPlaying = false;
    this.startTimer();
  }

  ngOnInit() {
    this._playerService.getAudioObservable().subscribe((audio: HTMLAudioElement) => {
      this.isPlaying = !audio.paused;
    });
  }

  startTimer() {
    this.interval = interval(this.timeOut);
    this.interval.subscribe(() => {

      this.rotateCassete();

    });
  }

  rotateCassete() {
    if (this.isPlaying) {

      this.rotate_turn += 0.05;
      if (this.rotate_turn >= 1) {
        this.rotate_turn = 0.0;
      }

    }
  }

}
