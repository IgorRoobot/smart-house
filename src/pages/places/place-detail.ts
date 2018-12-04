import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import { NavController, NavParams, AlertController } from 'ionic-angular';

import { PlaceEditPage } from './place-edit';

@Component({
  selector: 'page-place-detail',
  templateUrl: 'place-detail.html',
})
export class PlaceDetailPage {
  selectedItem: any;

  constructor(public navCtrl: NavController,
  			  public navParams: NavParams,
  			  public alertCtrl: AlertController,
  			  public translate: TranslateService) {
    // If we navigated to this page, we will have an item available as a nav param
    // TODO: do deep linking too
    this.selectedItem = navParams.get('place');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlaceDetailPage');
  }

	// ????  FUNCTION: Navigate to edit item
  editItem(event, item) {
    console.log("edit")
    this.navCtrl.push(PlaceEditPage, {
      place: this.selectedItem
    });
  }

  // FUNCTION: Delete an item
  deleteItem(item) {
    console.log("delete")
    // Show an item if sure
/*    this.alertCtrl.create({
      title : this.translate.instant('DELETE_ENTRY_TITLE'),
      message: this.translate.instant('DELETE_ENTRY_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('DELETE_ENTRY_NO')
        },{
          text: this.translate.instant('DELETE_ENTRY_YES'),
          handler: data => {
            let loader = this.loadingController.create({content: this.translate.instant('LOADING')});
            loader.present();
            this.url = appconfig.data.apiUrl + appconfig.data.appName + "/classes/itemslist/" + this.selectedItem.objectId;
            this.http.delete(this.url, {headers: this.headers})
            .map(res=> res.json()).subscribe(res => {
              loader.dismiss();
              this.alertCtrl.create({
                title: this.translate.instant('DELETE_ENTRY_SUCCESS_TITLE'),
                message: this.translate.instant('DELETE_ENTRY_SUCCESS_TEXT'),
                buttons: [{
                  text: "OK",
                  handler: () => {
                    this.navCtrl.setRoot(EntryPage, {});
                  }
                }]
              }).present();
            },err => {
              loader.dismiss();
              this.alertCtrl
              .create({ title : this.translate.instant('ERROR_TITLE'), message : this.translate.instant('ERROR_TEXT'), buttons: [{
                text: 'OK',
              }]})
              .present();
            })
          }
        }
      ]
    }).present();*/
  }

}

