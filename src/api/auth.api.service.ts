import { Injectable } from '@angular/core';
import { RequestApiService } from './request.api.service';

import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';

const INVALID_SESSION_TOKEN_CODE = 209;

@Injectable()
export class AuthApiService {

  onUnauthorizedRequest = new Subject();
  onLogout = new Subject();

  constructor(
    private request: RequestApiService,
  ) {
    this.request.onError.subscribe((err: any) => {
      if(err.code === INVALID_SESSION_TOKEN_CODE){
        this.onUnauthorizedRequest.next(err);
      }
    });
  }

  login(username, password) {
    const url = `/login?username=${username}&password=${password}`;

    return this.request.get(url)
      .do((userSession) => {
        this.request.setUserSession(userSession);
      });
  }

  getUserSession() {
    return this.request.getUserSession();
  }

  signup(user) {
    return this.request.post('/users', user, false)
      .flatMap(() => {
        return this.login(user.username, user.password);
      });
  }

  updateProfile(profile) {
    const userId = this.request.getUserSession().objectId;

    return this.request.put(`/users/${userId}`, profile)
      .map(res => {
        const change = {
          name: profile.name,
          email: profile.email,
          imgbase64: profile.imgbase64,
        };

        if (res.sessionToken) {
          (<any>change).sessionToken = res.sessionToken;
        }

        this.request.updateUserSession(change);
      });
  }

  isLoggedIn() {
    return !!this.request.getUserSession();
  }

  logout() {
    const observable = this.request.get('/logout');

    this.request.unsetUserSession();
    this.onLogout.next();

    return observable;
  }

}
