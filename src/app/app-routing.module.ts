import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SettingsComponent} from './components/settings/settings.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {DebugComponent} from './components/debug/debug.component';
import {SongComponent} from './components/song/song.component';
import {AudioVisualizerComponent} from './components/audio-visualizer/audio-visualizer.component';
import {LibraryComponent} from './components/library/library.component';
import {EqualizerComponent} from './components/equalizer/equalizer.component';
import {FavoritesComponent} from './components/favorites/favorites.component';
import {PlaylistsComponent} from './components/playlists/playlists.component';

const routes: Routes = [
//    { path: '', component: HomeComponent },
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'equalizer', component: EqualizerComponent},
  {path: 'library', component: LibraryComponent},
  {path: 'favorites', component: FavoritesComponent},
  {path: 'playLists', component: PlaylistsComponent},
  {path: 'settings', component: SettingsComponent},
  {path: 'debug', component: DebugComponent},
  {path: 'song', component: SongComponent},
  {path: 'audio-visualizer', component: AudioVisualizerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
