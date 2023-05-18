	import { Component,AfterViewInit, OnInit,ViewChild, ElementRef,HostListener  } from '@angular/core';

	import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
	import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
	import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
	import { TeamboxService } from './../../services';
	import { Router } from '@angular/router';
	import { ToolbarService,NodeSelection, LinkService, ImageService } from '@syncfusion/ej2-angular-richtexteditor';
	import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';

	@Component({
	selector: 'sb-teambox',
	templateUrl: './teambox.component.html',
	styleUrls: ['./teambox.component.scss'],
	providers: [ToolbarService, LinkService, ImageService, HtmlEditorService]
	})

	export class TeamboxComponent implements  OnInit {


			//******* Router Guard  *********//
		routerGuard = () => {
			if (sessionStorage.getItem('SP_ID') === null) {
				this.router.navigate(['login']);
			}
		}


		@ViewChild('notesSection') notesSection: ElementRef |undefined; 
		@ViewChild('chatSection') chatSection: ElementRef |undefined; 
		@ViewChild('chatEditor') chatEditor: RichTextEditorComponent | any; 
		
		public selection: NodeSelection = new NodeSelection();
		public range: Range | undefined;
		public saveSelection: NodeSelection | any;

		public QuickRepliesList: { [key: string]: Object }[] = [
			{ id:1,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:2,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:3,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:4,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:5,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:6,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
		];

		public TemplateList: any = [
			{ id:1,date:'2023-05-15',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:2,date:'2023-05-17',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:3,date:'2023-05-18',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:4,date:'2023-05-20',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:5,date:'2023-05-22',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:6,date:'2023-05-23',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:7,date:'2023-05-23',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:8,date:'2023-06-23',name:'Healthkart-Offers',img: 'template-img.png',heading:'Vitamins, Minerals & Supplements',content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
				
		];
		
		public selectedTemplate:any  = { id:1,date:'2023-05-15',name:'Healthkart-Offers',img: 'template-img.png',heading:'{{name}}',content: '<b>Vitamins, Minerals & Supplements</b><br>Are you unable to get the right amount of vitamins {{Product}}<br>essential nutrients through the food that you eat?<br><br>Hurry up!'};
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
			items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
			{
			tooltipText: 'Emoji',
			undo: true,
			click: this.toggleEmoji.bind(this),
			template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;"  class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/emoji.svg"></div></button>'
			},
			{
				tooltipText: 'Attachment',
				undo: true,
				click: this.ToggleAttachmentBox.bind(this),
				template: '<button  style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attachment-icon.svg"></div></button>'
			},
			{
				tooltipText: 'Attributes',
				undo: true,
				click: this.ToggleAttributesOption.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
			},
			{
				tooltipText: 'Quick Replies',
				undo: true,
				click: this.ToggleQuickReplies.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/quick-replies.svg"></div></button>'
			},
			{
				tooltipText: 'Saved Message',
				undo: true,
				click: this.ToggleSavedMessageOption.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/saved-message.svg"></div></button>'
			},
			{
				tooltipText: 'Insert Template',
				undo: true,
				click: this.ToggleInsertTemplateOption.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/insert-temp.svg"></div></button>'
			}]
		};

		

		
		custommesage='<p>Your message...</p>'
		showQuickResponse:any=false;
		showAttributes:any=false;
		showSavedMessage:any=false;
		showQuickReply:any=false;
		showInsertTemplate:any=false;
		showAttachmenOption:any=false;
		slideIndex=0;
		PauseTime:any='';
		confirmMessage:any;
		
	
		active = 1;
		SPID=2;
		TeamLeadId=6;
		AgentId=45;
		messageTimeLimit=10;
		SIPmaxMessageLimt=25;
		SIPthreasholdMessages=0;
		AgentName='Raman Bhasker';
		loginAs='Agent'//'TL'
		showFullProfile=false;
		showAttachedMedia=false;
		showattachmentbox=false;
		ShowFilerOption=false;
		ShowContactOption=false;
		AutoReplyOption=false;
		ShowConversationStatusOption=false;
		ShowAssignOption=false;
		selectedInteraction:any = [];
		selectedNote:any=[];
		contactList:any = [];
		interactionList:any = [];
		interactionListMain:any=[];
		agentsList:any = [];
		modalReference: any;
		OptedIn=false;
		searchFocused=false;
		searchChatFocused=false;
		errorMessage='';
		successMessage='';
		warningMessage='';
		showChatNotes='text';
		message_text='';
		showEmoji=false;
		EmojiType:any='smiley';
		selectedChannel:any='WhatsApp';
		contactSearchKey:any='';
		ShowChannelOption:any=false;
		
		newContact: any;
		editContact: any;
		ShowGenderOption:any=false;
		ShowLeadStatusOption:any=false;

		newMessage:any;
		interactionFilterBy:any='All'
		interactionSearchKey:any=''
		tagsoptios:any=[
		{name:'Paid',status:false},
		{name:'Unpaid',status:false},
		{name:'Return',status:false}]

		selectedTags:any='';
		AutoReplyEnableOption:any=['Extend Pause for 5 mins','Extend Pause for 10 mins','Extend Pause for 15 mins','Extend Pause for 20 mins'];
		AutoReplyPauseOption:any=['Pause for 5 mins','Pause for 10 mins','Pause for 15 mins','Pause for 20 mins','Auto Reply are Paused'];
		AutoReply:any='Extend Pause for 5 mins';
		AutoReplyType:any= 'Auto Reply are Paused';
		dragAreaClass: string='';
		editTemplate:any=false;
		showEditTemplateMedia:any=false;
		TemplatePreview:any=false;
		messageMeidaFile:any='';
		mediaType:any='';
		showMention:any=false;
		EditContactForm:any=[];
		SavedMessageList:any=[];
		QuickReplyList:any=[];
		SavedMessageListMain:any=[];
		QuickReplyListMain:any=[];
		allTemplates:any=[];
		allTemplatesMain:any=[];
		filterTemplateOption:any='';
		
		
		

		constructor(private http: HttpClient,private apiService: TeamboxService,config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder,private router:Router) {
			// customize default values of modals used by this component tree
			config.backdrop = 'static';
			config.keyboard = false;
			config.windowClass= 'teambox-pink';
			this.newContact= fb.group({
				SP_ID: new FormControl('', Validators.required),
				Name: new FormControl('', Validators.required),
				Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
				Channel: new FormControl('', Validators.required),
				
			});
			this.editContact=fb.group({
				SP_ID: new FormControl('', Validators.required),
				Name: new FormControl('', Validators.required),
				Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
				Channel: new FormControl('', Validators.required),
			});
			
			this.newMessage =fb.group({
				Message_id:new FormControl(''),
			});

		}
		resetMessageTex(){
			if(this.chatEditor.value == '<p>Your message...</p>' || this.chatEditor.value =='<p>Your content...</p>'){
				this.chatEditor.value='';
			}
			
		}
		toggleChatNotes(optionvalue:any){
			if(this.chatEditor){
			if(optionvalue == 'text'){
				this.chatEditor.value = 'Your message...'
				this.tools = {
					items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
					{
					tooltipText: 'Emoji',
					undo: true,
					click: this.toggleEmoji.bind(this),
					template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;"  class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/emoji.svg"></div></button>'
					},
					{
						tooltipText: 'Attachment',
						undo: true,
						click: this.ToggleAttachmentBox.bind(this),
						template: '<button  style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attachment-icon.svg"></div></button>'
					},
					{
						tooltipText: 'Attributes',
						undo: true,
						click: this.ToggleAttributesOption.bind(this),
						template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
					},
					{
						tooltipText: 'Quick Replies',
						undo: true,
						click: this.ToggleQuickReplies.bind(this),
						template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/quick-replies.svg"></div></button>'
					},
					{
						tooltipText: 'Saved Message',
						undo: true,
						click: this.ToggleSavedMessageOption.bind(this),
						template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/saved-message.svg"></div></button>'
					},
					{
						tooltipText: 'Insert Template',
						undo: true,
						click: this.ToggleInsertTemplateOption.bind(this),
						template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/insert-temp.svg"></div></button>'
					}]
				}
			}else{
				this.chatEditor.value = 'Your content...'
				this.tools = {
					items: ['Bold', 'Italic', 'Underline', 'StrikeThrough',
					{
					tooltipText: 'Emoji',
					undo: true,
					click: this.toggleEmoji.bind(this),
					template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;"  class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/emoji.svg"></div></button>'
					},
					{
						tooltipText: 'Attachment',
						undo: true,
						click: this.ToggleAttachmentBox.bind(this),
						template: '<button  style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attachment-icon.svg"></div></button>'
					},
					{
						tooltipText: 'Attributes',
						undo: true,
						click: this.ToggleAttributesOption.bind(this),
						template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
					},
					{
						tooltipText: '@mentions',
						undo: true,
						click: this.ToggleShowMentionOption.bind(this),
						template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
								+ '<div class="e-tbar-btn-text">@</div></button>'
					}]
				}
			}
		}
			this.showChatNotes=optionvalue
			setTimeout(() => {
				this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
				this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
			}, 100);
		}

		closeAllModal(){
			this.showAttachmenOption=false
			this.messageMeidaFile=false
			this.showAttributes=false
			this.showInsertTemplate=false
			this.editTemplate=false
			this.TemplatePreview=false
			this.showSavedMessage=false
			this.showQuickReply=false
			this.showMention=false
			this.showEmoji =false;

		}	
		editMedia(){
			this.closeAllModal()
			this.showEditTemplateMedia=true;
		}
		cancelEditTemplateMedia(){
			this.closeAllModal()
			this.editTemplate=true
		}
		updateEditTemplateMedia(){
			this.closeAllModal()
			this.editTemplate=true
		}
		showTemplatePreview(){
			this.closeAllModal()
			this.TemplatePreview=true
		}
		insertTemplate(){
			this.closeAllModal()
		}

	showeditTemplate(){
		this.editTemplate=true
		this.showInsertTemplate=false;
	}	
	ToggleShowMentionOption(){
		this.closeAllModal()
		this.showMention=!this.showMention
	}
	public InsertMentionOption(user:any){
		let content:any = this.chatEditor.value;
		content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
		content = content+'<span class="mention"> @'+user.name+' </span>'
		this.chatEditor.value = content
		this.showMention = false;
	}
	ToggleSavedMessageOption(){
		this.closeAllModal()
		this.showSavedMessage =!this.showSavedMessage

	}
	ToggleInsertTemplateOption(){
		this.closeAllModal()
		this.showInsertTemplate =!this.showInsertTemplate
	}

	ToggleAttributesOption(){
		this.closeAllModal()
		this.showAttributes = !this.showAttributes;
	}	
	ToggleQuickReplies(){
		this.closeAllModal()
		this.showQuickReply = !this.showQuickReply;
	}

	selectQuickReplies(item:any){
		this.closeAllModal()
		var htmlContnet = '<p><span style="color: #6149CD;"><b>'+item.title+'</b></span><br>'+item.content+'</p>';
		this.chatEditor.value =htmlContnet
	}
	searchSavedMessage(event:any){
		let searchKey = event.target.value
		if(searchKey.length>2){
		var allList = this.SavedMessageListMain
		let FilteredArray = [];
		for(var i=0;i<allList.length;i++){
			var content = allList[i].title.toLowerCase()
				if(content.indexOf(searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allList[i])
				}
		}
		this.SavedMessageList = FilteredArray
	}else{
		this.SavedMessageList = this.SavedMessageListMain
	}
	}
	searchQuickReply(event:any){
		let searchKey = event.target.value
		if(searchKey.length>2){
		var allList = this.QuickReplyListMain
		let FilteredArray = [];
		for(var i=0;i<allList.length;i++){
			var content = allList[i].title.toLowerCase()
				if(content.indexOf(searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allList[i])
				}
		}
		this.QuickReplyList = FilteredArray
	    }else{
			this.QuickReplyList = this.QuickReplyListMain
		}
	}

	searchTemplate(event:any){
		let searchKey = event.target.value
		if(searchKey.length>2){
		var allList = this.allTemplates
		let FilteredArray = [];
		for(var i=0;i<allList.length;i++){
			var content = allList[i].title.toLowerCase()
				if(content.indexOf(searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allList[i])
				}
		}
		this.allTemplates = FilteredArray
	    }else{
			this.allTemplates = this.allTemplates
		}
	}

	filterTemplate(temType:any){

		let allList  =this.allTemplatesMain;
		if(temType.target.checked){
		var type= temType.target.value;
		for(var i=0;i<allList.length;i++){
				if(allList[i]['type'] == type){
					allList[i]['is_active']=1
				}
		}
	   }else{
		var type= temType.target.value;
		for(var i=0;i<allList.length;i++){
				if(allList[i]['type'] == type){
					allList[i]['is_active']=0
				}
		}
	   }
		var newArray=[];
	   for(var m=0;m<allList.length;m++){
          if(allList[m]['is_active']==1){
			newArray.push(allList[m])
		  }

	   }
	   this.allTemplates= newArray

		
	}

		
	toggleEmoji(){
		this.closeAllModal()
		this.showEmoji = !this.showEmoji;
		(this.chatEditor.contentModule.getEditPanel() as HTMLElement).focus();
		this.range = this.selection.getRange(document);
		this.saveSelection = this.selection.save(this.range, document);
				
	}
	public onInsert(item:any) {
		
		this.saveSelection.restore();
		this.chatEditor.executeCommand('insertText', item.target.textContent);
		this.chatEditor.formatter.saveData();
		this.chatEditor.formatter.enableUndo(this.chatEditor);
		this.showEmoji = !this.showEmoji;

	}


	showEmojiType(EmojiType:any){
		this.EmojiType = EmojiType
	}
	ToggleAttachmentBox(){
		this.closeAllModal()
		this.showAttachmenOption=!this.showAttachmenOption
		this.dragAreaClass = "dragarea";
		
	}
		sendMediaMessage(){
			this.sendMessage()
		}
		onFileChange(event: any) {
			let files: FileList = event.target.files;
			this.saveFiles(files);
            
		}
		downloadFile(fileUrl:any){
			window.open(fileUrl,'_blank')
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
		
		saveFiles(files: FileList) {
			if(files[0]){
		    let imageFile = files[0]
			this.mediaType = files[0].type
			const data = new FormData();
			data.append('dataFile',imageFile ,imageFile.name);
			this.apiService.uploadfile(data).subscribe(uploadStatus =>{
				let responseData:any = uploadStatus
				if(responseData.filename){
					this.messageMeidaFile = responseData.filename
					this.showAttachmenOption=false;
				}
			})
		  }
		}

		ngOnInit() {
			this.routerGuard()
			this.getAgents()
			this.getAllInteraction()
			this.getCustomers()
			this.getsavedMessages()
			this.getquickReply()
			this.getTemplates()
		}

		
		async getsavedMessages(){
			this.apiService.getsavedMessages(this.SPID).subscribe(savedMessages =>{
				this.SavedMessageListMain = savedMessages
				this.SavedMessageList = savedMessages
			})

		}
		async getquickReply(){
			this.apiService.getquickReply(this.SPID).subscribe(quickReply =>{
				this.QuickReplyListMain = quickReply
				this.QuickReplyList = quickReply
			})
			
		}

		async getTemplates(){
			this.apiService.getTemplates(this.SPID).subscribe(allTemplates =>{
				console.log('////////allTemplates////////')
				console.log(allTemplates)
				this.allTemplatesMain = allTemplates
				this.allTemplates = allTemplates
			})
			
		}

		


		

		

		focusInChatFunction(){
			this.searchChatFocused = true
		}

		focusOutChatFunction(){
			this.searchChatFocused = false
		}
		focusInFunction(){
			this.searchFocused = true
		}
		focusOutFunction(){
			this.searchFocused = false
		}
		toggleProfileView(){
			//console.log(this.selectedInteraction)
			this.showFullProfile = !this.showFullProfile
		}
		toggleAttachedMediaView(){
			this.showAttachedMedia = !this.showAttachedMedia
		}

		updateOptedIn(event:any){
			this.OptedIn= event.target.checked
			this.newContact.value.OptedIn = event.target.value
		}
		getCustomers(){
			this.apiService.getCustomers(this.SPID).subscribe(data =>{
				this.contactList= data
			});
		}
		
		getAgents(){
			this.apiService.getAgents(this.SPID).subscribe(data =>{
				this.agentsList= data
			});

		}
		async getAssicatedInteractionData(dataList:any,selectInteraction:any=true){
			let threasholdMessages=0
			dataList.forEach((item:any) => {
			
			item['tags'] = this.getTagsList(item.tag)
			
			this.apiService.getAllMessageByInteractionId(item.InteractionId,'text').subscribe(messageList =>{
				item['messageList'] =messageList?this.groupMessageByDate(messageList):[]
				item['allmessages'] =messageList?messageList:[]

				var lastMessage = item['allmessages']?item['allmessages'][item['allmessages'].length - 1]:[];
				item['lastMessage'] = lastMessage
				item['lastMessageReceved']= this.timeSinceLastMessage(item.lastMessage)
				item['progressbar']= this.getProgressBar(item.lastMessage)
				item['UnreadCount']= this.getUnreadCount(item.allmessages)
				
				var messageSentCount:any = this.threasholdMessages(item.allmessages)
				threasholdMessages = threasholdMessages+messageSentCount
				this.SIPthreasholdMessages= this.SIPmaxMessageLimt-threasholdMessages
		
			})

			this.apiService.getAllMessageByInteractionId(item.InteractionId,'notes').subscribe(notesList =>{
				item['notesList'] =notesList?this.groupMessageByDate(notesList):[]
				item['allnotes'] =notesList?notesList:[]
			})

			this.apiService.getAllMessageByInteractionId(item.InteractionId,'media').subscribe(mediaList =>{
				item['allmedia'] =mediaList?mediaList:[]
			})


				this.apiService.getInteractionMapping(item.InteractionId).subscribe(mappingList =>{
					var mapping:any  = mappingList;
					item['assignTo'] =mapping?mapping[mapping.length - 1]:'';
			    })
			
			this.apiService.checkInteractionPinned(item.InteractionId,this.AgentId).subscribe(pinnedList =>{
				var isPinnedArray:any =pinnedList
				if(isPinnedArray.length >0){
				item['isPinned'] = true
				}else{
				item['isPinned'] = false
				}
			})


			});

			this.interactionList= dataList
			this.interactionListMain= dataList
			
			setTimeout(() => {
				this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
			}, 5000);

			setTimeout(() => {
				this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
			}, 5000);

			if(dataList[0] && selectInteraction){
				this.selectInteraction(dataList[0])
			}


		}
        async updatePinnedStatus(item:any){
			
			var bodyData = {
				AgentId:this.AgentId,
				isPinned:item.isPinned,
				InteractionId:item.InteractionId
			}
			//console.log(bodyData)
			this.apiService.updateInteractionPinned(bodyData).subscribe(async response =>{
				item.isPinned=!item.isPinned;
			})



		}

		async getFilteredInteraction(filterBy:any){
			await this.apiService.getFilteredInteraction(filterBy,this.AgentId,this.AgentName).subscribe(async data =>{
				var dataList:any = data;
				this.getAssicatedInteractionData(dataList)
			});
		}
		
		async getAllInteraction(selectInteraction:any=true){
			let bodyData={
				SearchKey:this.interactionSearchKey,
				FilterBy:this.interactionFilterBy,
				AgentId:this.AgentId,
				SPID:this.SPID,
				AgentName:this.AgentName
			}
			
			await this.apiService.getAllInteraction(bodyData).subscribe(async data =>{
				var dataList:any = data;
				this.getAssicatedInteractionData(dataList,selectInteraction)
			});

		}
		async getSearchInteraction(event:any){
		if(event.target.value.length>2){
			var searchKey =event.target.value
			this.interactionSearchKey = searchKey
			this.getAllInteraction()
		}else{
			this.interactionSearchKey = ''
			this.getAllInteraction()
		}
		
		}

		async seacrhInChat(event:any,selectInteraction:any=true){
			//console.log('seacrhInChat')
			let searchKey = event.target.value
		  if(searchKey.length>1){
			let FilteredArray = []
			let allmessages=[]
			if(this.showChatNotes=='text'){
				 allmessages = this.selectedInteraction['allmessages']
			}else{
				 allmessages = this.selectedInteraction['allnotes']
			}
			for(var i=0;i<allmessages.length;i++){
				let text = allmessages[i]['message_text']
				let content = text.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
				content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
				content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
				content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
				content = content.replace('&nbsp;', '\n')
				content = content.replace(/<br[^>]*>/g, '\n')
				content = content.replace(/<\/?[^>]+(>|$)/g, "")
				content = content.toLowerCase()

				if(content.indexOf(searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allmessages[i])
				}
		    }
			
			if(this.showChatNotes=='text'){
				this.selectedInteraction['messageList'] = FilteredArray.length>0?this.groupMessageByDate(FilteredArray):[{}]
			}else{
				this.selectedInteraction['notesList'] =   FilteredArray.length>0?this.groupMessageByDate(FilteredArray):[{}]
			}


		}else{
			this.selectedInteraction['messageList'] = this.groupMessageByDate(this.selectedInteraction['allmessages'])
			this.selectedInteraction['notesList'] =this.groupMessageByDate(this.selectedInteraction['allnotes'])
		}

		}
	
		
		getFormatedDate(date:any){
			if(date){
				var time = new Date(new Date(date).toString());
				var timeString = time.toLocaleString('en-US', { hour: "2-digit",minute: "2-digit" })
				const tempDate:any = new Date(date).toString().split(' ');
				const formattedDate:any = tempDate['2']+' '+tempDate['1']+' '+tempDate['3']+', '+timeString;
				return formattedDate
				}else{
				return '';
				}

		}

		getTagsList(tags:any){
			if(tags){
				const tagsArray = tags.split(',');
				return tagsArray
			}else{
				return [];
			}
		}

		dateSince(date:any) {
			if(date){
			const monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];		
			var a = new Date()
			var b = new Date(date)

			const _MS_PER_DAY = 1000 * 60 * 60 * 24;
			var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
			var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
			var groupDate = b.getDate()+' '+monthNames[b.getMonth()]+' '+b.getFullYear();
			var diffDays:any = Math.floor((utc1 - utc2) / _MS_PER_DAY);
			if(diffDays<1){
				return 'Today';
			}
			if(diffDays<2){
				return 'Yesterday';
			}else{
				return groupDate;
			}
			
		}else{
			return ''
		}
			
		}


		timeSince(date:any) {
			if(date){
			var messCreated = new Date(date)
				var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
				var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
				var hoursBH = hours < 10 ? "0" + hours : hours;
				var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
				var time = hoursBH + ":" + minutes  + " " + am_pm;
				return time
			
		}else{
			return ''
		}
			
		}
        threasholdMessages(allMessage:any){
             if(allMessage.length>0){
				let messageCount =0
				for(var i=0;i<allMessage.length;i++){
					var fiveMinuteAgo = new Date( Date.now() - 1000 * (60 * this.messageTimeLimit) )
					var messCreated = new Date(allMessage[i].created_at)
					if(messCreated > fiveMinuteAgo ){
						messageCount++
					}
				}
				return messageCount
			 }


		}
		getProgressBar(lastMessage:any){
            let progressbar:any=[];
			if(lastMessage){
				var date = lastMessage.created_at
				var currentDate:any = new Date()
				var messCreated:any = new Date(date)
				var seconds = Math.floor((currentDate - messCreated) / 1000);
				var interval:any = seconds / 31536000;
			
				interval = seconds / 2592000;
				interval = seconds / 86400;
				interval = seconds / 3600;
	
				var hour =parseInt(interval)
				if (hour < 48) {
					var hrPer = (100*hour)/48
					var hourLeft =48-parseInt(interval)
				}else{
					var hrPer =100
					var hourLeft =0
				}
				progressbar['progressbarPer'] = "--value:"+hrPer;
				progressbar['progressbarValue']= hourLeft;
	
				}else{
					var hrPer =100
					var hourLeft =0
					progressbar['progressbarPer'] = "--value:"+hrPer;
					progressbar['progressbarValue']= hourLeft;
				}
				return progressbar;

		}
		timeSinceLastMessage(lastMessage:any){
			if(lastMessage){
			var date = lastMessage.created_at
			var currentDate:any = new Date()
			var messCreated:any = new Date(date)
			var seconds = Math.floor((currentDate - messCreated) / 1000);
			var interval:any = seconds / 31536000;
		
			interval = seconds / 2592000;
			interval = seconds / 86400;
			interval = seconds / 3600;

			var hour =parseInt(interval)
			if (hour < 48) {
				var hrPer = (100*hour)/48
				var hourLeft =48-parseInt(interval)
			}else{
				var hrPer =100
				var hourLeft =0
				if(this.selectedInteraction['interaction_status']!=='Resolved'){
					this.updateConversationStatus('Resolved')
				}
			}
			
			//if (interval > 1) {
				var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
				var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
				var hoursBH = hours < 10 ? "0" + hours : hours;
				var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
				var time = hoursBH + ":" + minutes  + " " + am_pm;
				return time
			//}
		    }else{
				var hrPer =100
				var hourLeft =0
				return '';
			}
		}

	selectInteraction(Interaction:any){
		for(var i=0;i<this.interactionList.length;i++){
			this.interactionList[i].selected=false
		}
		Interaction['selected']=true
		this.selectedInteraction =Interaction
		//console.log(Interaction)
		this.getPausedTimer()
	}

	getPausedTimer(){
		//console.log('getPausedTimer')
		
		clearInterval(this.PauseTime);
  if(this.selectedInteraction.paused_till){
		var countDownDate = new Date(this.selectedInteraction.paused_till).getTime();
		let that =this;
		this.PauseTime = setInterval(function() {

			// Get today's date and time
			var now = new Date().getTime();
		  
			// Find the distance between now and the count down date
			var distance = countDownDate - now;
		  
			// Time calculations for days, hours, minutes and seconds
			var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		  
			// Display the result in the element with id="demo"
			that.selectedInteraction['PausedTimer'] =  minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
		  
			// If the count down is finished, write some text
			if (distance < 0) {
			  clearInterval(that.PauseTime);
			  that.selectedInteraction['PausedTimer'] = "";
			  that.selectedInteraction['AutoReplyStatus']='Auto Reply are Paused'
			}
		  }, 1000);
		}else{
			this.selectedInteraction['PausedTimer'] = "";
			this.selectedInteraction['AutoReplyStatus']='Auto Reply are Paused'
		}

	}
	
	counter(i: number) {
		return new Array(i);
	}

	filterInteraction(filterBy:any){
		this.selectedInteraction=[]
		/*
		if(filterBy != 'All'){
			this.getFilteredInteraction(filterBy)
		}else{
			this.getAllInteraction()
		}
		*/
		this.interactionFilterBy=filterBy
		this.getAllInteraction()
		this.ShowFilerOption =false

	}
	toggleFilerOption(){
		this.ShowFilerOption =!this.ShowFilerOption
	}

	toggleContactOption(){
		this.ShowContactOption =!this.ShowContactOption;
	}

	toggleChannelOption(){
		this.ShowChannelOption =!this.ShowChannelOption;
	}
	toggleGenderOption(){
		this.ShowGenderOption =!this.ShowGenderOption;
	}
	selectChannelOption(ChannelName:any){
		this.selectedChannel = ChannelName
		this.ShowChannelOption=false
	}
	hangeEditContactInuts(item:any){
		//console.log(item.target.name)
		if(item.target.name =='OptInStatus'){
			this.EditContactForm['OptInStatus'] = item.target.value
			this.EditContactForm['OptInStatusChecked'] = item.target.value?true:false
		}else{
			this.EditContactForm[item.target.name] = item.target.value
		}
		
		//this.ShowChannelOption=false

	}
	toggleLeadStatusOption(){
		this.ShowLeadStatusOption=!this.ShowLeadStatusOption;
	}
	hangeEditContactSelect(name:any,value:any){
		this.EditContactForm[name] = value
		this.ShowChannelOption=false
		this.ShowGenderOption=false
		this.ShowLeadStatusOption=false;

	}

	updateCustomer(){
		var bodyData = {
		Name:this.EditContactForm.Name,
		Phone_number:this.EditContactForm.Phone_number,
		channel:this.EditContactForm.channel,
		status:this.EditContactForm.status,
		OptInStatus:this.EditContactForm.OptInStatus,
		sex:this.EditContactForm.sex,
		age:this.EditContactForm.age,
		emailId:this.EditContactForm.emailId,
		Country:this.EditContactForm.Country,
		facebookId:this.EditContactForm.facebookId,
		InstagramId:this.EditContactForm.InstagramId,
		customerId:this.EditContactForm.customerId,
		}

		if(this.EditContactForm.OptInStatusChecked){
			bodyData['OptInStatus'] = 'Active Subscribers';
		}else{
			bodyData['OptInStatus'] = 'Disabled';
		}
		//console.log(bodyData)
		this.apiService.updatedCustomer(bodyData).subscribe(async response =>{
			this.selectedInteraction['Name']=this.EditContactForm.Name
		this.selectedInteraction['Phone_number']=this.EditContactForm.Phone_number
		this.selectedInteraction['channel']=this.EditContactForm.channel
		this.selectedInteraction['status']=this.EditContactForm.status
		this.selectedInteraction['OptInStatus']=bodyData['OptInStatus']
		this.selectedInteraction['sex']=this.EditContactForm.sex
		this.selectedInteraction['age']=this.EditContactForm.age
		this.selectedInteraction['emailId']=this.EditContactForm.emailId
		this.selectedInteraction['Country']=this.EditContactForm.Country
		this.selectedInteraction['facebookId']=this.EditContactForm.facebookId
		this.selectedInteraction['InstagramId']=this.EditContactForm.InstagramId
		
			if(this.modalReference){
				this.modalReference.close();
			}
			this.showToaster('Contact information updated...','success')
		});
	
	}


	filterContactByType(ChannelName:any){
		this.selectedChannel = ChannelName
		this.getSearchContact();
		this.ShowContactOption=false
	}
    
	toggleConversationStatusOption(){
		
		

		if(this.loginAs =='TL'){
		this.ShowConversationStatusOption =!this.ShowConversationStatusOption
		}else{
			this.showToaster('Opps you dont have permission','warning')
		}
		this.ShowAssignOption=false
	}

	toggleAssignOption(){
		this.ShowConversationStatusOption=false;
		if(this.selectedInteraction.interaction_status =='Resolved'){
			this.showToaster('Already Resolved','warning')
		}else{
		if(this.loginAs =='TL' || this.selectedInteraction.interaction_status !='Resolved'){
			this.ShowAssignOption =!this.ShowAssignOption
		}else{
			this.showToaster('Opps you dont have permission','warning')
		}
	}
	}

	showToaster(message:any,type:any){
	if(type=='success'){
		this.successMessage=message;
	}else if(type=='error'){
		this.errorMessage=message;
	}else{
		this.warningMessage=message;
	}
	setTimeout(() => {
		this.hideToaster()
	}, 5000);
	
	}
	markItRead(message:any){
	   
       if(message.message_direction!='Out' && message.is_read==0){
		var bodyData = {
			Message_id:message.Message_id
		}
		this.apiService.updateMessageRead(bodyData).subscribe(async data =>{
			let selectedInteraction =this.selectedInteraction;
			selectedInteraction['UnreadCount']=selectedInteraction['UnreadCount']>0?selectedInteraction['UnreadCount']-1:0
			this.selectedInteraction =selectedInteraction
			message.is_read=1;	
		})
	   }

	}


	getUnreadCount(messages:any){
		let unreadCount=0
		for(var i=0;i<messages.length;i++){
			if(messages[i].message_direction!='Out' && messages[i].is_read==0){
				unreadCount=unreadCount+1
			}
		}
		return unreadCount
	}

	hideToaster(){
		this.successMessage='';
		this.errorMessage='';
		this.warningMessage='';
	}
	toggleAutoReply(){
		this.AutoReplyOption =!this.AutoReplyOption
	}
    
	SelectReplyOption(optionValue:any,optionType:any){
		var LastPaused = this.selectedInteraction.paused_till
        var PTime = optionValue.match(/(\d+)/);
		let pausedTill = new Date();
		if(PTime){
		
		if(optionType =='Extend'){
		var dt1 = (new Date(LastPaused)).getTime();//Unix timestamp (in milliseconds)
		var addSec = PTime[0]*60*1000
		var dt2= new Date(dt1+addSec)
		pausedTill = new Date(dt2);
		
		}else{
		var dt1 = (new Date()).getTime();
		var addSec = PTime[0]*60*1000
		var dt2= new Date(dt1+addSec)
		pausedTill = new Date(dt2);	
		}	
	 }
	
	
		
		var bodyData = {
			AutoReply:optionValue,
			InteractionId:this.selectedInteraction.InteractionId,
			updated_at:new Date(),
			paused_till:pausedTill
		}
		this.apiService.updateInteraction(bodyData).subscribe(async response =>{
			this.selectedInteraction.AutoReplyStatus =optionValue	
			this.AutoReplyType ='Pause are '+optionType	
			this.AutoReplyOption=false;
			this.selectedInteraction['paused_till'] =pausedTill;
			this.getPausedTimer()
			this.showToaster('Pause Applied','success')
		})
		
	}

	searchContact(event:any){
		this.contactSearchKey = event.target.value;
		this.getSearchContact()
		
	}
	getSearchContact(){
		this.apiService.searchCustomer(this.selectedChannel,this.SPID,this.contactSearchKey).subscribe(data =>{
			this.contactList= data
		});
	}

	blockCustomer(selectedInteraction:any){
		var bodyData = {
			customerId:selectedInteraction.customerId,
			isBlocked:selectedInteraction.isBlocked==1?0:1
		}
		this.apiService.blockCustomer(bodyData).subscribe(ResponseData =>{
			this.selectedInteraction['isBlocked']=selectedInteraction.isBlocked==1?0:1
			if(selectedInteraction.isBlocked==1){
				this.showToaster('Conversations is Unblocked','success')
			}else{
				this.showToaster('Conversations is Blocked','success')
			}
			
		});
	}

	handelBlockConfirm(){
		if(this.modalReference){
			this.modalReference.close();
		}	
		this.blockCustomer(this.selectedInteraction)
	}
	handelStatusConfirm(){
		if(this.modalReference){
			this.modalReference.close();
		}	
		if(this.selectedInteraction['interaction_status']=='Resolved'){
			this.updateConversationStatus('Open')
		}else{
			this.updateConversationStatus('Resolved')
		}
		
	}
	handelDeleteConfirm(){
		if(this.modalReference){
			this.modalReference.close();
		}
		var bodyData = {
			AgentId:this.AgentId,
			InteractionId:this.selectedInteraction.InteractionId
		}
		this.apiService.deleteInteraction(bodyData).subscribe(async response =>{
				//console.log(response)
				this.showToaster('Conversations deleted...','success')
		});	
	}

    toggleTagsModal(updatedtags:any){
		if(this.modalReference){
			this.modalReference.close();
		}
		var activeTags = this.selectedInteraction['tags'];
		for(var i=0;i<this.tagsoptios.length;i++){
			var tagItem = this.tagsoptios[i]
			if(activeTags.indexOf(tagItem.name)>-1){
				tagItem['status']=true
				this.selectedTags += tagItem.name+','
			}
		}
     	this.modalReference = this.modalService.open(updatedtags,{ size:'ml', windowClass:'white-bg'});
	
	}
	addTags(tagName:any){
		if(tagName.target.checked){
			this.selectedTags += tagName.target.value+','
		}else{
			this.selectedTags = this.selectedTags.replace(tagName.target.value+',', "");
		}
		//console.log(this.selectedTags)
	}
	
	updateTags(){
		var bodyData = {
			tag:this.selectedTags,
			customerId:this.selectedInteraction.customerId
		}
		this.apiService.updateTags(bodyData).subscribe(async response =>{
			this.selectedInteraction['tags']=this.getTagsList(this.selectedTags)
			if(this.modalReference){
				this.modalReference.close();
			}
			this.showToaster('Tags updated...','success')

		});
	}

	triggerEditCustomer(updatecustomer:any){
		if(this.modalReference){
			this.modalReference.close();
		}
		this.EditContactForm['Name'] =this.selectedInteraction.Name
		this.EditContactForm['Phone_number'] =this.selectedInteraction.Phone_number
		this.EditContactForm['channel'] =this.selectedInteraction.channel
		this.EditContactForm['status'] =this.selectedInteraction.status
		this.EditContactForm['OptInStatus'] =this.selectedInteraction.OptInStatus
		this.EditContactForm['OptInStatusChecked'] =this.selectedInteraction.OptInStatus=='Active Subscribers'?true:false
		
		this.EditContactForm['sex'] =this.selectedInteraction.sex
		this.EditContactForm['age'] =this.selectedInteraction.age
		this.EditContactForm['emailId'] =this.selectedInteraction.emailId
		this.EditContactForm['Country'] =this.selectedInteraction.Country
		this.EditContactForm['facebookId'] =this.selectedInteraction.facebookId
		this.EditContactForm['InstagramId'] =this.selectedInteraction.InstagramId
		this.EditContactForm['customerId'] =this.selectedInteraction.customerId
		this.modalReference = this.modalService.open(updatecustomer,{ size:'lg', windowClass:'white-bg'});
	}


	triggerDeleteCustomer(openDeleteAlertmMessage:any){
		if(this.modalReference){
			this.modalReference.close();
		}
		if(this.loginAs =='TL'){
		this.confirmMessage= 'Are you sure want to Delete this conversations'
		this.modalReference = this.modalService.open(openDeleteAlertmMessage,{ size:'sm', windowClass:'white-bg'});
		}else{
		this.showToaster('Opps you dont have permission','warning')
	    }
	}
	triggerBlockCustomer(BlockStatus:any,openBlockAlertmMessage:any){
		if(this.modalReference){
			this.modalReference.close();
		}
		if(this.loginAs =='TL'){
		this.confirmMessage= 'Are you sure want to '+BlockStatus+' this conversations'
		this.modalReference = this.modalService.open(openBlockAlertmMessage,{ size:'sm', windowClass:'white-bg'});
		
	    }else{
		this.showToaster('Opps you dont have permission','warning')
	    }
	}
    triggerUpdateConversationStatus(status:any,openStatusAlertmMessage:any){
		if(this.modalReference){
			this.modalReference.close();
		}
		this.ShowConversationStatusOption=false
		if(this.selectedInteraction['interaction_status']!=status){
				if(this.modalReference){
					this.modalReference.close();
				}
				this.confirmMessage= 'Are you sure want to '+status+' this conversations'
				this.modalReference = this.modalService.open(openStatusAlertmMessage,{ size:'sm', windowClass:'white-bg'});
	   
		}
	}

	updateConversationStatus(status:any){
		var bodyData = {
			Status:status,
			InteractionId:this.selectedInteraction.InteractionId
		}
		this.apiService.updateInteraction(bodyData).subscribe(async response =>{
			this.ShowConversationStatusOption=false
			this.showToaster('Conversations updated to '+status+'...','success')
			/*
			//////This time it can not be assign to any one
			var responseData:any = response
			var bodyData = {
				InteractionId: this.selectedInteraction.InteractionId,
				AgentId: this.AgentId,
				MappedBy: this.AgentId
			}
			this.apiService.updateInteractionMapping(bodyData).subscribe(responseData =>{
			this.apiService.getInteractionMapping(this.selectedInteraction.InteractionId).subscribe(mappingList =>{
				var mapping:any  = mappingList;
				this.selectedInteraction['assignTo'] =mapping[mapping.length - 1];
			})

			});

			*/
			
			this.selectedInteraction['interaction_status']=status
		});

	}

	groupMessageByDate(messageList:any){
		const data =messageList;
		data.sort(function(a:any, b:any) {
			var dateA = new Date(a.Message_id);
			var dateB = new Date(b.Message_id);
			return dateA > dateB ? 1 : -1; 
		});


		const groups = data.reduce((groups:any, transactions:any) => {
			const date = transactions.created_at.split('T')[0];
			if (!groups[date]) {
				groups[date] = [];
			}

			groups[date].push(transactions);
			return groups;
		}, {});

		const groupArrays = Object.keys(groups).map((date) => {
		return {
			date,
			items: groups[date]
		};
		});
		return groupArrays
	}

	createCustomer(){
		this.newContact.value.SP_ID =this.SPID;
		this.newContact.value.Channel = this.selectedChannel
		var bodyData = this.newContact.value
		if(bodyData['OptedIn']){
			bodyData['OptedIn'] = 'Active Subscribers';
		}
		this.apiService.createCustomer(bodyData).subscribe(async response =>{
			var responseData:any = response
			var insertId:any = responseData.insertId
			if(insertId){
				this.createInteraction(insertId)
			}
		});
	}


	


	createInteraction(customerId:any){
	var bodyData = {
		customerId: customerId
	}
	this.apiService.createInteraction(bodyData).subscribe(async data =>{
		var responseData:any = data
		var insertId:any = responseData.insertId
		if(insertId){
			this.getAllInteraction(false)
		}
		if(this.modalReference){
			this.modalReference.close();
		}
		
	});


	}

	updateInteractionMapping(InteractionId:any,AgentId:any,MappedBy:any){
		this.ShowAssignOption=false;
		var bodyData = {
			InteractionId: InteractionId,
			AgentId: AgentId,
			MappedBy: MappedBy
		}
		this.apiService.resetInteractionMapping(bodyData).subscribe(responseData1 =>{
			this.apiService.updateInteractionMapping(bodyData).subscribe(responseData =>{
				this.apiService.getInteractionMapping(InteractionId).subscribe(mappingList =>{
					var mapping:any  = mappingList;
					this.selectedInteraction['assignTo'] =mapping?mapping[mapping.length - 1]:'';
				})
			
			});
	  });
	}


	openaddMessage(messageadd: any) {
		if(this.modalReference){
		this.modalReference.close();
		}
		this.modalReference = this.modalService.open(messageadd,{windowClass:'teambox-pink'});
	}

	openaddMediaGallery(mediagallery:any, slideIndex:any) {
		if(this.modalReference){
		this.modalReference.close();
		}
		this.slideIndex =slideIndex
		this.modalReference = this.modalService.open(mediagallery,{windowClass:'teambox-transparent'});
	}

	showNextSlides(n:any) {
		let slides = document.getElementsByClassName("mySlides");
		if(n < slides.length){
			this.slideIndex = n+1
		}
		
	} 
	showPrevSlides(n:any) {
		if(n>0){
			this.slideIndex = n-1
		}
	} 


	openadd(contactadd: any) {
		if(this.modalReference){
			this.modalReference.close();
		}
		this.modalReference  = this.modalService.open(contactadd,{windowClass:'teambox-white'});
	}

	toggleNoteOption(note:any){
		//console.log(note)
		this.hideNoteOption()
		if(note && this.selectedNote.Message_id != note.Message_id){
		note.selected=true
		this.selectedNote= note
		}else{
			note.selected=false
			this.selectedNote= []
		
		}
		
	}
	hideNoteOption(){
		this.selectedNote.selected=false
		
	}
	editNotes(){
		this.hideNoteOption()
		this.chatEditor.value = this.selectedNote.message_text
		this.newMessage.reset({
			Message_id: this.selectedNote.Message_id
		});
		
	}
	
	deleteNotes(){
		this.hideNoteOption()
		var bodyData = {
			Message_id:this.selectedNote.Message_id,
			deleted:1,
			deleted_by:this.AgentId,
			deleted_at:new Date()
		}
		////console.log(bodyData)
		this.apiService.deleteMessage(bodyData).subscribe(async data =>{
			//console.log(data)
			this.selectedNote.is_deleted=1
			this.selectedNote.deleted_by=this.selectedNote.AgentName
		})
		

	}

	sendMessage(){
		
		//console.log('sendMessage'+this.SIPthreasholdMessages)
		
		if(this.SIPthreasholdMessages>0){
		let objectDate = new Date();
		var cMonth = String(objectDate.getMonth() + 1).padStart(2, '0');
		var cDay = String(objectDate.getDate()).padStart(2, '0');
		var createdAt = objectDate.getFullYear()+'-'+cMonth+'-'+cDay+'T'+objectDate.getHours()+':'+objectDate.getMinutes()+':'+objectDate.getSeconds()

		var bodyData = {
			InteractionId: this.selectedInteraction.InteractionId,
			SPID:this.SPID,
			AgentId: this.AgentId,
			messageTo:this.selectedInteraction.Phone_number,
			message_text: this.chatEditor.value,
			Message_id:this.newMessage.value.Message_id,
			message_media: this.messageMeidaFile,
			media_type: this.mediaType,
			quick_reply_id: '',
			template_id:'',
			message_type: this.showChatNotes,
			created_at:new Date()
		}
		this.apiService.sendNewMessage(bodyData).subscribe(async data =>{
			this.SIPthreasholdMessages=this.SIPthreasholdMessages-1
			//console.log(data)
			this.messageMeidaFile='';
			this.mediaType='';
			var responseData:any = data
			if(this.newMessage.value.Message_id==''){
			
			var insertId:any = responseData.insertId
			if(insertId){
				var lastMessage ={
					"interaction_id": bodyData.InteractionId,
					"Message_id": insertId,
					"message_direction": "Out",
					"Agent_id": bodyData.AgentId,
					"message_text": bodyData.message_text,
					"message_media": bodyData.message_media,
					"media_type": bodyData.media_type,
					"Message_template_id": bodyData.message_media,
					"Quick_reply_id": bodyData.message_media,
					"Type": bodyData.message_media,
					"ExternalMessageId": bodyData.message_media,
					"created_at": createdAt
				}
				
				if(this.showChatNotes=='text'){
					var allmessages =this.selectedInteraction.allmessages
					this.selectedInteraction.lastMessage= lastMessage
					allmessages.push(lastMessage)
					this.selectedInteraction.messageList =this.groupMessageByDate(allmessages)
					setTimeout(() => {
						this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
					}, 500);

				}else{
					var allnotes =this.selectedInteraction.allnotes
					allnotes.push(lastMessage)
					this.selectedInteraction.notesList =this.groupMessageByDate(allnotes)
					setTimeout(() => {
						this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
					}, 500);

				
				}
				this.chatEditor.value ='Your message...';
			}


			}else{
				this.selectedNote.message_text= bodyData.message_text
			}
			

			this.newMessage.reset({
				Message_id: ''
			});


		});
		}else{
			this.showToaster('Oops! SIP message limit exceed please wait for 5min...','warning')
		}
	}


	}

