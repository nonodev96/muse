import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService } from '../../providers/player.service';
import { FileService } from '../../providers/file.service';
import { ElectronService } from '../../providers/electron.service';
import { DatabaseService, InterfaceFavorites, InterfaceFavoriteToAdd, InterfaceFavoriteToDelete } from '../../providers/database.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: [ './debug.component.scss' ]
})
export class DebugComponent implements OnInit, OnDestroy {

  i: number;
  namePlayList: string = '';
  nameSongPath: string = '';

  constructor(private _databaseService: DatabaseService,
              private _electronService: ElectronService,
              private _playerService: PlayerService,
              private _fileService: FileService,
              private snackBar: MatSnackBar) {
    this.i = 0;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  data() {
    console.log(this._playerService.getData());
  }

  load() {
    this._fileService.loadFilesFromFolderContent().then((data) => {
      console.log(data);
    });
  }

  addFavorite() {
    let songPathToAdd: InterfaceFavoriteToAdd = {
      path: 'favorite ' + this.i
    };
    this._databaseService.addFavorite(songPathToAdd).then(value => {
      if (value === true) {
        this.openSnackBar('La cancion se ha añadido a favoritos');
      } else if (value === false) {
        this.openSnackBar('La cancion no se ha podido añadir a favoritos por un error');
      } else {
        this.openSnackBar(value);
      }
    });
    this.i++;
    if (this.i >= 10) {
      this.i = 0;
    }
  }

  deleteFavorite() {
    let songPathToDelete: InterfaceFavoriteToDelete = {
      path: 'favorite 5'
    };
    this._databaseService.deleteFavorite(songPathToDelete).then(value => {
      if (value === true) {
        this.openSnackBar('La cancion se ha borrado de favoritos');
      } else if (value === false) {
        this.openSnackBar('La cancion no se ha podido borrar de favoritos por un error');
      } else {
        this.openSnackBar(value);
      }
    });
  }

  getAllFavorites() {
    this._databaseService.getAllFavorites();
  }

  database() {
    this._databaseService.database();
  }

  createNewPlaylist() {
    let namePlayListToCreate = this.namePlayList;
    console.log('Se va a crear la playlist ' + namePlayListToCreate);

    this._databaseService.createPlayList(namePlayListToCreate).then(value => {
      if (value === true) {
        this.openSnackBar('La playlist se ha creado correctamente');
      } else if (value === false) {
        this.openSnackBar('La playlist no se ha podido crear por un error');
      } else {
        this.openSnackBar(value);
      }
    });
  }

  deletePlaylist() {
    let namePlayListToDelete = this.namePlayList;
    console.log('Se va a borrar la playlist ' + namePlayListToDelete);

    this._databaseService.deletePlayList(namePlayListToDelete).then(value => {
      if (value === true) {
        this.openSnackBar('La playlist se ha borrado correctamente');
      } else if (value === false) {
        this.openSnackBar('La playlist no se ha podido borrar por un error');
      } else {
        this.openSnackBar(value);
      }
    });
  }

  addSongPathToPlayList() {
    let namePlayList = this.namePlayList;
    let nameSongPath = this.nameSongPath;
    console.log(namePlayList + ' - ' + nameSongPath);

    this._databaseService.addSongPathToPlayList(namePlayList, nameSongPath).then(value => {
      if (value === true) {
        this.openSnackBar('Se ha añadido correctamente la canción ' + nameSongPath + ' a la playlist ' + namePlayList);
      } else if (value === false) {
        this.openSnackBar('No se ha añadido la canción ' + nameSongPath + ' a la playlist ' + namePlayList + ' por un error');
      } else {
        this.openSnackBar(value);
      }
    });
  }

  updateInputPlayList(namePlayList: string) {
    this.namePlayList = namePlayList;
  }

  updateInputSongPath(nameSongPath: string) {
    this.nameSongPath = nameSongPath;
  }

  private openSnackBar(message: string, action: string = 'Undo') {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

}
