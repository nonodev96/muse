import { Injectable } from '@angular/core';
import storage from 'electron-json-storage';

export enum DataBase {
  favorites = 'favorites',
  playLists = 'playLists',
  // Protected playList
  songsLoad = 'songsLoad'
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
      storage.get(DataBase.favorites, dataBaseJsonPath, (errorGET, dataJSON_Favorites: InterfaceFavorites) => {
        let valueToAdd = songPathToAdd.path;

        // If not exist, add to the list and update
        if (dataJSON_Favorites.paths.indexOf(valueToAdd) === -1) {
          dataJSON_Favorites.paths.push(valueToAdd);

          let updateFavorites: InterfaceFavorites = {
            paths: dataJSON_Favorites.paths
          };
          storage.set(DataBase.favorites, updateFavorites, dataBaseJsonPath, (error_SET) => {
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
      storage.get(DataBase.favorites, dataBaseJsonPath, (error_GET, dataJSON_Favorites: InterfaceFavorites) => {

        // to remove from the array
        let valueToRemove = songPathToDelete.path;
        if (dataJSON_Favorites.paths.indexOf(valueToRemove) === -1) {
          resolve('La canción ' + songPathToDelete.path + ' no existe en la lista de favoritos');
        }
        dataJSON_Favorites.paths = dataJSON_Favorites.paths.filter(element => element !== valueToRemove);

        // to clean and sort the array
        dataJSON_Favorites.paths = dataJSON_Favorites.paths.filter(element => element != null);

        let updateFavorites: InterfaceFavorites = {
          paths: dataJSON_Favorites.paths
        };
        storage.set(DataBase.favorites, updateFavorites, dataBaseJsonPath, (error_SET) => {
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

  public getAllFavorites(): Promise<InterfaceFavorites> {
    return new Promise((resolve) => {
      storage.get(DataBase.favorites, this.dataBaseJsonPath, (error_GET, dataJSON_Favorites: InterfaceFavorites) => {
        resolve(dataJSON_Favorites);
        console.log(error_GET);
      });
    });
  }

  public createPlayList(namePlaylistToCreate: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;

    return new Promise((resolve) => {
      if (DataBase.songsLoad !== namePlaylistToCreate) {
        storage.get(DataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

          // find playlist in the list of playLists
          let search = dataJSON_PlayLists.playLists.find(playlist => {
            return playlist.name === namePlaylistToCreate;
          });

          // The playlist not exist
          if (search === undefined) {
            let initNewPlaylist: InterfacePlayList = {
              name: namePlaylistToCreate,
              paths: []
            };
            dataJSON_PlayLists.playLists.push(initNewPlaylist);
            storage.set(DataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
              if (error_SET !== undefined) {
                console.log('error_SET' + error_SET);
                resolve(false);
              } else {
                resolve(true);
              }
            });
          } else {
            resolve('La playlist "' + namePlaylistToCreate + '" ya existe');
          }

        });
      } else {
        resolve('La playList ' + namePlaylistToCreate + ' está protegida');
      }
    });
  }

  public deletePlayList(namePlaylistToDelete: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;

    return new Promise((resolve) => {
      if (DataBase.songsLoad !== namePlaylistToDelete) {
        storage.get(DataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

          // find playlist in the list of playlists
          let search = dataJSON_PlayLists.playLists.find(playlist => {
            return playlist.name === namePlaylistToDelete;
          });

          // If playlist exist, delete and save
          if (search !== undefined) {
            dataJSON_PlayLists.playLists = dataJSON_PlayLists.playLists.filter(playlist => {
              return playlist.name !== namePlaylistToDelete;
            });

            storage.set(DataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
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
      } else {
        resolve('La playList ' + namePlaylistToDelete + ' está protegida');
      }
    });
  }

  public addSongPathToPlayList(namePlayList: string, songPathToPlayList: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;

    return new Promise((resolve) => {
      storage.get(DataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

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

                storage.set(DataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
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

  public addSongsPathToPlayList(namePlayList: string, songsToSave: string[]): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;

    return new Promise((resolve) => {
      storage.get(DataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

        let searchPlayList = dataJSON_PlayLists.playLists.find(playList => {
          return playList.name === namePlayList;
        });

        if (searchPlayList === undefined) {
          resolve('La playList ' + namePlayList + ' no existe');
        } else {

          // Find playlist in the list of playLists
          dataJSON_PlayLists.playLists.forEach((playlist: InterfacePlayList) => {

            if (playlist.name === namePlayList) {

              playlist.paths = playlist.paths.concat(songsToSave);
              // No songs repeats
              playlist.paths = playlist.paths.filter((item, pos) => {
                return playlist.paths.indexOf(item) === pos;
              });

              storage.set(DataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
                if (error_SET === undefined) {
                  resolve(true);
                } else {
                  console.log('error_SET' + error_SET);
                  resolve(false);
                }
              });

            }

          });

        }

      });
    });
  }

  public getPlayListsByName(playListName: string): Promise<InterfacePlayList | string> {
    return new Promise((resolve) => {
      storage.get(DataBase.playLists, this.dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

        if (dataJSON_PlayLists.playLists !== undefined) {

          let searchPlayList = dataJSON_PlayLists.playLists.find((playList: InterfacePlayList) => {
            return playList.name === playListName;
          });

          if (searchPlayList !== undefined) {
            resolve(searchPlayList);
          } else {
            let defaultPlayList: InterfacePlayList = {
              name: DataBase.songsLoad,
              paths: []
            };
            console.log('defaultPlayList');
            resolve(defaultPlayList);
          }

        } else {
          let defaultPlayList: InterfacePlayList = {
            name: DataBase.songsLoad,
            paths: []
          };
          console.log('defaultPlayList');
          resolve(defaultPlayList);
        }

      });
    });
  }

  public getAllPlayLists(): Promise<InterfacePlayLists> {
    return new Promise((resolve) => {
      storage.get(DataBase.playLists, this.dataBaseJsonPath, function (error_GET, dataJSON_PlayLists: InterfacePlayLists) {
        if (error_GET !== undefined) {
          console.log('error_GET ' + error_GET);
        }
        resolve(dataJSON_PlayLists);
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
          storage.set(DataBase.favorites, initFavorites, dataBaseJsonPath, (error_INIT) => {
            if (error_INIT !== undefined) {
              console.log(error_INIT);
            }
          });
        }

        if (tables.indexOf(DataBase.playLists) === -1) {
          let initPlayLists: InterfacePlayLists = {
            playLists: [ {
              name: DataBase.songsLoad,
              paths: []
            } ]
          };
          storage.set(DataBase.playLists, initPlayLists, dataBaseJsonPath, (error_INIT) => {
            if (error_INIT !== undefined) {
              console.log(error_INIT);
            }
          });
        }
      }
    });

  }
}
