import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSnackBar, MatSort, MatTableDataSource} from '@angular/material';
import {PlayerService} from '../../providers/player.service';
import {Song} from '../../mocks/Song';
import {Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {type} from 'os';
import {DatabaseService, InterfacePlayList, InterfacePlayLists} from '../../providers/database.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource: MatTableDataSource<Song> = new MatTableDataSource([]);
  public displayedColumns: string[] = ['play', 'title', 'album', 'artist', 'config'];
  private songListSubscription: Subscription;
  public allPlayLists: InterfacePlayLists;

  titleFilter = new FormControl('');
  albumFilter = new FormControl('');
  artistFilter = new FormControl('');
  filterValues = {
    title: '',
    album: '',
    artist: ''
  };

  constructor(private _playerService: PlayerService,
              private _databaseService: DatabaseService,
              private snackBar: MatSnackBar) {
    this.dataSource.filterPredicate = this.createFilter();
    this.allPlayLists = new class implements InterfacePlayLists {
      playLists: InterfacePlayList[];
    };
    this.allPlayLists.playLists = [];
  }

  ngOnInit() {
    this.titleFilter.valueChanges.subscribe(value => {
      this.filterValues.title = value;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.albumFilter.valueChanges.subscribe(value => {
      this.filterValues.album = value;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.artistFilter.valueChanges.subscribe(value => {
      this.filterValues.artist = value;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    });
    this.songListSubscription = this._playerService.getSongListObservable()
      .subscribe((songList: Song[]) => {
        this.dataSource.data = songList;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    this._playerService.updateSongListSubscription();

    this._databaseService.getAllPlayLists().then(value => {
      this.allPlayLists = value;
    });
  }

  /**
   * Override of filters
   */
  createFilter(): (data: Song, filter: string) => boolean {
    return (data: Song, filter: string): boolean => {
      let searchTerms = JSON.parse(filter.trim().toLowerCase());
      return data.title.toLowerCase().indexOf(searchTerms.title) !== -1
        && data.album.toString().toLowerCase().indexOf(searchTerms.album) !== -1
        && data.artist.toLowerCase().indexOf(searchTerms.artist) !== -1;
    };
  }

  play_music(song: Song) {
    this._playerService.setPlayer(song);
    this._playerService.playerTogglePlayPause();
  }

  addToPlayList(playList: InterfacePlayList, song: Song) {
    this._databaseService.addSongPathToPlayList(playList.name, song.src).then(value => {
      if (value === true) {
        this.openSnackBar('Se ha añadido correctamente la canción ' + song.title + ' a la playlist ' + playList.name);
      } else if (value === false) {
        this.openSnackBar('No se ha añadido la canción ' + song.title + ' a la playlist ' + playList.name + ' por un error');
      } else {
        this.openSnackBar(value);
      }
    });
  }

  private openSnackBar(message: string, action: string = 'Undo') {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
