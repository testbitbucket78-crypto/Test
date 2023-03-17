import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
declare var $: any;

@Component({
	selector: 'sb-smartReplies',
	templateUrl: './smartReplies.component.html',
	styleUrls: ['./smartReplies.component.scss']
})
export class SmartRepliesComponent implements OnInit {

	replies: any;
	searchForm = new FormGroup({
		ID: new FormControl('')
	})
	sidenavReplies:any;
	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
	ngOnInit() {
		this.getReplies()
		
	}

	getReplies() {
		this.apiService.getUser().subscribe((data: any) => {
			this.replies = data;
			console.log(this.replies)
		})
	}

	search() {
		console.log("this.searchForm.value.ID " + this.searchForm.value.ID)
		this.apiService.searchSmartReply(this.searchForm.value.ID).subscribe((data: any) => {
			this.replies = data
			console.log("data " + this.replies)
		})
	}

	
   getID(data:any){
	  sessionStorage.setItem("ID",data)
      console.log("getID")
	  console.log(data)
   }
	
}
