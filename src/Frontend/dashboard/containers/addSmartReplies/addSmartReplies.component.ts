import { Component, OnInit,ViewChild,ElementRef,ViewEncapsulation } from '@angular/core';
import { FormGroup,FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { Router } from '@angular/router';
import { agentMessageList } from '@app/models/smart-replies/smartReplies.model';
import Stepper from 'bs-stepper';
import { ToolbarService, NodeSelection, LinkService, ImageService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
declare var $: any;

@Component({
	selector: 'sb-addSmartReplies',
	templateUrl: './addSmartReplies.component.html',
	styleUrls: ['./addSmartReplies.component.scss'],
	providers: [ToolbarService, LinkService, ImageService, HtmlEditorService],
	// encapsulation: ViewEncapsulation.None
})
export class AddSmartRepliesComponent implements OnInit {


	// ******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}

	@ViewChild('notesSection') notesSection: ElementRef | undefined;
	@ViewChild('chatSection') chatSection: ElementRef | undefined;
	@ViewChild('chatEditor') chatEditor: RichTextEditorComponent | any;


	public selection: NodeSelection = new NodeSelection();
	public range: Range | undefined;
	public saveSelection: NodeSelection | any;


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

	newMessage!: FormGroup;
	message = '';	
	messages:any [] = [];
	

	selectedAction:any;	
	
	keyword: string = '';
	keywords: string[] = [];
	
	editedText:string ='';
	editedMessage: string = '';
	isEditable: boolean = false;
	addText:string ='';
	showBox:boolean = false;
	showBox1: boolean = false;
	showBox2: boolean = false;
	showattachmentbox = false;
	agentsList = ["Rishabh Singh", "Jatin Sharma", "Raunak Kumari", "Sumit Goyal" ,"Pawan Sharma"];
	ShowAssignOption = false;
	assignActionList = ["Assign Conversation", "Add Contact Tag", "Remove Tag"]; //,"Trigger Flow", "Name Update", "Resolve Conversation"
	ShowAddAction = false;
	AutoReplyEnableOption = ['Flow New Launch', 'Flow Help', 'Flow Buy Product', 'Flow Return Product'];
	ShowAutoReplyOption = false;
	AutoReplyOption = false;
	ShowAddTag = false;
	ToggleAddTag = false;
	ToggleAssignOption = false;
	addTagList = ["Paid", "UnPaid", "Return", "New Customer", "Order Complete", "New Order", " Unavailable"];
	ShowRemoveTag = false;
	ToggleRemoveTags = false;
	ShowNameUpdate = false;
    errorMessage = '';
	successMessage = '';
	warningMessage = '';
	assignedAgentList: agentMessageList [] =[];
	assignAddTag: [] =[];
	assignedTagList:any []=[];

    /**richtexteditor **/ 
	custommesage = '<p>Your Reply...</p>'
	showQuickResponse: any = false;
	showAttributes: any = false;
	showSavedMessage: any = false;
	showQuickReply: any = false;
	showInsertTemplate: any = false;
	showAttachmenOption: any = false;
	slideIndex = 0;
	PauseTime: any = '';
	confirmMessage: any;
	showEmoji = false;
	EmojiType: any = 'smiley';
	showEditTemplateMedia: any = false;
	TemplatePreview: any = false;
	messageMeidaFile: any = '';
	mediaType: any = '';
	showMention: any = false;
	editTemplate: any = false;


	public smileys: { [key: string]: Object }[] = [
		{ content: '&#128512;', title: 'Grinning face' },
		{ content: '&#128513;', title: 'Grinning face with smiling eyes' },
		{ content: '&#128514;', title: 'Face with tears of joy' },
		{ content: '&#128515;', title: 'Smiling face with open mouth' },
		{ content: '&#128516;', title: 'Smiling face with open mouth and smiling eyes' },
		{ content: '&#128517;', title: 'Smiling face with open mouth and cold sweat' },
		{ content: '&#128518;', title: 'Smiling face with open mouth and tightly-closed eyes' },
		{ content: '&#128519;', title: 'Smiling face with halo' },
		{ content: '&#128520;', title: 'Smiling face with horns' },
		{ content: '&#128521;', title: 'Winking face' },
		{ content: '&#128522;', title: 'Smiling face with smiling eyes' },
		{ content: '&#128523;', title: 'Face savouring delicious food' },
		{ content: '&#128524;', title: 'Relieved face' },
		{ content: '&#128525;', title: 'Smiling face with heart-shaped eyes' },
		{ content: '&#128526;', title: 'Smiling face with sunglasses' },
		{ content: '&#128527;', title: 'Smirking face"' },
		{ content: '&#128528;', title: 'Neutral face' },
		{ content: '&#128529;', title: 'Expressionless face' },
		{ content: '&#128530;', title: 'Unamused face' },
		{ content: '&#128531;', title: 'Face with cold sweat' },
		{ content: '&#128532;', title: 'Pensive face' },
		{ content: '&#128533;', title: 'Confused face' },
		{ content: '&#128534;', title: 'Confounded face' },
		{ content: '&#128535;', title: 'Kissing face' },
		{ content: '&#128536;', title: 'Face throwing a kiss' },
		{ content: '&#128538;', title: 'Kissing face with smiling eyes' },
		{ content: '&#128539;', title: 'Face with stuck-out tongue' },
		{ content: '&#128540;', title: 'Face with stuck-out tongue and winking eye' },
		{ content: '&#128541;', title: 'Face with stuck-out tongue and tightly-closed eyes' },
		{ content: '&#128542;', title: 'Disappointed face' },
		{ content: '&#128543;', title: 'Worried face' },
		{ content: '&#128544;', title: 'Angry face' },
		{ content: '&#128545;', title: 'Pouting face' },
		{ content: '&#128546;', title: 'Crying face' },
		{ content: '&#128547;', title: 'Persevering face' },
		{ content: '&#128548;', title: 'Face with look of triumph' },
		{ content: '&#128549;', title: 'Disappointed but relieved face' },
		{ content: '&#128550;', title: 'Frowning face with open mouth' },
		{ content: '&#128551;', title: 'Anguished face' },
		{ content: '&#128552;', title: 'Fearful face' },
		{ content: '&#128553;', title: 'Weary face' },
		{ content: '&#128554;', title: 'Sleepy face' },
		{ content: '&#128555;', title: 'Tired face' },
		{ content: '&#128556;', title: 'Grimacing face' },
		{ content: '&#128557;', title: 'Loudly crying face' },
		{ content: '&#128558;', title: 'Face with open mouth' },
		{ content: '&#128559;', title: 'Hushed face' },
		{ content: '&#128560;', title: 'Face with open mouth and cold sweat' },
		{ content: '&#128561;', title: 'Face screaming in fear' },
		{ content: '&#128562;', title: 'Astonished face' },
		{ content: '&#128563;', title: 'Flushed face' },
		{ content: '&#128564;', title: 'Sleeping face' },
		{ content: '&#128565;', title: 'char_block' },

	];
	public animals: { [key: string]: Object }[] = [
		{ title: 'Monkey Face', content: '&#128053;' },
		{ title: 'Monkey', content: '&#128018;' },
		{ title: 'Gorilla', content: '&#129421;' },
		{ title: 'Dog Face', content: '&#128054;' },
		{ title: 'Dog', content: '&#128021;' },
		{ title: 'Poodle', content: '&#128041;' },
		{ title: 'Wolf Face', content: '&#128058;' },
		{ title: 'Fox Face', content: '&#129418;' },
		{ title: 'Cat Face', content: '&#128049;' },
		{ title: 'Cat', content: '&#128008;' },
		{ title: 'Lion Face', content: '&#129409;' },
		{ title: 'Tiger Face', content: '&#128047;' },
		{ title: 'Tiger', content: '&#128005;' },
		{ title: 'Leopard', content: '&#128006;' },
		{ title: 'Horse Face', content: '&#128052;' },
		{ title: 'Horse', content: '&#128014;' },
		{ title: 'Unicorn Face', content: '&#129412;' },
		{ title: 'Deer', content: '&#129420;' },
		{ title: 'Cow Face', content: '&#128046;' },
		{ title: 'Ox', content: '&#128002;' },
		{ title: 'Water Buffalo', content: '&#128003;' },
		{ title: 'Cow', content: '&#128004;' },
		{ title: 'Pig Face', content: '&#128055;' },
		{ title: 'Pig', content: '&#128022;' },
		{ title: 'Boar', content: '&#128023;' },
		{ title: 'Pig Nose', content: '&#128061;' },
		{ title: 'Ram', content: '&#128015;' },
		{ title: 'Ewe', content: '&#128017;' },
		{ title: 'Goat', content: '&#128016;' },
		{ title: 'Camel', content: '&#128042;' },
		{ title: 'Two-Hump Camel', content: '&#128043;' },
		{ title: 'Elephant', content: '&#128024;' },
		{ title: 'Rhinoceros', content: '&#129423;' },
		{ title: 'Mouse Face', content: '&#128045;' },
		{ title: 'Mouse', content: '&#128001;' },
		{ title: 'Rat', content: '&#128000;' },
		{ title: 'Hamster Face', content: '&#128057;' },
		{ title: 'Rabbit Face', content: '&#128048;' },
		{ title: 'Rabbit', content: '&#128007;' },
		{ title: 'Chipmunk', content: '&#128063;' },
		{ title: 'Bat', content: '&#129415;' },
		{ title: 'Bear Face', content: '&#128059;' },
		{ title: 'Koala', content: '&#128040;' },
		{ title: 'Panda Face', content: '&#128060;' },
		{ title: 'Paw Prints', content: '&#128062;' },
		{ title: 'Frog Face', content: '&#128056;' },
		{ title: 'Crocodile', content: '&#128010;' },
		{ title: 'Turtle', content: '&#128034;' },
		{ title: 'Lizard', content: '&#129422;' },
		{ title: 'Snake', content: '&#128013;' },
		{ title: 'Dragon Face', content: '&#128050;' },
		{ title: 'Dragon', content: '&#128009;' },
		{ title: 'Sauropod', content: '&#129429;' },
		{ title: 'T-Rex', content: '&#129430;' },
	];



	public tools: object = {
		items: ['Bold', 'Italic', 'StrikeThrough',
			{

				undo: true,
				click: this.toggleEmoji.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;"  class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/emoji.svg"></div></button>'
			},
			{

				undo: true,
				click: this.ToggleAttachmentBox.bind(this),
				template: '<button  style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attachment-icon.svg"></div></button>'
			},
			{

				undo: true,
				click: this.ToggleAttributesOption.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
			},
			{
				undo: true,
				click: this.ToggleQuickReplies.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/quick-replies.svg"></div></button>'
			},
			{
	
				undo: true,
				click: this.ToggleSavedMessageOption.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/saved-message.svg"></div></button>'
			},
			{
				undo: true,
				click: this.ToggleInsertTemplateOption.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/insert-temp.svg"></div></button>'
			}]
	};

	isSendButtonDisabled=false
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

/*** rich text editor ***/

	closeAllModal() {
		this.showAttachmenOption = false
		this.messageMeidaFile = false
		this.showAttributes = false
		this.showInsertTemplate = false
		this.editTemplate = false
		this.TemplatePreview = false
		this.showSavedMessage = false
		this.showQuickReply = false
		this.showMention = false
		this.showEmoji = false;

	}

	resetMessageTex() {
		if (this.chatEditor.value == '<p>Your message...</p>' || this.chatEditor.value == '<p>Your Reply...</p>') {
			this.chatEditor.value = '';
			
		}

	}
	closeEmoji(){
		this.showEmoji =false;
	}

	toggleEmoji() {
		this.closeAllModal()
		this.showEmoji = !this.showEmoji;
		(this.chatEditor.contentModule.getEditPanel() as HTMLElement).focus
		this.range = this.selection.getRange(document);
		this.saveSelection = this.selection.save(this.range, document);
				
	}

	ToggleAttachmentBox() {
		this.closeAllModal()
		this.showAttachmenOption = !this.showAttachmenOption;

	}


	ToggleAttributesOption() {
		this.closeAllModal()
		this.showAttributes = !this.showAttributes;
	}
	ToggleQuickReplies() {
		this.closeAllModal()
		this.showQuickReply = !this.showQuickReply;
	}
	ToggleSavedMessageOption() {
		this.closeAllModal()
		this.showSavedMessage = !this.showSavedMessage;

	}

	ToggleInsertTemplateOption() {
		this.closeAllModal()
		this.showInsertTemplate = !this.showInsertTemplate;
	}



	showEmojiType(EmojiType: any) {
		this.EmojiType = EmojiType;
	}

	public onInsert(item: any) {

		this.saveSelection.restore();
		this.chatEditor.executeCommand('insertText', item.target.textContent);
		this.chatEditor.formatter.saveData();
		this.chatEditor.formatter.enableUndo(this.chatEditor);
		// this.showEmoji = !this.showEmoji;

	}



	/***add keyword and remove keyowrd method***/

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


	/****** Add , Edit and Remove Messages on Reply Action ******/ 

	addMessage() {
		this.assignedAgentList.push({ Message:this.custommesage, ActionID:1, Value: this.custommesage })
			// this.messages.push(this.message);
			this.custommesage = '';
		
		    
		}

	
	removeMessage(index:number) {
		this.assignedAgentList.splice(index, 1);
	}


	removeAction(index: number) {

		this.assignedAgentList.forEach(item => {
			if (!item.Message) {
				this.assignedAgentList.splice(index, 1);
					
			}
		})
		
	}


	removeAddTag(index: number) {
		this.assignedTagList = [];
		this.assignedAgentList.splice(index, 1);

	}

	/*** edit message and assinged conversation***/ 

	toggleEditable(index: number) {
		this.isEditable = !this.isEditable;
		setTimeout(() => { document.getElementById(`msgbox-body${index}`); }, 100);
		
		console.log(document.getElementById(`msgbox-body${index}`));
		
		}

	onEdit(msgText:string) {
		this.editedMessage = msgText;
		
	}

	onActionEdit(Text: string) {
		this.editedText = Text;

	}

	checkTagStatus (val:any) {
		if(this.assignedTagList.includes(val)) {
			return true;
		}
		else {
			return false;
		}
	}

  /***  reply-action function  ***/

	toggleAssignOption(index: number) {
  if (this.assignActionList[index] === "Assign Conversation") {
    this.ShowAssignOption = !this.ShowAssignOption;
  }
  else if (this.assignActionList[index] === "Add Contact Tag") {
	  this.ShowRemoveTag =false;
	  $("#addTagModal").modal('show'); 

  }
//   else if (this.assignActionList[index] === "Trigger Flow") {
// 	  this.AutoReplyOption = !this.AutoReplyOption;
//   }
	else { 
	   this.ShowAssignOption = false;
	  
	  this.ShowAutoReplyOption = false;

  }
 this.ShowAddAction = false;

}



/*** toggle Actions***/ 
	toggleAddActions() {
		this.ShowAssignOption = false;
		this.ShowAddAction = !this.ShowAddAction;
	}

	closeAssignOption() {
		this.ShowAssignOption = false;
		this.ToggleAssignOption = !this.ToggleAssignOption;
	}

	toggleAutoReply() {
		this.ShowAutoReplyOption = false;
		this.AutoReplyOption = !this.AutoReplyOption;
		
	}

	toggleAddTag() {

		this.ShowAddTag = false;
		this.ToggleAddTag = !this.ToggleAddTag;


	}

	toggleRemoveTag() {
		$("#addTagModal").modal('show'); 
		this.ShowRemoveTag = true;
	
	}
	assignConversation(index: number) {
		var isExist = false;
		this.assignedAgentList.forEach(item=> {
			if(item.ActionID == 2) {
				if(item.Value == this.agentsList[index]) 
				isExist = true;
			}
		})
		if(!isExist) {
			this.assignedAgentList.push({Message:'', ActionID:2, Value: this.agentsList[index]})
		}
			
	}

	addTags(index: number, e:any) {
		console.log(e,index);
		var isExist = false;
		this.assignedAgentList.forEach(item => {
			if (item.ActionID == 3) {
				  isExist= true;
				  if (e.target.checked) {
					  if (!item.Value.includes(this.addTagList[index])) {
						  console.log(this.addTagList[index]);
						  // item.Value.push(this.addTagList[index]);
						  this.assignedTagList.push(this.addTagList[index]);
					  }
				  }
				  else {
					var idx = this.assignedTagList.findIndex(item => item == this.addTagList[index]) 
					console.log(idx);
					console.log(this.assignedTagList[idx]);
					this.assignedTagList.splice(idx,1);
					
				  }
				
		}
		})
		if (!isExist) {
			this.assignedTagList = [];
			this.assignedTagList.push(this.addTagList[index]);
			this.assignedAgentList.push({ Message: '',ActionID: 3, Value: this.assignedTagList});
			console.log('new value');
		}
		console.log(this.assignedAgentList);
		console.log(this.assignedTagList);
	}


	next() {
		this.stepper.next();
		console.log(this.stepper);
		// const currentIndex = this.stepper ? this.stepper.currentIndex : 0;
		// if (currentIndex > 0) {
		// 	const previousStep = this.stepper ? this.stepper.steps[currentIndex - 1] : null;
		// 	if (previousStep) {
		// 		previousStep.classList.add('completed');
		// 	}
		// }
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
	getNewSmartReplyData() {
		const title = this.newReply.value.Title;
		const description = this.newReply.value.Description;
		const errorDiv = document.getElementById("title-err-msg");

		if (title !== '' && description !== '') {
			sessionStorage.setItem('Title', title);
			sessionStorage.setItem('Description', description);
			errorDiv!.style.visibility = 'hidden';
			this.next();
		} else {
			const errorMessage = "! Please Fill Title & Description First";
			errorDiv!.innerHTML = errorMessage;
		}
	}


	verifyKeywordForNextStep(duplicatekeyword:any) {

		if (document.getElementsByClassName('keytext')[0].innerHTML !== '') {
			this.verifyKeyword(duplicatekeyword);
			

		}
	}


	onSelectionChange(entry: any): void {
		this.model = entry;
		console.log(this.model)
		sessionStorage.setItem('MatchingCriteria',this.model)
	}
	

	sendNewSmartReply(smartreplysuccess: any, smartreplyfailed: any ) {

			var data = {
				SP_ID: sessionStorage.getItem('SP_ID'),
				Title: this.newReply.value.Title,
				Description: this.newReply.value.Description,
				MatchingCriteria: this.model,
				Keywords: this.keywords,
				ReplyActions: this.assignedAgentList,
				Tags: []
			}
			console.log(data)
			this.apiService.addNewReply(data).subscribe (
			
			(response:any) => {
				console.log(response)
			
				if (response.status === 200) {
					this.modalService.open(smartreplysuccess);
				}
				
			},

			(error:any) => {
				if (error.status === 500) {
					this.modalService.open(smartreplyfailed);
				}
				else {
					const errorDiv = document.getElementById("smrply-err-msg");
					const errorMessage = "! Internal Server Error Please try after some time";
					errorDiv!.innerHTML = errorMessage;

				}

				
	       });
		
		
	}



	verifyKeyword(duplicatekeyword:any) {

		var data= {
			SP_ID: sessionStorage.getItem('SP_ID'),
			Keywords: this.keywords
		}
		this.apiService.duplicatekeywordSmartReply(data).subscribe(
			
			(response: any) => {
			console.log(response)
			if (response.status === 200) {
				this.next();				
			}
	    
		},
			(error: any) => {
				if (error.status === 409) {
					this.modalService.open(duplicatekeyword);
				}
				else {
					const errorDiv = document.getElementById("keyword-err-msg");
					const errorMessage = "! Internal Server Error Please try after some time";
					errorDiv!.innerHTML = errorMessage;

				}
	
			});
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



}