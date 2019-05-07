import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../providers/database.service';
import {Song} from '../../mocks/Song';
import {IAudioMetadata} from 'music-metadata';
import {FileService} from '../../providers/file.service';
import {PlayerService} from '../../providers/player.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {

  public favorites: Song[] = [];

  constructor(private _databaseService: DatabaseService,
              private _fileService: FileService,
              private _playerService: PlayerService) {
  }

  ngOnInit() {
    this.getAllFavorites();
  }

  getAllFavorites() {
    this._databaseService.getAllFavorites().then(value => {
      console.log(value);
      this.loadAudioMetaDataFromPaths(value.paths);
    });
  }

  private playSong(song: Song): void {
    this._playerService.setPlayer(song);
    this._playerService.playerTogglePlayPause();
  }


  private loadAudioMetaDataFromPaths(paths) {
    this.favorites = [];
    for (let pathFile of paths) {
      console.log(pathFile);

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

          this.favorites.push(newSong);

        });

    }
  }
}
