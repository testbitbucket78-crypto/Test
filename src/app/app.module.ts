
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule, HttpClientModule, NgMultiSelectDropDownModule.forRoot()],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}