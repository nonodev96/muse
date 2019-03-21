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
    this.getSongList();
  }

  ngOnDestroy(): void {
    this.songListSubscription.unsubscribe();
  }

  loadDashboard() {
    this.getSongList();
  }

  showInfo(song: Song) {
    console.log('showInfo');
    console.log(song);
    console.log('song');
  }

  debug() {
    console.log({
      'panelOpenState': this.panelOpenState,
      'songListInFolder': this.songListInFolder
    });
  }

  private getSongList() {
    this.songListSubscription = this._playerService.getSongListObservable().subscribe((songList: Song[]) => {
      this.songListInFolder = songList;
    });
  }

  playSong(song: Song) {
    this._playerService.setPlayer(song);
    this._playerService.playerTogglePlayPause();
  }
}
