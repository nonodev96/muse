import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatabaseService, InterfacePlayList, InterfacePlayLists} from '../../providers/database.service';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit, OnDestroy {

  public playLists: InterfacePlayLists;
  public selected_play_list: InterfacePlayList;

  constructor(private _databaseService: DatabaseService) {
    this.playLists = new class implements InterfacePlayLists {
      playLists: InterfacePlayList[];
    };
    this.playLists.playLists = [];
  }

  ngOnInit(): void {
    this._databaseService.getAllPlayLists().then((value: InterfacePlayLists) => {
      console.log(value);
      this.playLists.playLists = value.playLists;
    });
  }

  ngOnDestroy(): void {
  }

  onSelect(play_list: InterfacePlayList): void {
    this.selected_play_list = play_list;
  }

  play(playList_: InterfacePlayList) {
  }
}
