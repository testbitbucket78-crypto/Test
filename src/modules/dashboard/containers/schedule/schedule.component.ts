import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';

@Component({
  selector: 'sb-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
		 Campaigns:any;
constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
this.getCampaign();

}
	openmenu(menu:any) {
		this.modalService.open(menu);
	}

  getCampaign() {
    this.apiService.RuningCampaign().subscribe(data => {this.Campaigns = data;
console.log(this.Campaigns);
    });
  }

}