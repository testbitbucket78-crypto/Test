import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from "@angular/forms";
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
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
  modalReference:any;
  visible:boolean = true;
  uid :any;
  currentPasswordType: boolean = true;
  newPasswordType: boolean = true;
  confirmPasswordType: boolean = true;
  selectedAmount!:number;
  selectedDiv!: number;
  enterAmountVal!: any;
  selectedTab: number = 0;
  teamName!:string;
  roleName!:string;
  isActive: number = 0; 
  profilePicData:any;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  
  errorMessage='';
	successMessage='';
	warningMessage='';

  changepassword = this.fB.group({
      uid:[0],
      oldPass:[''],
      newPass:[''],
      confirmPass:['']
  });
  


  constructor(config: NgbModalConfig, private modalService: NgbModal, private fB:FormBuilder,private apiService: ProfileService) { }

  ngOnInit(): void {
    this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
    this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
    this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
  

    let uid: string  = sessionStorage.getItem('loginDetails')?.toString() ?? '';
    let userid =JSON.parse(uid);
    this.uid = userid.uid;
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getTeamName();
    this.getRoleName();
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
        console.log('response:', response);
      },
      error => {
        console.error('error:', error);
      }
    );
}


  // change password api service

  saveNewPassword() {
    this.changepassword.controls.uid.setValue(this.uid);

    this.apiService.changePass(this.changepassword.value).subscribe(
      
    (response: any) => {
      if(response.status === 200) {
        this.showToaster('! Password changed successfully.','success');
      }
    },

    (error: any) => {
      if (error.status === 401) {
        this.showToaster('! Current Password does not match','error');
        
      } } ,

    )
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

    const profilePicData = {

      spId: this.spId,
      uid:this.uid,
      name:this.Name,
      filePath:this.croppedImage
    };
    this.apiService.saveUserProfilePic(profilePicData).subscribe(
  (response) => {
    $("#pictureCropModal").modal('hide');
    console.log('Image saved successfully', response);
   
  },
  (error) => {
   alert('Error saving image: ' + error.message);
  })

}

}
