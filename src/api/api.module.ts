import { NgModule } from '@angular/core';

import { ApiService } from './api.service';
import { AuthApiService } from './auth.api.service';
import { PlaceApiService } from './place.api.service';
import { RequestApiService } from './request.api.service';
import { MqttApiService } from './mqtt.api.service';
import { RoomApiService } from './room.api.service';
import { DeviceApiService } from './device.api.service';
import { SceneApiService } from './scene.api.service';
import { GroupApiService } from './group.api.service';

@NgModule({
  providers: [
    ApiService,
    AuthApiService,
    PlaceApiService,
    RequestApiService,
    MqttApiService,
    RoomApiService,
    DeviceApiService,
    SceneApiService,
    GroupApiService,
  ]
})
export class ApiModule { }
