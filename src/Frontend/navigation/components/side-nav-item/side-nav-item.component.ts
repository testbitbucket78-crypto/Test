import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SBRouteData, SideNavItem } from 'Frontend/navigation/models';
import { Router } from '@angular/router';

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


    constructor(private router: Router) {}

    isCurrentLink(link: string): boolean {
        return this.router.isActive(link, true);
      }
      
    ngOnInit() {
     
    }
}
