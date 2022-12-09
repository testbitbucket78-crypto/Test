import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';

@Component({
  selector: 'sb-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
	 contacts:any;
constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
this.getContact();
}
	open(content:any) {
		this.modalService.open(content);
	}

opens(contents:any) {
		this.modalService.open(contents);
	}

	openadd(contactadd:any) {
		this.modalService.open(contactadd);
	}




		openconver(conver:any) {
		this.modalService.open(conver);
	}
      getContact() {
    this.apiService.Contact().subscribe(data => {this.contacts = data;
console.log(this.contacts);
    });
  }

}