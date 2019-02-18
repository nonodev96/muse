import {IAudioMetadata} from 'music-metadata-browser';

interface InterfaceSong {
  id: number | string;
  title: string;
  album: string;
  artist: string;
  src: string;
  imgData?: string;
  audioMetadata?: IAudioMetadata;
}

export class Song implements InterfaceSong {
  id: number | string;
  title: string;
  album: string;
  artist: string;
  src: string;
  imgData?: string;
  audioMetadata?: IAudioMetadata | null;

  // @ts-ignore
  constructor() {
    this.id  = '';
    this.title = '';
    this.album = '';
    this.artist = '';
    this.src = '';
    this.imgData = '';
    this.audioMetadata = <IAudioMetadata>{};
  }

  // @ts-ignore
  constructor(song?: any) {
    this.id = song && song.id || '';
    this.title = song && song.title || '';
    this.album = song && song.album || '';
    this.artist = song && song.artist || '';
    this.src = song && song.src || '';
    this.imgData = song && song.imgData || '';
    this.audioMetadata = song && song.audioMetadata || '';
  }
}
