import { Component, OnInit,ChangeDetectorRef, OnDestroy  } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder,FormGroup,Validators } from "@angular/forms";
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { NotificationService } from 'Frontend/dashboard/services/notification.service';
import { addFundsData, profilePicData, teamboxNotifications } from 'Frontend/dashboard/models/profile.model';
import { isNullOrUndefined } from 'is-what';
import { interval } from 'rxjs';
declare var $:any;

@Component({
  selector: 'sb-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.scss']
})
export class MyprofileComponent implements OnInit,OnDestroy {
  uid :any;
  spId!:number;
  ID!:number;
  Name:any;
  EmailId:any;
  PhoneNumber:any;
  firstLetterFirstName!:string;
  firstLetterLastName!:string;
  notificationId!:number;
  PushNotificationValue=0;
  SoundNotificationValue= 0;
  modalReference:any;
  visible:boolean = true;
  currentPasswordType: boolean = true;
  newPasswordType: boolean = true;
  confirmPasswordType: boolean = true;
  changepassword:FormGroup;
  changePasswordValue:any;
  selectedAmount!:number;
  selectedDiv!: number;
  enterAmountVal!: any;
  availableAmount: number = 0;
  selectedTab: number = 0;
  teamName!: string;
  roleName!:string;
  isActive: number = 0; 
  profilePicData= <profilePicData> {};
  profilePicture:any;
  userid:number = 0;
  userList:any;
  currentUserDetails:any;
  fundsData = <addFundsData> {};
  teamboxNotificationStateData = <teamboxNotifications> {};
  imageChangedEvent: any = '';
  croppedImage: any = '';
  randomNumber:number = 0;
  errorMessage='';
	successMessage='';
	warningMessage='';
  NotificationDataInit:any;
  notificationData:any = [];
  notification:any;

  private notificationIntervalSubscription: any;

  NotificationData = [
    { id:1,
      title:"New Chat Notification",
      description:"When a new chat is available to be assigned"
    },
    { id:2,
      title:"New Chat Assigned to You",
      description:"When a new chat is assigned to you (Fresh conversation)"
    },
    { id:3,
      title:"New Message in Your Chat",
      description:"When you receive a new message in your current conversation"
    },
    { id:4,
      title:"New Chat Assigned to Team",
      description:"When a new chat is assigned to your team, any team member can choose to assign the chat to himself and start a conversation"
    }
  ];

