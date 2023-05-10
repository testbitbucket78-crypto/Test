	import { Component,AfterViewInit, OnInit,ViewChild, ElementRef,HostListener  } from '@angular/core';

	import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
	import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
	import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
	import { TeamboxService } from './../../services';

	import { ToolbarService,NodeSelection, LinkService, ImageService } from '@syncfusion/ej2-angular-richtexteditor';
	import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';

	@Component({
	selector: 'sb-teambox',
	templateUrl: './teambox.component.html',
	styleUrls: ['./teambox.component.scss'],
	providers: [ToolbarService, LinkService, ImageService, HtmlEditorService]
	})

	export class TeamboxComponent implements  OnInit {
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
			
		

		public SavedMessageList: { [key: string]: Object }[] = [
			{ id:1,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:2,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:3,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:4,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:5,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
			{ id:6,content: '<span style="color: #6149CD;"><b>Adipiscing elit, sed do Adipiscing elit, sed do</b></span><br>Fonsectetur adipiscing elit, sed do eiusmod tempor<br><b>sit amet, consectetur adipiscing elit,</b><br>sed doeiusmod tempor incididunt ut labore et'},
		];
		

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
		showInsertTemplate:any=false;
		showAttachmenOption:any=false;
		slideIndex=0;
		
	
		active = 1;
		SPID=2;
		TeamLeadId=6;
		AgentId=6;
		loginAs='TL'
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
		agentsList:any = [];
		progressbarPer:any = "--value:0";
		progressbarValue:any = "0";
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
		newMessage:any;
		interactionFilterBy:any='All'
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
		
		
		

		constructor(private http: HttpClient,private apiService: TeamboxService,config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder) {
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
			this.newMessage =fb.group({
				Message_id:new FormControl(''),
			});

		}

		toggleChatNotes(optionvalue:any){
			
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
			this.showChatNotes=optionvalue
			setTimeout(() => {
				this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
				this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
			}, 100);
		}

		closeAllModal(){
		this.editTemplate=false
		this.showInsertTemplate=false;
		this.showAttributes=false;
		this.showSavedMessage=false;
		this.showQuickResponse=false;
		this.showAttachmenOption=false;
		this.showEditTemplateMedia=false;
		this.TemplatePreview=false;
		this.showMention=false;
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
		this.showMention=!this.showMention
		this.showSavedMessage =false
		this.showEmoji =false;
		this.showAttachmenOption=false;
		this.showAttributes=false;
		this.showQuickResponse=false;
		this.showInsertTemplate=false;
		
	}
	public InsertMentionOption(user:any){
		let content:any = this.chatEditor.value;
		content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
		content = content+'<span class="mention"> @'+user.name+' </span>'
		this.chatEditor.value = content
		this.showMention = false;
	}
	ToggleSavedMessageOption(){
		
		this.showSavedMessage =!this.showSavedMessage
		this.showEmoji =false;
		this.showAttachmenOption=false;
		this.showAttributes=false;
		this.showQuickResponse=false;
		this.showInsertTemplate=false;
		this.showMention=false;

	}
	ToggleInsertTemplateOption(){
		this.showEmoji =false;
		this.showAttachmenOption=false;
		this.showAttributes=false;
		this.showQuickResponse=false;
		this.showSavedMessage=false;
		this.editTemplate=false
		this.showMention=false;
		this.showInsertTemplate =!this.showInsertTemplate
	}

	ToggleAttributesOption(){
		this.showEmoji =false;
		this.showAttachmenOption=false;
		this.showQuickResponse=false;
		this.showSavedMessage=false;
		this.showInsertTemplate=false;
		this.showMention=false;
		this.showAttributes = !this.showAttributes;
	}	
	ToggleQuickReplies(){
		this.showEmoji =false;
		this.showAttachmenOption=false;
		this.showAttributes=false;
		this.showSavedMessage=false;
		this.showInsertTemplate=false;
		this.showMention=false;
		this.showQuickResponse = !this.showQuickResponse;
	}

	selectQuickReplies(item:any){
		this.showEmoji =false;
		this.showAttachmenOption=false;
		this.showAttributes=false;
		this.showSavedMessage=false;
		this.showInsertTemplate=false;
		this.showQuickResponse = false;
		this.showMention=false;
		this.chatEditor.value =item
	}
		
	toggleEmoji(){
		this.showAttachmenOption=false;
		this.showAttributes=false;
		this.showQuickResponse=false;
		this.showSavedMessage=false;
		this.showInsertTemplate=false;
		this.showMention=false;
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
		this.showEmoji =false;
		this.showAttributes=false;
		this.showQuickResponse=false;
		this.showSavedMessage=false;
		this.showInsertTemplate=false;

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
			this.getAgents()
			this.getAllInteraction()
			this.getCustomers()
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
			this.showFullProfile = !this.showFullProfile
		}
		toggleAttachedMediaView(){
			this.showAttachedMedia = !this.showAttachedMedia
		}

		updateOptedIn(event:any){
			this.OptedIn= event.target.checked
			this.newContact.value.OptedIn = event.target.checked
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
			
			dataList.forEach((item:any) => {
			
			item['tags'] = this.getTagsList(item.tag)
			
			this.apiService.getAllMessageByInteractionId(item.InteractionId,'text').subscribe(messageList =>{
				item['messageList'] =messageList?this.groupMessageByDate(messageList):[]
				item['allmessages'] =messageList?messageList:[]

				var lastMessage = item['allmessages']?item['allmessages'][item['allmessages'].length - 1]:[];
				item['lastMessage'] = lastMessage
				item['lastMessageReceved']= this.timeSinceLastMessage(item.lastMessage)
				item['UnreadCount']= this.getUnreadCount(item.allmessages)
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

		async getFilteredInteraction(filterBy:any){
			await this.apiService.getFilteredInteraction(filterBy,this.AgentId).subscribe(async data =>{
				var dataList:any = data;
				this.getAssicatedInteractionData(dataList)
			});
		}
		
		async getAllInteraction(selectInteraction:any=true){
			await this.apiService.getAllInteraction().subscribe(async data =>{
				var dataList:any = data;
				this.getAssicatedInteractionData(dataList,selectInteraction)
			});

		}
		async getSearchInteraction(event:any,selectInteraction:any=true){
		this.selectedInteraction=[]
		if(event.target.value.length>=3){
			var searchKey =event.target.value
			await this.apiService.getSearchInteraction(searchKey,this.AgentId).subscribe(async data =>{
				var dataList:any = data;
				this.getAssicatedInteractionData(dataList,selectInteraction)
			});
		}else{
			await this.apiService.getAllInteraction().subscribe(async data =>{
				var dataList:any = data;
				this.getAssicatedInteractionData(dataList,selectInteraction)
			});

		}

		}

		async seacrhInChat(event:any,selectInteraction:any=true){
			console.log('seacrhInChat')

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
			this.progressbarPer = "--value:"+hrPer;
			this.progressbarValue= hourLeft;

			if (interval > 1) {
				var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
				var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
				var hoursBH = hours < 10 ? "0" + hours : hours;
				var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
				var time = hoursBH + ":" + minutes  + " " + am_pm;
				return time
			}
		    }else{
				var hrPer =100
				var hourLeft =0
				this.progressbarPer = "--value:"+hrPer;
			    this.progressbarValue= hourLeft;
				return '';
			}
		}

	selectInteraction(Interaction:any){
		for(var i=0;i<this.interactionList.length;i++){
			this.interactionList[i].selected=false
		}
		Interaction['selected']=true
		this.selectedInteraction =Interaction
	}
	
	counter(i: number) {
		return new Array(i);
	}

	filerInteraction(filterBy:any){
		this.selectedInteraction=[]
		if(filterBy != 'All'){
			this.getFilteredInteraction(filterBy)
		}else{
			this.getAllInteraction()
		}

		this.interactionFilterBy=filterBy
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
	selectChannelOption(ChannelName:any){
		this.selectedChannel = ChannelName
		
		this.ShowChannelOption=false
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
			this.showToaster('Opps you dont have permission','')
		}
		this.ShowAssignOption=false
	}

	toggleAssignOption(){
		this.ShowConversationStatusOption=false;
		if(this.selectedInteraction.interaction_status =='Resolved'){
			this.showToaster('Already Resolved','')
		}else{
		if(this.loginAs =='TL'){
			this.ShowAssignOption =!this.ShowAssignOption
		}else{
			this.showToaster('Opps you dont have permission','')
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

		var bodyData = {
			AutoReply:optionValue,
			InteractionId:this.selectedInteraction.InteractionId
		}
		this.apiService.updateInteraction(bodyData).subscribe(async response =>{
			this.selectedInteraction.AutoReplyStatus =optionValue	
			this.AutoReplyType ='Pause are '+optionType	
			this.AutoReplyOption=false;
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
			isBlocked:1
		}
		this.apiService.blockCustomer(bodyData).subscribe(ResponseData =>{
			this.selectedInteraction['isBlocked']=1
			this.showToaster('Account is blocked','success')
		});
	}


	updateConversationStatus(status:any){
		var bodyData = {
			Status:status,
			InteractionId:this.selectedInteraction.InteractionId
		}
		this.apiService.updateInteraction(bodyData).subscribe(async response =>{
			this.ShowConversationStatusOption=false
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
		this.apiService.updateInteractionMapping(bodyData).subscribe(responseData =>{
			//this.getAllInteraction()
			this.apiService.getInteractionMapping(InteractionId).subscribe(mappingList =>{
				var mapping:any  = mappingList;
				this.selectedInteraction['assignTo'] =mapping?mapping[mapping.length - 1]:'';
			})

			//console.log(this.selectedInteraction['assignTo'])
		
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
		this.hideNoteOption()
		if(note){
		note.selected=true
		this.selectedNote= note
		}else{
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
		//console.log(bodyData)
		this.apiService.deleteMessage(bodyData).subscribe(async data =>{
			console.log(data)
			this.selectedNote.is_deleted=1
			this.selectedNote.deleted_by=this.selectedNote.AgentName
		})
		

	}

	sendMessage(){
		
		console.log('sendMessage')
		
		
		let objectDate = new Date();
		var cMonth = String(objectDate.getMonth() + 1).padStart(2, '0');
		var cDay = String(objectDate.getDate()).padStart(2, '0');
		var createdAt = objectDate.getFullYear()+'-'+cMonth+'-'+cDay+'T'+objectDate.getHours()+':'+objectDate.getMinutes()+':'+objectDate.getSeconds()

		var bodyData = {
			InteractionId: this.selectedInteraction.InteractionId,
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
			console.log(data)
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
		

	}


	}

