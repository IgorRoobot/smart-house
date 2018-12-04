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
export class GroupsService {

  public groups;
  public groupsLastUpdate;

  constructor(
    private api: ApiService,
    private places: PlacesService,
  ) {
    this.places.onPlaceChange.subscribe(() => {
      this.groups = null;
      this.groupsLastUpdate = null;
    });
  }

  get(id) {
    if(!this.groups){
      return null;
    }

    return find(this.groups, {id});
  }

  getAll(placeId) {
    // const currentTime = Date.now();
    // const timePassed = currentTime - this.scenesLastUpdate;

    // if (this.scenesLastUpdate && (timePassed < INVALIDATE_TIMEOUT)) {
    //   return Observable.of(this.scenes);
    // }
    
    return this.api.group.getAll(placeId)
      .map((res) => {
        this.groupsLastUpdate = Date.now();
        this.groups = res;

        return this.groups;
      })
      .catch((err) => {
        if (this.groupsLastUpdate) {
          err.groups = this.groups;
        }

        throw err;
      });
  }

  create(group, placeId) {
    return this.api.group.create(group, placeId)
      .do((group) => {
        this.groups = group;
      });
  }

  update(group) {
    return this.api.group.update(group)
      .do((group) => {
        const index = findIndex(this.groups, {id: group.id});

        if (index === -1){
          return;
        }

        this.groups.splice(index, 1, group);
      });
  }

  delete(group) {
    return this.api.group.delete({id: group.id})
      .do((group) => {
        const index = findIndex(this.groups, {id: group.id});

        if (index === -1){
          return;
        }

        this.groups.splice(index, 1);
      });
  }

}
