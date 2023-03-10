import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';

import Stepper from 'bs-stepper';
declare var $: any;

@Component({
	selector: 'sb-addSmartReplies',
	templateUrl: './addSmartReplies.component.html',
	styleUrls: ['./addSmartReplies.component.scss']
})
export class AddSmartRepliesComponent implements OnInit {
	active = 1;
	stepper: any;
	data: any;
	val: any;
	selectedTeam: any;

    newSmartReply:any;
	newReply=new FormGroup({
		Title: new FormControl('',Validators.required),
		Description:new FormControl('',Validators.required)
	
	})
	model: any;
	
	
	constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService:DashboardService ) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}

	ngOnInit() {
		this.stepper = new Stepper($('.bs-stepper')[0], {
			linear: false,
			animation: true
		})
	
	}

	addqty(val: any) {
		this.data = val;
	}
    bold() {
		(<HTMLInputElement>document.getElementById("replyText")).style.fontWeight = "bold";
	}
	itelic() {
		(<HTMLInputElement>document.getElementById("replyText")).style.fontStyle = "italic";
	}
	next() {
		this.stepper.next();
	}
    previous() {
		this.stepper.previous();
	}
	openinstruction(instruction: any) {
		this.modalService.open(instruction);
	}

	file: any;
	getFile(event: any) {
		this.file = event.target.files[0];
		console.log('file', this.file);
	}
	onSelected(value: string) {
		this.selectedTeam = value;
	}
	getNewSmartReplyData(){
		
		if(this.newReply.valid){
			
			sessionStorage.setItem('Title' ,this.newReply.value.Title)
			sessionStorage.setItem('Description' ,this.newReply.value.Description)
           
		}
          
	}

	onSelectionChange(entry: any): void {
		this.model = entry;
		console.log(this.model)
		sessionStorage.setItem('MatchingCriteria',this.model)
	}

	sendNewSmartReply(){
		var data={
			Title:this.newReply.value.Title ,
			Description:this.newReply.value.Description,
			MatchingCriteria:this.model
		}
		console.log("data")
		console.log(data)
		this.apiService.addNewReply(data).subscribe((responce)=>{
            console.log(responce)
		})
	}
	

	 
}