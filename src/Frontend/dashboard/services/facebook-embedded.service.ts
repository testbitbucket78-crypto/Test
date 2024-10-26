// facebook.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare var FB: any;

@Injectable({
  providedIn: 'root'
})
export class FacebookService {
  private isSDKLoaded: boolean = false;

  constructor() {
    this.loadFacebookSDK();
  }

  // Load the Facebook SDK asynchronously
  loadFacebookSDK() {
    return new Promise<void>((resolve) => {
      if (this.isSDKLoaded) {
        resolve();
      }

      (window as any).fbAsyncInit = () => {
        FB.init({
          appId: '1147412316230943', // Replace with your app id
          cookie: true,
          xfbml: true,
          version: 'v2.4' // Replace with the latest version
        });
        this.isSDKLoaded = true;
        resolve();
      };

      // FB.login(fbLoginCallback, {
      //   config_id: '523980490418313', // configuration ID goes here
      //   response_type: 'code', // must be set to 'code' for System User access token
      //   override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
      //   extras: {
      //     setup: {},
      //     featureType: '',
      //     sessionInfoVersion: '2',
      //   }
      // });

      // Load the Facebook SDK
      const scriptElement = document.createElement('script');
      scriptElement.id = 'facebook-jssdk';
      scriptElement.src = 'https://connect.facebook.net/en_US/sdk.js';
      const firstScript = document.getElementsByTagName('script')[0];
      if (!document.getElementById('facebook-jssdk')) {
        firstScript.parentNode?.insertBefore(scriptElement, firstScript);
      } else {
        resolve(); // SDK already loaded
      }
    });
  }

  // Use the Promise to ensure SDK is loaded before any API calls
  getMyLastName(): Observable<any> {
    return new Observable(observer => {
      this.loadFacebookSDK().then(() => {
        FB.api('/me', { fields: 'last_name' }, (response: any) => {
          if (response && !response.error) {
            observer.next(response);
          } else {
            observer.error('Error occurred');
          }
          observer.complete();
        });
      }).catch((error) => {
        observer.error('Failed to load Facebook SDK');
        observer.complete();
      });
    });
  }
}
