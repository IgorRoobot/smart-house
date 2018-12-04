import { Component, Injector } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'buzzer',
  template: `
      <ion-card-title>
        {{device.title}}
          <ion-badge *ngIf="isOnline" color="secondary" item-end>{{ 'devices.status.online' | translate}}</ion-badge>
          <ion-badge *ngIf="!isOnline" color="primary" item-end>{{ 'devices.status.offline' | translate}}</ion-badge>
      </ion-card-title>
    <ion-item>
        <ion-badge *ngIf="isOn" color="secondary" item-end>ON</ion-badge>
        <ion-badge *ngIf="!isOn" color="danger" item-end>OFF</ion-badge>
    </ion-item>
      <button ion-button color="secondary" outline (click)="goOn()">ON</button>
      <button ion-button color="danger" outline (click)="goOff()">OFF</button>
  `,
})
export class DeviceBuzzerComponent {
  isOn = false;
  isOnline = false;
  device: any;
  myMessage: string;
  myTopic: string;

  constructor(
    private injector: Injector,
    private api: ApiService,
  ) {

    this.device = this.injector.get('device');

    this.device.observableMqttMsg.subscribe((message: IMqttMessage) => {
      this.isOnline = true;
      this.myMessage = message.payload.toString();
      let state = JSON.parse(this.myMessage).state;
      this.isOn = (state ==1);
    });
  }

  status(){
    return this.isOn ? 'ON' : 'OFF';
  }

  goOn():void {
    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,'CMD', 'FEFE00'); //all go FULL ON
  }

  goOff():void {
    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,'CMD', 'FF0000'); //all go FULL OFF
  }

}
