import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Stepper from 'bs-stepper';
declare var $: any;

@Component({
  selector: 'sb-addSmartReplies',
  templateUrl: './addSmartReplies.component.html',
  styleUrls: ['./addSmartReplies.component.scss']
})
export class AddSmartRepliesComponent implements OnInit {
	active = 1;
	stepper: any;
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
		this.stepper = new Stepper($('.bs-stepper')[0], {
	    linear: false,
	    animation: true
			   })

}

next() {
	    this.stepper.next();
	  }

	openinstruction(instruction:any) {
		this.modalService.open(instruction);
	}
	name:string = ""
	file:any;
	getFile(event: any){
		this.file = event.target.files[0];
		console.log('file', this.file);
	}

}