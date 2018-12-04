import { Component, Injector } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'window-blinds',
  template: `
      <ion-card-title>
        {{device.title}}
          <ion-badge *ngIf="isOnline" color="secondary" item-end>{{ 'devices.status.online' | translate}}</ion-badge>
          <ion-badge *ngIf="!isOnline" color="primary" item-end>{{ 'devices.status.offline' | translate}}</ion-badge>
      </ion-card-title>
    <ion-item>
      <ion-toggle [(ngModel)]="isGoingUp" (click)="goUp()" color="danger"></ion-toggle>
    </ion-item>
    <ion-item>
      <ion-toggle [(ngModel)]="isGoingDown" (click)="goDown()" color="danger"></ion-toggle>
    </ion-item>
<!--    <pre>up:{{isGoingUp}}-dwn:{{isGoingDown}}</pre>
    <pre>{{myMessage}}</pre>
    <pre>{{(device.observableMqttMsg | async)?.payload.toString() }}</pre> -->
  `,
})
export class DeviceWindowBlindsComponent {
  public isGoingUp = false;
  public isGoingDown = false;
  device: any;
  myMessage: string;

  constructor(
    private injector: Injector,
    private api: ApiService,
  ) {
    // this.isOn = this.injector.get('isOn');
    this.device = this.injector.get('device');

    console.log('topic: ' + this.device.objectId)
    this.device.observableMqttMsg.subscribe((message: IMqttMessage) => {
      this.myMessage = message.payload.toString();
    });
  }

  goUp():void {
    this.isGoingUp = true;
    this.isGoingDown = false;
    // let d = new Date();
    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,'CMD', 'FEFE00'); //all go FULL ON
    //simulate communication
    setTimeout(() => {
        this.isGoingUp = false;
        this.isGoingDown = false;
      }, 2000);
  }

  goDown():void{
    this.isGoingDown = true;
    this.isGoingUp = false;
    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,'CMD', 'FEFE00'); //all go FULL ON
    //simulate communication
    setTimeout(() => {
        this.isGoingUp = false;
        this.isGoingDown = false;
      }, 2000);
  }
}
