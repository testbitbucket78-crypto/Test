import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators } from "@angular/forms";
import { AuthService } from 'Frontend/auth/services';
import { Router } from '@angular/router';
import { error } from 'console';

@Component({
  selector: 'sb-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.scss']
})
export class MyprofileComponent implements OnInit {
  Name:any;
  EmailId:any;
  PhoneNumber:any;
  modalReference:any;
  visible:boolean = true;
  uid:any;
  currentPasswordType: boolean = true;
  newPasswordType: boolean = true;
  confirmPasswordType: boolean = true;

  changepassword = this.fB.group({
      uid:[0],
      oldPass:[''],
      newPass:[''],
      confirmPass:['']
  });


  constructor(config: NgbModalConfig, private modalService: NgbModal, private fB:FormBuilder,private apiService: AuthService,private router: Router) { }

  ngOnInit(): void {
    this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
    this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
    this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
  }

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

  getTeamName () {
    
  }

  saveNewPassword() {
    let uid: string  = sessionStorage.getItem('loginDetails')?.toString() ?? '';
    let userid =JSON.parse(uid);
    userid = userid.uid;

    this.changepassword.controls.uid.setValue(userid);

    this.apiService.changePass(this.changepassword.value).subscribe(
      
    (response: any) => {
      if(response.status === 200) {
        alert('Password changed successfully');
      this.router.navigate(['login']);
      }
    },

    (error: any) => {
      if (error.status === 401) {
          alert('Password Fields cannot be empty!');
      } } ,

    )
  }

}
