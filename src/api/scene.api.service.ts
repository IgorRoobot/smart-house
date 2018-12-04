import { Injectable } from '@angular/core';
import { RequestApiService } from './request.api.service';

@Injectable()
export class SceneApiService {

  constructor(
    private request: RequestApiService,
  ) {}

  getAll(placeId) {
    return this.request.runCloudFunction('scene_getAll', {placeId});
  }

  create(scene, placeId) {
    return this.request.runCloudFunction('scene_create', {
      name: scene.name,
      picture: scene.picture,
      devicesIds: scene.devicesIds || [],
      groupsIds: scene.groupsIds || [],
      placeId: placeId,
    });
  }

  update(scene) {
    return this.request.runCloudFunction('scene_update', {
      id: scene.id,
      name: scene.name,
      picture: scene.picture,
      devicesIds: scene.devicesIds,
      groupsIds: scene.groupsIds,
    });
  }

  delete({id}) {
    return this.request.runCloudFunction('scene_delete', {id});
  }

}
