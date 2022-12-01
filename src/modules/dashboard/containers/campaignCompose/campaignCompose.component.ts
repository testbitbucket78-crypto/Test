import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-campaignCompose',
  templateUrl: './campaignCompose.component.html',
  styleUrls: ['./campaignCompose.component.scss']
})
export class CampaignComposeComponent implements OnInit {
  
constructor(config: NgbModalConfig, private modalService: NgbModal) {
  // customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

}
	


}