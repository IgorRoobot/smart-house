import { Component  } from '@angular/core';

import { RoomsPage } from '../rooms/rooms';
import { DevicesPage } from '../devices/devices';
import { ScenesPage } from '../scenes/scenes'; 


@Component({
  template: `
  <ion-tabs selectedIndex="0">
    <ion-tab tabIcon="flame" tabTitle="{{ 'tabs.title.rooms' | translate}}" [root]="roomsPage"></ion-tab>
    <ion-tab tabIcon="leaf"  tabTitle="{{ 'tabs.title.devices' | translate}}" [root]="devicesPage"></ion-tab>
    <ion-tab tabIcon="water" tabTitle="{{ 'tabs.title.scenes' | translate}}" [root]="tab1"></ion-tab>
  </ion-tabs>`
})
export class TabsPage {
tab1: any;
devicesPage: any;
roomsPage: any;
  constructor() {
    this.tab1 = ScenesPage;
    this.devicesPage = DevicesPage;
    this.roomsPage = RoomsPage;
  }
}
