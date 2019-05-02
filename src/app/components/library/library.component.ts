import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {PlayerService} from '../../providers/player.service';
import {Song} from '../../mocks/Song';
import {Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {type} from 'os';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource: MatTableDataSource<Song> = new MatTableDataSource([]);
  public displayedColumns: string[] = ['play', 'title', 'album', 'artist'];
  private songListSubscription: Subscription;

  titleFilter = new FormControl('');
  albumFilter = new FormControl('');
  artistFilter = new FormControl('');
  filterValues = {
    title: '',
    album: '',
    artist: ''
  };

  constructor(private _playerService: PlayerService) {
    this.dataSource.filterPredicate = this.createFilter();
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
}
