import { Injectable } from '@angular/core';
import { RequestApiService } from './request.api.service';

@Injectable()
export class RoomApiService {

  constructor(
    private request: RequestApiService,
  ) {}

  getAll(placeId) {
    return this.request.runCloudFunction('room_getAll', {placeId});
  }

  create(room, placeId) {
    return this.request.runCloudFunction('room_create', {
      name: room.name,
      picture: room.picture,
      placeId: placeId,
    });
  }

  update(room) {
    return this.request.runCloudFunction('room_update', {
      id: room.id,
      name: room.name,
      picture: room.picture,
    });
  }

  delete({id}) {
    return this.request.runCloudFunction('room_delete', {id});
  }

}
