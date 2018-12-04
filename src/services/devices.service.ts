import { Injectable } from '@angular/core';
import { ApiService } from '../api/';
// import { Storage } from '@ionic/storage';
// import { fromPromise } from 'rxjs/observable/fromPromise';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { findIndex, find, throttle, assign } from 'lodash';
import { IMqttMessage } from 'ngx-mqtt';
import { PlacesService } from './places.service';
import { Observable } from 'rxjs/Observable';
// import { Observable } from 'rxjs/Observable';

const INVALIDATE_TIMEOUT = 5 * 60 * 1000;

@Injectable()
export class DevicesService {

  private devices = [];
  private devicesLastUpdate;
  public dtypes = [];
  // private currentDevice;

  public onDevicesSort = new Subject();

  throttledSort;

  constructor(
    private api: ApiService,
    private places: PlacesService,
    // private storage: Storage
  ) {    
    this.places.onPlaceChange.subscribe(() => {
      this.unsetDevices();
      this.devicesLastUpdate = null;
    });
    
    this.throttledSort = throttle(this.sortDevices.bind(this), 50);
  }

  listDevicesInRoom(roomId) {
    return this.devices.filter((device) => {
      return device.roomId === roomId;
    });
  }

  listAllDevices(){
    return this.devices;
  }

  get(id) {
    return find(this.devices, {id});
  }

  getAll(placeId) {
    const currentTime = Date.now();
    const timePassed = currentTime - this.devicesLastUpdate;

    if (this.devicesLastUpdate && (timePassed < INVALIDATE_TIMEOUT)) {
      return Observable.of(this.devices);
    }

    return this.api.device.getAllByPlaceId(placeId)
      .map((devices) => {
        this.devicesLastUpdate = Date.now();
        this.addUniqueDevicesAndSubscribe(devices);
        
        // SEND CFG command to ALL devices, each should respond with uptime
        this.throttledSort();
        this.api.mqtt.publishToMqttTopic('all', 'CFG', '4000');  // get device uptime
        
        return this.devices;
      })
      .catch((err) => {
        if (this.devicesLastUpdate) {
          err.devices = this.devices;
        }

        throw err;
      });
  }

  getDevicesByIds(ids) {
    return ids.map(id => this.get(id));
  }

  createMany(devices, placeId) {
    return this.api.device.createMany({devices, placeId})
      .do((devices) => {
        this.addUniqueDevicesAndSubscribe(devices);
        this.throttledSort();
        this.api.mqtt.publishToMqttTopic('all', 'CFG', '4000');
      });
  }

  addUniqueDevicesAndSubscribe(devices) {
    devices.forEach(device => {
      if (this.get(device.id)) {
        return;
      }

      this.subscribe(device);
      this.devices.push(device);
    });
  }

  sortDevices() {
    this.devices.sort((d1, d2) => {
      if (d1.isOnline !== d2.isOnline) {
        if (d1.isOnline && !d2.isOnline) {
          return -1;
        } else {
          return 1;
        }
      }

      return d2.createdAt - d1.createdAt;
    });

    this.onDevicesSort.next();
  }

  update(device) {
    const props:any = {
      id: device.id,
      title: device.title,
    };

    if (device.roomId) {
      props.roomId = device.roomId;
    }

    return this.api.device.update(props)
      .do((device) => {
        const index = findIndex(this.devices, {id: device.id});

        if (index === -1){
          return;
        }

        assign(this.devices[index], props);
      });
  }

  delete(device) {
    return this.api.device.delete({id: device.id})
      .do(() => {
        const index = findIndex(this.devices, {id: device.id});

        if (index === -1){
          return;
        }

        this.unsubscribe(this.devices[index]);
        this.devices.splice(index, 1);
      });
  }

  subscribe(device) {
    device.observableMqttMsg = this.api.mqtt.subscribeToStatusMqttTopic(device.nodeId , '#');  // all topics ( ANS, INF)
    device.subscription = device.observableMqttMsg.subscribe((message: IMqttMessage) => {
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
          if (!device.isOnline) {
            device.isOnline = true;
            this.throttledSort();
          }
          // device.mqttStatusMsg = message;
          break;
        case "lwt":
          // device last will = offline
          // set device offline

          if (device.isOnline) {
            device.isOnline = false;
            this.throttledSort();
          }

          // device.mqttStatusMsg = message;
          break;
        default:
          // code...
          break;
      }
    });
  }

  unsubscribe(device) {
    device.subscription.unsubscribe();
  }

  unsetDevices() {
    this.devices.forEach(device => this.unsubscribe(device));
    this.devices = [];
  }

  getDataFromDevice() {
    return this.api.device.getDataFromDevice();
  }

  saveDataToDevice(deviceCreateData) {
    return this.api.device.saveDataToDevice(deviceCreateData);
  }

  restDevices(placeId, devices) {
    let allDevicesNotInGroup = [];
    this.getAll(placeId).subscribe(getAllDevices => {
      getAllDevices.filter(device => {
        devices.map(res => {
          if (device.id !== res) {
            allDevicesNotInGroup.push(device);
          }
        });
      });
    });
    allDevicesNotInGroup
      .splice(-2,2)
      .filter(function(item, pos) {
        return allDevicesNotInGroup.indexOf(item) == pos;
      });
  }

  getDevicesByType(currentPlace, currentDType) {
    let arrOfDevices = [];
    this.getAll(currentPlace)
      .subscribe(res => {
        res.map(devices => {
          if (devices.dtype === currentDType) {
            arrOfDevices.push(devices);
          }
        });
      });
    return arrOfDevices;
  }

  deleteFromGroupDevice(currentGroup, arrayOfDevicesInType) {
    let index;
    for (var i=0; i<currentGroup.devicesIds.length; i++) {
      index = arrayOfDevicesInType.indexOf(currentGroup.devicesIds[i]);
      if (index > -1) {
        arrayOfDevicesInType.splice(index, 1);
      }
    }
  }

  getUniqueTypes(currentPlace): Array<any> {
    this.getAll(currentPlace)
    .subscribe(res => {
      res.map(type => {
        this.dtypes.push(type.dtype);
        return this.dtypes;
      });
      this.dtypes = this.dtypes.filter((el, i, a) => i === a.indexOf(el) && el!=undefined);
    });
    return this.dtypes;
  }

}
