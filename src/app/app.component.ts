import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TranslateService } from '@ngx-translate/core';

import * as appconfig from '../appconfig'
import { UtilsService } from '../services/utils.service';
import { PlacesService } from '../services/places.service';
import { ApiService } from '../api/';
// import { EntryPage } from '../pages/entry/entry';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { PlacesPage } from '../pages/places/places'
// import { RoomsPage } from '../pages/rooms/rooms';
import { DeviceCreatePage } from '../pages/devices/device-create';
import { GroupsPage } from '../pages/groups/groups';
import { TabsPage } from '../pages/tabs/tabs';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  url: string;
  rootPage: any;

  pages: Array<{icon: string, title: string, component: any, isRoot: boolean}>;

  constructor(public platform: Platform,
              translate: TranslateService,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              private api: ApiService,
              private utils: UtilsService,
              private places: PlacesService) {
    // Set the default language for translation strings, and the current language.
    var userLang = navigator.language.split('-')[0];
    userLang = /(de|en)/gi.test(userLang) ? userLang : 'en';
    translate.setDefaultLang('en');
    translate.use(userLang);

    translate.get('LOADING').subscribe((value) => {

      this.pages = [
        { icon: "person", title: translate.instant('PROFILE_TITLE'), component: ProfilePage, isRoot: false },
        { icon: "home", title: translate.instant('places.title'), component: PlacesPage, isRoot: true},
        { icon: "person", title: translate.instant('rooms.title'), component: TabsPage, isRoot: true },
        { icon: "person", title: translate.instant('devices.create_new'), component: DeviceCreatePage, isRoot: false },
        { icon: "person", title: translate.instant('groups.title'), component: GroupsPage, isRoot: true }
      ];

    });

    api.initialize(appconfig.data)
      .then(() => {
        return api.auth.isLoggedIn();
      })
      .then(isLoggedIn => {
        console.log('isLoggedIn:', isLoggedIn);
        console.log(isLoggedIn);
        return this.setRootPage(isLoggedIn);
      })
      .catch(err => {
        this.utils.showTranslatedError(err,  {messageKey: 'app.initialization_error'});
        console.log(err);
      });

    api.auth.onUnauthorizedRequest
      .subscribe((err) => {
        console.log(err);
        console.log('Unauthorized request was made, redirecting to Login Page...')
        this.api.auth.logout();
        this.nav.setRoot(LoginPage);
      });

    this.initializeApp();
  }

  setRootPage(isLoggedIn) {
    if (!isLoggedIn) {
      this.nav.setRoot(LoginPage);
      return;
    }

    this.places.initialize()
      .then(() => {
        return this.places.getCurrent();
      })
      .then((currentPlace) => {
        if (currentPlace) {
          this.nav.setRoot(TabsPage);
        } else {
          this.nav.setRoot(PlacesPage);
        }
      })
      .catch(err => {
        this.utils.showTranslatedError(err,  {messageKey: 'app.initialization_error'});
        console.log(err);
      });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.isRoot) {
      this.nav.setRoot(page.component);
    } else {
      this.nav.push(page.component);
    }

  }

  // don't listen to logout errors
  logout() {
    this.api.auth.logout();
    this.nav.setRoot(LoginPage);
  }

}
