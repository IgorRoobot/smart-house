import { Component, OnDestroy } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import { NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';

import { User } from '../../models/user-model';

import { ApiService } from '../../api/';
import { UtilsService } from '../../services/utils.service';

const EMAIL_TAKEN_ERROR_CODE = 203;

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage implements OnDestroy {

  user: User = {
    name: "",
    username: "",
    email: "",
    password: "",
    imgbase64: "assets/images/noimage.jpg"
  };
  confirmPassword = '';

  public base64Image: string;
  url: string;
  userId: string;
  userSession: any;

  updateSub;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public localStorage: Storage,
    public menuCtrl: MenuController,
    private camera: Camera,
    private api: ApiService,
    private utils: UtilsService,
  ) {
    this.menuCtrl.enable(true);

    const userSession = this.api.auth.getUserSession();

    this.user.name = userSession.name;
    this.user.email = userSession.email;
    this.user.imgbase64 = userSession.imgbase64;

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
      this.user.imgbase64 = this.base64Image;
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
      this.user.imgbase64 = this.base64Image;
    }, (err) => {
    });
  }

  // FUNCTION: Set save profile parameters
  saveprofile() {
    if (this.user.password != this.confirmPassword) {
      this.utils.showTranslatedErrorByKey('SIGNUP_PWCHECK_MESSAGE');
      return;
    }

    const profileChange = {
      name: this.user.name,
      email: this.user.email,
      imgbase64: this.base64Image,
    };

    if (this.user.password) {
      (<any>profileChange).password = this.user.password;
    }

    this.utils.showLoader();

    this.updateSub = this.api.auth.updateProfile(profileChange)
      .subscribe(
        this.onUpdateProfileSuccess.bind(this),
        this.onUpdateProfileError.bind(this),
      );
  }

  onUpdateProfileSuccess() {
    this.utils.hideLoader();

    this.alertCtrl.create({
      title: this.translate.instant('PROFILE_SUCCESS_TITLE'),
      message: this.translate.instant('PROFILE_SUCCESS_MESSAGE'),
      buttons: [{
        text: "OK",
        handler: () => {
          this.navCtrl.pop();
        }
      }]
    }).present();

  }

  onUpdateProfileError(err) {
    console.log(err);
    this.utils.hideLoader();

    if (err.code === EMAIL_TAKEN_ERROR_CODE) {
      this.utils.showTranslatedErrorByKey('general.email_taken');
      return;
    }

    this.utils.showTranslatedErrorByKey('general.request_error');

  }

  ngOnDestroy() {
    this.updateSub && this.updateSub.unsubscribe();
  }

}
