import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder,FormGroup,Validators } from "@angular/forms";
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { addFundsData, profilePicData, teamboxNotifications } from 'Frontend/dashboard/models/profile.model';
import { isNullOrUndefined } from 'is-what';
declare var $:any;

@Component({
  selector: 'sb-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.scss']
})
export class MyprofileComponent implements OnInit {
  uid :any;
  spId!:number;
  Name:any;
  EmailId:any;
  PhoneNumber:any;
  firstLetterFirstName!:string;
  firstLetterLastName!:string;
  notificationId!:number;
  pushNotificationValue= [0, 0, 0, 0];
  soundNotificationValue=[0, 0, 0 ,0];
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
  
  errorMessage='';
	successMessage='';
	warningMessage='';

  constructor(config: NgbModalConfig, private modalService: NgbModal, private fB:FormBuilder,private apiService: ProfileService,private _settingsService:SettingsService,private cdRef: ChangeDetectorRef) { 
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
    this.profilePicture = (JSON.parse(sessionStorage.getItem('loginDetails')!)).profile_img;
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
  
  }

  ngOnDestroy() {
    this.modalService.dismissAll();
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

saveTeamboxNotificationsState() {
  this.teamboxNotificationStateData.ID = 0
  this.teamboxNotificationStateData.UID = this.uid;
  this.teamboxNotificationStateData.notificationId = this.notificationId;
  this.teamboxNotificationStateData.PushNotificationValue = this.pushNotificationValue[this.notificationId - 1] ? 1 : 0;
  this.teamboxNotificationStateData.SoundNotificationValue = this.soundNotificationValue[this.notificationId - 1] ? 1 : 0;

  this.apiService.saveTeamboxNotificationState(this.teamboxNotificationStateData).subscribe((response) => {
    if(isNullOrUndefined(response)) {
      console.log(JSON.stringify(this.teamboxNotificationStateData));
    }
  });
}





updateNotificationId(notificationId: number) {
  this.notificationId = notificationId;
  console.log(this.notificationId)
  this.saveTeamboxNotificationsState();
}


// get teamboxNotificationState
getTeamboxNotificaions() { 
  this.apiService.getTeamboxNotificationsState(this.uid).subscribe((response) => {
      const notifyArray = response.notify;
      console.log(notifyArray)

    if(notifyArray.length > 0) {
      const lastIndex = notifyArray.length - 1;
      const data = notifyArray[lastIndex];
      
      this.pushNotificationValue = data.PushNotificationValue;
      this.soundNotificationValue = data.SoundNotificationValue;
      
      console.log(data);
      console.log(this.pushNotificationValue);
      console.log(this.soundNotificationValue);
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
    this.profilePicture;
   
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
        this.availableAmount = response.AvailableAmout;
        console.log(this.availableAmount);
  });
}

}
