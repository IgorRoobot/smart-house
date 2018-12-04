import { Component, OnDestroy } from '@angular/core';
import { NavController, MenuController, NavParams } from 'ionic-angular';

import { ApiService } from '../../api/';
import { User } from '../../models/user-model';
import { UtilsService } from '../../services/utils.service';
import { SignupPage } from '../signup/signup';
import { PlacesPage } from '../places/places';


@Component({
  templateUrl: 'login.html'
})
export class LoginPage implements OnDestroy {

  user: User = {
    username: "",
    password: ""
  };

  loginSub;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    private utils: UtilsService,
    private api: ApiService,
  ) {
    if (navParams.get('username')) {
      this.user.username = navParams.get('username');
      this.user.password =  navParams.get('password');
    }

    this.menuCtrl.enable(false);
  }

  goToSignUp(){
    this.navCtrl.push(SignupPage)
  }

  login(){
    if(!this.user.username || !this.user.password){
      this.utils.showTranslatedErrorByKey('login_page.login_error');
      return;
    }

    this.utils.showLoader();

    this.loginSub = this.api.auth.login(this.user.username, this.user.password)
      .subscribe(
        this.onLoginSuccess.bind(this),
        this.onLoginError.bind(this),
      );
  }

  onLoginSuccess() {
    this.utils.hideLoader();
    this.navCtrl.setRoot(PlacesPage);
  }

  onLoginError(err) {
    console.log(err);
    this.utils.hideLoader();
    this.utils.showTranslatedError(err, {messageKey: 'login_page.login_error'});
  }

  ngOnDestroy() {
    this.loginSub && this.loginSub.unsubscribe();
  }

}
