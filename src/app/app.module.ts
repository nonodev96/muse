import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';
import { MatButtonModule, MatSliderModule, MatIconModule, MatListModule, MatToolbarModule, MatExpansionModule } from '@angular/material';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PlayerComponent } from './components/player/player.component';
import { PlaylistsComponent } from './components/playlists/playlists.component';
import { PlaylistsDetailComponent } from './components/playlists-detail/playlists-detail.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SongComponent } from './components/song/song.component';
import { AlbumComponent } from './components/album/album.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DebugComponent } from './components/debug/debug.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    PlayerComponent,
    PlaylistsComponent,
    PlaylistsDetailComponent,
    FavoritesComponent,
    SettingsComponent,
    SongComponent,
    AlbumComponent,
    DashboardComponent,
    DebugComponent
  ],
  imports: [
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatExpansionModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
