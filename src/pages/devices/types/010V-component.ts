import { Component, Injector } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'V010V',
  template: `
      <ion-card-title>
        {{device.title}}
          <ion-badge *ngIf="device.isOnline" color="secondary" item-end>{{ 'devices.status.online' | translate}}</ion-badge>
          <ion-badge *ngIf="!device.isOnline" color="primary" item-end>{{ 'devices.status.offline' | translate}}</ion-badge>
      </ion-card-title>
    <ion-item>
        <ion-badge *ngIf="isOn" color="secondary" item-end>ON</ion-badge>
        <ion-badge *ngIf="!isOn" color="danger" item-end>OFF</ion-badge>
    </ion-item>
 <ion-item>
   <ion-badge color="primary" item-right>{{requestedBrightness()}}</ion-badge>
   <ion-badge color="secondary" item-right>{{currentBrightness()}}</ion-badge>
   <ion-range min="0" max="255" step="2" [(ngModel)]="brightness" (ionChange)="setBrightness()">
     <ion-icon small range-left name="sunny"></ion-icon>
     <ion-icon range-right name="sunny"></ion-icon>
   </ion-range>
 </ion-item>
      <button ion-button color="secondary" outline (click)="goOn()">ON</button>
      <button ion-button color="danger" outline (click)="goOff()">OFF</button>
    <!-- <pre>{{(device.observableMqttMsg | async)?.payload.toString() }}</pre> -->
  `,
})
export class Device010VComponent {
  // state = false;
  // value: number = 0;
  // isOnline = false;
  device: any;
  myMessage: string;
  myTopic: string;
  brightness: number = 0;
  brightnessRatio: number;

  constructor(
    private injector: Injector,
    private api: ApiService,
  ) {
    // this.showNum = this.injector.get('showNum');
    // this.isOn = this.injector.get('isOn');
    this.device = this.injector.get('device');
    console.log(this.device);

    // subscribe to the messages
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
    return this.device.state ? 'ON ' + Math.round(this.device.value/255).toString() : 'OFF';
  }
  requestedBrightness(){
    return Math.round(this.brightness/255*100).toString() + '%';
  }
  currentBrightness(){
    if (!this.device.value) return "-";
    if (this.device.value) return "-";
    return Math.round(this.device.value/255*100).toString() + '%';
  }
  setBrightness(){
    // console.log(this.brightness);
    let reqLvl = Math.round(this.brightness/255*100);
    this.setLevel(reqLvl);
  }
  goOn():void {
    this.setLevel(100);
  }

  goOff():void {
    this.setLevel(0);
  }

  setLevel(level):void {
    console.log(level);
    if (level < 0 ) {level =0;}
    if (level >100) {level = 100;}
    //send DIRECT_ARC_POWER_CONTROL
    let cc = "00"; //( "00" + (Number(this.device.addr)*2).toString(16)).substr(-2);  //get device addr x 2 => HEX
    // let lvl = ( "00" + (Number(level)*2).toString(16)).substr(-2); // max 255
    let lvl = ( "00" + (Math.round(level*254/100).toString(16))).substr(-2); //max 254
    let addr = "78"; //our protocol => 010V command  18,28,38,48,58 and 78 all
    switch (this.device.addr) {
      case 0:
        addr = '18';
        break;
      case 1:
        addr = '28';
        break;
      case 2:
        addr = '38';
        break;
      case 3:
        addr = '48';
        break;
      default:
        addr = '78';
        break;
    }

    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,"CMD",  lvl + cc + addr);
  }
}
