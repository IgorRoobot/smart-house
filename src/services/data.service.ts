import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//rxjs promises cause angular http return observable natively.
import 'rxjs/add/operator/toPromise';

import { IMqttMessage, MqttService } from 'ngx-mqtt';

import { Storage } from '@ionic/storage';
import * as appconfig from '../appconfig'

@Injectable()
export class DataService {

  private BASEURL : string = appconfig.data.apiUrl + appconfig.data.appName;
  private _headers = {};
  // private _userAcl: any = {};
  private _userId: string ='';
  // private _sessionToken: string ='';

  // private _places: any [] = [];
  // private _placesLastUpdate: Date = null;
  private _currentPlace: any = {};

  // private _rooms: any [] = [];
  // private _roomsLastUpdate: Date = null;
  // private _currentRoom: any = {};

  private _devices: any [] = [];
  // private _devicesLastUpdate: Date = null;
  // private _currentDevice: any = {};

  constructor(
    private _mqttService: MqttService,
    private http: HttpClient,
    private localStorage: Storage,
  ) {

    this._headers['X-Parse-Application-Id'] = appconfig.data.XParseApplicationId;
    this._headers['X-Parse-REST-API-Key'] = appconfig.data.XParseRESTAPIKey;
    this.localStorage.get('userSession')
    .then((value) => {
      if(value !== null){
        this._userId = value.objectId;
        // this._userAcl = value.ACL;
        // this._sessionToken = value.sessionToken;
        this._headers['X-Parse-Session-Token'] = value.sessionToken;
      }
      return this.localStorage.get('currentPlace');
    })
    .then((value) => {
      if(value !== null){
        this._currentPlace = value;
        // this._startMqtt();
      }
    })
    ;
  }

  /*************************************************
  *  MQTT
  **************************************************/
  public _startMqtt(place):void {
    this._stopMqtt();

    this._currentPlace = place;

    this._mqttService.connect({
      hostname: this._currentPlace.cloud_broker_url,
      port: this._currentPlace.cloud_broker_port_ws,
      username: this._currentPlace.cloud_broker_user,
      password: this._currentPlace.cloud_broker_user_pass,
      path: '/mqtt'
    })
  }

  public _stopMqtt():void{
    try {this._mqttService.disconnect();} catch(err){ }
  }

  public subscribeToCommandMqttTopic(topic:string){
    console.log('subscribe:' + this._currentPlace.topic + '/0/' + topic);
    return this._mqttService.observe(this._currentPlace.topic + '/0/' + topic);
  }

  public subscribeToStatusMqttTopic(deviceId:string, cmdType: string){
    // console.log('subscribe:' + this._currentPlace.topic + '/0/' + topic + '/sts');
    // return this._mqttService.observe(this._currentPlace.topic + '/0/' + topic + '/sts');
    console.log('subscribe:' + this._currentPlace.topic + '/' + deviceId + '/' + cmdType );
    return this._mqttService.observe(this._currentPlace.topic + '/' + deviceId + '/' + cmdType);
  }

  public publishToMqttTopic(deviceId:string, cmdType: string, message: string): void{
    console.log('publish:' + this._currentPlace.topic + '/' +  deviceId + '/' + cmdType, message );
    this._mqttService.unsafePublish(this._currentPlace.topic + '/' +  deviceId + '/' + cmdType, message, {qos: 0, retain: false});
  }

