import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {PlayerService} from '../../providers/player.service';
import {Song} from '../../mocks/Song';
import {commonLabels, formatLabels, TagLabel} from './format-tags';
import * as mmb from 'music-metadata-browser';

interface IValue {
  text: string;
  ref?: string;
}

interface ITagText {
  key: string;
  label: IValue;
  value: IValue[];
}

interface IUrlAsFile {
  name: string;
  type: string;
}

interface IFileAnalysis {
  file: File | IUrlAsFile;
  metadata?: mmb.IAudioMetadata;
  parseError?: Error;
}

interface ITagList {
  title: string;
  key: string;
  tags?: ITagText[];
}

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.scss']
})
export class SongComponent implements OnInit, OnDestroy {

  public audio: HTMLAudioElement;
  public song: Song;
  public rotate_turn: number = 0;

  private audioSubscription: Subscription;
  private songSubscription: Subscription;
  private interval;
  private readonly timeOut: number = 200;


  public tagLists: ITagList[] = [{
    title: 'Format',
    key: 'format'
  }, {
    title: 'Generic tags',
    key: 'common'
  }];

  public nativeTags: {
    type: string, tags: {
      id: string,
      value: string
    }[]
  }[] = [];


  constructor(private _playerService: PlayerService) {
    this.audio = this._playerService.getAudio();
    this.song = this._playerService.getSong();
  }

  ngOnInit() {
    this.audioSubscription = this._playerService.getAudioObservable()
      .subscribe((audio: HTMLAudioElement) => {
        this.audio = audio;
      });
    this.songSubscription = this._playerService.getSongObservable()
      .subscribe((song: Song) => {
        this.song = song;
        if (this.song.audioMetadata.format !== undefined &&
          this.song.audioMetadata.common !== undefined &&
          this.song.audioMetadata.native !== undefined) {

          this.tagLists[0].tags = this.prepareTags(formatLabels, song.audioMetadata.format);
          this.tagLists[1].tags = this.prepareTags(commonLabels, song.audioMetadata.common);
          this.nativeTags = this.prepareNativeTags(song.audioMetadata.native);

        }
      });
    this._playerService.updateSongSubscription();
    this.startTimer();
  }

  ngOnDestroy() {
    this.audioSubscription.unsubscribe();
    this.songSubscription.unsubscribe();
    clearInterval(this.interval);
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.rotateCassette();
    }, this.timeOut);
  }

  rotateCassette() {
    if (!this.audio.paused) {
      this.rotate_turn += 0.05;
      if (this.rotate_turn >= 1) {
        this.rotate_turn = 0.0;
      }
    }
  }

  private prepareTags(labels: TagLabel[], tags): ITagText[] {
    if (tags !== undefined) {
      return labels.filter(label => tags.hasOwnProperty(label.key)).map(label => {
          const av = Array.isArray(tags[label.key]) ? tags[label.key] : [tags[label.key]];
          return {
            key: label.key,
            label: {text: label.label, ref: label.keyRef},
            value: av.map(v => {
              return {
                text: label.toText ? label.toText(v) : v,
                ref: label.valueRef ? label.valueRef(v) : undefined
              };
            })
          };
        }
      );
    }
  }

  private prepareNativeTags(tags): { type: string, tags: { id: string, value: string }[] }[] {
    return Object.keys(tags).map(type => {
      return {
        type,
        tags: tags[type]
      };
    });
  }

}
