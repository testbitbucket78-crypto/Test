import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'sb-dashboard-head',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dashboard-head.component.html',
    styleUrls: ['dashboard-head.component.scss'],
})
export class DashboardHeadComponent implements OnInit {
   
    constructor() {}
    @Input() title: string = '';
    @Input() hideBreadcrumbs = false;
    ngOnInit():void {}
}


