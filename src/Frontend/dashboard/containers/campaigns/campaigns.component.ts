import { Component,AfterViewInit, OnInit,ViewChild, ElementRef,HostListener  } from '@angular/core';

import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import {DashboardService} from './../../services';

@Component({
  selector: 'sb-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss']
})
export class CampaignsComponent implements OnInit {
	@ViewChild('filterby') filterby: ElementRef |undefined; 

	 allCampaigns:any=[{title:'abc'}]
	 modalReference: any;
	 RuningCampaigns:any;
	 confirmMessage:any;
	 step2Option:any='';
	 showCampaignDetail:any=false;
	 showFilterByOption:any=false;
	 
	 showAdvance:any=false;
	 ShowChannelOption:any=false;
	 activeStep:any=1;
	 campaignDetail: any;
	 importantContact:any=false;
	 dragAreaClass: string='';
	 slectedItem:any;
	 filterForm:any;
	 applyListModal:any;
	 applylistFiltersWidth:any='900px';
	 newListName:any=false;
	 importedContacts:any=false;
	 MapOptionFor:any=false;
	 
	 showEditTemplateMedia:any=false;
	 scheduled:any=false;
	 
	 showScheduleDateOption:any=false;
	 ScheduleDateList:any=['15 Dec 2022','16 Dec 2022','17 Dec 2022','18 Dec 2022'];
	 selecteScheduleDate:any='15 Dec 2022';
	 showScheduleTimeOption:any=false;
	 ScheduleTimeList:any=['12:00 Am','12:15 Am','12:30 Am','12:30 Am'];
	 selecteScheduleTime:any='12:00 Am';

	 showTimeZoneOption:any=false;
	 
	 selecteTimeZone:any='GMT +5:30';
	 timeZonesList:any=['GMT +5:30','GMT +5:30','GMT +5:30']

