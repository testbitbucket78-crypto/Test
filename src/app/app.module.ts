
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardModule } from 'Frontend/dashboard/dashboard.module';
import { JwtInterceptor } from 'Frontend/dashboard/Intercepttor/JwtInterceptor';


@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, FormsModule, ReactiveFormsModule,  AppRoutingModule, HttpClientModule, BrowserAnimationsModule, DashboardModule],
    providers: [       
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },],
    bootstrap: [AppComponent],
})
export class AppModule {}