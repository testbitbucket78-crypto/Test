import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-sidenavReply',
  templateUrl: './sidenavReply.component.html',
  styleUrls: ['./sidenavReply.component.scss']
})
export class SidenavReplyComponent implements OnInit {
  active = 1;
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

}

	


}