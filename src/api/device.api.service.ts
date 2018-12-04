import { Injectable } from '@angular/core';
import { RequestApiService } from './request.api.service';
import { HttpClient } from '@angular/common/http';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Injectable()
export class DeviceApiService {

  constructor(
    private request: RequestApiService,
    private http: HttpClient,
  ) {}

  public createMany({devices, placeId}) {
    return this.request.runCloudFunction('device_createMany', {
      devices: devices,
      placeId: placeId,
    });
  }

  public getAllByPlaceId(placeId) {
    return this.request.runCloudFunction('device_getAllByPlaceId', {placeId});
  }

  public update(device) {
    return this.request.runCloudFunction('device_update', {
      id: device.id,
      title: device.title,
      roomId: device.roomId,
    });
  }

  public delete({id}) {
    return this.request.runCloudFunction('device_delete', {id});
  }

  public getDataFromDevice() {
    return this.http.get(`${this.getDeviceUrl()}/id`);
  }

  public saveDataToDevice(deviceCreateData) {
    const requestBody = {
      "ssid": deviceCreateData.ssid,
      "wifipass": deviceCreateData.password,
      "place": deviceCreateData.devicePlace || "none",
      "mqttsrv": deviceCreateData.brokerURL,
      "mqttprt": deviceCreateData.brokerPort,
      "htopic": deviceCreateData.topicBase,
      "huser": deviceCreateData.brokerUser,
      "hpass": deviceCreateData.brokerPwd,
    };

    const promise = this.save(requestBody)
      .then(res => {
        // if here than res.text() == "saved"
        // send reset to device to load with new params
        return this.reset();
      })
      .then( (res)=>{
        // if here - device will reser in 1 sec
        // return true to app after 1 sec
        return this.timeout(1000, true);
      });

    return fromPromise(promise);
  }

  private timeout(ms, res) {
    return new Promise(resolve => setTimeout(() => resolve(res), ms));
  }

  private save(requestBody) {
    const data = toQueryString(requestBody);

    const headers = {};
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    return this.http.post(`${this.getDeviceUrl()}/save`, data, {
      headers,
      responseType: 'text',
    })
    .toPromise();
  }

  private reset() {
    return this.http
      .get(`${this.getDeviceUrl()}/reset`, {responseType: 'text'})
      .toPromise();
  }

  private getDeviceUrl() {
    return this.request.getConfig().defaultDeviceURL;
  }

}

function toQueryString(obj) {
  return Object.keys(obj)
    .map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    })
    .join('&');
}
