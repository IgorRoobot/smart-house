import { Component, Injector } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'triac',
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
export class DeviceTRIACComponent {
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

    // this.api.mqtt.publishToMqttTopic(this.device.nodeId , 'CFG', '4000'); //send command to congif topic, should respond with uptime in sec

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
    if (level < 5 ) {level =5;} // do not set 0 = goes off
    if (level > 95) {level = 95;} // do not set max = 100 , goes off
    // change level value to
    level = 100 - level;

    //send DIRECT_ARC_POWER_CONTROL
    let addr = "FF"; //( "00" + (Number(this.device.addr)*2).toString(16)).substr(-2);  //get device addr x 2 => HEX
    let lvl = ( "00" + (Math.round(level*254/100).toString(16))).substr(-2); //max 254
    let cc = "00"; //our protocol => TRIAC command
    this.api.mqtt.publishToMqttTopic(this.device.nodeId ,"CMD", lvl + cc + addr);
  }
}
