import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Storage } from '@ionic/storage';

import { _throw } from 'rxjs/observable/throw';
import { Subject } from 'rxjs/Subject';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { assign } from 'lodash';

@Injectable()
export class RequestApiService {

  config: any;
  userSession: any;
  BASEURL: string;

  onError = new Subject();

  constructor(
    private storage: Storage,
    private http: HttpClient,
  ) {}

  public initialize(config) {
    this.config = config;
    this.BASEURL = config.apiUrl + config.appName;

    return this.storage.get('userSession')
      .then(this.setUserSession.bind(this));
  }

  public getConfig() {
    return this.config;
  }

  public getUserSession() {
    return this.userSession;
  }

  public setUserSession(userSession) {
    this.userSession = userSession;
    this.storage.set('userSession', userSession);
  }

  public updateUserSession(userSession) {
    assign(this.userSession, userSession);
    this.storage.set('userSession', this.userSession);
  }

  public unsetUserSession() {
    this.userSession = null;
    this.storage.clear();
  }

  public get(url, isToAppendSessionToken = true) {
    return this.wrap(
      this.http.get(this.BASEURL + url, {
        headers: this.getHeaders(isToAppendSessionToken)
      })
    );
  }

  public post(url, body, isToAppendSessionToken = true) {
    return this.wrap(
      this.http.post(this.BASEURL + url, body, {
        headers: this.getHeaders(isToAppendSessionToken)
      })
    );
  }

  public put(url, body, isToAppendSessionToken = true) {
    return this.wrap(
      this.http.put(this.BASEURL + url, body, {
        headers: this.getHeaders(isToAppendSessionToken)
      })
    );
  }

  public runCloudFunction(fnName, params = {}) {
    return this.wrap(
      this.http.post(
        this.BASEURL + `/functions/${fnName}`,
        params,
        { headers: this.getHeaders() }
      )
    )
    .map(res => res.result);
  }

  private wrap(requestObservable){
    return requestObservable
      .catch((err: HttpErrorResponse) => {
        let resError;

        if (err.error instanceof ErrorEvent || err.error instanceof ProgressEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          resError = { code: 0, error: 'No internet connection' };
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          resError = err.error;
        }

        this.onError.next(resError);
        return _throw(resError);
      });
  }

  // session token is appended to each request except of login
  private getHeaders(isToAppendSessionToken = true) {
    const headers = {};

    headers['X-Parse-Application-Id'] = this.config.XParseApplicationId;
    headers['X-Parse-REST-API-Key'] = this.config.XParseRESTAPIKey;

    if (this.userSession && isToAppendSessionToken) {
      headers['X-Parse-Session-Token'] = this.userSession.sessionToken;
    }

    return headers;
  }

}
