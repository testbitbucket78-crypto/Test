import { ChangeDetectionStrategy, Input, ElementRef, Component, OnInit,HostListener} from '@angular/core';
import { NavigationService } from 'Frontend/navigation/services';
import { AuthService } from 'Frontend/auth/services';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
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
    uid :any;
    spId!:number;
    PhoneNumber:any;
    profilePicture:any;
    isActive: number = 1; 
    firstLetterFirstName!:string;
    firstLetterLastName!:string;
    notificationData = [];

    constructor(private navigationService: NavigationService, private authservice:AuthService, private router:Router,private apiService: ProfileService,private elementRef: ElementRef) {}

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
      let clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.hideDiv();
      }
    }
    ngOnInit() {
        
        let uid: string  = sessionStorage.getItem('loginDetails')?.toString() ?? '';
        let userid =JSON.parse(uid);
        this.uid = userid.uid;
        this.spId = Number(sessionStorage.getItem('SP_ID'));
        this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
        this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
        this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
        this.profilePicture = (JSON.parse(sessionStorage.getItem('loginDetails')!)).profile_img;

        const nameParts = this.Name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts[1] || '';
        
        this.firstLetterFirstName = firstName.charAt(0) || '';
        this.firstLetterLastName = lastName.charAt(0) || '';

        this.getNotificationData();
    }

    getNotificationData() {
      this.apiService.getNotifications(this.spId).subscribe((response=> {
          this.notificationData = response.notifications;
          this.notificationData.reverse();
      }));
    }

    toggleShowNotifications() {
		
		this.ShowNotification = !this.ShowNotification;
        this.ShowProfile =false;
	}
   

    hideDiv() {
       this.ShowNotification = false;
       this.ShowProfile = false;
    }
    
    toggleShowProfile() {
		
		this.ShowProfile = !this.ShowProfile;
        this.ShowNotification = false;
	}

    // toggle active/inactive state of logged-in user

    toggleActiveState(checked: boolean) {
        this.isActive = checked ? 1 : 0;
    
        const activeStateData = {
        uid: this.uid,
        IsActive: this.isActive
        };
    
        this.apiService.userActiveState(activeStateData)
        .subscribe(
            response => {
            console.log('success',response);
            },
            error => {
            console.log('error:', error);
            }
        );
    }
  

    logout(): void {
        
        this.authservice.logout();
        this.router.navigate(['/login']);
      }
    }
 

