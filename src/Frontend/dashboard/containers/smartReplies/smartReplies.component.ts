import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
  selector: 'sb-smartReplies',
  templateUrl: './smartReplies.component.html',
  styleUrls: ['./smartReplies.component.scss']
})
export class SmartRepliesComponent implements OnInit {
	navigationService: any;
	
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
		
	}
	ngOnInit() {}

	openNav() {
		document.getElementById("mySidepanel");
	  }
	  
	  closeNav() {
		document.getElementById("mySidepanel");
	  }

}
