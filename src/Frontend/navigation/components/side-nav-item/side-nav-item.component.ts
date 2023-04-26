import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SBRouteData, SideNavItem } from 'Frontend/navigation/models';

@Component({
    selector: 'sb-side-nav-item',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './side-nav-item.component.html',
    styleUrls: ['side-nav-item.component.scss'],
})
export class SideNavItemComponent implements OnInit {
    @Input() sideNavItem!: SideNavItem;
    @Input() expanded!: boolean;


    routeData!: SBRouteData;


    constructor() {}
    ngOnInit() {
     
    }
}
