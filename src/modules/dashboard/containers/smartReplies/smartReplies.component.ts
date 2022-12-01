import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Stepper from 'bs-stepper';
declare var $: any;

@Component({
  selector: 'sb-smartReplies',
  templateUrl: './smartReplies.component.html',
  styleUrls: ['./smartReplies.component.scss']
})
export class SmartRepliesComponent implements OnInit {
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
   new Stepper($('.bs-stepper')[0]);

}
	
 sttapper1(){
 	var stepper=  new Stepper($('.bs-stepper')[0]);

	stepper.next();
}
 sttapper2(){
 	var steppers=  new Stepper($('.bs-stepper')[0]);
 	console.log(steppers);
	steppers.next();
}
	openinstruction(instruction:any) {
		this.modalService.open(instruction);
	}
 sttapper(){
 	var stepper=  new Stepper($('.bs-stepper')[0]);
	stepper.previous();
}

}