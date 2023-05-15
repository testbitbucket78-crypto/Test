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

    constructor(public navigationService: NavigationService, public userService: UserService) {}

    ngOnInit() {
        this.openHamburger();
    
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


   openHamburger(): void {
        const openHam = (document.getElementsByClassName('sidenav-item')) as unknown as HTMLElement[];
        const sideNavMenu = document.getElementById('sidenav-menu');
        const sideBarToggle = document.getElementById('sidebarToggle');
        const logo = (document.getElementsByClassName('navbar-brand')) as unknown as HTMLElement[];
        const mainBody = document.getElementsByClassName('container-fluid') as unknown as HTMLElement[];
        const caret = (document.getElementsByClassName('svg-inline--fa fa-angle-down fa-w-10')) as unknown as HTMLElement[];

    for (let i = 0; i < openHam.length; i++) {
        if(openHam[i] instanceof HTMLElement) {
            if (openHam[i].style.display == "block") {
                openHam[i].style.display = "none";
                caret[i].style.display = "none";
                sideNavMenu!.style.width = "25%";
                sideNavMenu!.style.border = "0";
                mainBody[i].style.marginLeft = "-10%";
                sideBarToggle!.style.marginLeft = "-10px";
                logo[i].style.borderRight = '0';
                
            }
            else {
                openHam[i].style.display = "block";
                caret[i].style.display = "block";
                sideNavMenu!.style.borderRight = "1px solid #EBEBEB";
                sideNavMenu!.style.width = "100%";
                mainBody[i].style.marginLeft = "0";
                sideBarToggle!.style.marginLeft = "-148px";
                
                logo[i].style.borderRight = '1px solid #EBEBEB';
            }
        }
      
    }
}

   


}
