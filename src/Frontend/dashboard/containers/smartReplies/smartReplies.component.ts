import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { Cards } from './Cards';
declare var $: any;

@Component({
	selector: 'sb-smartReplies',
	templateUrl: './smartReplies.component.html',
	styleUrls: ['./smartReplies.component.scss']
})
export class SmartRepliesComponent implements OnInit {

	data: any;
	items:any;
  
	mydate:any;
	active = 1;

	Cards: Cards[] = [
		new Cards(1107),new Cards(1108),new Cards(1109),new Cards(1110),new Cards(1111),new Cards(1112),new Cards(1113)
	]
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

		console.log(sessionStorage.getItem("ID"))
		//sessionStorage.removeItem("ID")
		this.getRepliesByID();
		
	}

	getReplies() {
		this.apiService.getUser().subscribe((data: any) => {
			this.replies = data;
			console.log(this.replies)
		})
	}
	opensidenav(employee: any){
		document.getElementById("sidebar")!.style.width = "300px";
	   }
	   closesidenav(items: any){
		document.getElementById ("sidebar")!.style.width = "0";
	   }

	search() {
		console.log("this.searchForm.value.ID " + this.searchForm.value.ID)
		this.apiService.searchSmartReply(this.searchForm.value.ID).subscribe((data: any) => {
			this.replies = data
			console.log("data " + this.replies)
		})
	}
	getRepliesByID() {
		var value=sessionStorage.getItem("ID")
		 this.apiService.sideNav(value).subscribe((responce => {
		   this.data = responce;
		   this.items=this.data[0]
		   
		   console.log(this.data)
		   
		   sessionStorage.removeItem("ID")
		 }))
		
	   }
	
//    getID(data:any){
// 	  sessionStorage.setItem("ID",data)
//       console.log("getID")
// 	  console.log(data)
//    }
	
}
