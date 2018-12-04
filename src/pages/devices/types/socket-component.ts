import { Component, Injector } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'socket',
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
    <!-- <pre>{{(device.observableMqttMsg | async)?.payload.toString() }}</pre> -->
  `,
})
export class DeviceSocketComponent {
  isOn = false;
  isOnline = false;
  device: any;
  myMessage: string;
  myTopic: string;

  constructor(
    private injector: Injector,
    private api: ApiService,
  ) {
    // this.showNum = this.injector.get('showNum');
    // this.isOn = this.injector.get('isOn');
    this.device = this.injector.get('device');

    // console.log('topic: ' + this.device.nodeId);
    //get device status //{ "device_name":"3PI_8506458", "type":"relay" }
    //this.api.mqtt.publishToMqttTopic(this.device.nodeId, '{"device_name":"' + this.device.nodeId + '" ,"type":"' + this.device.dtype + '"}');
    // this.api.mqtt.publishToMqttTopic(this.device.nodeId, '{"1":"1"}');

    console.log(this.device);

    this.device.observableMqttMsg.subscribe((message: IMqttMessage) => {
      switch (message.topic.split("/").pop()) {
        case "CMD":
          // device recieved a command
          // do nothing
          break;
        case "CFG":
          // device recieved a CFG command
          // do nothing
          break;
        case "ANS":
          // device sent answer to CMD
          // do something with answer
          // device.mqttStatusMsg = message;
          break;
        case "INF":
          // device sent answer to CFG
          // do somthing with answer
          this.device.isOnline = true;
          // device.mqttStatusMsg = message;
          break;
        case "lwt":
          // device last will = offline
          // set device offline
          this.device.isOnline = false;
          // device.mqttStatusMsg = message;
          break;
        default:
          // code...
          break;
      }
    });
//    this.myMessage = this.device.mqttCommandMsg;
  }


  status(){
    return this.isOn ? 'ON' : 'OFF';
  }

  goOn():void {
    // this.api.mqtt.publishToMqttTopic(this.device.nodeId, '{"device_name":"' + this.device.nodeId + '" ,"type":"' + this.device.dtype + '", "state":1}');
    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,'CMD', '03'); //all go FULL ON
    //this.isOn=true;
  }

  goOff():void {
    // this.api.mqtt.publishToMqttTopic(this.device.nodeId, '{"device_name":"' + this.device.nodeId + '" ,"type":"' + this.device.dtype + '", "state":0}');
    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,'CMD', '00'); //all go FULL OFF
    //this.isOn=false;
  }

}
