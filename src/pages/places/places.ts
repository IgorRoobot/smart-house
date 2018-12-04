import { Component, OnInit, ViewChild, OnDestroy  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController, List  } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { UtilsService } from '../../services/utils.service';
import { PlacesService } from '../../services/places.service';
import { PlaceEditPage } from './place-edit';
import { TabsPage } from '../tabs/tabs';
import { SharingPage } from '../sharing/sharing';
import { ScanPage } from '../sharing/scan';

// @IonicPage()
@Component({
  selector: 'page-places',
  templateUrl: 'places.html',
})
export class PlacesPage implements OnInit, OnDestroy {

  // public picture: string;
  items: any = [];
  public currentPlace;
  @ViewChild(List) list: List;

  getPlacesSub;
  deleteSub;
  // createSub;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public translate: TranslateService,
    private utils: UtilsService,
    private places: PlacesService,
  ) {
    this.menuCtrl.enable(true);
  }

  ngOnInit(){
    //console.log("onInit");
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter PlacesPage');
    this.currentPlace = this.places.getCurrent();
    this.getItems(null);
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad PlacesPage');
    this.presentToast(this.translate.instant('places.msg.slide_to_see'));
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

    this.getPlacesSub = this.places.getAll()
      .subscribe(
        this.onGetAllPlacesSuccess.bind(this, refresher),
        this.onGetAllPlacesError.bind(this, refresher),
      );
  }

  onGetAllPlacesSuccess(refresher, places) {
    this.items = places;
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetAllPlacesError(refresher, err) {
    console.log(err);
    if (err.places) {
      this.items = err.places;
      this.utils.showTranslatedError(err, {noInternetKey: 'general.failed_to_update_list'});
    } else {
      this.utils.showTranslatedError(err);
    }
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  // FUNCTION: Open item
  itemTapped(event, item) {
    this.places.setCurrentAsPromise(item)
    .then((res)=>{
      this.navCtrl.push(TabsPage, {place: item});
    });
  }


  shareKey(event, item){
    this.navCtrl.push(SharingPage, { place: item })
    this.list.closeSlidingItems();
  }

  addItem() {
    this.list.closeSlidingItems();
    this.navCtrl.push(PlaceEditPage);
  }

  editItem(event, item) {
    this.list.closeSlidingItems();
    this.navCtrl.push(PlaceEditPage, {
      place: item
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

    this.deleteSub = this.places.delete(item)
      .subscribe(
        this.onDeletePlaceSuccess.bind(this),
        this.onDeletePlaceError.bind(this)
      );
  }

  onDeletePlaceSuccess() {
    this.utils.hideLoader();
    this.list.closeSlidingItems();
  }

  onDeletePlaceError(err) {
    console.log(err);
    this.utils.showTranslatedError(err, {messageKey: 'general.request_error'});
    this.utils.hideLoader();
  }

  scanQrCode(event) {
    this.navCtrl.push(ScanPage);
  }

  ngOnDestroy() {
    this.getPlacesSub && this.getPlacesSub.unsubscribe();
    this.deleteSub && this.deleteSub.unsubscribe();
  }

}
