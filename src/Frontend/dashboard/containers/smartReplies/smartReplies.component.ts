import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { Cards } from './../../models';
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
    actions:any[]=[];
	keywords:any[]=[];
	mydate: any;
	active = 1;

	Cards: Cards[] = [
		new Cards(1107), new Cards(1108), new Cards(1109), new Cards(1110), new Cards(1111), new Cards(1112), new Cards(1113)
	]
	replies: any;
	searchForm = new FormGroup({
		ID: new FormControl('')
	})
	sidenavReplies: any;
	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService) {
		config.backdrop = 'static';
		config.keyboard = false;
	}

	ngOnInit() {
		this.getReplies()

	}

	getReplies() {
		this.apiService.getSmartReply().subscribe((data: any) => {
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
	    console.log("getRepliesByID")
		console.log(data)
		console.log(data.ID)
		this.apiService.sideNav(data.ID).subscribe((responce => {
			this.data = responce;
			this.items = this.data[0]
            console.log(this.items)
			console.log(this.data)

		
		}))

	}



}
