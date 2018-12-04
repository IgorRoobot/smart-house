import { Component, ViewChild, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController } from 'ionic-angular';
import { List  } from 'ionic-angular';

import { PlacesService } from '../../services/places.service';
import { RoomsService } from '../../services/rooms.service';
import { DevicesService } from '../../services/devices.service';
import { UtilsService } from '../../services/utils.service';
import { GroupsService } from '../../services/groups.service';
import { ApiService } from '../../api/api.service';

import { DeviceDetailPage } from '../devices/device-detail';
import { DeviceEditPage } from '../devices/device-edit';

@Component({
  selector: 'page-scene-detail',
  templateUrl: 'scene-detail.html',
})
export class SceneDetailPage implements OnDestroy {
  public currentScene: any = {};
  public currentPlace: any = {};
  devices: any = [];
  groups:any = [];
  sortedDevices: any = [];
  brightness: number = 0;

  @ViewChild(List) list: List;

  onDevicesSortSub;
  onRoomUpdateSub;
  deleteSub;
  subGroups;
  subDevices;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    private places: PlacesService,
    private rooms: RoomsService,
    private devicesService: DevicesService,
    private utils: UtilsService,
    private group: GroupsService,
    private device: DevicesService,
    private api: ApiService
  ) {}

  ionViewWillEnter(){
    console.log('ionViewWillEnter SceneDetailPage');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad sceneDetailPage');
    this.currentPlace = this.places.getCurrent();
    this.getAllGroups(null);

    if (this.navParams.get('scene')) {
      this.currentScene = this.navParams.get('scene');
    } else {
      this.currentScene = {};
      this.currentScene.name = "";
      this.currentScene.picture = "assets/images/noimage.jpg";
    }

  }

  getAllGroups(refresher) {
    this.subDevices = this.device.getAll(this.currentPlace.id)
    .subscribe(
      this.onGetDevicesSuccess.bind(this, refresher),
        this.onGetDevicesError.bind(this, refresher),
    );

    this.subGroups = this.group.getAll(this.currentPlace.id)
    .subscribe(
      this.onGetAllSuccess.bind(this, refresher),
      this.onGetAllError.bind(this, refresher),
    );
  }

  onGetDevicesSuccess(refresher, devices) {
    this.devices = devices;
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetDevicesError(refresher, err) {
    this.utils.hideLoader();
    console.log(err);
    if (err.devices) {
      this.devices = err.devices;
      this.utils.showTranslatedError(err, {noInternetKey: 'general.failed_to_update_list'});
    } else {
      this.utils.showTranslatedError(err);
    }
    refresher && refresher.complete();
  }

  onGetAllSuccess(refresher, groups) {
    this.groups = groups;
    this.filterDevices(this.groups);
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetAllError(refresher, err) {
    console.info(err);
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  filterDevices(groups) {
    groups.filter(group => {
      this.devices.map(device => {
        console.log()
        if (group.devicesIds.indexOf(device.id) === -1) return this.sortedDevices.push(device);
      });
      return this.sortedDevices;
    });
    
    let uniq = this.sortedDevices.reduce(function(a,b){
      if (a.indexOf(b) < 0 ) a.push(b);
      return a;
    },[]);
    this.sortedDevices = uniq;
    this.devices = this.sortedDevices;
    console.log(this.devices);
    return this.devices;
  }

  getRoomName(roomId) {
    let room = this.rooms.get(roomId);

    if (!!room && room.name) {
      return room.name;
    }

    return this.translate.instant('rooms.msg.not_attached_to_room');
  }

  // FUNCTION: Open item
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

  onDeleteItemClick(event, item) {
    this.utils.showDeleteConfirm(
      () => { this.list.closeSlidingItems() },
      this.deleteItem.bind(this, item),
    );
  }

  deleteItem(item) {
    this.utils.showLoader();

    this.deleteSub = this.devicesService.delete(item)
      .subscribe(
        this.onDeleteDeviceSuccess.bind(this),
        this.onDeleteDeviceError.bind(this)
      );
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

  deviceState(item){
    return item.state;
  }

  isDeviceOnline(item){
    return (!! item.isOnline && item.isOnline == true);
  }
  
  requestedBrightness(){
    return Math.round(this.brightness/255*100).toString() + '%';
  }
  currentBrightness(){
    if (!this.currentScene.value) return "-";
    if (this.currentScene.value) return "-";
    return Math.round(this.currentScene.value/255*100).toString() + '%';
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
    if (level < 0 ) {level =0;}
    if (level >100) {level = 100;}
    //send DIRECT_ARC_POWER_CONTROL
    let cc = "00"; //( "00" + (Number(this.device.addr)*2).toString(16)).substr(-2);  //get device addr x 2 => HEX
    // let lvl = ( "00" + (Number(level)*2).toString(16)).substr(-2); // max 255
    let lvl = ( "00" + (Math.round(level*254/100).toString(16))).substr(-2); //max 254
    let addr = "78"; //our protocol => 010V command  18,28,38,48,58 and 78 all
    switch (this.currentScene.addr) {
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

    this.api.mqtt.publishToMqttTopic(this.currentScene.nodeId ,"CMD",  lvl + cc + addr);
  }

  ngOnDestroy() {
    this.subGroups && this.subGroups.unsubscribe();
    this.onDevicesSortSub && this.onDevicesSortSub.unsubscribe();
    this.deleteSub && this.deleteSub.unsubscribe();
    this.onRoomUpdateSub && this.onRoomUpdateSub.unsubscribe();
    this.subDevices && this.subDevices.unsubscribe();
  }


}

