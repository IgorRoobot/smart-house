import { Injectable } from '@angular/core';
import { RequestApiService } from './request.api.service';

@Injectable()
export class GroupApiService {

  constructor(
    private request: RequestApiService,
  ) {}

  getAll(placeId) {
    return this.request.runCloudFunction('group_getAll', {placeId});
  }

  create(group, placeId) {
    return this.request.runCloudFunction('group_create', {
      name: group.name,
      picture: group.picture,
      type: group.type,
      devicesIds: group.devicesIds || [],
      placeId: placeId,
    });
  }

  update(group) {
    return this.request.runCloudFunction('group_update', {
      id: group.id,
      name: group.name,
      picture: group.picture,
      devicesIds: group.devicesIds,
    });
  }

  delete({id}) {
    return this.request.runCloudFunction('group_delete', {id});
  }

}
