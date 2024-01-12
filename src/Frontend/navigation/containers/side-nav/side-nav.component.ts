import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'Frontend/auth/services';
import { SideNavItems, SideNavSection } from 'Frontend/navigation/models';
import { NavigationService } from 'Frontend/navigation/services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'sb-side-nav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './side-nav.component.html',
    styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
    @Input() sidenavStyle!: string;
    @Input() sideNavItems!: SideNavItems;
    @Input() sideNavSections!: SideNavSection[];

    subscription: Subscription = new Subscription();
    routeDataSubscription!: Subscription;

    showNavItem: boolean = true;
 

    constructor(public navigationService: NavigationService, public userService: UserService,private router:Router) {}

    ngOnInit() {  
       
    }
    
    toggleHamburger(): void {
        const sideNavMenu = document.getElementById('sidenav-menu');
        const sideBarToggle = document.getElementById('sidebarToggle');
        const sideBarBody = document.getElementById('sidenavAccordion');
        const layoutMainSide = document.getElementById('layoutSidenav_content');
        const mainBody = document.getElementsByClassName('container-fluid')[0] as HTMLElement;
    
        if (sideNavMenu && sideBarToggle && sideBarBody && layoutMainSide) {
            if (sideBarBody.style.width === '100%') {
                sideBarBody.style.width = '25%';
                mainBody.style.marginLeft = '-4%';
                layoutMainSide.style.paddingLeft= '155px';
                sideBarToggle.style.marginLeft = '-3px';
            } else {
                sideBarBody.style.width = '100%';
                sideNavMenu.style.borderRight = '1px solid #EBEBEB';
                mainBody.style.marginLeft = '0';
                layoutMainSide.style.paddingLeft= '225px';
                sideBarToggle.style.marginLeft = '-148px';
            }
        }
    }


}
