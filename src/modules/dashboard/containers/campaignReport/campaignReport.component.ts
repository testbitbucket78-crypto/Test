import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';

@Component({
  selector: 'sb-campaignReport',
  templateUrl: './campaignReport.component.html',
  styleUrls: ['./campaignReport.component.scss']
})
export class CampaignReportComponent implements OnInit {
	 Campaigns:any;
constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
this.getCampaign();

}
	   getCampaign() {
    this.apiService.RuningCampaign().subscribe(data => {this.Campaigns = data;
console.log(this.Campaigns);
    });
  }


}