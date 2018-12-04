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

import { DeviceEditPage } from '../devices/device-edit';
import { ScenesService } from '../../services/scenes.service';
import { ScenesPage } from './scenes';

@Component({
  selector: 'page-scene-edit',
  templateUrl: 'scene-edit.html'
})
export class SceneEditPage {
  public picture: string;
  public currentScene: any = {};
  public currentPlace: any = {};
  public dtypes = [];
  public currentObject = {};
  devices: any = [];
  items: any = [];
  groups: any = [];
  sortedDevices: any = [];
  public checkedGroups = [];
  public devicesIds = [];
  public sceneDeviceIsEdit = [];
  public sceneGroupIsEdit = [];
  public inEditMode:boolean = false;
  public devicesInEditMode = [];
  public groupsInEditMode = [];

  @ViewChild(List) list: List;
  @ViewChild(Navbar) navbarName: Navbar;

  deleteSub;
  devicesInGroup;
  deviceCheck = false;
  subGroups;
  subDevices;

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
    private group: GroupsService,
    private utils: UtilsService,
    private device: DevicesService,
    private rooms: RoomsService,
    public platform: Platform,
    public scene: ScenesService
  ) {

  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter SceneEditPage');

    this.currentPlace = this.places.getCurrent();
    this.getAllGroupsAndDevices(null);
    
    if (this.navParams.get('scene')) {
      this.isEdit = true;
      this.currentScene = this.navParams.get('scene');
      this.getDevicesAndGroups(this.currentScene);
      this.devicesInEditMode = this.scene.filterItemsInEditMode(this.currentScene.devicesIds, this.devices);      
    } else {
      this.isEdit = false;
      this.currentScene = {
        name: "New scene",
        picture: "assets/images/noimage.jpg",
        devicesIds: [],
        groupsIds: []
      };
    }
  }

  getAllGroupsAndDevices(refresher) {
    this.subDevices = this.device.getAll(this.currentPlace.id)
    .subscribe(
      this.onGetDevicesSuccess.bind(this, refresher),
      this.onGetDevicesError.bind(this, refresher),
    );

    this.subGroups = this.group.getAll(this.currentPlace.id)
    .subscribe(
      this.onGetAllSuccess.bind(this, refresher),
      this.onGetAllError.bind(this, refresher),
    );
  }

  onGetDevicesSuccess(refresher, devices) {
    this.devices = devices;
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetDevicesError(refresher, err) {
    this.utils.hideLoader();
    console.log(err);
    if (err.devices) {
      this.items = err.devices;
      this.utils.showTranslatedError(err, {noInternetKey: 'general.failed_to_update_list'});
    } else {
      this.utils.showTranslatedError(err);
    }
    refresher && refresher.complete();
  }

  onGetAllSuccess(refresher, groups) {
    this.groups = groups;

    if (this.groups.length !== this.currentScene.groupsIds.length) {
      this.groupsInEditMode = this.scene.filterItemsInEditMode(this.currentScene.groupsIds, this.groups);
    }
    if (this.isEdit) {
      this.sceneDeviceIsEdit = this.scene.filterDevices(this.groups, this.sceneDeviceIsEdit);
    }
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetAllError(refresher, err) {
    console.info(err);
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  updateItemGroups(group) {
    if (group.isChecked) {
      return this.checkedGroups.push(group);
    } else {
      var index = this.checkedGroups.indexOf(group);
      if (index != -1) {
        return this.checkedGroups.splice(index, 1);
      }
      return false;
    }
  }

  updateItemDevices(device) {
    if (device.isChecked) {
      return this.devicesIds.push(device);
    } else {
      var index = this.devicesIds.indexOf(device);
      if (index != -1) {
        return this.devicesIds.splice(index, 1);
      }
      return false;
    }
  }

  editItem(event, item) {
    this.list.closeSlidingItems();
    this.navCtrl.push(DeviceEditPage, {
      device: item
    });
  }

  onDeleteDeviceClick(event, item) {
    this.utils.showDeleteConfirm(
      () => { this.list.closeSlidingItems() },
      this.deleteDevice.bind(this, item),
    );

  }

  onDeleteGroupClick(event, item) {
    this.utils.showDeleteConfirm(
      () => { this.list.closeSlidingItems() },
      this.deleteGroup.bind(this, item),
    );

  }

  deleteGroup(item) {
    this.currentScene.groupsIds.some((group, index, self) => {
      if (group === item.id) {
        self.splice(self[index], 1);
        this.list.closeSlidingItems();
        return self;
      }
    });
    return this.currentScene;
  }


  deleteDevice(item) {
    this.currentScene.devicesIds.some((device, index, self) => {
      if (device === item.id) {
        self.splice(self[index], 1);
        this.list.closeSlidingItems();
        return self;
      }
    });
    return this.currentScene;
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
      this.currentScene.picture = this.picture;
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
      this.currentScene.picture = this.picture;
      this.cropPicture(this.picture);
    }, (err) => {
    });
  }

  cropPicture(pathToPicture) {
    this.crop.crop(pathToPicture, { quality: 75, targetHeight: 720, targetWidth: 1280});
  }

  createFullInfoScene(currentScene) {
    this.checkedGroups.map(groupsIds => {
      currentScene.groupsIds.push(groupsIds.id);
    });
    this.devicesIds.map(devicesIds => {
      currentScene.devicesIds.push(devicesIds.id);
    });
  }

  itemSave() {
    let observable;
    this.utils.showLoader();
    this.createFullInfoScene(this.currentScene);

    if (this.isEdit) {
      observable = this.scene.update(this.currentScene);
    } else {
      observable = this.scene.create(this.currentScene, this.currentPlace.id);
    }

    this.saveSub = observable.subscribe(
      this.onSaveSuccess.bind(this),
      this.onSaveError.bind(this),
    );
  }

  onSaveSuccess() {
    this.utils.hideLoader();
    this.navCtrl.setRoot(ScenesPage);
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

  onDeleteDeviceSuccess() {
    this.utils.hideLoader();
    this.list.closeSlidingItems();
  }

  onDeleteDeviceError(err) {
    console.info(err);
    this.utils.showTranslatedError(err);
    this.utils.hideLoader();
  }

  getDevicesAndGroups(currnetScene) {
    currnetScene.devicesIds.map(device => {
      let deviceInScene = this.device.get(device);
      this.sceneDeviceIsEdit.push(deviceInScene);
    });
    currnetScene.groupsIds.map(group => {
      let groupInScene = this.group.get(group);
      this.sceneGroupIsEdit.push(groupInScene);
    });  
  }

  toggleDevices() {
    this.inEditMode = !this.inEditMode;
  }

  ngOnDestroy() {
    this.saveSub && this.saveSub.unsubscribe();
    this.subGroups && this.subGroups.unsubscribe();
    this.subDevices && this.subDevices.unsubscribe();
  }

}
