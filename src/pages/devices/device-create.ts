import { Component, ViewChild, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { NavController, NavParams, AlertController, LoadingController, Slides, ViewController  } from 'ionic-angular';
// import { Camera } from '@ionic-native/camera';
// import { Network } from '@ionic-native/network';

// import { DevicesPage } from './devices';
// import { DataService } from '../../services/data.service';
import { PlacesService } from '../../services/places.service';
import { DevicesService } from '../../services/devices.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'page-device-create',
  templateUrl: 'device-create.html'
})
export class DeviceCreatePage implements OnDestroy {
  @ViewChild(Slides) slides: Slides;

  // TODO: save SSID & pass to local storage and show them next time

  public deviceCreateData = {
    ssid: '3pidesign.com',
    password: 'goodlife',
    doSaveSSID: true,
    deviceId: '',
    deviceType: '',
    devicePlace: '',
    deviceCapabilies: [],
    mData:'',
    brokerURL: '',
    brokerPort: 19001,
    brokerUser: '',
    brokerPwd:  '',
    topicBase:  '',
    updateURL: ''

    //mqtt and other
  };


  public picture: string;
  public currentDevice: any = {};
  public currentPlace: any = {};
  public rooms;
  public selectedRoom;
  // private connectSubscription;

  createManySub;
  getDataFromDeviceSub;
  saveDataToDeviceSub;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public translate: TranslateService,
    public viewCtrl: ViewController,
    private places: PlacesService,
    private devices: DevicesService,
    private utils: UtilsService,
  ) {}

  ionViewWillEnter(){
    console.log('ionViewWillEnter DeviceCreatePage');
    this.slides.lockSwipes(true);
    this.currentPlace = this.places.getCurrent();
    this.deviceCreateData.brokerURL = this.currentPlace.cloud_broker_url;
    this.deviceCreateData.brokerPort = this.currentPlace.cloud_broker_port_ssl;
    this.deviceCreateData.brokerUser = this.currentPlace.cloud_broker_user;
    this.deviceCreateData.brokerPwd = this.currentPlace.cloud_broker_user_pass;
    this.deviceCreateData.topicBase = this.currentPlace.topic;
    this.currentDevice = {};
  }

  isSlideNextEnabled(){
    let currIndex = this.slides.getActiveIndex();
    switch (currIndex) {
      case 0:
        // First slide
        if (this.deviceCreateData.ssid != '' && this.deviceCreateData.password != '') return true;
        break;

      case 1:
        // slide - connect to Wi-Fi of the device
        // TODO: find solution to test network SSID

        // Get device type & ID
        // if (this.deviceCreateData.ssid != '' && this.deviceCreateData.password != '') return true;
        break;

      default:
        // code...
        break;
    }
    return false;
  }
  userChangeNumber(item){
    item.userQty = parseInt(item.userQty);
    if (item.userQty < 0 ) item.userQty = 0;
    if (item.userQty > item.qty) item.userQty = item.qty;
  }

  // choose 3PI_XXX... wifi
  getDeviceAndSlideNext(){
    let currIndex = this.slides.getActiveIndex();
    //user should be connected to device AP and moving from page 1 to 2
    if (currIndex !== 1){
      return;
    }

    this.utils.showLoader();

    this.getDataFromDeviceSub = this.devices.getDataFromDevice()
      .subscribe(
        this.onGetDataFromDeviceSuccess.bind(this),
        this.onGetDataFromDeviceError.bind(this),
      );
  }

  onGetDataFromDeviceSuccess(data) {
    this.deviceCreateData.deviceId = data.deviceId;
    this.deviceCreateData.deviceType = data.dtype;
    this.deviceCreateData.mData = data.mData;

    data.cap.forEach((capability)=>{
      capability.userQty = 0;
      this.deviceCreateData.deviceCapabilies.push(capability);
    })

    this.utils.hideLoader();
    this.slideNext();
  }

  onGetDataFromDeviceError(err) {
    console.info(err);
    this.utils.hideLoader();
    this.utils.showTranslatedErrorByKey('DEVICES_CREATE__ERROR__NOT_CONNECTED_TO_DEVICE_TITLE');
  }

  // devices number inputs
  // save data to device
  saveToDeviceAndSlideNext(){
    let currIndex = this.slides.getActiveIndex();

    if (currIndex !== 2) {
      return;
    }

    this.utils.showLoader();

    this.saveDataToDeviceSub = this.devices.saveDataToDevice(this.deviceCreateData)
      .subscribe(
        this.onSaveDataToDeviceSuccess.bind(this),
        this.onSaveDataToDeviceError.bind(this),
      );
  }

  onSaveDataToDeviceSuccess() {
    this.slideNext();
    this.utils.hideLoader();
  }

  onSaveDataToDeviceError(err) {
    console.info(err);
    this.utils.hideLoader();
    this.utils.showTranslatedErrorByKey('DEVICES_CREATE__ERROR__SAVING_DATA_TO_DEVICE_TITLE');
  }

  // save data to database
  saveDevicesAndSlideNext(){
    let currIndex = this.slides.getActiveIndex();

    if (currIndex !== 3) {
      return;
    }

    this.utils.showLoader();

    this.createManySub = this.devices.createMany(this.getDevicesData(), this.places.getCurrent().id)
      .subscribe(
        this.onCreateManySuccess.bind(this),
        this.onCreateManyError.bind(this),
      );
  }

  onCreateManySuccess() {
    this.utils.hideLoader();
    this.slideNext();
  }

  onCreateManyError(err) {
    console.info(err);
    this.utils.hideLoader();
    this.utils.showTranslatedErrorByKey('DEVICES_CREATE__ERROR__SAVING_DEVICES_TITLE');
  }

  getDevicesData() {
    const nodeId = this.deviceCreateData.deviceId;
    const mData = this.deviceCreateData.mData;

    return this.deviceCreateData.deviceCapabilies
      .map(capability => {
        const devices = [];

        for (var i = 0; i < capability.userQty; ++i) {
          devices.push({
            addr: i,
            mData,
            title: "New " + capability.cname + " device, addr : " + i,
            nodeId,
            dtype: capability.cname,
          });
        }

        return devices;
      })
      .reduce((accum, devices) => {
        return accum.concat(devices);
      }, []);
  }

  slideNext(){
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.slides.lockSwipes(true);
  }

  slidePrev(){
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.slides.lockSwipes(true);
  }

  startOver(){
    this.navCtrl.push(DeviceCreatePage, null);
  }

  ngOnDestroy() {
    this.createManySub && this.createManySub.unsubscribe();
    this.getDataFromDeviceSub && this.getDataFromDeviceSub.unsubscribe();
    this.saveDataToDeviceSub && this.saveDataToDeviceSub.unsubscribe();
  }
}