  /*************************************************
  *  Devices
  **************************************************
  /*
  private createVirtDevice(device, cname:string, addr:number, title: string){
    // TODO: create object with required properties only
    let virtDevice = Object.assign({}, device);
    virtDevice.cname = cname;
    virtDevice.dtype = cname; // set type to cname
    virtDevice.title = title;
    virtDevice.addr = addr;
    virtDevice.state = undefined;
    virtDevice.value = undefined;

    return virtDevice;
  }
  */
  getDevices(place): Promise<any[]>{
    return this.http.get(this.BASEURL + '/classes/Device?where={"place":{"__type":"Pointer","className":"Place","objectId":"' + place.id + '"}}',{headers: this._headers})
        .toPromise()
        .then((res:any) => {
          // this._devicesLastUpdate = new Date();
          return res.results;
        })
        .then((devices)=>{
          //subscribe each device to it's topic
          devices.forEach((device)=>{
            //TODO: find out how to subscribe to only ANS and INF topics
            let found = this._devices.filter( (_device) => {
              return _device.objectId === device.objectId;
            });
            if (found.length == 0){
              //do subsrc
              this._devices.push(device);
              device.observableMqttMsg = this.subscribeToStatusMqttTopic(device.nodeId , '#');  // all topics ( ANS, INF)
              device.observableMqttMsg.subscribe((message: IMqttMessage) => {
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
                    device.isOnline = true;
                    // device.mqttStatusMsg = message;
                    break;
                  case "lwt":
                    // device last will = offline
                    // set device offline
                    device.isOnline = false;
                    // device.mqttStatusMsg = message;
                    break;
                  default:
                    // code...
                    break;
                }
              });
            }
          });
          // SEND CFG command to ALL devices, each should respond with uptime
          this.publishToMqttTopic('all', 'CFG', '4000');  //get device uptime
          return this._devices;
        })
        .catch(err => {
          throw err
        });
  }


  listDevicesInRoom(room){
    return this._devices.filter( (device) => {
      if (device.room == undefined) {return false;}
      return device.room.objectId === room.objectId;
    });
  }


  listAllDevices(){
    return this._devices;
  }

  saveDataToDevice(deviceCreateData):Promise<any>{
    //save data to device
    let requestBody = {
      "ssid": deviceCreateData.ssid,
      "wifipass": deviceCreateData.password,
//      "devname": deviceCreateData.deviceType,  don't change device name
      "place": deviceCreateData.devicePlace || "none",
//      "otaurl":  deviceCreateData.updateURL, don't change update URL
      "mqttsrv": deviceCreateData.brokerURL,
      "mqttprt": deviceCreateData.brokerPort,
      "htopic": deviceCreateData.topicBase,
      "huser": deviceCreateData.brokerUser,
      "hpass": deviceCreateData.brokerPwd,
    };

    const data = Object.keys(requestBody).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(requestBody[key])).join('&');
    let headers = {};
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return this.http.post(appconfig.data.defaultDeviceURL +"/save", data, {headers:headers, responseType: 'text', })
        .toPromise()
        .then(res => {
          // if here than res.text() == "saved"
          // send reset to device to load with new params
            return this.http.get(appconfig.data.defaultDeviceURL +"/reset",{responseType: 'text'})
              .toPromise()
        })
        .then( (res)=>{
          //if here - device will reser in 1 sec
          // return true to app after 1 sec
          return new Promise(resolve => setTimeout(() => resolve(true), 1000));
        })
        .catch(err => {
          throw err;
        });
  }

  getDataFromDevice():Promise<any>{
    //get data from device
    return this.http.get(appconfig.data.defaultDeviceURL +"/id",{})
        .toPromise()
        .then((res: any) => {
          // console.log(res);
          //results returned as text
          return res;
        })
        .catch(err => {
          throw err
        });
  }

  saveDeviceData(deviceCreateData): Promise<any>{
    //save device data to db

/*    //save data to device
    return this.saveDataToDevice(deviceCreateData)
    .then( (res)=>{
      // basically device will reboot and mobile will connect back to network
      //TODO: wait for network to come back, now just wait 5 sec
      return new Promise(resolve => setTimeout(() => resolve(true), 5000));
    })*/
    // .then( (res)=>{
      // creating devices in database
      //for each capability & user QTY create new device in db
      var promises = [];
      deviceCreateData.deviceCapabilies.forEach((capability) => {
        for (var i = 0; i < capability.userQty; ++i) {
          promises.push(this.createDevice(deviceCreateData.deviceId, capability.cname, i, deviceCreateData.mData));
        }
      });
      // save devices to db
      return Promise.all(promises)
    // })
    .then( (results)=>{
      //reload all devices with new
      return this.getDevices(this._currentPlace);
    })
    .then( (results)=>{
      return true;
    })
    .catch( (err)=>{
      throw err;
    })


  }

  createDevice(deviceId, dtype, addr, mData): Promise<any>{
     //TODO: check multiple devices with the same nodeId + addr + dtype on server

    let requestBody = {
      "title": "New " + dtype + " device, addr : " + addr,
      "place": {"__type":"Pointer","className":"Place","objectId":this._currentPlace.objectId},
      "belongTo": {"__type":"Pointer","className":"_User","objectId":this._userId},
      // "room": {"__type":"Pointer","className":"Room","objectId":this._currentRoom.objectId},
      "ACL": this._currentPlace.ACL,
      "dtype": dtype,
      "nodeId": deviceId,
      "mData": mData,
      "addr": addr
    };
    return this.http.post(this.BASEURL + '/classes/Device', requestBody ,{headers: this._headers})
        .toPromise()
        .then(res => {
          return true;
        })
        .catch(err => {
          throw err;
        });
  }


  updateDevice(device): Promise<any>{
    let requestBody = {
      'title': device.title,
      'room': {'__type':'Pointer','className':'Room','objectId': device.newRoomObjectId}
    };
    return this.http.put(this.BASEURL + '/classes/Device/' + device.objectId, requestBody ,{headers: this._headers})
        .toPromise()
        .then(res => {
          return this.http.get(this.BASEURL + '/classes/Device/'+  device.objectId ,{headers: this._headers})
          .toPromise()
        })
        .then((resDevice:any) => {
          let index: number = this._devices.indexOf(device);
          if (index !== -1) {
              this._devices.splice(index, 1, resDevice); //replace with new
          }
          return resDevice;
        })
        .catch(err => {
          throw err
        });
  }

  deleteDevice(device): Promise<any>{
    return this.http.delete(this.BASEURL + '/classes/Device/' + device.objectId ,{headers: this._headers})
        .toPromise()
        .then((res:any) => {
          //console.log('data.service - delete device: ', device);
          let index: number = this._devices.indexOf(device);
          if (index !== -1) {
              this._devices.splice(index, 1);
          }
          return res.results;
        })
        .catch(err => {
          throw err
        });
  }


}
