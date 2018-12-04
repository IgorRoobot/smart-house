/*import { Component, OnInit, ViewChild , Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController, List  } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { DataService } from '../../services/data.service';
import { LoginPage } from '../login/login';
import { PlacesPage } from '../places/places';
import { DeviceDetailPage } from './device-detail';
import { DeviceEditPage } from './device-edit';

@Component({
  selector: 'device-list',
  templateUrl: 'device-list.html',
})
export class DeviceListComponent implements OnInit {

  @Input() room?: any;
  @Input() place?: any;

  items: any = [];

  @ViewChild(List) list: List;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public loadingController: LoadingController,
              public menuCtrl: MenuController,
              public translate: TranslateService,
              private ds: DataService) {

    console.log("constructor DeviceListComponent");
  }

  ngOnInit(){
    console.log("onInit DeviceListComponent");
    if (this.room){
      this.items = this.ds.listDevicesInRoom(this.room);
    } else {
      this.items = this.ds.listAllDevices();
    }
  }

  itemTapped(event, item) {
    this.navCtrl.push(DeviceDetailPage, {
      device: item
    });
  }

  editItem(event, item) {
    this.list.closeSlidingItems();
    this.navCtrl.push(DeviceEditPage, {
      device: item
    });
  }

  deleteItem(event, item) {
    this.alertCtrl
      .create({ title : this.translate.instant('devices.msg.not_implemented'), message : 'not implemented yet', buttons: [{
        text: 'OK',
      }]})
      .present();
    this.list.closeSlidingItems();
  }

  isMsgForItem(item){
    if (item.mqttStatusMsg){
      let state = JSON.parse(item.mqttStatusMsg.payload.toString()).state;
      return (state ==1) ? true: false;
    }else{
      return false;
    }
  }

  isDeviceOnline(item){
    if (item.mqttStatusMsg){
      let state = JSON.parse(item.mqttStatusMsg.payload.toString()).state;
      return true;
    }else{
      return false;
    }
  }


}
*/
