import { ChangeDetectionStrategy, Input, Component, OnInit,HostListener} from '@angular/core';
import { NavigationService } from 'Frontend/navigation/services';
import { AuthService } from 'Frontend/auth/services';
import { Router } from '@angular/router';



@HostListener('window:scroll', ['$event'])


@Component({
    selector: 'sb-top-nav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './top-nav.component.html',
    styleUrls: ['top-nav.component.scss'],
})
export class TopNavComponent implements OnInit {
    @Input() title: string = '';
    showNav: boolean = true;
    
    onWindowScroll(event:any) {
        const scrollTop = event.target.documentElement.scrollTop;
        this.showNav = scrollTop < 50;
    }

    ShowNotification: boolean =false;
    ShowProfile: boolean =false;
    Name:any;
    EmailId:any;
    PhoneNumber:any;

    constructor(private navigationService: NavigationService, private authservice:AuthService, private router:Router) {}

    ngOnInit() {

        this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
        this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
        this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;

    }

    // toggleSideNav() {
    //     this.navigationService.toggleSideNav();
    // }


    toggleShowNotifications() {
		
		this.ShowNotification = !this.ShowNotification;
	}
   

    
    toggleShowProfile() {
		
		this.ShowProfile = !this.ShowProfile;
	}

    logout(): void {
        
        this.authservice.logout();
        console.log('logout');
        this.router.navigate(['/login']);
      }
    }
 

