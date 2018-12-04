import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, LoadingController, List, Navbar, Platform } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';

import { PlacesService } from '../../services/places.service';
import { GroupsService } from '../../services/groups.service';
import { UtilsService } from '../../services/utils.service';
import { DevicesService } from '../../services/devices.service';
import { RoomsService } from '../../services/rooms.service';

import { GroupsPage } from '../groups/groups';
import { AddDevicesPage } from '../devices/group-add-device';

@Component({
  selector: 'page-group-edit',
  templateUrl: 'group-edit.html'
})
export class GroupEditPage {
  public picture: string;
  public currentGroup: any = {};
  public currentPlace: any = {};
  public dtypes = [];
  public currentObject = {};
  items: any = [];

  @ViewChild(List) list: List;
  @ViewChild(Navbar) navbarName: Navbar;

  deleteSub;
  devicesInGroup;
  deviceCheck = false;

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
    private groups: GroupsService,
    private utils: UtilsService,
    private devices: DevicesService,
    private rooms: RoomsService,
    public platform: Platform
  ) {

  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter GroupsEditPage');

    this.currentPlace = this.places.getCurrent();
    
    
    this.dtypes = this.devices.getUniqueTypes(this.currentPlace);
    this.setBackButtonAction()
    if (this.navParams.get('group')) {
      this.isEdit = true;
      this.currentGroup = this.navParams.get('group');
      this.items = [];
      this.deviceCheck = this.devicesInGroupFunc(this.currentGroup);
      this.devices.getDevicesByIds(this.currentGroup.devicesIds).map(res => this.items.push(res));
    } else if (this.navParams.get('currentGroup') && this.navParams.get('currentGroup').id) {
      this.isEdit = true;
      this.currentGroup = this.navParams.get('currentGroup');
      this.items = [];
      this.deviceCheck = this.devicesInGroupFunc(this.currentGroup);
      this.devices.getDevicesByIds(this.currentGroup.devicesIds).map(res => this.items.push(res));
    } else {
      this.isEdit = false;
      this.currentGroup = this.navParams.get('currentGroup');
      
      if (this.currentGroup) {
        this.items = [];
        this.deviceCheck = this.devicesInGroupFunc(this.currentGroup);
        this.devices.getDevicesByIds(this.currentGroup.devicesIds).map(res => {
          this.items.push(res);
        });
      } else {
        this.currentGroup = {
          name: "New group",
          picture: "assets/images/noimage.jpg",
          type: this.navParams.get('type') || this.dtypes[0],
          devicesIds: this.navParams.get('devicesIds')
        };
      }

    }
  }

  devicesInGroupFunc(currentGroup) {
    this.devicesInGroup = currentGroup.devicesIds.length;
    return this.devicesInGroup ? true : false;
  }

  setBackButtonAction(){
    this.navbarName.backButtonClick = () => {
      this.itemSave();
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
      this.currentGroup.picture = this.picture;
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
      this.currentGroup.picture = this.picture;
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
      observable = this.groups.update(this.currentGroup);
    } else {
      observable = this.groups.create(this.currentGroup, this.currentPlace.id);
    }

    this.saveSub = observable.subscribe(
      this.onSaveSuccess.bind(this),
      this.onSaveError.bind(this),
    );
  }

  onSaveSuccess() {
    this.utils.hideLoader();
    this.navCtrl.setRoot(GroupsPage);
  }

  onSaveError(err) {
    console.log(err);
    this.utils.showTranslatedError(err, {messageKey: 'general.request_error'});
    this.utils.hideLoader();
  }

  getRoomName(roomId) {
    if (roomId == undefined) return this.translate.instant('rooms.msg.not_attached_to_room');

    let room = this.rooms.get(roomId);
    if (!!room && room.name) {
      return this.rooms.get(roomId).name;
    }
    return this.translate.instant('rooms.msg.not_attached_to_room');
  }

  deviceState(item){
    return item.state;
  }

  isDeviceOnline(item){
    return (!! item.isOnline && item.isOnline == true);
  }

  //Delete device in group
  onDeleteItemClick(event, item) {
    this.utils.showDeleteConfirm(
      () => { this.list.closeSlidingItems() },
      this.deleteDeviceInGroup.bind(this, item),
    );

  }

  deleteDeviceInGroup(item) {
    let index = this.currentGroup.devicesIds.indexOf(item.id);
    if (index > -1) {
      this.deleteSub = this.currentGroup.devicesIds.splice(index, 1);
    }
    return this.currentGroup;
  }

  addDevices(groupId?) {

    this.list.closeSlidingItems();
    this.navCtrl.push(AddDevicesPage, {groupId: groupId, dtype: this.currentGroup.type, isEdit: this.isEdit, currentGroup: this.currentGroup});
  }

  onDeleteDeviceSuccess() {
    this.utils.hideLoader();
    this.list.closeSlidingItems();
  }

  onDeleteDeviceError(err) {
    console.info(err);
    this.utils.showTranslatedError(err);
    this.utils.hideLoader();
  }

  ngOnDestroy() {
    this.saveSub && this.saveSub.unsubscribe();
  }

}
