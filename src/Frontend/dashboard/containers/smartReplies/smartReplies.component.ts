import { Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { Router } from '@angular/router';
import { repliesList } from 'Frontend/dashboard/models/smartReplies.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
declare var $: any;

@Component({
	selector: 'sb-smartReplies',
	templateUrl: './smartReplies.component.html',
	styleUrls: ['./smartReplies.component.scss'],
	changeDetection:ChangeDetectionStrategy.Default
})

export class SmartRepliesComponent implements OnInit {


	//******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}


	isEdit: boolean = false;
	isShowSmartReplies: boolean = false;

	data: any;
	items: any;
    actions:any[]=[];
	keywords:any[]=[];
	active = 1;
	showTopNav: boolean = true;
	showSideBar = false;
	searchText ='';
	repliesData!:repliesList;
	replies:[] =[];

	constructor(config: NgbModalConfig, private modalService: NgbModal,public settingsService:SettingsService, private apiService: DashboardService, private router:Router) {
		config.backdrop = 'static';
		config.keyboard = false;
	}

	ngOnInit() {
		this.routerGuard();
		this.getReplies();
	}

	closeallmodal(){
		$("#smartrepliesModal").modal('hide');
	}

	getReplies() {
		var SP_ID=sessionStorage.getItem('SP_ID')
		this.apiService.getSmartReply(SP_ID).subscribe((data: any) => {
			this.replies = data;
		})
	}

	toggleSideBar() {
		this.showSideBar = !this.showSideBar
	}

	getRepliesByID(data:any) {
	    console.log("getRepliesByID")
		console.log(data)
		console.log(data.ID)
		this.apiService.sideNav(data.ID).subscribe((response => {
			this.data = response;
			this.repliesData = <repliesList> {} ;
			this.repliesData.Description = this.data[0].Description;
			this.repliesData.Title = this.data[0].Title;
			this.repliesData.ID = this.data[0].ID;
			this.repliesData.CreatedDate = this.data[0].CreatedDate;
			this.repliesData.ModifiedDate = this.data[0].ModifiedDate;
			this.repliesData.MatchingCriteria = this.data[0].MatchingCriteria; 
			this.repliesData.Keyword = [];
			this.repliesData.ActionList = [];
			this.repliesData.Media=this.data[0].Media;
			var keywordTemp = this.data[0].Keyword;
			for(let i=0;i<this.data.length;i++){
				if(!this.repliesData.Keyword.includes(this.data[i].Keyword)) 
					this.repliesData.Keyword.push(this.data[i].Keyword)

				   if(keywordTemp==this.data[i].Keyword) {
					this.repliesData.ActionList.push({Message:this.data[i].Message ,Name:this.data[i].Name, Value:this.data[i].Value,Media:this.data[i].Media})
				   }
			}
			
			console.log(this.repliesData);
			this.items = this.data[0]
            console.log(this.items)
			console.log(this.data)

		
		}))

	}

	parseTags(tagsString: string): string[] {
		let tagsArray: string[] = [];
		try {
		  tagsArray = JSON.parse(tagsString.replace(/'/g,'"'));
		} catch (error) {
		  console.error('Error parsing tags:', error);
		}
		
		return tagsArray;
	  }

	deleteRepliesById (data:any) {
		let deleteId = {ID:data[0].ID};
		this.apiService.deletesmartReply(deleteId).subscribe((response) => {
			    this.getReplies();
				this.toggleSideBar();
			}
			
		)};

		editSmartReply() {
		console.log(this.repliesData);
			this.isEdit = true;
			this.isShowSmartReplies = true;
			$("#smartrepliesModal").modal('show'); 
			this.showSideBar= false;
		
		}

	
 
	}

