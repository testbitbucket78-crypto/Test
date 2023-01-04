import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';

@Component({
  selector: 'sb-automation',
  templateUrl: './automation.component.html',
  styleUrls: ['./automation.component.scss']
})
export class AutomationComponent implements OnInit {
	automations:any;
		 contacts:any;

constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
this.getAutomation();
this.getContact();

}
	addfunnel(){
		 (<HTMLInputElement>document.getElementById("funnel")).style.display = "block";  
	}
	add(){
		 (<HTMLInputElement>document.getElementById("funnel")).style.display = "none";  
	}

	opensubcribe(subcribe:any) {
		this.modalService.open(subcribe);
	}
		opencontact(contactd:any) {
		this.modalService.open(contactd);
	}

  getAutomation() {
    this.apiService.Automation().subscribe(data => {this.automations = data;
console.log(this.automations);
    });
  }
   getContact() {
    this.apiService.Contact().subscribe(data => {this.contacts = data;
console.log(this.contacts);
    });
  }

}