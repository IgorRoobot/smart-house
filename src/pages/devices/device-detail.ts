import { Component, ViewChild  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController } from 'ionic-angular';
import { List  } from 'ionic-angular';

import { DeviceDALIComponent } from './types/dali-component';
import { DeviceTRIACComponent } from './types/triac-component';
import { Device010VComponent } from './types/010V-component';
import { DeviceDRIVERComponent } from './types/driver-component';
import { DeviceSocketComponent } from './types/socket-component';
import { DeviceWindowBlindsComponent } from './types/window-blinds-component';
import { DeviceLedComponent } from './types/led-component';
import { DeviceBuzzerComponent } from './types/buzzer-component';
import { PlacesService } from '../../services/places.service';

@Component({
  selector: 'page-device-detail',
  templateUrl: 'device-detail.html',
})
export class DeviceDetailPage {
  public currentDevice: any = {};
  public currentPlace: any = {};

  @ViewChild(List) list: List;

  componentData = null;

  constructor(public navCtrl: NavController,
  			  public navParams: NavParams,
  			  public alertCtrl: AlertController,
  			  public translate: TranslateService,
          private places: PlacesService) {}

  ionViewWillEnter(){
    console.log('ionViewWillEnter DeviceDetailPage');
      this.currentPlace = this.places.getCurrent();
      if (this.navParams.get('device')) {
        this.currentDevice = this.navParams.get('device');
        switch(this.currentDevice.dtype) {
          case 'dali':
          case 'DALI':
              // this.loadDeviceDALIComponent();
              this.loadDeviceComponent(DeviceDALIComponent,{});
              break;
          case 'triac':
          case 'TRIAC':
              // this.loadDeviceTRIACComponent();
              this.loadDeviceComponent(DeviceTRIACComponent,{});
              break;
          case '010v':
          case '010V':
              // this.loadDevice010VComponent();
              this.loadDeviceComponent(Device010VComponent,{});
              break;
          case 'driver':
          case 'DRIVER':
              this.loadDeviceComponent(DeviceDRIVERComponent,{});
              break;
          case 'socket':
          case 'RELAY':
              // this.loadDeviceSocketComponent();
              this.loadDeviceComponent(DeviceSocketComponent,{});
              break;
          case 'window-blinds':
              // this.loadDeviceWindowBlindsComponent();
              this.loadDeviceComponent(DeviceWindowBlindsComponent,{isOn: true,showNum: 55}); //for tests, check it later
              break;
          case 'led':
              // this.loadDeviceLedComponent();
              this.loadDeviceComponent(DeviceLedComponent,{});
              break;
          case 'buzzer':
              // this.loadDeviceBuzzerComponent();
              this.loadDeviceComponent(DeviceBuzzerComponent,{});
              break;
          default:
              // this.loadDeviceSocketComponent();
              this.loadDeviceComponent(DeviceSocketComponent,{});
        }
      }

/*    });*/

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DeviceDetailPage');
  }

  loadDeviceComponent(component, inputs){
    // inputs can have specific properties
    // inputs: {
    //   isOn: true,
    //   showNum: 55,
    //   device: this.currentDevice
    // },

    inputs.device = this.currentDevice;
    this.componentData = {
      component: component,
      inputs: inputs,
    };
  }
/*
  loadDeviceDALIComponent(){
    this.componentData = {
      component: DeviceDALIComponent,
      inputs: {
        isOn: true,
        showNum: 55,
        device: this.currentDevice
      },
    };
  }

  loadDeviceSocketComponent(){
    this.componentData = {
      component: DeviceSocketComponent,
      inputs: {
        isOn: true,
        showNum: 55,
        device: this.currentDevice
      },
    };
  }

  loadDeviceWindowBlindsComponent(){
    this.componentData = {
      component: DeviceWindowBlindsComponent,
      inputs: {
        isOn: true,
        showNum: 55,
        device: this.currentDevice
      }
    };
  }

  loadDeviceLedComponent(){
    this.componentData = {
      component: DeviceLedComponent,
      inputs: {
        device: this.currentDevice
      }
    };
  }

  loadDeviceBuzzerComponent(){
    this.componentData = {
      component: DeviceBuzzerComponent,
      inputs: {
        device: this.currentDevice
      }
    };
  }
*/
}

