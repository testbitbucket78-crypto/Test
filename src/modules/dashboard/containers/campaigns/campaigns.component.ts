import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';

@Component({
  selector: 'sb-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss']
})
export class CampaignsComponent implements OnInit {
	 RuningCampaigns:any;
constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
this.getRuningCampaign();
}
	open(content:any) {
		this.modalService.open(content);
	}

opens(contents:any) {
		this.modalService.open(contents);
	}

	openadd(contactadd:any) {
		this.modalService.open(contactadd);
	}
		opencampaignTime(campaignTime:any) {
		this.modalService.open(campaignTime);
	}

SummaryRunclose(){
			 (<HTMLInputElement>document.getElementById("SummaryRun")).style.display = "none";  

}
SummaryExecutedclose(){
		 (<HTMLInputElement>document.getElementById("SummaryExecuted")).style.display = "none";  
	}

	openmenu(menu:any) {
		this.modalService.open(menu);
	}

SummaryRun(){
		 (<HTMLInputElement>document.getElementById("SummaryRun")).style.display = "inline-flex";  
	}
	SummaryExecuted(){
		 (<HTMLInputElement>document.getElementById("SummaryExecuted")).style.display = "inline-flex";  
	}


        getRuningCampaign() {
    this.apiService.RuningCampaign().subscribe(data => {this.RuningCampaigns = data;
console.log(this.RuningCampaigns);
    });
  }

}