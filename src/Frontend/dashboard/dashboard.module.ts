/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
/* Modules */
import { AppCommonModule } from 'Frontend/app-common/app-common.module';
import { NavigationModule } from 'Frontend/navigation/navigation.module';
import { ChartsModule } from 'Frontend/charts/charts.module';
import { TablesModule } from 'Frontend/tables/tables.module';
import { OrderModule } from 'ngx-order-pipe';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { JwPaginationModule } from 'jw-angular-pagination';




/* Components */
import * as dashboardComponents from './components';

/* Containers */
import * as dashboardContainers from './containers';

/* Guards */
import * as dashboardGuards from './guards';

/* Services */
import * as dashboardServices from './services';
import { SearchfilterPipe } from './containers/Search/searchfilter.pipe';


@NgModule({
    imports: [
        CommonModule,
        NgMultiSelectDropDownModule.forRoot(),
        OrderModule,
        JwPaginationModule,
        FilterPipeModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        ChartsModule,
        TablesModule,
        
    ],
    providers: [...dashboardServices.services, ...dashboardGuards.guards],
    declarations: [...dashboardContainers.containers, ...dashboardComponents.components, SearchfilterPipe],
    exports: [...dashboardContainers.containers, ...dashboardComponents.components],
})
export class DashboardModule {}
