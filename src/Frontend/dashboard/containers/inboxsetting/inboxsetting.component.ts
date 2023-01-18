import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-inboxsetting',
  templateUrl: './inboxsetting.component.html',
  styleUrls: ['./inboxsetting.component.scss']
})
export class InboxsettingComponent implements OnInit {
  active = 1;
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

}
open(department:any) {
  this.modalService.open(department);
}

opens(user:any) {
  this.modalService.open(user);
}
	


}