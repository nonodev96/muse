import { Injectable } from '@angular/core';
import storage from 'electron-json-storage';

enum DataBase {
  favorites = 'favorites',
  playlists = 'playlists'
}

interface InterfaceDataBase {
  favorites: string;
  playlists: string;
}

export interface InterfaceFavorites {
  paths: string[];
}

export interface InterfacePlaylists {
  playlist: {
    name: string;
    paths: string[]
  }[];
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
    console.log(this.dataBaseJsonPath);
    this.initDataBase();
  }

  public addFavorite(songPathToAdd: InterfaceFavoriteToAdd) {
    let dataBaseJsonPath = this.dataBaseJsonPath;
    storage.get(DataBase.favorites, dataBaseJsonPath, function (errorGET, dataJSONFavorites: InterfaceFavorites) {
      let valueToAdd = songPathToAdd.path;

      // If not exist, add to the list and update
      if (dataJSONFavorites.paths.indexOf(valueToAdd) === -1) {
        dataJSONFavorites.paths.push(valueToAdd);

        let updateFavorites: InterfaceFavorites = {
          paths: dataJSONFavorites.paths
        };
        storage.set(DataBase.favorites, updateFavorites, dataBaseJsonPath, function (error_SET) {
          if (error_SET !== undefined) {
            console.log('error_SET' + error_SET);
          }
        });
      }

    });
  }

  public deleteFavorite(songPathToDelete: InterfaceFavoriteToDelete) {
    let dataBaseJsonPath = this.dataBaseJsonPath;
    storage.get(DataBase.favorites, dataBaseJsonPath, function (errorGET, dataJSONFavorites: InterfaceFavorites) {
      // to remove from the array
      let valueToRemove = songPathToDelete.path;
      dataJSONFavorites.paths = dataJSONFavorites.paths.filter(element => element !== valueToRemove);
      // to clean and sort the array
      dataJSONFavorites.paths = dataJSONFavorites.paths.filter(element => element != null);

      let updateFavorites: InterfaceFavorites = {
        paths: dataJSONFavorites.paths
      };
      storage.set(DataBase.favorites, updateFavorites, dataBaseJsonPath, function (error_SET) {
        if (error_SET !== undefined) {
          console.log('error_SET' + error_SET);
        }
      });

    });
  }

  public getAllFavorites() {
    storage.get(DataBase.favorites, this.dataBaseJsonPath, function (error, data) {
      console.log(data);
      console.log(error);
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
    storage.keys(function (error, tables: InterfaceDataBase) {
      if (error) {
        throw error;
      } else {
        let dataBaseJsonPath = storage.getDataPath();
        console.log(dataBaseJsonPath);
        if (tables.favorites === undefined) {
          let initFavorites: InterfaceFavorites = {
            paths: []
          };
          storage.set(DataBase.favorites, initFavorites, dataBaseJsonPath, function (error_INIT) {
            if (error_INIT !== undefined) {
              console.log(error_INIT);
            }
          });
        }
        if (tables.playlists === undefined) {
          let initPlaylists: InterfacePlaylists = {
            playlist: [ {
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
