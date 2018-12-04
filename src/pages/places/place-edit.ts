import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';

import { PlacesPage } from './places';
import { PlacesService } from '../../services/places.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'page-place-edit',
  templateUrl: 'place-edit.html'
})
export class PlaceEditPage implements OnDestroy {
  public picture: string;
  headers: Headers;
  url: string;
  userAcl: any = {};
  userId: string;
  selectedItem: any;

  saveSub;

  isEdit;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    private camera: Camera,
    private crop: Crop,
    private places: PlacesService,
    private utils: UtilsService,
  ) {
    if (navParams.get('place')) {
      this.isEdit = true;
      this.selectedItem = navParams.get('place');
    } else {
      this.isEdit = false;
      this.selectedItem = {
        name: "New place",
        picture: "assets/images/noimage.jpg",
      };
    }
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
      this.picture = "data:image/jpeg;base64," + imageData;
      this.selectedItem.picture = this.picture;
      this.cropPicture(this.picture);
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
      this.picture = "data:image/jpeg;base64," + imageData;
      this.selectedItem.picture = this.picture;
      this.cropPicture(this.picture);
    }, (err) => {
    });
  }

  cropPicture(pathToPicture) {
    this.crop.crop(pathToPicture, { quality: 75, targetHeight: 720, targetWidth: 1280});
  }

  itemSave() {
    let observable;
    this.utils.showLoader();

    if (this.isEdit) {
      observable = this.places.update(this.selectedItem);
    } else {
      observable = this.places.create(this.selectedItem);
    }

    this.saveSub = observable.subscribe(
      this.onSaveSuccess.bind(this),
      this.onSaveError.bind(this),
    );
  }

  onSaveSuccess() {
    this.utils.hideLoader();
    this.navCtrl.setRoot(PlacesPage, null);
  }

  onSaveError(err) {
    console.log(err);
    this.utils.showTranslatedError(err, {messageKey: 'general.request_error'});
    this.utils.hideLoader();
  }

  ngOnDestroy() {
    this.saveSub && this.saveSub.unsubscribe();
  }

}
