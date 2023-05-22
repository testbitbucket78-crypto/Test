import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { Router } from '@angular/router';

import Stepper from 'bs-stepper';
declare var $: any;

@Component({
	selector: 'sb-addSmartReplies',
	templateUrl: './addSmartReplies.component.html',
	styleUrls: ['./addSmartReplies.component.scss']
})
export class AddSmartRepliesComponent implements OnInit {


	//******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}


	active = 1;
	stepper: any;
	data: any;
	val: any;
	
	keywordtxt: any;
	selectedTeam: any;
	selectedTag:any;
	triggerFlows:any;
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

	addContactTag: string[] =
		[
			"Paid", "UnPaid", "Return", "New Customer", "Order Complete", "New Order", " Unavailable"
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
	assignActionList = ["Assign Conversation","Add Contact Tag","Remove Tags","Trigger Flow", "Name Update", "Resolve Conversation" ];
	ShowAddAction = false;
	AutoReplyEnableOption: any = ['Flow New Launch', 'Flow Help', 'Flow Buy Product', 'Flow Return Product'];
	ShowAutoReplyOption = false;
	AutoReplyOption = false;
	ShowRemoveTag = false;
	ToggleRemoveTags = false;
	removeTagList = ["Paid", "UnPaid", "Return", "New Customer", "Order Complete", "New Order", " Unavailable"];
    errorMessage = '';
	successMessage = '';
	warningMessage = '';

	
	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService, private fb: FormBuilder, private router:Router ) {
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
	
		this.routerGuard();
	
	
	
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
		console.log("keywordtxt==="+this.keywordtxt)

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
		
	 this.ShowAddAction = false;
     this.ShowAssignOption = !this.ShowAssignOption;
		
	}

	toggleAddActions() {
		this.ShowAssignOption = false;
		this.ShowAddAction = !this.ShowAddAction;
	}

	toggleAutoReply() {
		this.ShowAutoReplyOption= false;
		this.AutoReplyOption = !this.AutoReplyOption;
	}

	toggleRemoveTag() {
		this.ShowRemoveTag = false;
		this.ToggleRemoveTags = !this.ToggleRemoveTags;
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
			SP_ID:sessionStorage.getItem('SP_ID'),
			Title:this.newReply.value.Title ,
			Description:this.newReply.value.Description,
			MatchingCriteria:this.model,
			Keywords:this.keywords
		}
		console.log("data")
		console.log(data)
		this.apiService.addNewReply(data).subscribe((responce)=>{
            console.log(responce)
		})
	}
	

	onClickFuzzy(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('form-check-label-img')) {
			this.showBox = true;
		}
	}

	onClickExact(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('form-check-label-img')) {
			this.showBox1 = true;
		}
	}

	onClickContains(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('form-check-label-img')) {
			this.showBox2 = true;
		}
	}


	SelectReplyOption(optionValue: any, optionType: any) {
		var LastPaused = this.selectedInteraction.paused_till
		var PTime = optionValue.match(/(\d+)/);
		let pausedTill = new Date();
		if (PTime) {

			if (optionType == 'Extend') {
				var dt1 = (new Date(LastPaused)).getTime();//Unix timestamp (in milliseconds)
				var addSec = PTime[0] * 60 * 1000
				var dt2 = new Date(dt1 + addSec)
				pausedTill = new Date(dt2);

			} else {
				var dt1 = (new Date()).getTime();
				var addSec = PTime[0] * 60 * 1000
				var dt2 = new Date(dt1 + addSec)
				pausedTill = new Date(dt2);
			}
		}

}


}