  constructor(config: NgbModalConfig, private modalService: NgbModal,
    public settingsService:SettingsService, private fB:FormBuilder,private apiService: ProfileService,private _settingsService:SettingsService,private notificationService: NotificationService,private cdRef: ChangeDetectorRef) { 
    this.changepassword = this.fB.group({
      uid: this.uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid,
      oldPass:['', [Validators.required, Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=.*[$@$!%*?&]).{8,30}')]],
      newPass:['', [Validators.required, Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=.*[$@$!%*?&]).{8,30}')]],
      confirmPass: ['', [Validators.required, this.passwordMatchValidator.bind(this)]]

    });
  }

  ngOnInit(): void {
    this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
    this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
    this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
    this.uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
    const nameParts = this.Name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts[1] || '';
    
    this.firstLetterFirstName = firstName.charAt(0) || '';
    this.firstLetterLastName = lastName.charAt(0) || '';
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getTeamboxNotificaions();
    this.getTeamName();
    this.getRoleName();
    this.getUserList();
    this.getAvailableAmount();
    this.startNotificationInterval();

    this.profilePicture = this.apiService.getProfilePicture();

    this.apiService.profilePicture$.subscribe((pictureUrl) => {
      this.profilePicture = pictureUrl;
    });
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
    this.stopNotificationInterval();
}

  showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}else if(type=='error'){
			this.errorMessage=message;
		}else{
			this.warningMessage=message;
		}
		setTimeout(() => {
			this.hideToaster()
		}, 5000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.errorMessage='';
		this.warningMessage='';
	}

  selectTab(tabNumber: number) {
    this.selectedTab = tabNumber;
  }
  
  // toggle changepassword popup and eyeicon toggle logic

  changePasswordToggle(changepassword: any) {
		if(this.modalReference){
		this.modalReference.close();
		}
		this.modalReference = this.modalService.open(changepassword);
	}

  togglePasswordVisibility(field: string) {
    if (field === 'currentPassword') {
      this.currentPasswordType = !this.currentPasswordType;
    } else if (field === 'newPassword') {
      this.newPasswordType = !this.newPasswordType;
    } else if (field === 'confirmPassword') {
      this.confirmPasswordType = !this.confirmPasswordType;
    }
  }

  passwordMatchValidator() {
    const passwordControl = this.changepassword?.get('newPass');
    const confirmPasswordControl = this.changepassword?.get('confirmPass');

    if (passwordControl && confirmPasswordControl) {
        const password = passwordControl.value;
        const confirmPassword = confirmPasswordControl.value;

        if (password !== confirmPassword && password !== '') {
            return { 'mismatch': true };
        }
    }
    return null;
}

  // get teamname and rolename from api response

  getTeamName() {
    this.apiService.teamName(this.uid).subscribe((response) => {
      this.teamName = response.teamRes[0].team_name;  
      });
  }

  getRoleName() { 
    this.apiService.roleName(this.uid).subscribe((response) => {
     this.roleName = response.roleRes[0].RoleName;
    });
}

// save teambox notifications toggle on / off state


saveTeamboxNotificationsState(data:any) {
  this.apiService.saveTeamboxNotificationState(data).subscribe((response) => {
    if((response)) {
      this.getTeamboxNotificaions();
    }
  });
}

togglePushNotification(checked:boolean,notificationId: number,ID: number,idx:number) {
  if(isNullOrUndefined(ID && notificationId)) {
    this.ID = 0;
    notificationId = idx+1
  }
  else {
    this.ID = ID;
  }
  this.PushNotificationValue = checked ? 1 : 0;

  let PushNotificationData = {
    ID:this.ID,
    UID:this.uid,
    notificationId:notificationId,
    PushNotificationValue:this.PushNotificationValue,
    SoundNotificationValue:this.SoundNotificationValue
  }
  this.saveTeamboxNotificationsState(PushNotificationData);
}

toggleSoundNotification(checked:boolean,notificationId: number,ID: number,idx:number) {
  if(isNullOrUndefined(ID && notificationId)) {
    this.ID = 0;
    notificationId = idx+1
  }
  else {
    this.ID = ID;
  }
  this.SoundNotificationValue = checked ? 1 : 0;

  let SoundNotificationData = {
    ID:this.ID,
    UID:this.uid,
    notificationId:notificationId,
    PushNotificationValue:this.PushNotificationValue,
    SoundNotificationValue:this.SoundNotificationValue
  }
  this.saveTeamboxNotificationsState(SoundNotificationData);
  
}


// get teamboxNotificationState
getTeamboxNotificaions() { 
  this.apiService.getTeamboxNotificationsState(this.uid).subscribe((response) => {
    const notifyArray = response.notify;

    if (Array.isArray(notifyArray)) {

        this.NotificationDataInit = this.NotificationData.map((notifyData) => {
            const matchedData = notifyArray.find((item: any) => item.notificationId === notifyData.id);
            if (matchedData) {
                return { ...notifyData, ...matchedData };
            } else {
                return notifyData;
            }
        });
        console.log(this.NotificationDataInit);
    }
  });
}

// get current user active/inactive state 

getUserList() {
  this._settingsService.getUserList(this.spId).subscribe((result:any) =>{
    if(result) {
      this.userList =result?.getUser;     
        for (let i = 0; i<this.userList.length;i++) {
          if(this.userList[i].uid === this.uid) {
            this.currentUserDetails = this.userList[i];
            this.isActive = this.currentUserDetails.IsActive;
            this.randomNumber = Math.random();
            this.profilePicture = this.currentUserDetails.profile_img;
            this.apiService.setProfilePicture(this.profilePicture);
            let val:any = JSON.parse(sessionStorage.getItem('loginDetails')!);
            val.profile_img = this.profilePicture + '?' + this.randomNumber;
            sessionStorage.setItem('loginDetails',JSON.stringify(val));
          }
        }      
      }
  });
}


// toggle active/inactive state of logged in user

toggleActiveState(checked: boolean) {
  this.isActive = checked ? 1 : 0;

  const activeStateData = {
    uid: this.uid,
    isActive: this.isActive
  };

  this.apiService.userActiveState(activeStateData)
    .subscribe(
      response => {
        if(this.isActive ===1) {
          this.showToaster('User Active!', 'success'+ response);
        }
        else {
          this.showToaster('User Inactive!', 'success'+ response);
        }
        this.getUserList();
      },
      error => {
        console.error('error:', error);
      }
    );
}


  // change password api service

  saveNewPassword() {

    this.changePasswordValue = this.changepassword.value;
    if(this.changepassword.valid) {
      this.apiService.changePass(this.changePasswordValue).subscribe(
        
      (response: any) => {
        if(response.status === 200) {
          this.changepassword.reset();
          this.showToaster('! Password changed successfully.','success');
          $("#changePasswordModal").modal('hide');
        }
      },
  
      (error: any) => {
        if (error.status === 401) {
          this.showToaster('! Current Password does not match','error');
        } } ,
   
      )
    }
  
  }

  // add funds logic to fill pre defined amount in input field

  fillAmount(amount: number, divIndex: number) {
    if (this.enterAmountVal !== undefined) {
      this.enterAmountVal = undefined; 
    } else {
      this.selectedAmount = amount;
      this.selectedDiv = divIndex;
    }
  }
  

  openAddFundsPopup() {
    $("#AddFundsModal").modal('show');
    // this.selectedAmount === null;
   
  }

  openAddFundsSuccessPopup(addFundsSuccess: any){
    if(this.selectedAmount) {
      this.modalService.open(addFundsSuccess);
      $("#AddFundsModal").modal('hide');
    }

}

closeModal() {
  this.modalService.dismissAll();
}

//  image cropping function for popup

 fileChangeEvent(event: any): void {
  $("#pictureCropModal").modal('show');
    this.imageChangedEvent = event;
  }
   imageCropped(event: ImageCroppedEvent) {
    const newImageUrl = event.base64 + '?timestamp=' + new Date().getTime();
    this.croppedImage = newImageUrl;
    
    // Trigger change detection
    this.cdRef.detectChanges();
 }

 

//API call to save the cropped image

  saveCroppedProfilePicture() {
      this.profilePicData.spid = this.spId,
      this.profilePicData.uid = this.uid,
      this.profilePicData.name = this.Name,
      this.profilePicData.filePath = this.croppedImage
    
    this.apiService.saveUserProfilePic(this.profilePicData).subscribe(
  (response) => {

    this.showToaster('Image saved successfully','success' + response);
    $("#pictureCropModal").modal('hide');
    this.getUserList()

   
  },
  (error) => {
   this.showToaster('Error saving image ','error' + error.message);
  })

}

//post add funds data to api service

addFunds(addFundsSuccess: any) {

  if(this.selectedAmount < 500) {
    this.showToaster('Please enter minimum amount of 500 or above','');
    return;
  
  }

  else {
    this.fundsData.sp_id = this.spId;
    this.fundsData.amount = this.selectedAmount;
    this.fundsData.transation_type = 'Credited'
    this.fundsData.currency = 'INR' ;

    this.apiService.addFunds(this.fundsData).subscribe(response => {

      if(response.status === 200) {
        this.openAddFundsSuccessPopup(addFundsSuccess);
        this.getAvailableAmount();
        this.changepassword.clearValidators();
        this.changepassword.reset();
   
}},

      (error) => {
        
        if(error.status === 404) {
        this.showToaster('"Oops! Unable to add funds to your wallet. Please try again later or contact our support team for assistance.', 'error');
        }
     
    });
  }
 

  }

  getAvailableAmount() {
    
    this.apiService.showAvailableAmount(this.spId).subscribe(response => {
        let amountAvilable = response.AvailableAmout;
        this.availableAmount = amountAvilable.toFixed(2);
  });
}

// get teambox notification data
getNotificationData() {
  this.apiService.getNotifications(this.spId).subscribe((response=> {
    this.notificationData = response.notifications;
    this.notificationData.reverse();

      let latestNotification = this.notificationData[0]?.subject + this.extractMessage(this.notificationData[0]?.message);

       if (latestNotification !== this.notification) {
        this.notification = latestNotification;
        this.showBrowserNotification(this.notification);
      }

  }));
}

extractMessage(htmlString: string): string {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlString;
  
  return tempElement.textContent || tempElement.innerText || '';
}

// enable browser notifications
showBrowserNotification(message: string): void {
  this.notificationService.requestPermission().then(permission => {
    if (permission === 'granted') {
      this.notificationService.showNotification(message);
    } else {
      console.error('Notification permission denied.');
    }
  });
}

startNotificationInterval(): void {
  this.getNotificationData();

  this.notificationIntervalSubscription = interval(60000).subscribe(() => {
    this.getNotificationData();
  });
}

stopNotificationInterval(): void {
  if (this.notificationIntervalSubscription) {
    this.notificationIntervalSubscription.unsubscribe();
  }
}

}
