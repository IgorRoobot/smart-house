import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';

import { RoomsPage } from './rooms';
// import { DataService } from '../../services/data.service';
import { PlacesService } from '../../services/places.service';
import { RoomsService } from '../../services/rooms.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'page-room-edit',
  templateUrl: 'room-edit.html'
})
export class RoomEditPage {
  public picture: string;
  public currentRoom: any = {};
  public currentPlace: any = {};

  private isEdit;
  private saveSub;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    private camera: Camera,
    private crop: Crop,
    // private ds: DataService,
    private places: PlacesService,
    private rooms: RoomsService,
    private utils: UtilsService,
  ) {}

  ionViewWillEnter(){
    console.log('ionViewWillEnter RoomEditPage');

    this.currentPlace = this.places.getCurrent();

    if (this.navParams.get('room')) {
      this.isEdit = true;
      this.currentRoom = this.navParams.get('room');
    } else {
      this.isEdit = false;
      this.currentRoom = {
        name: "New room",
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
      this.currentRoom.picture = this.picture;
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
      this.currentRoom.picture = this.picture;
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
      observable = this.rooms.update(this.currentRoom);
    } else {
      observable = this.rooms.create(this.currentRoom, this.currentPlace.id);
    }

    this.saveSub = observable.subscribe(
      this.onSaveSuccess.bind(this),
      this.onSaveError.bind(this),
    );
  }

  onSaveSuccess() {
    this.utils.hideLoader();
    this.navCtrl.setRoot(RoomsPage, null);
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
