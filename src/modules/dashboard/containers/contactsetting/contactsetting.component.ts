import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-contactsetting',
  templateUrl: './contactsetting.component.html',
  styleUrls: ['./contactsetting.component.scss']
})
export class ContactsettingComponent implements OnInit {
  active =1;
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

}
open(create:any) {
  this.modalService.open(create);
}
opens(add:any) {
  this.modalService.open(add);
}



}