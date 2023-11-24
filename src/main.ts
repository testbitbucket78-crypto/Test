/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { registerLicense } from '@syncfusion/ej2-base';

// validateLicense('Ngo9BigBOggjHTQxAR8/V1NHaF1cWWhIfEx0R3xbf1xzZFdMYV9bRH5PIiBoS35RdURiW31fdHZXR2RcU0R2');
registerLicense('Ngo9BigBOggjHTQxAR8/V1NHaF1cWWhIf0x0THxbf1xzZFRMZFpbQXVPIiBoS35RdURiW31fc3BTQ2NZVk1+');


if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
