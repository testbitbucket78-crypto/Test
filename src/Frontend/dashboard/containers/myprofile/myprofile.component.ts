import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder,Validators } from "@angular/forms";
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
import { addFundsData, profilePicData, teamboxNotifications } from 'Frontend/dashboard/models/profile.model';
declare var $:any;

@Component({
  selector: 'sb-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.scss']
})
export class MyprofileComponent implements OnInit {
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
  uid :any;
  currentPasswordType: boolean = true;
  newPasswordType: boolean = true;
  confirmPasswordType: boolean = true;
  selectedAmount!:number;
  selectedDiv!: number;
  enterAmountVal!: any;
  availableAmount: number = 0;
  selectedTab: number = 0;
  teamName!: string;
  roleName!:string;
  isActive: number = 1; 
  profilePicData= <profilePicData> {};
  fundsData = <addFundsData> {};
  teamboxNotificationStateData = <teamboxNotifications> {};
  


  imageChangedEvent: any = '';
  croppedImage: any = '';
  
  errorMessage='';
	successMessage='';
	warningMessage='';

  changepassword = this.fB.group({
      uid:[0],
      oldPass:['', [Validators.required, Validators.minLength(8)]],
      newPass:['', [Validators.required, Validators.minLength(8)]],
      confirmPass:['', [Validators.required, Validators.minLength(8)]]
  });
  


  constructor(config: NgbModalConfig, private modalService: NgbModal, private fB:FormBuilder,private apiService: ProfileService) { }

  ngOnInit(): void {
    this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
    this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
    this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
    const nameParts = this.Name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts[1] || '';
    
    this.firstLetterFirstName = firstName.charAt(0) || '';
    this.firstLetterLastName = lastName.charAt(0) || '';

    let uid: string  = sessionStorage.getItem('loginDetails')?.toString() ?? '';
    let userid =JSON.parse(uid);
    this.uid = userid.uid;
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getTeamboxNotificaions();
    this.getTeamName();
    this.getRoleName();
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
   
  this.teamboxNotificationStateData.UID = this.uid;
  this.teamboxNotificationStateData.notificationId = this.notificationId;
  this.teamboxNotificationStateData.PushNotificationValue = this.pushNotificationValue[this.notificationId - 1] ? 1 : 0;
  this.teamboxNotificationStateData.SoundNotificationValue = this.soundNotificationValue[this.notificationId - 1] ? 1 : 0;

  this.apiService.saveTeamboxNotificationState(this.teamboxNotificationStateData).subscribe((response) => {
      console.log(response + JSON.stringify(this.teamboxNotificationStateData));
  });


}

updateNotificationId(notificationId: number) {
  this.notificationId = notificationId;
  this.saveTeamboxNotificationsState();
}


// get teamboxNotificationState
getTeamboxNotificaions() { 
  this.apiService.getTeamboxNotificationsState(this.uid).subscribe((response) => {
      console.log(response);
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

      },
      error => {
        console.error('error:', error);
      }
    );
}


  // change password api service

  saveNewPassword() {
    if(this.changepassword.valid) {
      this.changepassword.controls.uid.setValue(this.uid);

      this.apiService.changePass(this.changepassword.value).subscribe(
        
      (response: any) => {
        if(response.status === 200) {
          this.showToaster('! Password changed successfully.','success');
          this.modalReference.close();
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
      this.croppedImage = event.base64;
   
 }
 

//API call to save the cropped image

  saveCroppedProfilePicture() {
      this.profilePicData.spid = this.spId,
      this.profilePicData.uid = this.uid,
      this.profilePicData.name = this.Name,
      this.profilePicData.filePath = this.croppedImage
    
    this.apiService.saveUserProfilePic(this.profilePicData).subscribe(
  (response) => {
    $("#pictureCropModal").modal('hide');
    this.showToaster('Image saved successfully','success' + response);
   
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

    this.apiService.addFunds(this.fundsData,).subscribe(response => {
      // console.log(JSON.stringify(response)+' added');
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
