import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Stepper from 'bs-stepper';
declare var $: any;

@Component({
  selector: 'sb-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
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

 sttapper(){
 	var stepper=  new Stepper($('.bs-stepper')[0]);
	stepper.previous();
}

}