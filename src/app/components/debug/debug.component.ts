import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService } from '../../providers/player.service';
import { FileService } from '../../providers/file.service';
import mysql from 'mysql';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: [ './debug.component.scss' ]
})
export class DebugComponent implements OnInit, OnDestroy {

  constructor(private _playerService: PlayerService, private _fileService: FileService) {
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

  database(){
    let connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'museujaen',
      database: 'museujaen'
    });
    connection.connect();
    connection.query('SELECT 1 + 1 AS result', function (error, results, fields) {
      if (error) throw error;
      console.log('1 + 1 = ', results[0].result);
    });
    connection.end();

  }
}
