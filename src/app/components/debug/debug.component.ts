import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService } from '../../providers/player.service';
import { FileService } from '../../providers/file.service';

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

}
