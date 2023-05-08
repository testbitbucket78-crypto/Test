import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormControl, Validators } from '@angular/forms';
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
	triggerFlows:any;
	selectedValue: any;
    newSmartReply:any;
	newReply=new FormGroup({
		Title: new FormControl('',Validators.required),
		Description:new FormControl('',Validators.required)
	
	})
	model: any;

	assignConversation: string[] =
		[
			"James Whatson", "David Harrison", "Jane Cooper", "Charles John"
		];

	addContactTag: string[] =
		[
			"Paid", "UnPaid", "Return", "New Customer", "Order Complete", "New Order", " Unavailable"
		];

	removeContactTag: string[] =
		[
			"Paid", "UnPaid", "Return", "New Customer", "Order Complete", "New Order", " Unavailable"
		];

		triggerFlow: string[] = 
		[
		        "Flow New Launch","Flow Help", "Flow Buy Product", "Flow Return Product"
			
		];


	newMessage!: FormGroup;
	message = '';	
	messages:any [] = [];
	
	action = '';
	addedActions:any [] =[];
	
	tt = '';
	tf: any [] = []

	selectedAction:any;	
	
	keyword: string = '';
	keywords: string[] = [];
	
	editedText:string ='';
	isEditable: boolean = false;
	addText:string ='';
	showBox:boolean = false;
	showBox1: boolean = false;
	showBox2: boolean = false;
	showattachmentbox = false;
	agentsList = ["James Whatson", "David Harrison", "Jane Cooper", "Charles John"];
	selectedInteraction: any = [];
	ShowAssignOption = false;
	errorMessage = '';
	successMessage = '';
	warningMessage = '';

	
	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService, private fb: FormBuilder ) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}

	ngOnInit() {
		this.stepper = new Stepper($('.bs-stepper')[0], {
			linear: true,
			animation: true
		});

		this.newMessage = this.fb.group({
			message_text: ''
		});
	
	
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
			this.tf.push(this.tt);
			this.action = '';
		
		
	}

	removeAction(index: number) {
		this.addedActions.splice(index, 1);
	}

	/****** Add , Edit and Remove Messages on Reply Action ******/ 

	addMessage() {
		
			this.messages.push(this.message);
			this.message = '';
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

	/*** Text Formating buttons on Reply Action ***/


    bold() {
		(<HTMLInputElement>document.getElementById("bold-txt")).style.fontWeight = "bold";
	}
	itelic() {
		(<HTMLInputElement>document.getElementById("replyText")).style.fontStyle = "italic";
	}


  /***  reply-action function  ***/
	toggleAssignOption() {
		
     this.ShowAssignOption = !this.ShowAssignOption;
		
	}

	showToaster(message: any, type: any) {
		if (type == 'success') {
			this.successMessage = message;
		} else if (type == 'error') {
			this.errorMessage = message;
		} else {
			this.warningMessage = message;
		}
		setTimeout(() => {
			this.hideToaster()
		}, 5000);

	}
	hideToaster() {
		this.successMessage = '';
		this.errorMessage = '';
		this.warningMessage = '';
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

	onTriggerFlow(value: any) {
		this.triggerFlows = value;


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
	

	onClickFuzzy(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('form-check-label')) {
			this.showBox = true;
		}
	}

	onClickExact(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('form-check-label')) {
			this.showBox1 = true;
		}
	}

	onClickContains(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('form-check-label')) {
			this.showBox2 = true;
		}
	}

}