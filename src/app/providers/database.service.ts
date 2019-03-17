import { Injectable } from '@angular/core';
import storage from 'electron-json-storage';

enum DataBase {
  favorites = 'favorites',
  playlists = 'playlists'
}

export interface InterfaceFavorites {
  paths: string[];
}

export interface InterfacePlayList {
  name: string;
  paths: string[];
}

export interface InterfacePlayLists {
  playLists: InterfacePlayList[];
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
      storage.get(DataBase.playlists, dataBaseJsonPath, function (error_GET, dataJSON_playlists: InterfacePlayLists) {

        // find playlist in the list of playlists
        let search = dataJSON_playlists.playLists.find(playlist => {
          return playlist.name === nameNewPlaylist;
        });

        // The playlist not exist
        if (search === undefined) {
          let initNewPlaylist: InterfacePlayList = {
            name: nameNewPlaylist,
            paths: []
          };
          dataJSON_playlists.playLists.push(initNewPlaylist);
          storage.set(DataBase.playlists, dataJSON_playlists, dataBaseJsonPath, function (error_SET) {
            if (error_SET !== undefined) {
              console.log('error_SET' + error_SET);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve('La playlist "' + nameNewPlaylist + '" ya existe');
        }

      });
    });
  }

  public deletePlayList(namePlaylistToDelete: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;

    return new Promise((resolve) => {
      storage.get(DataBase.playlists, dataBaseJsonPath, function (error_GET, dataJSON_playlists: InterfacePlayLists) {

        console.log(dataJSON_playlists);
        // find playlist in the list of playlists
        let search = dataJSON_playlists.playLists.find(playlist => {
          return playlist.name === namePlaylistToDelete;
        });

        // If playlist exist, delete and save
        if (search !== undefined) {
          dataJSON_playlists.playLists = dataJSON_playlists.playLists.filter(playlist => {
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
          resolve('La playlist "' + namePlaylistToDelete + '" no existe');
        }
      });
    });
  }

  public addSongPathToPlayList(namePlayList: string, songPathToPlayList: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;

    return new Promise((resolve) => {
      storage.get(DataBase.playlists, dataBaseJsonPath, function (error_GET, dataJSON_PlayLists: InterfacePlayLists) {

        let searchPlayList = dataJSON_PlayLists.playLists.find(playList => {
          return playList.name === namePlayList;
        });

        if (searchPlayList === undefined) {
          resolve('La playList ' + namePlayList + ' no existe');
        } else {

          // Find playlist in the list of playLists
          dataJSON_PlayLists.playLists.forEach((playlist: InterfacePlayList) => {

            if (playlist.name === namePlayList) {

              // If the PlayList not contains the songPath
              if (playlist.paths.indexOf(songPathToPlayList) === -1) {

                // Add to playList
                playlist.paths.push(songPathToPlayList);

                storage.set(DataBase.playlists, dataJSON_PlayLists, dataBaseJsonPath, function (error_SET) {
                  if (error_SET !== undefined) {
                    console.log('error_SET' + error_SET);
                    resolve(false);
                  } else {
                    console.log(dataJSON_PlayLists);
                    resolve(true);
                  }
                });

              } else {
                resolve('La playList ' + namePlayList + ' ya tiene la canción ' + songPathToPlayList);
              }
            }

          });

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
          let initPlaylists: InterfacePlayLists = {
            playLists: [ {
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
