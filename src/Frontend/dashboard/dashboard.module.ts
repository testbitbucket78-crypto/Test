/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule,DatePipe,NgOptimizedImage } from '@angular/common';
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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QRCodeModule } from 'angularx-qrcode';
import { ReadMoreComponent } from 'Frontend/utility/containers/read-more/read-more.component';




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
import { SanitizeHtmlPipe } from './containers/sanitizeHtml/sanitize-html.pipe';
import { ContactFilterComponent } from './containers/contact-filter/contact-filter.component';
import { MentionModule } from '@syncfusion/ej2-angular-dropdowns';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { TimepickerComponent } from './containers/common/timepicker/timepicker.component';


@NgModule({
    imports: [
        CommonModule,
        OrderModule,
        FilterPipeModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        ChartsModule,
        TablesModule,
        AgGridModule,
        NgMultiSelectDropDownModule.forRoot(),
        RichTextEditorModule,
        ImageCropperModule,
        DragDropModule,
        QRCodeModule,
        RichTextEditorAllModule,
        MentionModule
    ],
    providers: [...dashboardServices.services,
                ...dashboardGuards.guards,DatePipe,NgOptimizedImage
        ],
    declarations:  [
         ...dashboardContainers.containers,
         ...dashboardComponents.components,
            DashboardComponent,
            SearchfilterPipe,
            ReadMoreComponent,
            SanitizeHtmlPipe,
            ContactFilterComponent,
            TimepickerComponent

        ],
    exports: [...dashboardContainers.containers,
              ...dashboardComponents.components,
                 DashboardComponent
            ],
})
export class DashboardModule { }
