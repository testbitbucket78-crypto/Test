/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { registerLicense } from '@syncfusion/ej2-base';

// validateLicense('ORg4AjUWIQA/Gnt2VlhiQlVPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSH9Rf0VgXX1ad3xVQmM=');
registerLicense('ORg4AjUWIQA/Gnt2VlhiQlVPd11dXmJWd1p/THNYflR1fV9DaUwxOX1dQl9gSH9Rf0VgXX1ad3xVQmM=');


if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
