import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {InterfacePlayList} from '../../providers/database.service';
import {IAudioMetadata} from 'music-metadata';
import {Song} from '../../mocks/Song';
import {FileService} from '../../providers/file.service';
import {PlayerService} from '../../providers/player.service';

@Component({
  selector: 'app-playlists-detail',
  templateUrl: './playlists-detail.component.html',
  styleUrls: ['./playlists-detail.component.scss']
})
export class PlaylistsDetailComponent implements OnInit, OnChanges {
  @Input() playList: InterfacePlayList;
  public list: Song[] = [];

  constructor(private _fileService: FileService,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.playList.currentValue !== undefined) {
      this.loadAudioMetaDataFromPaths(changes.playList.currentValue.paths);
    }
  }

  private loadAudioMetaDataFromPaths(paths) {
    this.list = [];
    for (let pathFile of paths) {

      this._fileService.loadAudioMetaDataFromPath(pathFile).then(
        (audioMetadataValue: IAudioMetadata) => {

          let newSong = new Song({
            id: '1',
            title: audioMetadataValue.common.title,
            album: audioMetadataValue.common.album,
            artist: audioMetadataValue.common.artist,
            src: pathFile,
            audioMetadata: audioMetadataValue
          });
          if (audioMetadataValue.common.picture !== undefined) {
            let picture = audioMetadataValue.common.picture[0];
            if (picture !== undefined) {
              newSong.imgData = 'data:' + picture.format + ';base64,' + picture.data.toString('base64');
            }
          }

          this.list.push(newSong);

        });

    }
  }

  private playSong(song: Song): void {
    this._playerService.setPlayer(song);
    this._playerService.playerTogglePlayPause();
  }
}
