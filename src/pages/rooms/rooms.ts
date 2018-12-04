import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController, List  } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { RoomDetailPage } from './room-detail';
import { RoomEditPage } from './room-edit';
import { PlacesService } from '../../services/places.service';
import { DevicesService } from '../../services/devices.service';
import { RoomsService } from '../../services/rooms.service';
import { UtilsService } from '../../services/utils.service';

import { forkJoin } from 'rxjs/observable/forkJoin';

// @IonicPage()
@Component({
  selector: 'page-rooms',
  templateUrl: 'rooms.html',
})
export class RoomsPage implements OnInit, OnDestroy {

  items: any = [];
  public currentPlace;

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
    private devices: DevicesService,
    private utils: UtilsService,
    private rooms: RoomsService,
  ) {
    this.menuCtrl.enable(true);
    console.log("constructor RoomsPage");
  }

  ngOnInit(){
    console.log("onInit RoomsPage");
    this.currentPlace = this.places.getCurrent();

    this.getItems(null, true);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomsPage');
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      position: 'top',
      duration: 3000
    });
    toast.present();
  }

  getItems(refresher, isToFetchDevices) {
    this.utils.showLoader();

    const observables = [
      this.rooms.getAll(this.currentPlace.id)
    ];

    if (isToFetchDevices) {
      observables.push(this.devices.getAll(this.currentPlace.id));
    }

    this.getAllSub = forkJoin(observables)
      .subscribe(
        this.onGetAllSuccess.bind(this, refresher),
        this.onGetAllError.bind(this, refresher),
      );
  }

  onGetAllSuccess(refresher, [rooms]) {
    this.items = rooms;
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetAllError(refresher, err) {
    console.info(err);
    if (err.rooms) {
      this.items = err.rooms;
      this.utils.showTranslatedError(err, {noInternetKey: 'general.failed_to_update_list'});
    } else {
      this.utils.showTranslatedError(err);
    }
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  // FUNCTION: Open item
  itemTapped(event, item) {
    this.navCtrl.push(RoomDetailPage, {room: item});
  }

  addItem() {
    this.list.closeSlidingItems();
    this.navCtrl.push(RoomEditPage);
  }

  editItem(event, item) {
    this.list.closeSlidingItems();

    this.navCtrl.push(RoomEditPage, {room: item});
  }

  onDeleteItemClick(event, item) {
    this.utils.showDeleteConfirm(
      () => { this.list.closeSlidingItems() },
      this.deleteItem.bind(this, item),
    );
  }

  deleteItem(item) {
    this.utils.showLoader();

    this.deleteSub = this.rooms.delete(item)
      .subscribe(
        this.onDeleteRoomSuccess.bind(this),
        this.onDeleteRoomError.bind(this)
      );
  }

  onDeleteRoomSuccess() {
    this.utils.hideLoader();
    this.list.closeSlidingItems();
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
