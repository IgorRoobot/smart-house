import { Injectable } from '@angular/core';
import { ApiService } from '../api/';
import { Storage } from '@ionic/storage';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';

import { Subject } from 'rxjs/Subject';

import { findIndex } from 'lodash';

const INVALIDATE_TIMEOUT = 5;

@Injectable()
export class PlacesService {

  private currentPlace;
  private places;
  private placesLastUpdate;

  public onPlaceChange = new Subject();

  constructor(
    private api: ApiService,
    private storage: Storage,
  ) {

    this.api.auth.onLogout
      .subscribe(() => {
        this.places = null;
        this.placesLastUpdate = null;
        this.setCurrent(null);
      });

  }

  initialize() {
    return this.storage.get('currentPlace')
      .then(this.setCurrentAsPromise.bind(this))
      .catch(err => {
        console.info(err);
      });
  }

  setCurrent(place) {
    return fromPromise(this.setCurrentAsPromise(place));
  }

  setCurrentAsPromise(place) {
    this.currentPlace = place;
    const promise = this.storage.set('currentPlace', place);

    if (place) {
      this.api.mqtt.startMqtt(place);
    } else {
      this.api.mqtt.stopMqtt();
    }

    this.onPlaceChange.next(place);

    return promise;
  }

  getCurrent(){
    return this.currentPlace;
  }

  getAll() {
    const currentTime = Date.now();
    const timePassed = currentTime - this.placesLastUpdate;

    if (this.placesLastUpdate && (timePassed < INVALIDATE_TIMEOUT)) {
      return Observable.of(this.places);
    }

    return this.api.place.getAll()
      .do((places) => {
        this.placesLastUpdate = Date.now();
        this.places = places;
      })
      .catch((err) => {
        if (this.placesLastUpdate) {
          err.places = this.places;
        }

        throw err;
      });
  }

  create(place) {
    return this.api.place.create(place)
      .do((place) => {
        this.places.push(place);
      });
  }

  update(place) {
    return this.api.place.update(place)
      .do((place) => {
        const index = findIndex(this.places, {id: place.id});

        if (index === -1) {
          return;
        }

        this.places.splice(index, 1, place);
      });
  }

  delete(place) {
    return this.api.place.delete({id: place.id})
      .do(() => {
        const index = findIndex(this.places, {id: place.id});

        if (index === -1){
          return;
        }

        if (this.currentPlace && (this.currentPlace.id === place.id)) {
          this.setCurrent(null);
        }

        this.places.splice(index, 1);
      });
  }


}