	 mapNameOption:any=['First Name','Last Name', 'Username','Email'];
	 attributesoption:any=['{{IP_address}}','{{user_name}}','{{Help}}','{{Support}}','{{email id}}','{{IP_address}}','{{New-Order}}','{{Product YN}}','{{mail_address}}']
	 
	 
constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService,private fb: FormBuilder) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
		this.campaignDetail= fb.group({
			Name: new FormControl('', Validators.required),
			Channel: new FormControl('', Validators.required),
			
		});

		this.filterForm = this.fb.group({  
			filters: this.fb.array([]) ,  
		  });  

	}

	filters() : FormArray {  
		return this.filterForm.get("filters") as FormArray  
	  }  

	newFilter(): FormGroup {  
		return this.fb.group({  
		  operator: '',  
		  by: '',  
		  value: '',  
		})  
	  }  
		 
	  addFilter() {  
		this.filters().push(this.newFilter());  
	  }  
		 
	  removeFilter(i:number) {  
		this.filters().removeAt(i);  
	  }  

	  toggleFilterByOption(){
		this.showFilterByOption=!this.showFilterByOption
	  }

	  selectScheduled(schedule:any){
		this.scheduled=schedule
	  }

	  toggleTimeZone(){
		this.showTimeZoneOption=!this.showTimeZoneOption
	  }

	  selectTimeZone(timeZone:any){
			this.selecteTimeZone =timeZone
			this.showTimeZoneOption=false
	  }

	  toggleScheduleDate(){
		this.showScheduleDateOption =!this.showScheduleDateOption
	  }
	  selectScheduleDate(ScheduleDate:any){
		this.selecteScheduleDate= ScheduleDate
		this.showScheduleDateOption=false
	  }

	  toggleScheduleTime(){
		this.showScheduleTimeOption =!this.showScheduleTimeOption
	  }
	  selectScheduleTime(ScheduleTime:any){
		this.selecteScheduleTime= ScheduleTime
		this.showScheduleTimeOption=false
	  }

    ngOnInit() {
    
	}

	counter(i: number) {
		return new Array(i);
	}
	selectItem(itemId:any){
		this.slectedItem =this.slectedItem !=itemId?itemId:null
	}
	open(content:any) {
		this.modalService.open(content);
	}
	toggleChannelOption(){
		this.ShowChannelOption=!this.ShowChannelOption;
	}
	toggleshowAdvance(){
		this.showAdvance =!this.showAdvance;
    }
	selectChannel(channel:any){
		this.campaignDetail.get('Channel').setValue(channel);
		this.ShowChannelOption=false
	}

	toggleCampaign(){
		this.showCampaignDetail =!this.showCampaignDetail 
	}
	selectStep2Option(option:any,modalname:any,step2Option:any){
		this.step2Option =option
		if(step2Option ==option && this.step2Option ==='ImportContacts'){
			this.openImportantContact(modalname)
		}
		if(step2Option ==option && this.step2Option ==='AddSegmentAudience'){
			this.openSegmentAudience(modalname)
		}
		
	}
	openAddNew(addNewCampaign:any){
		   if(this.modalReference){
			this.modalReference.close();
			}
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}
	TestCampaign(TestCampaignModal:any){
		if(this.modalReference){
			this.modalReference.close();
		}
		this.modalReference = this.modalService.open(TestCampaignModal,{size: 'sm', windowClass:'pink-bg-sm'});
	
	}
	
	
	openSegmentAudience(importantContact:any){
		    this.modalReference = this.modalService.open(importantContact,{size: 'xl', windowClass:'white-bg'});
	}
	openAddNewItem(addNewItem:any){
		this.newFilter()
	    this.modalReference = this.modalService.open(addNewItem,{size: 'xl', windowClass:'white-bg'});
	}
	openImportantContact(mpcampaign:any){
		this.importantContact=true;
		mpcampaign('close modal');
	}
	selectAttribute(closeModal:any){
		closeModal('close modal')
	}
	toggleapplyList(applyList:any,closeModal:any){
		closeModal('close modal')
		this.applyListModal =applyList;
	    this.modalReference = this.modalService.open(applyList,{size: 'xl', windowClass:'white-bg'});
		
	}
	saveList(saveListModal:any){
		this.modalReference = this.modalService.open(saveListModal,{size: 'sm', windowClass:'white-bg'});
	}
	SaveListName(addNewCampaign:any){
		if(this.modalReference){
			this.modalReference.close();
		}
		this.newListName='615 unique contacts selected';
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	
	}
	ImportMapping(closeModal:any){
		closeModal('close modal')
		this.importedContacts='615 unique contacts selected';
	}
	closeImportantContact(){
		this.importantContact=false;
	}
	editTemplateMedia(){
		this.showEditTemplateMedia=!this.showEditTemplateMedia;
	}

	deleteCampaign(openalertmessage:any){
		this.confirmMessage= 'Do you really want to delete this campaign'
		this.modalReference = this.modalService.open(openalertmessage,{ size:'sm', windowClass:'white-bg'});
	}

	prevStep(){
		if(this.activeStep >1){
			this.activeStep = this.activeStep-1
			}else{
				alert('Its firest step...')
			}
	}
	nextStep(){
		if(this.activeStep ==3){
			this.activeStep=3.1
		}else if(this.activeStep ==3.1){
			this.activeStep=3.2
		}else if(this.activeStep ==3.2){
			this.activeStep=4
		}else{
		if(this.activeStep < 4){
		this.activeStep = this.activeStep+1
		}else{
			alert('Its final step...')
		}
	    }
	}
	setStep(newStep:any){
		this.activeStep = newStep
	}
	filterCampaign(filtercampaign: any) {
		if(this.modalReference){
		this.modalReference.close();
		}
		this.modalReference = this.modalService.open(filtercampaign,{size: 'sm', windowClass:'white-pink'});
	}
	mapImportantContact(mpcampaign:any){
		this.importantContact=false;
		this.modalReference = this.modalService.open(mpcampaign,{size: 'ml', windowClass:'pink-bg'});
	}


   opens(contents:any) {
		this.modalService.open(contents);
	}
	openMapOption(MapOptionFor:any){
		this.MapOptionFor =MapOptionFor
	}
	openVariableOption(contents:any) {
		this.modalReference = this.modalService.open(contents,{size: 'ml', windowClass:'pink-bg'});
	
	}


	openadd(contactadd:any) {
		this.modalService.open(contactadd);
	}
		opencampaignTime(campaignTime:any) {
		this.modalService.open(campaignTime);
	}

	openmenu(menu:any) {
		this.modalService.open(menu);
	}



    onFileChange(event: any) {
		let files: FileList = event.target.files;
		this.saveFiles(files);
	}

	saveFiles(files: FileList) {
	
		if (files.length > 1){
			console.log("Only one file at time allow");
		}
		else {
		  console.log(files[0].size,files[0].name,files[0].type);
		}
	  }

	@HostListener("dragover", ["$event"]) onDragOver(event: any) {
		this.dragAreaClass = "droparea";
		event.preventDefault();
	}
	  @HostListener("dragenter", ["$event"]) onDragEnter(event: any) {
		this.dragAreaClass = "droparea";
		event.preventDefault();
	  }
	  @HostListener("dragend", ["$event"]) onDragEnd(event: any) {
		this.dragAreaClass = "dragarea";
		event.preventDefault();
	  }
	  @HostListener("dragleave", ["$event"]) onDragLeave(event: any) {
		this.dragAreaClass = "dragarea";
		event.preventDefault();
	  }
	  @HostListener("drop", ["$event"]) onDrop(event: any) {
		this.dragAreaClass = "dragarea";
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer.files) {
		  let files: FileList = event.dataTransfer.files;
		  this.saveFiles(files);
		}
	  }

}