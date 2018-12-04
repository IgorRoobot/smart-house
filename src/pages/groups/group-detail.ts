import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController, List  } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { DeviceDetailPage } from '../devices/device-detail';

import { DeviceEditPage } from '../devices/device-edit'; 
import { PlacesService } from '../../services/places.service';
import { GroupsService } from '../../services/groups.service';
import { UtilsService } from '../../services/utils.service';
import { DevicesService } from '../../services/devices.service';
import { RoomsService } from '../../services/rooms.service';
import { ApiService } from '../../api/api.service';

@Component({
  selector: 'page-group-detail',
  templateUrl: 'group-detail.html'
})
export class GroupDetailPage {
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
  public currentGroup;
  brightness: number = 0;
  public isOpen:boolean = false;
  

  @ViewChild(List) list: List;

  getAllSub;
  deleteSub;

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
    private groups: GroupsService,
    private devices: DevicesService,
    private rooms: RoomsService,
    private api: ApiService
  ) {
    this.menuCtrl.enable(true);
    console.log("constructor GroupDetailPage");
  }

  ngOnInit(){
    console.log("onInit GroupDetailPage");
    this.currentPlace = this.places.getCurrent();
    this.currentGroup = this.navParams.get('group');

    this.getItems(null);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupDetailPage');
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
    
    this.getAllSub = this.groups.getAll(this.currentPlace.id)
      .subscribe(
        this.onGetAllSuccess.bind(this, refresher, this.navParams.get('group')),
        this.onGetAllError.bind(this, refresher),
      );
  }

  onGetAllSuccess(refresher, group) {
    this.items = this.devices.getDevicesByIds(group.devicesIds);
    console.log(this.items[0]);
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetAllError(refresher, err) {
    console.info(err);
    if (err.groups) {
      this.items = err.groups;
      this.utils.showTranslatedError(err, {noInternetKey: 'general.failed_to_update_list'});
    } else {
      this.utils.showTranslatedError(err);
    }
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  getRoomName(roomId) {
    if (roomId == undefined) return this.translate.instant('rooms.msg.not_attached_to_room');

    let room = this.rooms.get(roomId);
    if (!!room && room.name) {
      return this.rooms.get(roomId).name;
    }
    return this.translate.instant('rooms.msg.not_attached_to_room');
  }

  deviceState(item){
    return item.state;
  }

  isDeviceOnline(item){
    return (!! item.isOnline && item.isOnline == true);
  }

  // FUNCTION: Open item
  itemTapped(event, item) {
    this.navCtrl.push(DeviceDetailPage, {
      device: item
    });
  }

  editItem(event, item) {
    this.list.closeSlidingItems();
    
    this.navCtrl.push(DeviceEditPage, {device: item});
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
    
    this.mqttOnDevicesInGroup(this.items, lvl, cc, addr);
  }

  mqttOnDevicesInGroup(devices, lvl, cc, addr) {
    this.currentBrightness(devices);
    devices.map(device => {
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

  toggleDevices() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy() {
    this.getAllSub && this.getAllSub.unsubscribe();
    this.deleteSub && this.deleteSub.unsubscribe();
  }

}
