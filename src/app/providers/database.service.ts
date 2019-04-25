import {Injectable} from '@angular/core';
import storage from 'electron-json-storage';

export enum EnumDataBase {
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

export enum EnumAddFavorites {
  THE_SONG_HAS_BEEN_ADDED = 1,
  THE_SONG_HAS_NOT_BEEN_ADDED = 2,
  THE_SONG_IS_ALREADY_IN_THE_LIST = 3
}

export enum EnumDeleteFavorites {
  THE_SONG_HAS_BEEN_DELETE = 1,
  THE_SONG_HAS_NOT_BEEN_DELETE = 2,
  THE_SONG_IS_NOT_IN_FAVORITES = 3
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

  public addFavorite(songPathToAdd: InterfaceFavoriteToAdd): Promise<EnumAddFavorites> {
    return new Promise((resolve) => {
      let dataBaseJsonPath = this.dataBaseJsonPath;
      storage.get(EnumDataBase.favorites, dataBaseJsonPath, (errorGET, dataJSON_Favorites: InterfaceFavorites) => {
        let valueToAdd = songPathToAdd.path;

        // If not exist, add to the list and update
        if (dataJSON_Favorites.paths.indexOf(valueToAdd) === -1) {
          dataJSON_Favorites.paths.push(valueToAdd);

          let updateFavorites: InterfaceFavorites = {
            paths: dataJSON_Favorites.paths
          };
          storage.set(EnumDataBase.favorites, updateFavorites, dataBaseJsonPath, (error_SET) => {
            if (error_SET !== undefined) {
              console.log('error_SET' + error_SET);
              resolve(EnumAddFavorites.THE_SONG_HAS_NOT_BEEN_ADDED);
            } else {
              resolve(EnumAddFavorites.THE_SONG_HAS_BEEN_ADDED);
            }
          });
        } else {
          resolve(EnumAddFavorites.THE_SONG_IS_ALREADY_IN_THE_LIST);
        }
      });
    });
  }

  public deleteFavorite(songPathToDelete: InterfaceFavoriteToDelete): Promise<EnumDeleteFavorites> {
    return new Promise((resolve) => {
      let dataBaseJsonPath = this.dataBaseJsonPath;
      storage.get(EnumDataBase.favorites, dataBaseJsonPath, (error_GET, dataJSON_Favorites: InterfaceFavorites) => {

        // to remove from the array
        let valueToRemove = songPathToDelete.path;
        if (dataJSON_Favorites.paths.indexOf(valueToRemove) === -1) {
          resolve(EnumDeleteFavorites.THE_SONG_IS_NOT_IN_FAVORITES);
        }
        dataJSON_Favorites.paths = dataJSON_Favorites.paths.filter(element => element !== valueToRemove);

        // to clean and sort the array
        dataJSON_Favorites.paths = dataJSON_Favorites.paths.filter(element => element != null);

        let updateFavorites: InterfaceFavorites = {
          paths: dataJSON_Favorites.paths
        };
        storage.set(EnumDataBase.favorites, updateFavorites, dataBaseJsonPath, (error_SET) => {
          if (error_SET !== undefined) {
            console.log('error_SET' + error_SET);
            resolve(EnumDeleteFavorites.THE_SONG_HAS_NOT_BEEN_DELETE);
          } else {
            resolve(EnumDeleteFavorites.THE_SONG_HAS_BEEN_DELETE);
          }
        });

      });
    });
  }

  public getAllFavorites(): Promise<InterfaceFavorites> {
    return new Promise((resolve) => {
      storage.get(EnumDataBase.favorites, this.dataBaseJsonPath, (error_GET, dataJSON_Favorites: InterfaceFavorites) => {
        resolve(dataJSON_Favorites);
        console.log(error_GET);
      });
    });
  }

  public createPlayList(namePlaylistToCreate: string): Promise<string | boolean> {
    let dataBaseJsonPath = this.dataBaseJsonPath;

    return new Promise((resolve) => {
      if (EnumDataBase.songsLoad !== namePlaylistToCreate) {
        storage.get(EnumDataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

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
            storage.set(EnumDataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
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
      if (EnumDataBase.songsLoad !== namePlaylistToDelete) {
        storage.get(EnumDataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

          // find playlist in the list of playlists
          let search = dataJSON_PlayLists.playLists.find(playlist => {
            return playlist.name === namePlaylistToDelete;
          });

          // If playlist exist, delete and save
          if (search !== undefined) {
            dataJSON_PlayLists.playLists = dataJSON_PlayLists.playLists.filter(playlist => {
              return playlist.name !== namePlaylistToDelete;
            });

            storage.set(EnumDataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
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
      storage.get(EnumDataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

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

                storage.set(EnumDataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
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
      storage.get(EnumDataBase.playLists, dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

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

              storage.set(EnumDataBase.playLists, dataJSON_PlayLists, dataBaseJsonPath, (error_SET) => {
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
      storage.get(EnumDataBase.playLists, this.dataBaseJsonPath, (error_GET, dataJSON_PlayLists: InterfacePlayLists) => {

        if (dataJSON_PlayLists.playLists !== undefined) {

          let searchPlayList = dataJSON_PlayLists.playLists.find((playList: InterfacePlayList) => {
            return playList.name === playListName;
          });

          if (searchPlayList !== undefined) {
            resolve(searchPlayList);
          } else {
            let defaultPlayList: InterfacePlayList = {
              name: EnumDataBase.songsLoad,
              paths: []
            };
            console.log('defaultPlayList');
            resolve(defaultPlayList);
          }

        } else {
          let defaultPlayList: InterfacePlayList = {
            name: EnumDataBase.songsLoad,
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
      storage.get(EnumDataBase.playLists, this.dataBaseJsonPath, function (error_GET, dataJSON_PlayLists: InterfacePlayLists) {
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

        if (tables.indexOf(EnumDataBase.favorites) === -1) {
          let initFavorites: InterfaceFavorites = {
            paths: []
          };
          storage.set(EnumDataBase.favorites, initFavorites, dataBaseJsonPath, (error_INIT) => {
            if (error_INIT !== undefined) {
              console.log(error_INIT);
            }
          });
        }

        if (tables.indexOf(EnumDataBase.playLists) === -1) {
          let initPlayLists: InterfacePlayLists = {
            playLists: [{
              name: EnumDataBase.songsLoad,
              paths: []
            }]
          };
          storage.set(EnumDataBase.playLists, initPlayLists, dataBaseJsonPath, (error_INIT) => {
            if (error_INIT !== undefined) {
              console.log(error_INIT);
            }
          });
        }
      }
    });

  }
}
