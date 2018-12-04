import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class UtilsService {

  loader = null;

  constructor(
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private loadingController: LoadingController,
  ) {}

  markFormAsTouched(form) {
    Object.keys(form.controls).forEach((key) => {
      form.controls[key].markAsTouched();
    });
  }

  showTranslatedError(err, keys = {}) {
    const title = this.translate.instant('alerts.error.title');
    const buttonText = this.translate.instant('alerts.error.button');

    let defaultKeys = {
      messageKey: 'general.request_error',
      noInternetKey: 'general.no_internet_error'
    }

    let actualKeys = Object.assign({}, defaultKeys, keys);

    const actualKeysMessage = err.code === 0 ? actualKeys.noInternetKey : actualKeys.messageKey;
    const message = this.translate.instant(actualKeysMessage);

    this.alertCtrl
      .create({ title, message, buttons: [{text: buttonText}]})
      .present();
  }

  showTranslatedErrorByKey(key) {
    return this.showTranslatedError({}, {messageKey: key});
  }

  showLoader() {
    this.loader = this.loadingController.create({
      content: this.translate.instant('general.loader_content')
    });

    this.loader.present();
  }

  hideLoader() {
    this.loader.dismiss();
  }

  showDeleteConfirm(onCancel, onConfirm) {
    this.alertCtrl.create({
      title : this.translate.instant('DELETE_ENTRY_TITLE'),
      message: this.translate.instant('DELETE_ENTRY_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('DELETE_ENTRY_NO'),
          handler: onCancel
        },
        {
          text: this.translate.instant('DELETE_ENTRY_YES'),
          handler: onConfirm
        }
      ]
    }).present();
  }

}
