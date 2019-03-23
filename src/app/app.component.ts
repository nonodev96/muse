import { Component, OnInit, ViewChild } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PlayerService } from './providers/player.service';
import { Song } from './mocks/Song';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  @ViewChild('elementSidenavID') matSidenavRef: MatSidenav;

  public song: Song;
  public TOOLBAR_TITLE: string;
  public SIDENAV_HEADER_TITLE: string;
  private songSubscription: Subscription;

  constructor(public electronService: ElectronService,
              private translate: TranslateService,
              private _playerService: PlayerService) {
    // console.log('AppConfig', AppConfig);
    this.translate.setDefaultLang('es');

    if (electronService.isElectron()) {
      // console.log('Mode electron');
      // console.log('Electron ipcRenderer', electronService.ipcRenderer);
      // console.log('NodeJS childProcess', electronService.childProcess);
    } else {
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

  public toggleSidenav() {
    this.matSidenavRef.toggle().then(() => {
    });
  }

  public closeSidenav() {
    this.matSidenavRef.close().then(() => {
    });
  }
}
