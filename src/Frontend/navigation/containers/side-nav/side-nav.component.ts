import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'Frontend/auth/services';
import { SideNavItems, SideNavSection } from 'Frontend/navigation/models';
import { NavigationService } from 'Frontend/navigation/services';
import { element } from 'protractor';
import { Subscription } from 'rxjs';

@Component({
    selector: 'sb-side-nav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './side-nav.component.html',
    styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy {
    @Input() sidenavStyle!: string;
    @Input() sideNavItems!: SideNavItems;
    @Input() sideNavSections!: SideNavSection[];

    subscription: Subscription = new Subscription();
    routeDataSubscription!: Subscription;

    showNavItem: boolean = true;

    constructor(public navigationService: NavigationService, public userService: UserService) {}

    ngOnInit() {
        // this.openHamburger();
    
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    // openHamburger(): void {
    //     const sideNavMenu = document.getElementById('sidenav-menu');
    //     const sideBarToggle = document.getElementById('sidebarToggle');
    //     const mainBody = document.getElementsByClassName('container-fluid')[0] as HTMLElement; // Get the first element
    
    //     if (sideNavMenu && sideBarToggle) {
    //         if (sideNavMenu.style.width === '100%') {
    //             sideNavMenu.style.width = '25%';
    //             sideNavMenu.style.border = '0';
    //             mainBody.style.marginLeft = '-10%';
    //             sideBarToggle.style.marginLeft = '-3px';
    //         } else {
    //             sideNavMenu.style.width = '100%';
    //             sideNavMenu.style.borderRight = '1px solid #EBEBEB';
    //             mainBody.style.marginLeft = '0';
    //             sideBarToggle.style.marginLeft = '-148px';
    //         }
    //     }
    // }

    toggleNavItem() {
        this.showNavItem = !this.showNavItem;
      }

   


}
