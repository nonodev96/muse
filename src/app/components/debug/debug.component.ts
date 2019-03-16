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

  database() {
    this._databaseService.database();
  }

  addFavorite() {
    let songPathToAdd: InterfaceFavoriteToAdd = {
      path: 'favorite ' + this.i
    };
    this._databaseService.addFavorite(songPathToAdd);
    this.i++;
    if (this.i >= 10) {
      this.i = 0;
    }
  }

  /**
   * multiple add not is atomic
   */
  addAllFavorites() {
    for (let i = 0; i < 10; i++) {
      let songPathToAdd: InterfaceFavoriteToAdd = {
        path: 'favorite ' + i
      };
      this._databaseService.addFavorite(songPathToAdd);
    }
  }

  deleteFavorite() {
    let songPathToDelete: InterfaceFavoriteToDelete = {
      path: 'favorite 5'
    };
    this._databaseService.deleteFavorite(songPathToDelete);
  }

  /**
   * multiple delete not is atomic
   */
  deleteAllFavorites() {
    for (let i = 0; i < 10; i++) {
      let songPathToDelete: InterfaceFavoriteToDelete = {
        path: 'favorite ' + i
      };
      this._databaseService.deleteFavorite(songPathToDelete);
    }
  }

  getAllFavorites() {
    this._databaseService.getAllFavorites();
  }

  openSnackBar() {
    this.snackBar.open('Message archived', 'Undo', {
      duration: 3000
    });
  }
}
