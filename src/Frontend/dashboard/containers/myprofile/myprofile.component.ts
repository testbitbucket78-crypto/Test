import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from "@angular/forms";

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
  changetype:boolean = true;

  constructor(config: NgbModalConfig, private modalService: NgbModal, private formbuilder:FormBuilder) { }

  ngOnInit(): void {
    this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
    this.EmailId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
    this.PhoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
  }

  changePassword(changepassword: any) {
		if(this.modalReference){
		this.modalReference.close();
		}
		this.modalReference = this.modalService.open(changepassword);
	}

  viewpass() {
    
    this.visible = !this.visible;
    this.changetype = !this.changetype;

  }
}
