/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AgGridModule } from 'ag-grid-angular';



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
import { ManageplanComponent } from './containers/manageplan/manageplan.component';

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
        NgxIntlTelInputModule,
        AgGridModule.withComponents([dashboardContainers.ContactsComponent]),
        NgMultiSelectDropDownModule.forRoot(),
        RichTextEditorModule
    ],
    providers: [...dashboardServices.services,
                ...dashboardGuards.guards
        ],
    declarations:  [
         ...dashboardContainers.containers,
         ...dashboardComponents.components,
            DashboardComponent,
            SearchfilterPipe,
            ManageplanComponent,
        ],
    exports: [...dashboardContainers.containers,
              ...dashboardComponents.components,
                 DashboardComponent
            ],
})
export class DashboardModule { }
