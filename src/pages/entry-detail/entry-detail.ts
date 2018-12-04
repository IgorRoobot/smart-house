import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import * as appconfig from '../../appconfig'
import { Storage } from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';
import { Http, Headers } from '@angular/http';
import { EntryPage } from '../entry/entry';
import { EntryEditPage } from '../entry-edit/entry-edit';

import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Component({
  selector: 'page-entry-detail',
  templateUrl: 'entry-detail.html'
})
export class EntryDetailPage {
  selectedItem: any;
  headers: Headers;
  url: string;
  userId: string;

  public myMessage: string;
  // public myOtherMessage$: Observable<IMqttMessage>;

  constructor(private _mqttService: MqttService,
              public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public localStorage: Storage, public http: Http, public loadingController: LoadingController, public translate: TranslateService) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get('entry');
    this.headers = new Headers();
    this.headers.append("X-Parse-Application-Id", appconfig.data.XParseApplicationId);
    this.headers.append("X-Parse-REST-API-Key", appconfig.data.XParseRESTAPIKey);
    this.localStorage.get('userSession').then((value) => {
      this.userId = value.objectId;
      this.headers.append("X-Parse-Session-Token", value.sessionToken);
    })

    this._mqttService.observe('cata/1').subscribe((message: IMqttMessage) => {
      this.myMessage = message.payload.toString();
    });
    // this.myOtherMessage$ = this._mqttService.observe('cata/2');
  }

  public publishMsg(){
    this.unsafePublish('cata/1','hello');
  }
  private unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 1, retain: false});
  }

  // FUNCTION: Navigate to edit entry page
  editEntry(event, entry) {
    this.navCtrl.push(EntryEditPage, {
      entry: this.selectedItem
    });
  }

  // FUNCTION: Delete an entry
  deleteEntry(entry) {
    // Show an entry if sure
    this.alertCtrl.create({
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
            this.url = appconfig.data.apiUrl + appconfig.data.appName + "/classes/entryslist/" + this.selectedItem.objectId;
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
    }).present();
  }


}
