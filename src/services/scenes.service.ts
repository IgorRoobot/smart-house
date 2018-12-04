import { Injectable } from '@angular/core';
import { ApiService } from '../api/';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { findIndex, find } from 'lodash';
import { PlacesService } from './places.service';

// const INVALIDATE_TIMEOUT = 5 * 60 * 1000;

@Injectable()
export class ScenesService {

  private scenes;
  public devices;
  public scenesLastUpdate;

  constructor(
    private api: ApiService,
    private places: PlacesService,
  ) {
    this.places.onPlaceChange.subscribe(() => {
      this.scenes = null;
      this.scenesLastUpdate = null;
    });
  }

  get(id) {
    if(!this.scenes){
      return null;
    }

    return find(this.scenes, {id});
  }

  getAll(placeId) {
    // const currentTime = Date.now();
    // const timePassed = currentTime - this.scenesLastUpdate;

    // if (this.scenesLastUpdate && (timePassed < INVALIDATE_TIMEOUT)) {
    //   return Observable.of(this.scenes);
    // }
    return this.api.scene.getAll(placeId)
      .map((res) => {
        this.scenesLastUpdate = Date.now();
        this.scenes = res;
        return this.scenes;
      })
      .catch((err) => {
        if (this.scenesLastUpdate) {
          err.scenes = this.scenes;
        }

        throw err;
      });
  }

  create(scene, placeId) {
    return this.api.scene.create(scene, placeId)
      .do((scene) => {
        this.scenes.push(scene);
      });
  }

  update(scene) {
    return this.api.scene.update(scene)
      .do((scene) => {
        const index = findIndex(this.scenes, {id: scene.id});

        if (index === -1){
          return;
        }

        this.scenes.splice(index, 1, scene);
      });
  }

  deleteGroup(scene) {
    return this.api.scene.delete({id: scene.id})
      .do((scene) => {
        const index = findIndex(this.scenes, {id: scene.id});

        if (index === -1){
          return;
        }

        this.scenes.splice(index, 1);
      });
  }

  filterItemsInEditMode(itemsIds, items) {
    let itemArr = [];
    
    items.map(item => {
      if (itemsIds.length === 1) {
        if (itemsIds[0] !== item.id) {
          itemArr.push(item);
        }
      } else {
        if (itemsIds.length === 0) {
          itemArr.push(item);
        } else if (itemsIds.indexOf(item.id) === -1) {
          itemArr.push(item);
        }
      }
    });
    
    return itemArr;
  }

  filterDevices(groups, sceneDeviceIsEdit) {
    let sortedDevices = [];
    groups.filter(group => {
      sceneDeviceIsEdit.map(device => {
        if (group.devicesIds.indexOf(device.id) === -1) return sortedDevices.push(device);
      });
      return sortedDevices;
    });
    
    let uniq = sortedDevices.reduce(function(a,b){
      if (a.indexOf(b) < 0 ) a.push(b);
      return a;
    },[]);
    sortedDevices = uniq;
    sceneDeviceIsEdit = sortedDevices;
    return sceneDeviceIsEdit;
  }

}
