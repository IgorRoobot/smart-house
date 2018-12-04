import { Injectable } from '@angular/core';
// import { RequestApiService } from './request.api.service';
import { MqttService } from 'ngx-mqtt';

@Injectable()
export class MqttApiService {

  _currentPlace;

  constructor(
    private _mqttService: MqttService,
  ) {}

  public startMqtt(place):void {
    this.stopMqtt();

    this._currentPlace = place;

    this._mqttService.connect({
      hostname: this._currentPlace.cloud_broker_url,
      port: this._currentPlace.cloud_broker_port_ws,
      username: this._currentPlace.cloud_broker_user,
      password: this._currentPlace.cloud_broker_user_pass,
      path: '/mqtt',
    })
  }

  public stopMqtt(): void {
    try {this._mqttService.disconnect();} catch(err){ }
  }

  public subscribeToCommandMqttTopic(topic: string) {
    console.log('subscribe:' + this._currentPlace.topic + '/0/' + topic);
    return this._mqttService.observe(this._currentPlace.topic + '/0/' + topic);
  }

  public subscribeToStatusMqttTopic(deviceId: string, cmdType: string) {
    // console.log('subscribe:' + this._currentPlace.topic + '/0/' + topic + '/sts');
    // return this._mqttService.observe(this._currentPlace.topic + '/0/' + topic + '/sts');
    console.log('subscribe:' + this._currentPlace.topic + '/' + deviceId + '/' + cmdType );
    return this._mqttService.observe(this._currentPlace.topic + '/' + deviceId + '/' + cmdType);
  }

  public publishToMqttTopic(deviceId:string, cmdType: string, message: string): void {
    console.log('publish:' + this._currentPlace.topic + '/' +  deviceId + '/' + cmdType, message );
    this._mqttService.unsafePublish(this._currentPlace.topic + '/' +  deviceId + '/' + cmdType, message, {qos: 0, retain: false});
  }

}
