import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Stepper from 'bs-stepper';
declare var $: any;

@Component({
  selector: 'sb-compose',
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss']
})
export class ComposeComponent implements OnInit {
	active = 1;
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
sttapper3(){
	var stepper2=  new Stepper($('.bs-stepper')[0]);
	console.log(stepper2);
   stepper2.next();
}
	
	openreview(review:any) {
		this.modalService.open(review);
	}
 sttapper(){
 	var stepper=  new Stepper($('.bs-stepper')[0]);
	stepper.previous();
}

}