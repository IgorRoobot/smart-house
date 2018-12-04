import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { TranslateModule, TranslateLoader  } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';

import { MqttModule, MqttService } from 'ngx-mqtt';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Camera } from '@ionic-native/camera';
import { Crop } from '@ionic-native/crop';
import { Hotspot } from '@ionic-native/hotspot';

import { MyApp } from './app.component';
import { UtilsService } from '../services/utils.service';
import { PlacesService } from '../services/places.service';
import { RoomsService } from '../services/rooms.service';
import { DevicesService } from '../services/devices.service';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { ProfilePage } from '../pages/profile/profile';

import { EntryDetailPage } from '../pages/entry-detail/entry-detail';
import { EntryEditPage } from '../pages/entry-edit/entry-edit';
import { EntryPage } from '../pages/entry/entry';

import { PlacesPage } from '../pages/places/places'
import { PlaceDetailPage } from '../pages/places/place-detail';
import { PlaceEditPage } from '../pages/places/place-edit';

import { SharingPage } from '../pages/sharing/sharing';
import { ScanPage } from '../pages/sharing/scan';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { RoomsPage } from '../pages/rooms/rooms'
import { RoomDetailPage } from '../pages/rooms/room-detail';
import { RoomEditPage } from '../pages/rooms/room-edit';

import { DevicesPage } from '../pages/devices/devices'
import { DeviceDetailPage } from '../pages/devices/device-detail';
import { DeviceEditPage } from '../pages/devices/device-edit';
import { DeviceCreatePage } from '../pages/devices/device-create';

import { ScenesPage } from '../pages/scenes/scenes';
import { SceneEditPage } from '../pages/scenes/scene-edit';
import { SceneDetailPage } from '../pages/scenes/scene-detail';
import { AddDevicesPage } from '../pages/devices/group-add-device';

import { GroupsPage } from '../pages/groups/groups';
import { GroupEditPage } from '../pages/groups/group-edit';
import { GroupDetailPage } from '../pages/groups/group-detail';
import { AllGroupsPage } from '../pages/groups/all-groups';

import { TabsPage } from '../pages/tabs/tabs'

import { DynamicComponent } from '../pages/devices/types/dynamic-component';
import { DeviceDALIComponent } from '../pages/devices/types/dali-component';
import { DeviceTRIACComponent } from '../pages/devices/types/triac-component';
import { Device010VComponent } from '../pages/devices/types/010V-component';
import { DeviceDRIVERComponent } from '../pages/devices/types/driver-component';
import { DeviceSocketComponent } from '../pages/devices/types/socket-component';
import { DeviceWindowBlindsComponent } from '../pages/devices/types/window-blinds-component';
import { DeviceLedComponent } from '../pages/devices/types/led-component';
import { DeviceBuzzerComponent } from '../pages/devices/types/buzzer-component';

import { ApiModule } from '../api/';
import { ScenesService } from '../services/scenes.service';
import { GroupsService } from '../services/groups.service';

import { LongPressModule } from 'ionic-long-press';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const MQTT_SERVICE_OPTIONS = {
  connectOnCreate: false,
  //hostname: 'vmm1.saaintertrade.com',
  // port: 39001,
  path: ''
};

export function mqttServiceFactory() {
  return new MqttService(MQTT_SERVICE_OPTIONS);
}

// Declaration of the app pages
@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage,
    EntryPage,
    EntryDetailPage,
    EntryEditPage,
    ProfilePage,
    TabsPage,
    PlacesPage, PlaceDetailPage, PlaceEditPage,
    SharingPage, ScanPage,
    RoomsPage, RoomDetailPage, RoomEditPage,
    DevicesPage, DeviceDetailPage, DeviceEditPage, DeviceCreatePage, AddDevicesPage,
    ScenesPage, SceneEditPage, SceneDetailPage,
    GroupsPage, GroupEditPage, GroupDetailPage, AllGroupsPage,
    DynamicComponent,
    DeviceDALIComponent,
    DeviceTRIACComponent,
    Device010VComponent,
    DeviceDRIVERComponent,
    DeviceSocketComponent,
    DeviceWindowBlindsComponent,
    DeviceLedComponent,
    DeviceBuzzerComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: false
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot(),
    HttpClientModule,
    MqttModule.forRoot({
      provide: MqttService,
      useFactory: mqttServiceFactory
    }),
    ApiModule,
    LongPressModule,
    NgxQRCodeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    EntryPage,
    EntryDetailPage,
    EntryEditPage,
    ProfilePage,
    TabsPage,
    PlacesPage, PlaceDetailPage, PlaceEditPage,
    SharingPage, ScanPage,
    RoomsPage, RoomDetailPage, RoomEditPage,
    DevicesPage, DeviceDetailPage, DeviceEditPage, DeviceCreatePage,  AddDevicesPage,
    ScenesPage, SceneEditPage, SceneDetailPage,
    GroupsPage, GroupEditPage, GroupDetailPage, AllGroupsPage,
    DynamicComponent,
    DeviceDALIComponent,
    DeviceTRIACComponent,
    Device010VComponent,
    DeviceDRIVERComponent,
    DeviceSocketComponent,
    DeviceWindowBlindsComponent,
    DeviceLedComponent,
    DeviceBuzzerComponent,
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    StatusBar,
    SplashScreen,
    Crop,
    Camera,
    Hotspot,
    UtilsService,
    PlacesService,
    RoomsService,
    DevicesService,
    ScenesService,
    GroupsService,
    BarcodeScanner
  ]
})
export class AppModule { }
