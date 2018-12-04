import { Injectable } from '@angular/core';
import { RequestApiService } from './request.api.service';

@Injectable()
export class PlaceApiService {

  constructor(
    private request: RequestApiService,
  ) {}

  getAll() {
    return this.request.runCloudFunction('place_getAll');
  }

  create(place) {
    return this.request.runCloudFunction('place_create', {
      name: place.name,
      picture: place.picture,
    });
  }

  update(place) {
    return this.request.runCloudFunction('place_update', {
      id: place.id,
      name: place.name,
      picture: place.picture,
    });
  }

  delete({id}) {
    return this.request.runCloudFunction('place_delete', {id});
  }

}
