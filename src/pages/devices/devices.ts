import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController, List  } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { DevicesService } from '../../services/devices.service';
import { DeviceDetailPage } from './device-detail';
import { DeviceEditPage } from './device-edit';
import { DeviceCreatePage } from './device-create';
import { PlacesService } from '../../services/places.service';
import { RoomsService } from '../../services/rooms.service';
import { UtilsService } from '../../services/utils.service';

// @IonicPage()
@Component({
  selector: 'page-devices',
  templateUrl: 'devices.html',
})
export class DevicesPage implements OnInit, OnDestroy {

  items: any = [];
  public currentPlace;
  public allGroups = [];

  @ViewChild(List) list: List;

  subGroups;
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
    private devices: DevicesService,
    private places: PlacesService,
    private rooms: RoomsService,
    private utils: UtilsService,
  ) {
    this.menuCtrl.enable(true);

    console.log("constructor DevicesPage");
  }

  ngOnInit(){
    console.log("onInit DevicesPage");
    this.currentPlace = this.places.getCurrent();
    this.getItems(null);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DevicesPage');
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      position: 'top',
      duration: 3000
    });
    toast.present();
  }

  // FUNCTION: Fetch app items from parse server
  getItems(refresher) {
    this.utils.showLoader();

    this.getAllSub = this.devices.getAll(this.currentPlace.id)
      .subscribe(
        this.onGetDevicesSuccess.bind(this, refresher),
        this.onGetDevicesError.bind(this, refresher),
      );
  }

  onGetDevicesSuccess(refresher, devices) {
    this.items = devices;
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetDevicesError(refresher, err) {
    this.utils.hideLoader();
    console.log(err);
    if (err.devices) {
      this.items = err.devices;
      this.utils.showTranslatedError(err, {noInternetKey: 'general.failed_to_update_list'});
    } else {
      this.utils.showTranslatedError(err);
    }
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

  // FUNCTION: Open item
  itemTapped(event, item) {
    this.navCtrl.push(DeviceDetailPage, {
      device: item
    });
  }

  addItem() {
    this.list.closeSlidingItems();
    this.navCtrl.push(DeviceCreatePage, null);
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

    this.deleteSub = this.devices.delete(item)
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

  ngOnDestroy() {
    this.subGroups && this.subGroups.unsubscribe();
    this.getAllSub && this.getAllSub.unsubscribe();
    this.deleteSub && this.deleteSub.unsubscribe();
  }


}
