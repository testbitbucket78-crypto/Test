import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sb-manageplan',
    templateUrl: './manageplan.component.html',
    styleUrls: ['./manageplan.component.scss'],
})
export class ManageplanComponent implements OnInit {

  modalReference: any;

  
    constructor(config: NgbModalConfig, private modalService: NgbModal) {}

    ngOnInit(): void {}

    AllChoices = [
      'Build Your Team',
      'Inbox, Contact',
      'Funnel up to 10 Message',
      '25000 Free Message',
      '15 Free Bot',
      'Subscribe up to 100K',
      'Broadcast Management',
      'APIs & Webhooks',
      'Integrations',
    ];
    selectPlans(selectplan: any) {
      if (this.modalReference) {
          this.modalReference.close();
      }
      this.modalReference = this.modalService.open(selectplan, {
          size: 'lg',
          windowClass: 'white-pink',
      });
  }


  }    

