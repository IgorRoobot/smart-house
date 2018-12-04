import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController, List  } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { DeviceEditPage } from '../devices/device-edit';

import { SceneEditPage } from './scene-edit';
import { PlacesService } from '../../services/places.service';
import { ScenesService } from '../../services/scenes.service';
import { UtilsService } from '../../services/utils.service';
import { DevicesService } from '../../services/devices.service';
import { RoomsService } from '../../services/rooms.service';
import { SceneDetailPage } from './scene-detail';
import { GroupsService } from '../../services/groups.service';
import { ApiService } from '../../api/api.service';

// @IonicPage()
@Component({
  selector: 'scenes-rooms',
  templateUrl: 'scenes.html',
})
export class ScenesPage implements OnInit, OnDestroy {

  items: any = [];
  DevicesInGroup: any = [];
  nestedGroups: any = [];
  devicesIds: any = [];
  buttonDisabled: boolean;
  notInTopLevelGroup = false;
  public arrDevicesNotInGroup = [];
  public arrAllDevices = [];
  public currentPlace;
  public currentGroupId;
  public currentGroupDevices = [];
  showButtons: boolean;
  itemID;
  topLevel = 0;

  @ViewChild(List) list: List;

  getAllSub;
  deleteSub;
  brightness: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public translate: TranslateService,
    private places: PlacesService,
    private utils: UtilsService,
    private scenes: ScenesService,
    private devices: DevicesService,
    private rooms: RoomsService,
    private group: GroupsService,
    private api: ApiService
  ) {
    this.menuCtrl.enable(true);
    console.log("constructor ScenesPage");
  }

  ngOnInit(){
    console.log("onInit ScenesPage");
    this.currentPlace = this.places.getCurrent();

    this.getItems(null);
  }
  
  active(item, event) {
    console.log("long-press active");
    this.itemID = item.id;
    this.showButtons = true;
  }

  requestedBrightness(){
    return Math.round(this.brightness/255*100).toString() + '%';
  }
  currentBrightness(devices){
    devices.map(device => {
      if (!device.value) return "-";
      if (device.value) return "-";
      return Math.round(device.value/255*100).toString() + '%';
    }); 
  }
  setBrightness(){
    // console.log(this.brightness);
    let reqLvl = Math.round(this.brightness/255*100);
    this.setLevel(reqLvl);
  }
  goToggle(item):void {
    if (this.topLevel === 0) {
      this.setLevel(100, item);
    } else {
      this.setLevel(0, item);
    }
    
  }

  setLevel(level, item?):void {
    if (level < 0 ) {level =0;}
    if (level >100) {level = 100;}
    this.topLevel = level;
    //send DIRECT_ARC_POWER_CONTROL
    let cc = "00"; //( "00" + (Number(this.device.addr)*2).toString(16)).substr(-2);  //get device addr x 2 => HEX
    // let lvl = ( "00" + (Number(level)*2).toString(16)).substr(-2); // max 255
    let lvl = ( "00" + (Math.round(level*254/100).toString(16))).substr(-2); //max 254
    let addr = "78"; //our protocol => 010V command  18,28,38,48,58 and 78 all
    
    this.mqttOnDevicesInGroup(this.items, lvl, cc, addr, item);
  }

  mqttOnDevicesInGroup(groups, lvl, cc, addr, item) {
    
    let devicesArray = [];
    item.devicesIds.map(device => {
      return devicesArray.push(this.devices.get(device));
    });
    item.groupsIds.map(group => {
      this.group.get(group).devicesIds.map(device => {
        return devicesArray.push(this.devices.get(device));
      });
    });
    let uniqueArray = devicesArray.filter(function(item, pos) {
      return devicesArray.indexOf(item) == pos;
    });

    this.currentBrightness(uniqueArray);
    uniqueArray.map(device => {
      switch (device.addr) {
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
      this.api.mqtt.publishToMqttTopic(device.nodeId, "CMD", lvl + cc + addr)
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ScenesPage');
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      position: 'top',
      duration: 3000
    });
    toast.present();
  }

  getItems(refresher) {
    this.utils.showLoader();
    this.group.getAll(this.currentPlace.id).subscribe();

    this.getAllSub = this.scenes.getAll(this.currentPlace.id)
      .subscribe(
        this.onGetAllSuccess.bind(this, refresher),
        this.onGetAllError.bind(this, refresher),
      );
  }

  allDevices() {
    this.devices.getAll(this.currentPlace.id)
        .subscribe(res => {
          this.arrAllDevices = res;
          return this.arrAllDevices;
        });
  }

  sortedDevicesInGroup(devicesIds) {
    this.DevicesInGroup = [];
    for(var i=0;i<this.arrAllDevices.length;i++){
        if(devicesIds.indexOf(this.arrAllDevices[i].id) == -1){
          this.DevicesInGroup.push(this.arrAllDevices[i]);
      };
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

  editDeviceInGroup(event, item) {
    this.list.closeSlidingItems();
    this.navCtrl.push(DeviceEditPage, {
      device: item
    });
  }

  onDeleteDeviceSuccess() {
    this.utils.hideLoader();
    this.list.closeSlidingItems();
  }

  onDeleteDeviceError(err) {
    console.info(err);
    this.utils.showTranslatedError(err);
    this.utils.hideLoader();
  }

  onGetAllSuccess(refresher, scenes) {
    this.items = scenes;
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetAllError(refresher, err) {
    console.info(err);
    if (err.scenes) {
      this.items = err.scenes;
      this.utils.showTranslatedError(err, {noInternetKey: 'general.failed_to_update_list'});
    } else {
      this.utils.showTranslatedError(err);
    }
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  // FUNCTION: Open item
  itemTapped(event, item) {
    this.navCtrl.push(SceneDetailPage, {scene: item});
  }

  addItem(groupId?) {
    this.navCtrl.push(SceneEditPage);
  }

  editItem(event, item) {
    this.navCtrl.push(SceneEditPage, { scene: item });
  }

  onDeleteItemClick(event, item) {
    this.utils.showDeleteConfirm(
      () => {},
      this.deleteItem.bind(this, item),
    );
  }

  deleteItem(item) {
    this.utils.showLoader();

    this.deleteSub = this.scenes.deleteGroup(item)
      .subscribe(
        this.onDeleteRoomSuccess.bind(this),
        this.onDeleteRoomError.bind(this)
      );
  }

  // pagingBack() {
  //   this.nestedGroups.pop();

  //   if (this.nestedGroups.length === 0) {
  //     this.notInTopLevelGroup = false;
  //     if (this.nestedGroups.length == 0) {
  //       this.DevicesInGroup = [];
  //     }
  //     return this.getItems(null);
  //   } else {
  //     return this.getItems(null, this.nestedGroups[this.nestedGroups.length - 1].id);
  //   }
  // }

  // addDevices(groupId?) {
  //   this.list.closeSlidingItems();
  //   if (this.nestedGroups.length > 0) {
  //     this.navCtrl.push(AddDevicesPage, {groupId: groupId});
  //   }
  // }

  onDeleteRoomSuccess() {
    this.utils.hideLoader();
  }

  onDeleteRoomError(err) {
    console.info(err);
    this.utils.showTranslatedError(err, {messageKey: 'general.request_error'});
    this.utils.hideLoader();
  }
  ngOnDestroy() {
    this.getAllSub && this.getAllSub.unsubscribe();
    this.deleteSub && this.deleteSub.unsubscribe();
  }
}
