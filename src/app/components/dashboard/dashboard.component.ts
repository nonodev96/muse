import { Component, OnDestroy, OnInit } from '@angular/core';
import { Song } from '../../mocks/Song';
import { PlayerService } from '../../providers/player.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.scss' ]
})
export class DashboardComponent implements OnInit, OnDestroy {


  public songListInFolder: Song[] = [];

  private panelOpenState: boolean[] = [];
  private songListSubscription: Subscription;

  constructor(private _playerService: PlayerService) {
    this.songListInFolder = this._playerService.getSongList();
  }

  ngOnInit() {
    this.songListSubscription = this._playerService.getSongListObservable().subscribe((songList: Song[]) => {
      this.songListInFolder = songList;
    });
  }

  ngOnDestroy(): void {
    this.songListSubscription.unsubscribe();
  }

  public loadDashboard() {
    this._playerService.updateSongListSubscription();
  }

  public showInfo(song: Song) {
    console.log('showInfo');
    console.log(song);
    console.log('end showInfo');
  }

  public playSong(song: Song) {
    this._playerService.setPlayer(song);
    this._playerService.playerTogglePlayPause();
  }

  public debug() {
    console.log({
      'panelOpenState': this.panelOpenState,
      'songListInFolder': this.songListInFolder
    });
  }
}
