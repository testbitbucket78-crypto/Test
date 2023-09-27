/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
/ Modules /
import { AppCommonModule } from 'Frontend/app-common/app-common.module';
import { NavigationModule } from 'Frontend/navigation/navigation.module';
import { ChartsModule } from 'Frontend/charts/charts.module';
import { TablesModule } from 'Frontend/tables/tables.module';
import { OrderModule } from 'ngx-order-pipe';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AgGridModule } from 'ag-grid-angular';
import { ImageCropperModule } from 'ngx-image-cropper';





/ Components /
import * as dashboardComponents from './components';

/ Containers /
import * as dashboardContainers from './containers';

/ Guards /
import * as dashboardGuards from './guards';

/ Services /
import * as dashboardServices from './services';
import { SearchfilterPipe } from './containers/Search/searchfilter.pipe';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
import { DashboardComponent } from './containers';


@NgModule({
    imports: [
        CommonModule,
        NgMultiSelectDropDownModule.forRoot(),
        OrderModule,
        FilterPipeModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        ChartsModule,
        TablesModule,
        AgGridModule.withComponents([dashboardContainers.ContactsComponent]),
        NgMultiSelectDropDownModule.forRoot(),
        RichTextEditorModule,
        ImageCropperModule
    ],
    providers: [...dashboardServices.services,
                ...dashboardGuards.guards,DatePipe
        ],
    declarations:  [
         ...dashboardContainers.containers,
         ...dashboardComponents.components,
            DashboardComponent,
            SearchfilterPipe,

        ],
    exports: [...dashboardContainers.containers,
              ...dashboardComponents.components,
                 DashboardComponent
            ],
})
export class DashboardModule { }
