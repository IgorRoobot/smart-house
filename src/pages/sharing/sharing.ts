import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { PlacesService } from '../../services/places.service';

// @IonicPage()
@Component({
  selector: 'page-sharing',
  templateUrl: 'sharing.html',
})
export class SharingPage implements OnInit {

  public qrData = null;
  public sharingPlace;
  public createdCode = null;
  public currentPlace;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public translate: TranslateService,
    private places: PlacesService,
  ) {
    this.menuCtrl.enable(true);
    this.currentPlace = this.places.getCurrent();
    this.sharingPlace = navParams.get('place');
    let sharingPlace = this.defaultImageInSharingPlace(navParams.get('place'));
    this.qrData = sharingPlace;
  }

  defaultImageInSharingPlace(sharingPlace) {
    sharingPlace.picture = 'assets/images/noimage.jpg';
    return JSON.stringify(sharingPlace);
  }

  ngOnInit(){
    console.log("onInit");
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter SharingPage');
  }

  createCode() {
    this.createdCode = this.qrData;
  }
}
