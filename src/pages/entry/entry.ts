import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { LoginPage } from '../login/login';
import { EntryDetailPage } from '../entry-detail/entry-detail';
import { EntryEditPage } from '../entry-edit/entry-edit';
import { Storage } from '@ionic/storage';
import { LoadingController } from 'ionic-angular';
import * as appconfig from '../../appconfig'
import { TranslateService } from '@ngx-translate/core';

import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Component({
  selector: 'page-entry',
  templateUrl: 'entry.html'
})
export class EntryPage {

  public base64Image: string;
  headers: Headers;
  url: string;
  userAcl: any = {};
  userId: string;
  entrys: any = [];

  myMessage: string;

  constructor(private _mqttService: MqttService,
              public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public http: Http, public localStorage: Storage, public loadingController: LoadingController, public menuCtrl: MenuController, public translate: TranslateService) {
    this.menuCtrl.enable(true);
    this.headers = new Headers();
    this.headers.append("X-Parse-Application-Id", appconfig.data.XParseApplicationId);
    this.headers.append("X-Parse-REST-API-Key", appconfig.data.XParseRESTAPIKey);
    this.localStorage.get('userSession').then((value) => {
      this.userId = value.objectId;
      this.headers.append("X-Parse-Session-Token", value.sessionToken);
      this.getEntrys(null);
    })
    if (navParams.get('entry')) {
      this.itemTapped("fromsave", navParams.get('entry'));
    }

    this._mqttService.connect({
      hostname: 'vmm1.saaintertrade.com',
      port: 39001,
      username: 'CATA',
      password: 'CATA'
    })

    this._mqttService.observe('cata/#').subscribe((message: IMqttMessage) => {
      this.myMessage = message.payload.toString();
    });
    // this.myOtherMessage$ = this._mqttService.observe('cata/2');
  }


  public publishMsg(){
    let d = new Date();
    this.unsafePublish('cata/1','hello ' + d.toString());
  }
  private unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 1, retain: false});
  }

  // FUNCTION: Fetch app entrys from parse server
  getEntrys(refresher) {
    let loader = this.loadingController.create({ content: "Loading" });
    loader.present();
    //this.url = appconfig.data.apiUrl + appconfig.data.appName + '/classes/entryslist?where={"owner":"' + this.userId + '"}';
    this.url = appconfig.data.apiUrl + appconfig.data.appName + '/classes/Zone';
    this.http.get(this.url, { headers: this.headers }).map(res => res.json()).subscribe(res => {
      loader.dismiss();
      this.entrys = res.results;
      if (refresher !== null) refresher.complete();
    }, err => {
      // Auto logout if there are problems successfully executing the http.get
      loader.dismiss();
      loader = this.loadingController.create({ content: `Error: ${err.error}` });
      loader.present();
      setTimeout (() => {
        loader.dismiss();
        console.log("Hello from setTimeout");
        this.localStorage.remove('userSession').then(() => {
          this.navCtrl.setRoot(LoginPage);
        })
      }, 500)
    })
  }

  // FUNCTION: Open item
  itemTapped(event, entry) {
    this.navCtrl.push(EntryDetailPage, {
      entry: entry
    });
  }

  // FUNCTION: Navigate to the add entry page
  showAddDialog() {
    this.navCtrl.push(EntryEditPage, {});
  }


}
