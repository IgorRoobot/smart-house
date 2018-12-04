import { Injectable } from '@angular/core';
import { ApiService } from '../api/';
// import { Storage } from '@ionic/storage';
// import { fromPromise } from 'rxjs/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import { findIndex, find } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { PlacesService } from './places.service';
// import { Subject } from 'rxjs/Subject';

const INVALIDATE_TIMEOUT = 5 * 60 * 1000;

@Injectable()
export class RoomsService {

  private rooms;
  public roomsLastUpdate;  

  constructor(
    private api: ApiService,
    private places: PlacesService,
    // private storage: Storage,
  ) {    
    this.places.onPlaceChange.subscribe(() => {
      this.rooms = null;
      this.roomsLastUpdate = null;
    });
  }

  get(id) {
    if(!this.rooms){
      return null;
    }

    return find(this.rooms, {id});
  }

  getAll(placeId) {
    const currentTime = Date.now();
    const timePassed = currentTime - this.roomsLastUpdate;

    if (this.roomsLastUpdate && (timePassed < INVALIDATE_TIMEOUT)) {
      
      return Observable.of(this.rooms);
    }
    
    return this.api.room.getAll(placeId)
      .do((rooms) => { 
        this.roomsLastUpdate = Date.now();
        this.rooms = rooms;
      })
      .catch((err) => {
        if (this.roomsLastUpdate) {
          err.rooms = this.rooms
        }

        throw err;
      });
  }

  create(room, placeId) {
    return this.api.room.create(room, placeId)
      .do((room) => {
        this.rooms.push(room);
      });
  }

  update(room) {
    return this.api.room.update(room)
      .do((room) => {
        const index = findIndex(this.rooms, {id: room.id});

        if (index === -1){
          return;
        }

        this.rooms.splice(index, 1, room);
      });
  }

  delete(room) {
    return this.api.room.delete({id: room.id})
      .do((room) => {
        const index = findIndex(this.rooms, {id: room.id});

        if (index === -1){
          return;
        }

        this.rooms.splice(index, 1);
      });
  }

}
