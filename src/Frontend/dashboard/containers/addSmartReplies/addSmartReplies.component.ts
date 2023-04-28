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
	
	keywordtxt: any;
	selectedTeam: any;
	selectedTag:any;
	selectedValue: any;
	title = 'formValidation';
        submitted = false;
    newSmartReply:any;
	newReply=new FormGroup({
		Title: new FormControl('',Validators.required),
		Description:new FormControl('',Validators.required)
		
	
	})
	newReply1=new FormGroup({
		keywords: new FormControl('',([Validators.required, Validators.maxLength(50)])),
	})
	
	model: any;

	

	teams: string[] =
		[
			"James Whatson", "David Harrison", "Jane Cooper", "Charles John"
		];

	removeTag: string[] =
		[
			"Paid", "UnPaid", "Return", "New Customer", "Order Complete", "New Order", " Unavailable"
		];
	message = '';	
	messages:any [] = [];
	
	action = '';
	addedActions: any[] = [{ id: 1, value: '' },
		{ id: 2, Value: '' },
		{ id: 3, Value: '' }];

	selectedAction:any;	
	
	keyword: string = '';
	keywords: string[] = [];
	
	editedText:string ='';
	isEditable: boolean = false;
	addText:string ='';
	
	
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

	addKeyword() {
		if (this.keyword !== '') {
			this.keywords.push(this.keyword);
			this.keyword = '';
		}
		else {
			alert('Type any keyword first!')
		}
	}

	removeKeyword(keyword: string) {
		this.keywords = this.keywords.filter(k => k !== keyword);
	}


	addqty(val: any) {
		this.data = val;
		this.keywordtxt= val;

	}

	// onSubDropdownSelect(event: any, selectedvalue:number) {
	// 	this.selectedValue = event.target.innerText;
	// 	this.selectedAction = this.addedActions.find(this.action =>this.addedActions.id === selectedvalue )
		
		
	// }

	addedAction() {
		
		 	
			this.addedActions.push(this.action);
			this.action = '';
		
		

		
	}

	removeAction(index: number) {
		this.addedActions.splice(index, 1);
	}

	addMessage() {
			 if(this.message !== '') {
			this.messages.push(this.message);
			this.message = '';
		}
		else {
			alert('Type any message first!')
		}
	}
	removeMessage(index:number) {
		this.messages.splice(index, 1);
	}



	toggleEditable(index: number) {
		this.isEditable = !this.isEditable;
	}
	onEdit(text:string) {
		this.editedText = text;
		
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
	onSelectedTeams(value: any) {
		this.selectedTeam = value;
		

	}

	onSelectedTag(value: any) {
		this.selectedTag = value;


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