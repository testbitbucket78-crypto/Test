import { ChangeDetectionStrategy, Input, ElementRef, Component, OnInit,HostListener} from '@angular/core';
import { NavigationService } from 'Frontend/navigation/services';
import { AuthService } from 'Frontend/auth/services';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotificationService } from 'Frontend/dashboard/services/notification.service';

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
    userList:any;
    PhoneNumber:any;
    profilePicture:any;
    isActive: number = 0; 
    firstLetterFirstName!:string;
    firstLetterLastName!:string;
    notificationData = [];
    LastnotificationData = [];
    currentUserDetails:any;
    randomNumber:number=0;
    private notificationInterval: any;
    subscription:any;


    constructor(private navigationService: NavigationService, private authservice:AuthService, private router:Router,private apiService: 
        ProfileService,private elementRef: ElementRef,private _settingsService:SettingsService,private notificationService:NotificationService) {}

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
      let clickedInside = this.elementRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.hideDiv();
      }
    }
    ngOnInit() {
        this.spId = Number(sessionStorage.getItem('SP_ID'));
        this.uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid;
        this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
        this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
        this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
        // this.profilePicture = (JSON.parse(sessionStorage.getItem('loginDetails')!)).profile_img;

        this.profilePicture = this.apiService.getProfilePicture();

        this.apiService.profilePicture$.subscribe((pictureUrl) => {
          this.randomNumber = Math.random();
          this.profilePicture = pictureUrl;
        });
      

        const nameParts = this.Name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts[1] || '';
        
        this.firstLetterFirstName = firstName.charAt(0) || '';
        this.firstLetterLastName = lastName.charAt(0) || '';
        

        this.getNotificationData();
        this.getLocaleDetails();
        this.getFirstNotificationData();
        this.getUserList();
        // this.notificationInterval = setInterval(() => {
        //   this.notify();
        // }, 300000);
    }

    getNotificationData() {
      this.subscription = interval(60000) .pipe(switchMap(() =>this.apiService.getNotifications(this.spId))).
      subscribe((response=> {
        let data = response.notifications;
        this.notificationData = response.notifications;
        if(this.notificationData.length != this.LastnotificationData.length){
          console.log(data);
          console.log(data);
          this.notify(data[data.length-1]?.message);
        }
        this.LastnotificationData =  JSON.parse(JSON.stringify(this.notificationData));
        this.notificationData.reverse();
        console.log(this.notificationData)
      }));
      
    }
    getFirstNotificationData(){
      this.apiService.getNotifications(this.spId).subscribe((response=> {
        this.notificationData = response.notifications;       
        this.LastnotificationData =  JSON.parse(JSON.stringify(this.notificationData));
        this.notificationData.reverse();
      }));
    }

    notify(msg:any) {
      console.log('notification send');
      this.notificationService.showNotification('New message!', {
        body: msg,
        icon: '../../../../assets/img/main-logo.png'
      });
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


  getUserList() {
    this._settingsService.getUserList(this.spId).subscribe((result:any) =>{
      if(result) {
        this.userList =result?.getUser;     
          for (let i = 0; i<this.userList.length;i++) {
            if(this.userList[i].uid === this.uid) {
              this.currentUserDetails = this.userList[i];
              this.isActive = this.currentUserDetails.IsActive;
            }
          }      
        }
    });
  }

  
  getLocaleDetails(){
    this._settingsService.getLocaleData(this.spId)
    .subscribe(result =>{
      if(result){
        let localeData = result?.localDetails[0];
        console.log(localeData,'localeData');
        this._settingsService.dateFormat = localeData?.Date_Format;
        this._settingsService.timeFormat = localeData?.Time_Format;
        this._settingsService.timezone = localeData?.Time_Zone;
      }
    })
  }  

    // toggle active/inactive state of logged-in user

    toggleActiveState(checked: boolean) {
        this.isActive = checked ? 1 : 0;
    
        let  activeStateData = {
        uid: this.uid,
        isActive: this.isActive
        };
        this.apiService.userActiveState(activeStateData).subscribe(response => {
          if(response) {
            this.getUserList();
          }
        });
    }
  
    logout(): void {
        this.authservice.logout();
        this.router.navigate(['/login']);
      }

    }
 

