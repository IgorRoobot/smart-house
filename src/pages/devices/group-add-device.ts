import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
// import { Camera } from '@ionic-native/camera';

import { DevicesPage } from './devices';
import { GroupEditPage } from '../groups/group-edit';

import { ScenesPage } from '../scenes/scenes';
// import { DataService } from '../../services/data.service';
import { PlacesService } from '../../services/places.service';
import { UtilsService } from '../../services/utils.service';
import { DevicesService } from '../../services/devices.service';
import { RoomsService } from '../../services/rooms.service';

@Component({
  selector: 'page-add-device',
  templateUrl: 'group-add-device.html',
  providers: [DevicesPage]
})
export class AddDevicesPage {
  public currentScene: any = {};
  public currentPlace: any = {};
  public currentGroup;
  public items:any = [];
  public devicesIds:any = [];
  public buttonStatus = false;
  public currentDType;
  public ids = [];
  public arrayOfDevicesInType = [];
  public newArr;
  

  private saveSub;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    private rooms: RoomsService,
    public devicesController: DevicesPage,
    // private camera: Camera,
    // private ds: DataService,
    private places: PlacesService,
    private utils: UtilsService,
    private devices: DevicesService,
  ) {}

  ionViewWillEnter(){
    console.log('ionViewWillEnter AddDevicePage');

    this.currentPlace = this.places.getCurrent();
    this.currentDType = this.navParams.get('dtype');
    
    if (this.devicesIds.length == 0) {
      this.buttonStatus = true;
    }

    this.currentGroup = this.navParams.get('groupId') || this.navParams.get('currentGroup');
    
    if (this.currentGroup) {
      this.devices.getDevicesByType(this.currentPlace.id, this.currentDType)
        .map(devices => {
          this.arrayOfDevicesInType.push(devices.id);
        });
        
      if (this.arrayOfDevicesInType.length > 0) {
        if (this.currentGroup.devicesIds) {
          this.devices.deleteFromGroupDevice(this.currentGroup, this.arrayOfDevicesInType);
        } else {
          this.devices.getDevicesByType(this.currentPlace.id, this.currentDType);
        }
        
        this.devices.getDevicesByIds(this.arrayOfDevicesInType).map(devices => {
          this.items.push(devices);
        });
      }
    }
  }

  isDeviceOnline(item){
    return (!! item.isOnline && item.isOnline == true);
  }

  deviceState(item){
    return item.state;
  }

  getRoomName(roomId) {
    if (roomId == undefined) return this.translate.instant('rooms.msg.not_attached_to_room');

    let room = this.rooms.get(roomId);
    if (!!room && room.name) {
      return this.rooms.get(roomId).name;
    }
    return this.translate.instant('rooms.msg.not_attached_to_room');
  }

  itemSave() {
    if (this.navParams.get('isEdit')) {
      this.devicesIds.map(id => {
        this.currentGroup.devicesIds.push(id);
      });
    } else {
      this.newArr = this.navParams.get('currentGroup');
      if (this.newArr.devicesIds == undefined) {
        this.newArr.devicesIds = [];
      } else {
        this.newArr.devicesIds;
      }
      this.devicesIds.map(id => {
        this.newArr.devicesIds.push(id);
      });
    }
    
    this.navCtrl.push(GroupEditPage, {devicesIds: this.devicesIds, type: this.currentDType, currentGroup: this.currentGroup})
  }

  updateItem(deviceId) {
    this.devicesIds.push(deviceId);
    if (this.devicesIds.length > 0) {
      this.buttonStatus = false;
    }
  }

  onSaveSuccess() {
    this.utils.hideLoader();
    this.navCtrl.setRoot(ScenesPage, null);
  }

  onSaveError(err) {
    console.log(err);
    this.utils.showTranslatedError(err, {messageKey: 'general.request_error'});
    this.utils.hideLoader();
  }

  ngOnDestroy() {
    this.saveSub && this.saveSub.unsubscribe();
  }

}
