import {Component, OnDestroy, OnInit} from '@angular/core';
import {Song} from '../../mock/Song';
import {PlayerService} from '../../providers/player.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {


  public songListInFolder: Song[];
  private songListSubscription: Subscription;
  private panelOpenState: boolean[];

  constructor(private _playerService: PlayerService) {
    this.songListSubscription = this._playerService.getSongListObservable().subscribe((songList: Song[]) => {
      this.songListInFolder = songList;
      for (let index in this.songListInFolder) {
        this.panelOpenState[index] = false;
      }
    });
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.songListSubscription.unsubscribe();
  }

  showInfo(song: Song) {
    console.log('showInfo');
    console.log(song);
    console.log('song');
  }

}
