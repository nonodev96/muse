import {Component, OnInit, ViewChild} from '@angular/core';
import {ElectronService} from './providers/electron.service';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {PlayerService} from './providers/player.service';
import {Song} from './mocks/Song';
import {MatSidenav, MatSnackBar} from '@angular/material';
import {
  DatabaseService,
  EnumAddFavorites,
  EnumDeleteFavorites,
  InterfaceFavoriteToAdd,
  InterfaceFavoriteToDelete
} from './providers/database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('elementSidenavID') matSidenavRef: MatSidenav;

  public song: Song;
  public TOOLBAR_TITLE: string;
  public SIDENAV_HEADER_TITLE: string;
  private songSubscription: Subscription;

  constructor(public electronService: ElectronService,
              private translate: TranslateService,
              private _playerService: PlayerService,
              private _databaseService: DatabaseService,
              private snackBar: MatSnackBar) {
    // console.log('AppConfig', AppConfig);
    this.translate.setDefaultLang('es');

    if (ElectronService.isServer()) {
    } else {
      // console.log('Mode electron');
      // console.log('Electron ipcRenderer', electronService.ipcRenderer);
      // console.log('NodeJS childProcess', electronService.childProcess);
      // console.log('Mode web');
    }
  }

  ngOnInit(): void {
    this.translate.get('APP_TOOLBAR_TITLE').subscribe(value => {
      this.TOOLBAR_TITLE = value;
    });
    this.translate.get('APP_SIDENAV_HEADER_TITLE').subscribe(value => {
      this.SIDENAV_HEADER_TITLE = value;
    });
    this.songSubscription = this._playerService.getSongObservable().subscribe(song => {
      this.song = song;
      this.TOOLBAR_TITLE = this.song.title;
    });
  }

  public addSongToFavorites(song: Song) {
    if (song !== undefined) {
      let favoriteToAdd: InterfaceFavoriteToAdd = new class implements InterfaceFavoriteToAdd {
        path: string = song.src;
      };
      this._databaseService.addFavorite(favoriteToAdd).then(value => {
        if (value === EnumAddFavorites.THE_SONG_HAS_BEEN_ADDED) {
          this.openSnackBar('La cancion se ha añadido de favoritos');
        } else if (value === EnumAddFavorites.THE_SONG_HAS_NOT_BEEN_ADDED) {
          this.openSnackBar('La cancion no se ha podido añadir a favoritos por un error');
        } else {
          this.openSnackBar('La cancion ya estaba en favoritos');
        }
      });
    } else {
      this.openSnackBar('No tienes cancion seleccionada');
    }
  }

  public deleteSongFromFavorites(song: Song) {
    if (song !== undefined) {
      let favoriteToDelete: InterfaceFavoriteToDelete = new class implements InterfaceFavoriteToDelete {
        path: string = song.src;
      };
      this._databaseService.deleteFavorite(favoriteToDelete).then(value => {
        if (value === EnumDeleteFavorites.THE_SONG_HAS_BEEN_DELETE) {
          this.openSnackBar('La canción "' + song.title + '" ha sido eliminada de favoritos');
        } else if (value === EnumDeleteFavorites.THE_SONG_HAS_NOT_BEEN_DELETE) {
          this.openSnackBar('La cancion "' + song.title + '" no se ha podido borrar de favoritos');
        } else if (value === EnumDeleteFavorites.THE_SONG_IS_NOT_IN_FAVORITES) {
          this.openSnackBar('La cancion "' + song.title + '" no esta en favoritos');
        }
      });
    } else {
      this.openSnackBar('No tienes cancion seleccionada');
    }
  }

  public toggleSidenav() {
    this.matSidenavRef.toggle().then(() => {
    });
  }

  public closeSidenav() {
    this.matSidenavRef.close().then(() => {
    });
  }

  private openSnackBar(message: string, action: string = 'Ocultar') {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
