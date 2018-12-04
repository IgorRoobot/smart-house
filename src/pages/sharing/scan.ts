import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';

import { PlacesService } from '../../services/places.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

// @IonicPage()
@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html',
})
export class ScanPage implements OnInit {

  public scannedCode = null;
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
    private barcodeScanner: BarcodeScanner,
  ) {
    this.menuCtrl.enable(true);
    this.currentPlace = this.places.getCurrent();
  }

  ngOnInit(){
    console.log("onInit");
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter ScanPage');
  }

  scanCode() {
    this.barcodeScanner
      .scan()
      .then(barcodeData => {
        this.scannedCode = barcodeData.text;
        return JSON.parse(this.scannedCode);
      });
  }
}
