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
sttapper(){
	var stepper=  new Stepper($('.bs-stepper')[0]);
   stepper.previous();
   
}

 sttapper1(){
 	var stepper=  new Stepper($('.bs-stepper')[0]);
	 stepper.previous();
	stepper.next();
}
sttapper3(){
	var stepper=  new Stepper($('.bs-stepper')[1]);
	stepper.previous();
   stepper.next();
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