import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';

// import { DevicesPage } from './devices';
// import { DataService } from '../../services/data.service';
import { PlacesService } from '../../services/places.service';
import { RoomsService } from '../../services/rooms.service';
import { DevicesService } from '../../services/devices.service';
import { UtilsService } from '../../services/utils.service';
import { GroupsService } from '../../services/groups.service';

@Component({
  selector: 'page-device-edit',
  templateUrl: 'device-edit.html'
})
export class DeviceEditPage implements OnDestroy {
  public picture: string;
  public currentDevice: any = {};
  public currentPlace: any = {};
  public rooms;
  public selectedRoomId;
  public groups;
  public isChecked: boolean;
  public checkedGroups = [];

  subGroups;
  saveGroups;
  private getRoomsSub;
  private updateSub;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    private camera: Camera,
    private crop: Crop,
    private roomsService: RoomsService,
    private places: PlacesService,
    private devices: DevicesService,
    private utils: UtilsService,
    private group: GroupsService,
  ) {
    
  }

  ionViewWillEnter(){
    console.log('ionViewWillEnter DeviceDetailPage');
    this.currentPlace = this.places.getCurrent();

    this.getAllGroups(null, this.currentPlace.id);

    if (this.navParams.get('device')) {
      this.currentDevice = this.navParams.get('device');
    } else {
      this.currentDevice = {};
      this.currentDevice.name = "";
      this.currentDevice.picture = "assets/images/noimage.jpg";
    }

    this.selectedRoomId = this.currentDevice.roomId;
    
    this.getRoomsSub = this.roomsService.getAll(this.currentPlace.id)
      .subscribe(
        (rooms) => {
          this.rooms = rooms;
        },
        (err) => {
          console.log(err);
        },
      );
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
      this.currentDevice.picture = this.picture;
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
      this.currentDevice.picture = this.picture;
      this.cropPicture(this.picture);
    }, (err) => {
    });
  }

  cropPicture(pathToPicture) {
    this.crop.crop(pathToPicture, { quality: 75, targetHeight: 720, targetWidth: 1280});
  }
/*  selectRoom(roomId){
    console.log(roomId);
    this.selectedRoomId = roomId;
  }*/

  isRoomChecked(roomId) {
    this.selectedRoomId === roomId;
  }

  getAllGroups(refresher, placeId) {
    this.subGroups = this.group.getAll(placeId)
      .subscribe(
        this.onGetGroupsSuccess.bind(this, refresher),
        this.onGetGroupsError.bind(this, refresher)
      )
  }

  filteredGroupsByType(allGroups) {
    return allGroups
      .filter(group => 
        group.type === this.currentDevice.dtype && 
        group.devicesIds.indexOf(this.currentDevice.id) === -1
      );
  }

  updateItem(group) {
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

  onGetGroupsSuccess(refresher, groups) {
    this.groups = this.filteredGroupsByType(groups);
    this.groups.map(res=> res.isChecked = false);
    this.utils.hideLoader();
    refresher && refresher.complete();
  }

  onGetGroupsError(refresher, err) {
    this.utils.hideLoader();
    console.log(err);
    refresher && refresher.complete();
  }

  addDevicesIdsToGroup(arrayGroups) {
    console.log()
    if (arrayGroups.length > 1) {
      arrayGroups.map(group => {
        return group.devicesIds.push(this.currentDevice.id);
      });
      return arrayGroups;
    } else {
      arrayGroups[0].devicesIds.push(this.currentDevice.id);
      return arrayGroups;
    }
  }

  itemSave() {
    this.utils.showLoader();
    this.currentDevice.roomId = this.selectedRoomId;

    if (this.checkedGroups.length) {
      this.addDevicesIdsToGroup(this.checkedGroups)
        .map(updatedGroup => {
          delete updatedGroup.isChecked;
          this.group.update(updatedGroup).subscribe();
        });
    }

    this.updateSub = this.devices.update(this.currentDevice)
      .subscribe(
        this.onDeviceUpdateSuccess.bind(this),
        this.onDeviceUpdateError.bind(this),
      );
  }

  onDeviceUpdateSuccess(device) {
    this.utils.hideLoader();
    this.navCtrl.popToRoot();
  }

  onDeviceUpdateError(err) {
    console.info(err);
    this.utils.hideLoader();
    this.utils.showTranslatedError(err);
  }

  ngOnDestroy() {
    this.subGroups && this.subGroups.unsubscribe();
    this.getRoomsSub && this.getRoomsSub.unsubscribe();
    this.updateSub && this.updateSub.unsubscribe();
  }

}
