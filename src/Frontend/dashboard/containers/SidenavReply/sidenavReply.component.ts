import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';

@Component({
  selector: 'sb-sidenavReply',
  templateUrl: './sidenavReply.component.html',
  styleUrls: ['./sidenavReply.component.scss']
})
export class SidenavReplyComponent implements OnInit {
  data: any;
  items:any;

  mydate:any;
  active = 1;
  constructor(config: NgbModalConfig, private modalService: NgbModal, private apiServices: DashboardService) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit() {
   console.log(sessionStorage.getItem("ID"))
   //sessionStorage.removeItem("ID")
   this.getRepliesByID();
  }

  getRepliesByID() {
   var value=sessionStorage.getItem("ID")
    this.apiServices.sideNav(value).subscribe((responce => {
      this.data = responce;
      this.items=this.data[0]
      
      console.log(this.data)
      
      sessionStorage.removeItem("ID")
    }))
   
  }
 
 


}