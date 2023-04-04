import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-scheduleView',
  templateUrl: './scheduleView.component.html',
  styleUrls: ['./scheduleView.component.scss']
})
export class ScheduleViewComponent implements OnInit {
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

}
	


}