import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
declare var $: any;

@Component({
	selector: 'sb-smartReplies',
	changeDetection: ChangeDetectionStrategy.Default,
	templateUrl: './smartReplies.component.html',
	styleUrls: ['./smartReplies.component.scss']
})
export class SmartRepliesComponent implements OnInit {

	data: any;
	items: any;

	mydate: any;
    replies: any;
	sidenavReplies: any;
	searchForm = new FormGroup({
		ID: new FormControl('')
	})

	

	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService) {
		config.backdrop = 'static';
		config.keyboard = false;
	}

	ngOnInit() {
		
			this.apiService.getSmartReply().subscribe((data) => {
				this.replies = data;
				console.log(this.replies)
			})

		
		
	}

	
	opensidenav(employee: any) {
		document.getElementById("sidebar")!.style.width = "494px";
	}
	closesidenav(items: any) {
		document.getElementById("sidebar")!.style.width = "0";
	}

	search() {
		console.log("this.searchForm.value.ID " + this.searchForm.value.ID)
		this.apiService.searchSmartReply(this.searchForm.value.ID).subscribe((data: any) => {
			this.replies = data
			console.log("data " + this.replies)
		})
	}

	
	getRepliesByID(data:any) {
	 	this.apiService.sideNav(data.ID).subscribe((responce => {
			this.data = responce;
			this.items = this.data[0]
    
		}))

	}



}
