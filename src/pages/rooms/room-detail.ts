import { Component, ViewChild, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController } from 'ionic-angular';
import { List  } from 'ionic-angular';

import { PlacesService } from '../../services/places.service';
import { RoomsService } from '../../services/rooms.service';
import { DevicesService } from '../../services/devices.service';
import { UtilsService } from '../../services/utils.service';
import { GroupsService } from '../../services/groups.service';

import { DeviceDetailPage } from '../devices/device-detail';
import { DeviceEditPage } from '../devices/device-edit';

@Component({
  selector: 'page-room-detail',
  templateUrl: 'room-detail.html',
})
export class RoomDetailPage implements OnDestroy {
  public currentRoom: any = {};
  public currentPlace: any = {};
  devices: any = [];
  groups:any = [];
  sortedDevices: any = [];

  @ViewChild(List) list: List;

  onDevicesSortSub;
  onRoomUpdateSub;
  deleteSub;
  subGroups;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    private places: PlacesService,
    private rooms: RoomsService,
    private devicesService: DevicesService,
    private utils: UtilsService,
    private group: GroupsService
  ) {}

  ionViewWillEnter(){
    console.log('ionViewWillEnter RoomDetailPage');

    if (this.currentRoom.id) {
      this.getRoomDevices();
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomDetailPage');
    this.currentPlace = this.places.getCurrent();

    if (this.navParams.get('room')) {
      this.currentRoom = this.navParams.get('room');
    } else {
      this.currentRoom = {};
      this.currentRoom.name = "";
      this.currentRoom.picture = "assets/images/noimage.jpg";
    }

    this.getRoomDevices();

    this.onDevicesSortSub = this.devicesService.onDevicesSort
      .subscribe(this.getRoomDevices.bind(this));
  }

  getAllGroups(refresher) {
    this.subGroups = this.group.getAll(this.currentPlace.id)
    .subscribe(
      this.onGetAllSuccess.bind(this, refresher),
      this.onGetAllError.bind(this, refresher),
    );
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

  getRoomDevices() {
    this.devices = this.devicesService.listDevicesInRoom(this.currentRoom.id);   
    this.getAllGroups(null);
  }

  filterDevices(groups) {
    groups.filter(group => {
      this.devices.map(device => {
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
    this.getRoomDevices();
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

  ngOnDestroy() {
    this.subGroups && this.subGroups.unsubscribe();
    this.onDevicesSortSub && this.onDevicesSortSub.unsubscribe();
    this.deleteSub && this.deleteSub.unsubscribe();
    this.onRoomUpdateSub && this.onRoomUpdateSub.unsubscribe();
  }


}

