import { Component } from '@angular/core';
import 'rxjs/add/operator/map';

import { NavController } from 'ionic-angular';

import { FormBuilder, Validators } from '@angular/forms';

import { ApiService } from '../../api/';
import { UtilsService } from '../../services/utils.service';
import { PlacesPage } from '../places/places';

const USERNAME_TAKEN_ERROR_CODE = 202;
const EMAIL_TAKEN_ERROR_CODE = 203;

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {

  signupSub;
  form;

  constructor(
    public navCtrl: NavController,
    private utils: UtilsService,
    private api: ApiService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      username: ["", [Validators.required]],
      email: ["", [Validators.required]],
      password: ["", [Validators.required]],
      confirmPassword: ["", [Validators.required]],
    });
  }

  // FUNCTION: Go back to login page
  goToLogin(){
    this.navCtrl.pop();
  }

  signup() {
    if (this.form.invalid) {
      this.utils.markFormAsTouched(this.form);
      this.utils.showTranslatedErrorByKey('general.invalid_form');
      return;
    }

    const value = this.form.value;

    if (value.password !== value.confirmPassword) {
      this.utils.showTranslatedErrorByKey('SIGNUP_PWCHECK_MESSAGE');
      return;
    }

    this.utils.showLoader();

    delete value.confirmPassword;

    this.signupSub = this.api.auth.signup(value)
      .subscribe(
        this.onSignupSuccess.bind(this),
        this.onSignupError.bind(this),
      );
  }

  onSignupSuccess() {
    this.navCtrl.setRoot(PlacesPage);
    this.utils.hideLoader();
  }

  onSignupError(err) {
    console.log(err);
    this.utils.hideLoader();

    if (err.code === USERNAME_TAKEN_ERROR_CODE) {
      this.utils.showTranslatedErrorByKey('general.username_taken');
      return;
    }

    if (err.code === EMAIL_TAKEN_ERROR_CODE) {
      this.utils.showTranslatedErrorByKey('general.email_taken');
      return;
    }

    this.utils.showTranslatedError(err, {messageKey: 'general.request_error'});
  }

}
