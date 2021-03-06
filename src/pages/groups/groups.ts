import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController, List  } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { GroupEditPage } from './group-edit';
import { GroupDetailPage } from './group-detail';
import { PlacesService } from '../../services/places.service';
import { GroupsService } from '../../services/groups.service';
import { UtilsService } from '../../services/utils.service';

// @IonicPage()
@Component({
  selector: 'groups-page',
  templateUrl: 'groups.html',
})
export class GroupsPage implements OnInit, OnDestroy {

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
  ) {
    this.menuCtrl.enable(true);
    console.log("constructor GroupsPage");
  }

  ngOnInit(){
    console.log("onInit GroupsPage");
    this.currentPlace = this.places.getCurrent();

    this.getItems(null);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsPage');
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
        this.onGetAllSuccess.bind(this, refresher),
        this.onGetAllError.bind(this, refresher),
      );
  }

  onGetAllSuccess(refresher, groups) {
    this.items = groups;
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

  // FUNCTION: Open item
  itemTapped(event, item) {
    this.navCtrl.push(GroupDetailPage, {group: item});
  }

  addItem() {
    // this.list.closeSlidingItems();
    this.navCtrl.push(GroupEditPage);
  }
  
  editItem(event, item) {
    this.list.closeSlidingItems();
    
    this.navCtrl.push(GroupEditPage, {group: item});
  }

  onDeleteItemClick(event, item) {
    this.utils.showDeleteConfirm(
      () => { this.list.closeSlidingItems() },
      this.deleteItem.bind(this, item),
    );
  }

  deleteItem(item) {
    this.utils.showLoader();

    this.deleteSub = this.groups.delete(item)
      .subscribe(
        this.onDeleteGroupSuccess.bind(this),
        this.onDeleteGroupError.bind(this)
      );
  }

  onDeleteGroupSuccess() {
    this.utils.hideLoader();
    this.list.closeSlidingItems();
  }

  onDeleteGroupError(err) {
    console.info(err);
    this.utils.showTranslatedError(err, {messageKey: 'general.request_error'});
    this.utils.hideLoader();
  }

  ngOnDestroy() {
    this.getAllSub && this.getAllSub.unsubscribe();
    this.deleteSub && this.deleteSub.unsubscribe();
  }
}
