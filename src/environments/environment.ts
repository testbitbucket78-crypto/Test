// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    baseUrl: 'https://authapi.stacknize.com',
    // AdminbaseUrl: 'https://adminapi.stacknize.com',
    AdminbaseUrl: 'http://localhost:4000',
    botsAPI: 'https://bots.stacknize.com',
    settingAPI: 'https://settings.stacknize.com',
    notify: 'wss://notify.stacknize.com/',
    cipApi: 'https://cip-api.stacknize.com/',
    cipApi2: 'https://cip-api.stacknize.com',
    contactApi: 'https://contactapi.stacknize.com/',
    smartApi: 'https://smartapi.stacknize.com',
    waweb: 'https://waweb.stacknize.com',
    API_Keyword: 'stacknize',
    chhanel: 'api',
    env:'staging'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
