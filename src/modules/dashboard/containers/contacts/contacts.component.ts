import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

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



	openmenu(menu:any) {
		this.modalService.open(menu);
	}
		openconver(conver:any) {
		this.modalService.open(conver);
	}


}