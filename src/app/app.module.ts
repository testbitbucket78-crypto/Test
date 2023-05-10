
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardModule } from 'Frontend/dashboard/dashboard.module';
// import { DashboardComponent } from 'Frontend/dashboard/containers';


@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, FormsModule, ReactiveFormsModule,  AppRoutingModule, HttpClientModule, BrowserAnimationsModule, DashboardModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}