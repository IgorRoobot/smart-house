import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import * as appconfig from '../../appconfig'
import { Storage } from '@ionic/storage';
import {TranslateService} from '@ngx-translate/core';
import { Http, Headers } from '@angular/http';
import { EntryPage } from '../entry/entry';

@Component({
  selector: 'page-entry-edit',
  templateUrl: 'entry-edit.html'
})
export class EntryEditPage {
  public base64Image: string;
  headers: Headers;
  url: string;
  userAcl: any = {};
  userId: string;
  selectedItem: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public localStorage: Storage,
    public http: Http,
    public loadingController: LoadingController,
    public translate: TranslateService,
    private camera: Camera
  ) {
    if (navParams.get('entry')) {
      this.selectedItem = navParams.get('entry');
    } else {
      this.selectedItem = [];
      this.selectedItem.name = "";
      this.selectedItem.desc = "";
      this.selectedItem.imgbase64 = "assets/images/noimage.jpg";
    }
    this.headers = new Headers();
    this.headers.append("X-Parse-Application-Id", appconfig.data.XParseApplicationId);
    this.headers.append("X-Parse-REST-API-Key", appconfig.data.XParseRESTAPIKey);
    this.localStorage.get('userSession').then((value) => {
      this.userId = value.objectId;
      this.headers.append("X-Parse-Session-Token", value.sessionToken);
    })


  }

  // FUNCTION: Change a picture
  changePicture(){
    this.alertCtrl.create({
      title : this.translate.instant('CHANGE_PIC_TITLE'),
      message: this.translate.instant('CHANGE_PIC_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('CHANGE_PIC_USE_CAM'),
          handler: data => {
            this.takePicture();
          }
        },{
          text: this.translate.instant('CHANGE_PIC_USE_BIB'),
          handler: data => {
            this.choosePicture();
          }
        }
      ]
    }).present();
  }

  // FUNCTION: Take a picture from the phone camera
  takePicture(){
    this.camera.getPicture({
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType : this.camera.PictureSourceType.CAMERA,
      allowEdit : false,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      saveToPhotoAlbum: true,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 75
    }).then((imageData) => {
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.selectedItem.imgbase64 = this.base64Image;
    }, (err) => {
    });
  }

  // FUNCTION: Choose a picture from the phone library
  choosePicture(){
    this.camera.getPicture({
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: false,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 75
    }).then((imageData) => {
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.selectedItem.imgbase64 = this.base64Image;
    }, (err) => {
    });
  }

  // FUNCTION: Create or edit an entry
  entrysave(entry) {
    let loader = this.loadingController.create({content: this.translate.instant('LOADING')});
    loader.present();
    // Check for edit or create status
    // If the navigation parameters from previous page are exisintg edit an entry
    if (this.navParams.get('entry')) {
      this.url = appconfig.data.apiUrl + appconfig.data.appName + "/classes/entryslist/" + this.selectedItem.objectId;
      this.http.put(this.url, { name: this.selectedItem.name, desc: this.selectedItem.desc, imgbase64: this.selectedItem.imgbase64}, {headers: this.headers})
      .map(res=> res.json()).subscribe(res => {
        loader.dismiss();
        this.alertCtrl.create({
          title: this.translate.instant('EDIT_ENTRY_SUCCESS_TITLE'),
          message: this.translate.instant('EDIT_ENTRY_SUCCESS_MESSAGE'),
          buttons: [{
            text: "OK",
            handler: () => {
              this.navCtrl.setRoot(EntryPage, {
                entry: this.selectedItem
              });
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
    // Else create a new entry
    else {
      this.url = appconfig.data.apiUrl + appconfig.data.appName + "/classes/entryslist";
      // Set userAcl so only owning user is able to access this item
      this.userAcl = {
        [this.userId]: {
          "read": true,
          "write": true
        },
        "*": {}
      };
      this.http.post(this.url, { owner: this.userId, name: this.selectedItem.name, desc: this.selectedItem.desc, imgbase64: this.selectedItem.imgbase64, ACL: this.userAcl}, {headers: this.headers})
      .map(res=> res.json()).subscribe(res => {
        loader.dismiss();
        this.alertCtrl.create({
          title: this.translate.instant('ADD_ENTRY_SUCCESS_TITLE'),
          message: this.translate.instant('ADD_ENTRY_SUCCESS_MESSAGE'),
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

}
