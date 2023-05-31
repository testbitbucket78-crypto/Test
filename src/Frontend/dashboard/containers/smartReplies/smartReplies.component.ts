import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { Router } from '@angular/router';
import { Cards } from './../../models';
import { Title } from '@angular/platform-browser';
declare var $: any;

@Component({
	selector: 'sb-smartReplies',
	
	templateUrl: './smartReplies.component.html',
	styleUrls: ['./smartReplies.component.scss']
})

export class SmartRepliesComponent implements OnInit {

	//******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}


	data: any;
	items: any;
    actions:any[]=[];
	keywords:any[]=[];
	mydate: any;
	active = 1;
	showTopNav: boolean = true;
	showSideBar = false;

	Cards: Cards[] = [
		new Cards(1107), new Cards(1108), new Cards(1109), new Cards(1110), new Cards(1111), new Cards(1112), new Cards(1113)
	]
	replies: any;
	searchForm = new FormGroup({
		ID: new FormControl('')
	})
	sidenavReplies: any;
	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService, private router:Router) {
		config.backdrop = 'static';
		config.keyboard = false;
	}

	ngOnInit() {
		this.routerGuard();
		this.getReplies();
		// this.showTopNav = true;


	}

	getReplies() {
		var SP_ID=sessionStorage.getItem('SP_ID')
		this.apiService.getSmartReply(SP_ID).subscribe((data: any) => {
			this.replies = data;

			console.log(this.replies)
		})
	}
	// opensidenav(employee: any) {
	// 	document.getElementById("sidebar")!.style.width = "400px";
	// }
	// closesidenav(items: any) {
	// 	document.getElementById("sidebar")!.style.width = "0";
	// }


	toggleSideBar() {
		this.showSideBar = !this.showSideBar
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
