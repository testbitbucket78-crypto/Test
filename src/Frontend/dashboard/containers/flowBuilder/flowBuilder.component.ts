import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-flowBuilder',
  templateUrl: './flowBuilder.component.html',
  styleUrls: ['./flowBuilder.component.scss']
})
export class FlowBuilderComponent implements OnInit {
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

}
	


}