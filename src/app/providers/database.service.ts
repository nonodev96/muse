import { Injectable } from '@angular/core';
import storage from 'electron-json-storage';

enum DataBase {
  favorites = 'favorites',
  playlists = 'playlists'
}

export interface InterfaceFavorites {
  paths: string[];
}

export interface InterfacePlaylist {
  name: string;
  paths: string[];
}

export interface InterfacePlaylists {
  playlists: InterfacePlaylist[];
}

export interface InterfaceFavoriteToDelete {
  path: string;
}

export interface InterfaceFavoriteToAdd {
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  dataBaseJsonPath: string;

  constructor() {
    this.dataBaseJsonPath = storage.getDataPath();
    this.initDataBase();
  }

  public addFavorite(songPathToAdd: InterfaceFavoriteToAdd): Promise<string | boolean> {
    return new Promise((resolve) => {
      let dataBaseJsonPath = this.dataBaseJsonPath;
      storage.get(DataBase.favorites, dataBaseJsonPath, function (errorGET, dataJSON_favorites: InterfaceFavorites) {
        let valueToAdd = songPathToAdd.path;

        // If not exist, add to the list and update
        if (dataJSON_favorites.paths.indexOf(valueToAdd) === -1) {
          dataJSON_favorites.paths.push(valueToAdd);

          let updateFavorites: InterfaceFavorites = {
            paths: dataJSON_favorites.paths
          };
          storage.set(DataBase.favorites, updateFavorites, dataBaseJsonPath, function (error_SET) {
            if (error_SET !== undefined) {
              console.log('error_SET' + error_SET);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve('La canción ' + songPathToAdd.path + ' ya existe en la lista de favoritos');
        }

      });
    });
  }

  public deleteFavorite(songPathToDelete: InterfaceFavoriteToDelete): Promise<string | boolean> {
    return new Promise((resolve) => {
      let dataBaseJsonPath = this.dataBaseJsonPath;
      storage.get(DataBase.favorites, dataBaseJsonPath, function (error_GET, dataJSON_favorites: InterfaceFavorites) {

        // to remove from the array
        let valueToRemove = songPathToDelete.path;
        if (dataJSON_favorites.paths.indexOf(valueToRemove) === -1) {
          resolve('La canción ' + songPathToDelete.path + ' no existe en la lista de favoritos');
        }
        dataJSON_favorites.paths = dataJSON_favorites.paths.filter(element => element !== valueToRemove);

        // to clean and sort the array
        dataJSON_favorites.paths = dataJSON_favorites.paths.filter(element => element != null);

        let updateFavorites: InterfaceFavorites = {
          paths: dataJSON_favorites.paths
        };
        storage.set(DataBase.favorites, updateFavorites, dataBaseJsonPath, function (error_SET) {
          if (error_SET !== undefined) {
            console.log('error_SET' + error_SET);
            resolve(false);
          } else {
            resolve(true);
          }
        });

      });
    });
  }

  public getAllFavorites() {
    storage.get(DataBase.favorites, this.dataBaseJsonPath, function (error, data) {
      console.log(data);
      console.log(error);
    });
  }

  public createPlayList(nameNewPlaylist: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;
    return new Promise((resolve) => {
      storage.get(DataBase.playlists, dataBaseJsonPath, function (error_GET, dataJSON_playlists: InterfacePlaylists) {

        // find playlist in the list of playlists
        let search = dataJSON_playlists.playlists.find(playlist => {
          return playlist.name === nameNewPlaylist;
        });

        // The playlist not exist
        if (search === undefined) {
          let initNewPlaylist: InterfacePlaylist = {
            name: nameNewPlaylist,
            paths: []
          };
          dataJSON_playlists.playlists.push(initNewPlaylist);
          storage.set(DataBase.playlists, dataJSON_playlists, dataBaseJsonPath, function (error_SET) {
            if (error_SET !== undefined) {
              console.log('error_SET' + error_SET);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve('La playlist "' + nameNewPlaylist + ' ya existe"');
        }

      });
    });
  }

  public deletePlayList(namePlaylistToDelete: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;
    return new Promise((resolve) => {
      storage.get(DataBase.playlists, dataBaseJsonPath, function (error_GET, dataJSON_playlists: InterfacePlaylists) {

        console.log(dataJSON_playlists);
        // find playlist in the list of playlists
        let search = dataJSON_playlists.playlists.find(playlist => {
          return playlist.name === namePlaylistToDelete;
        });
        console.log(search);

        // If playlist exist, delete and save
        if (search !== undefined) {
          dataJSON_playlists.playlists = dataJSON_playlists.playlists.filter(playlist => {
            return playlist.name !== namePlaylistToDelete;
          });
          console.log(dataJSON_playlists);

          storage.set(DataBase.playlists, dataJSON_playlists, dataBaseJsonPath, function (error_SET) {
            if (error_SET !== undefined) {
              console.log('error_SET' + error_SET);
              resolve(false);
            } else {
              resolve(true);
            }
          });

        } else {
          resolve('La playlist "' + namePlaylistToDelete + ' no existe"');
        }
      });
    });
  }

  public database() {
    storage.keys(function (error, keys) {
      if (error) {
        throw error;
      } else {
        for (let key of keys) {
          console.log('There is a key called: ' + key);
        }
      }
    });
  }

  public initDataBase() {
    storage.keys(function (error, tables: string[]) {
      if (error) {
        throw error;
      } else {
        let dataBaseJsonPath = storage.getDataPath();

        if (tables.indexOf(DataBase.favorites) === -1) {
          let initFavorites: InterfaceFavorites = {
            paths: []
          };
          storage.set(DataBase.favorites, initFavorites, dataBaseJsonPath, function (error_INIT) {
            if (error_INIT !== undefined) {
              console.log(error_INIT);
            }
          });
        }

        if (tables.indexOf(DataBase.playlists) === -1) {
          let initPlaylists: InterfacePlaylists = {
            playlists: [ {
              name: '',
              paths: [ '' ]
            } ]
          };
          storage.set(DataBase.playlists, initPlaylists, dataBaseJsonPath, function (error_INIT) {
            if (error_INIT !== undefined) {
              console.log(error_INIT);
            }
          });
        }
      }
    });

  }
}
