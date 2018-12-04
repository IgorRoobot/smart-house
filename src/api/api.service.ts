import { Injectable } from '@angular/core';

import { AuthApiService } from './auth.api.service';
import { PlaceApiService } from './place.api.service';
import { RequestApiService } from './request.api.service';
import { MqttApiService } from './mqtt.api.service';
import { RoomApiService } from './room.api.service';
import { DeviceApiService } from './device.api.service';
import { SceneApiService } from './scene.api.service';
import { GroupApiService } from './group.api.service';

@Injectable()
export class ApiService {

  constructor(
    public auth: AuthApiService,
    public place: PlaceApiService,
    public room: RoomApiService,
    public mqtt: MqttApiService,
    public device: DeviceApiService,
    public scene: SceneApiService,
    public group: GroupApiService,
    private request: RequestApiService,
  ) {}

  initialize(config) {
    return this.request.initialize(config);
  }

}
