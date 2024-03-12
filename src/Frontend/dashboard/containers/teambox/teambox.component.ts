import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder,FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamboxService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { WebsocketService } from '../../services/websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ToolbarService,NodeSelection, LinkService, ImageService, EmojiPickerService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
import { debounceTime } from 'rxjs/operators';

declare var $: any;
@Component({
selector: 'sb-teambox',
templateUrl: './teambox.component.html',
styleUrls: ['./teambox.component.scss'],
providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService]
})

export class TeamboxComponent implements  OnInit {

	private socket$: WebSocketSubject<any> = new WebSocketSubject('wss://notify.stacknize.com/');

	incomingMessage: string = '';

	//******* Router Guard  *********//
routerGuard = () => {
	if (sessionStorage.getItem('SP_ID') === null) {
		this.router.navigate(['login']);
	}
}


	@ViewChild('notesSection') notesSection: ElementRef | any; 
	@ViewChild('chatSection') chatSection: ElementRef | any; 
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
		
	public tools: object = {
		items: [
			
			'Bold', 'Italic', 'StrikeThrough','EmojiPicker',
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
			tooltipText: 'Quick Response',
			undo: true,
			click: this.ToggleQuickReplies.bind(this),
			template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/quick-replies.svg"></div></button>'
		},
		{
			tooltipText: 'Insert Template',
			undo: true,
			click: this.ToggleInsertTemplateOption.bind(this),
			template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/insert-temp.svg"></div></button>'
		}]
	};

			countryCodes = [
			'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
			'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
			'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
			'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
			'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
			'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1767', 'DO +1809', 'DZ +213',
			'EC +593', 'EE +372', 'EG +20', 'EH +212', 'ER +291', 'ES +34', 'ET +251', 'FI +358', 'FJ +679', 'FK +500',
			'FM +691', 'FO +298', 'FR +33', 'GA +241', 'GB +44', 'GD +1473', 'GE +995', 'GF +594', 'GG +44', 'GH +233',
			'GI +350', 'GL +299', 'GM +220', 'GN +224', 'GP +590', 'GQ +240', 'GR +30', 'GS +500', 'GT +502', 'GU +1671',
			'GW +245', 'GY +592', 'HK +852', 'HN +504', 'HR +385', 'HT +509', 'HU +36', 'ID +62', 'IE +353', 'IL +972',
			'IM +44', 'IN +91', 'IO +246', 'IQ +964', 'IR +98', 'IS +354', 'IT +39', 'JE +44', 'JM +1876', 'JO +962',
			'JP +81', 'KE +254', 'KG +996', 'KH +855', 'KI +686', 'KM +269', 'KN +1869', 'KP +850', 'KR +82', 'KW +965',
			'KY +1345', 'KZ +7', 'LA +856', 'LB +961', 'LC +1758', 'LI +423', 'LK +94', 'LR +231', 'LS +266', 'LT +370',
			'LU +352', 'LV +371', 'LY +218', 'MA +212', 'MC +377', 'MD +373', 'ME +382', 'MF +590', 'MG +261', 'MH +692',
			'MK +389', 'ML +223', 'MM +95', 'MN +976', 'MO +853', 'MP +1 670', 'MQ +596', 'MR +222', 'MS +1 664', 'MT +356',
			'MU +230', 'MV +960', 'MW +265', 'MX +52', 'MY +60', 'MZ +258', 'NA +264', 'NC +687', 'NE +227', 'NF +672',
			'NG +234', 'NI +505', 'NL +31', 'NO +47', 'NP +977', 'NR +674', 'NU +683', 'NZ +64', 'OM +968', 'PA +507',
			'PE +51', 'PF +689', 'PG +675', 'PH +63', 'PK +92', 'PL +48', 'PM +508', 'PN +872', 'PR +1 787', 'PS +970',
			'PT +351', 'PW +680', 'PY +595', 'QA +974', 'RE +262', 'RO +40', 'RS +381', 'RU +7', 'RW +250', 'SA +966',
			'SB +677', 'SC +248', 'SD +249', 'SE +46', 'SG +65', 'SH +290', 'SI +386', 'SJ +47', 'SK +421', 'SL +232',
			'SM +378', 'SN +221', 'SO +252', 'SR +597', 'SS +211', 'ST +239', 'SV +503', 'SX +1721', 'SY +963', 'SZ +268',
			'TC +1649', 'TD +235', 'TF +262', 'TG +228', 'TH +66', 'TJ +992', 'TK +690', 'TL +670', 'TM +993', 'TN +216',
			'TO +676', 'TR +90', 'TT +1868', 'TV +688', 'TW +886', 'TZ +255', 'UA +380', 'UG +256', 'US +1', 'UY +598',
			'UZ +998', 'VA +39', 'VC +1784', 'VE +58', 'VG +1284', 'VI +1340', 'VN +84', 'VU +678', 'WF +681', 'WS +685',
			'YE +967', 'YT +262', 'ZA +27', 'ZM +260', 'ZW +263'
			];

	// custommesage='<p>Your message...</p>'
	// customenotes='<p>Type...</p>'
	showQuickResponse:any=false;
	showAttributes:any=false;
	showQuickReply:any=false;
	showInsertTemplate:any=true;
	showAttachmenOption:any=false;
	slideIndex=0;
	PauseTime:any='';
	confirmMessage:any;
	messagesAll:string[] = [];
	messagesRead:string[] = [];
	newMessagesNumber:number = 0;
	active = 1;
	showTopNav: boolean = true;
	SPID = sessionStorage.getItem('SP_ID')
	TeamLeadId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
	AgentId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
	AgentName = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name
	loginAs = (JSON.parse(sessionStorage.getItem('loginDetails')!)).UserType
	spNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number
	messageTimeLimit=10;
	SIPmaxMessageLimt=100;
	SIPthreasholdMessages=1;
	showFullProfile=false;
	showAttachedMedia=false;
	showattachmentbox=false;
	ShowFilerOption=false;
	ShowContactOption=false;
    showfilter=false;
	AutoReplyOption=false;
	ShowConversationStatusOption=false;
	ShowAssignOption=false;
	selectedInteraction:any = [];
	selectedNote:any=[];
	contactList:any = [];
    contactId:number = 0;
	interactionList:any = [];
	interactionListMain:any=[];
	selectedTemplate:any  = [];
	agentsList:any = [];
	modalReference: any;
	OptedIn='No';
	searchFocused=false;
	searchChatFocused=false;
	errorMessage='';
	successMessage='';
	warningMessage='';
	showChatNotes='text';
	message_text='';
	selectedChannel:any=['WhatsApp Web'];
	contactSearchKey:any='';
	ShowChannelOption:any=false;
	CountryCode!:any;
	selectedCountryCode!:string;
	newContact: FormGroup;
	editContact: FormGroup;
	ShowGenderOption:any=false;
	ShowLeadStatusOption:any=false;
	attributesearch!:string;
	quickreplysearch!:string;
	templatesearchreply!:string;
	header!:string;
	messageStatus:any;
	Messageid:any;
	messageStatusMap: Map<number, string> = new Map<number, string>();
	Allmessages:any=[];
	Messagedirection:any;
	Interaction:any
	items: any[] = [];
	newMessage:any;
	interactionFilterBy:any='All'
	interactionSearchKey:any=''
	tagsoptios:any=[];
	selectedTags:any='';
	AutoReplyEnableOption:any=['Extend Pause for 5 mins','Extend Pause for 10 mins','Extend Pause for 15 mins','Extend Pause for 20 mins','Enable'];
	AutoReplyPauseOption:any=['Pause for 5 mins','Pause for 10 mins','Pause for 15 mins','Pause for 20 mins','Auto Reply are Paused','Enable'];
	AutoReply:any='';
	AutoReplyType:any= '';
	dragAreaClass: string='';
	editTemplate:any=false;
	showEditTemplateMedia:any=false;
	TemplatePreview:any=false;
	messageMeidaFile:any='';
	mediaType:any='';
	showMention:any=false;
	NewContactForm:any=[];
	EditContactForm:any=[];
	QuickReplyList:any=[];
	QuickReplyListMain:any=[];
	allTemplates:any=[];
	allTemplatesMain:any=[];
	filterTemplateOption:any='';
	attributesList:any=[];
    showFullMessage: boolean = false;
	maxLength: number = 150;
	allmessages:any=[];
	mediaSize: any;
	hourLeft:number = 0;
	userList:any;
	allVariablesList:string[] =[];
	selected:boolean=false;

	constructor(private http: HttpClient,private apiService: TeamboxService ,private settingService: SettingsService, config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder,private elementRef: ElementRef,private renderer: Renderer2, private router: Router,private websocketService: WebsocketService) {
		
		// customize default values of modals used by this component tree

		config.backdrop = 'static';
		config.keyboard = false;
		config.windowClass= 'teambox-pink';

		this.newContact= fb.group({
			SP_ID: new FormControl(''),
			Name: new FormControl('', [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern('^(?:[a-zA-Z.0-9]+|(?:a to z))(?: [a-zA-Z0-9]+)*$')]),
			country_code:new FormControl('IN +91',{ nonNullable: true }),
			Phone_number: new FormControl(''),
			displayPhoneNumber: new FormControl('',[Validators.pattern('^[0-9]+$'),Validators.required,Validators.minLength(6),Validators.maxLength(15)])
		});
		this.editContact=fb.group({
			customerId: new FormControl(''),
			Name: new FormControl('', [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern('^(?:[a-zA-Z.0-9]+|(?:a to z))(?: [a-zA-Z0-9]+)*$')]),
			country_code: new FormControl(''),
			displayPhoneNumber: new FormControl('',[Validators.pattern('^[0-9]+$'),Validators.required,Validators.minLength(6),Validators.maxLength(15)]),
			Phone_number: new FormControl(''),
			emailId: new FormControl('', [Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'),Validators.minLength(5),Validators.maxLength(50)]),
			ContactOwner : new FormControl('',Validators.required),
			channel: new FormControl(''),
			OptInStatus: new FormControl('')
		});
		
		this.newMessage =fb.group({
			Message_id:new FormControl(''),
		});
		

	}
	selectTemplate(template:any){
		this.selectedTemplate = template
	}

	// resetMessageTex(){
	// 	// Prevent the default behavior to avoid losing focus
		
	// 	// Get the current content of the editor
	// 	const editorContent = this.chatEditor.value;
	// 		if(this.chatEditor.value == '<p>Your message...</p>' || this.chatEditor.value =='<p>Type…</p>'){
	// 			this.chatEditor.value='';
	// 		}
	// 	}
	
	
	// handleKeyPress(event: KeyboardEvent) {
		
	// 	// Check if the pressed key is "Enter"
	// 	if (event.key === 'Enter' && !event.shiftKey) {
	// 		// Prevent sending the message when Enter is pressed without Shift
			
	// 		event.preventDefault();
	// 		this.sendMessage(); // Call your send message function here
	// 	  }
	//   }

	toggleChatNotes(optionvalue:any){
		if(this.chatEditor){
		if(optionvalue == 'text'){
			this.chatEditor.value = '';
			this.tools = {
				items: ['Bold', 'Italic','StrikeThrough','EmojiPicker',
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
					tooltipText: 'Insert Template',
					undo: true,
					click: this.ToggleInsertTemplateOption.bind(this),
					template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
							+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/insert-temp.svg"></div></button>'
				}]
			};

		}else{
			 this.chatEditor.value = '';
			this.tools = {
				items: ['Bold', 'Italic', 'StrikeThrough','EmojiPicker',
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
		this.modalReference?.close();
		this.showAttachmenOption=false
		this.messageMeidaFile=false
		this.showAttributes=false
		this.editTemplate=false
		this.TemplatePreview=false
		this.showQuickReply=false
		this.showMention=false
		this.attributesearch ='';
		this.header ='';
		this.quickreplysearch='';
		$("#editTemplateMedia").modal('hide');
		$("#templatePreview").modal('hide');
		$("#quikpopup").modal('hide');
		$("#atrributemodal").modal('hide');
		$("#insertmodal").modal('hide');
		$("#editTemplate").modal('hide');
		$("#attachfle").modal('hide');
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();

	}	
	editMedia(){
		$("#editTemplate").modal('hide');
		$("#templatePreview").modal('hide');  
		$("#editTemplateMedia").modal('show'); 
	}
	closeEditMedia() {
		$("#editTemplate").modal('show'); 
		$("#editTemplateMedia").modal('hide'); 
	}
	cancelEditTemplateMedia(){
		this.closeAllModal()
	}
	updateEditTemplateMedia(){
		$("#editTemplate").modal('show'); 
		$("#editTemplateMedia").modal('hide'); 
	}
	showTemplatePreview(){
		$("#editTemplate").modal('hide'); 
		$("#templatePreview").modal('show'); 
	}
	insertTemplate(item:any){
		this.closeAllModal()
		let mediaContent
		if(item.media_type === 'image') {
		  mediaContent ='<p><img style="width:50%; height:50%" src="'+item.Links+'"></p>'
		}
		else if(item.media_type === 'video') {
			mediaContent ='<p><video style="width:50%; height:50%" src="'+item.Links+'"></video></p>'
		}
		else {
			mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
		}
		var htmlcontent = mediaContent +'<p><span style="color: #6149CD;"><b>'+item.Header+'</b></span><br>'+item.BodyText+'<br>'+item.FooterText+'<br></p>';
		this.chatEditor.value =htmlcontent
	}

showeditTemplate(){
	if(this.selectedTemplate.BodyText !== '' ) {
		$("#editTemplate").modal('show'); 
		$("#insertmodal").modal('hide'); 
		this.previewTemplate();
	}
	else {
		this.showToaster('! Please Select Any Template To Proceed','error');
	}

}	
ToggleShowMentionOption(){
	this.closeAllModal()
	this.showMention=!this.showMention
}
InsertMentionOption(user:any){
	let content:any = this.chatEditor.value || '';
	content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
	content = content+'<span class="mention"> @'+user.name+' </span>'
	this.chatEditor.value = content;
	this.showMention = false;
	this.selectInteraction(this.selectedInteraction)
}

ToggleInsertTemplateOption(){
	$("#insertmodal").modal('show'); 
	}

ToggleAttributesOption(){
	this.closeAllModal()
	$("#atrributemodal").modal('show'); 

}
selectAttributes(item:any) {
	this.closeAllModal();
	const selectedValue = item;
	let content:any = this.chatEditor.value || '';
	content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
	content = content+'<span style="color:#000">{{'+selectedValue+'}}</span>'
	this.chatEditor.value = content;
}

ToggleQuickReplies(){
	this.closeAllModal()
	this.getQuickResponse();
	$("#quikpopup").modal('show'); 
}


selectQuickReplies(item:any){
	this.closeAllModal()
	let mediaContent
	if(item.media_type === 'image') {
	  mediaContent ='<p><img style="width:50%; height:50%" src="'+item.Links+'"></p>'
	}
	else if(item.media_type === 'video') {
		mediaContent ='<p><video style="width:50%; height:50%" src="'+item.Links+'"></video></p>'
	}
	else {
		mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
	}
	var htmlcontent = mediaContent +'<p><span style="color: #6149CD;"><b>'+item.Header+'</b></span><br>'+item.BodyText+'<br>'+item.FooterText+'<br></p>';
	this.chatEditor.value =htmlcontent

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
	var allList = this.allTemplatesMain
	let FilteredArray: any[] = [];
	for(var i=0;i<allList.length;i++){
		var content = allList[i].TemplateName.toLowerCase()
			if(content.indexOf(searchKey.toLowerCase()) !== -1){
				FilteredArray.push(allList[i])
			}
	}
	this.allTemplates = FilteredArray
	}else{
		this.allTemplates = this.allTemplatesMain
	}
}


filterTemplate(temType:any){

	let allList  =this.allTemplatesMain;
	if(temType.target.checked){
	var type= temType.target.value;
	for(var i=0;i<allList.length;i++){
			if(allList[i]['Category'] == type){
				allList[i]['isDeleted']=1
			}
	}
   }else{
	var type= temType.target.value;
	for(var i=0;i<allList.length;i++){
			if(allList[i]['Category'] == type){
				allList[i]['isDeleted']=0
			}
	}
   }
	var newArray=[];
   for(var m=0;m<allList.length;m++){
	  if(allList[m]['isDeleted']==1){
		newArray.push(allList[m])
	  }

   }
   this.allTemplates= newArray

	
}

  public async onInsert(item: any) {
	
	this.range = this.selection.getRange(document); 
	this.saveSelection.restore();
	const emojiText = item.target.textContent;
	await this.chatEditor.executeCommand('insertHTML', emojiText);
	this.saveSelection = this.selection.save(this.range, document); 
	this.chatEditor.formatter.saveData();
	this.chatEditor.formatter.enableUndo(this.chatEditor);
	
  }

  actionCompleteHandler(e: any): void {
	if (e.requestType === 'SourceCode') {
	this.chatEditor.getToolbar().querySelector('#custom_tbar').parentElement.classList.add('e-overlay');
	} else if (e.requestType === 'Preview') {
	this.chatEditor.getToolbar().querySelector('#custom_tbar').parentElement.classList.remove('e-overlay');
	}
}
  onclickInsert(){
	console.log(this.chatEditor.contentModule.getEditPanel() as HTMLElement);
	(this.chatEditor.contentModule.getEditPanel() as HTMLElement).focus();
            // this.dialogObj.element.style.display = '';
            this.range = this.selection.getRange(document);
            this.saveSelection = this.selection.save(this.range, document);
            // this.dialogObj.show();
  }
  
  private moveToEndOfEditor() {
	const editor = this.chatEditor.contentModule.getDocument();
	const range = editor.createRange();
  
	// Set the range to the end of the editor content
	range.selectNodeContents(editor.body);
	range.collapse(false);
  
	// Update the selection with the new range
	const selection = editor.defaultView.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
  }
  
ToggleAttachmentBox(){
	this.closeAllModal()
	$("#attachfle").modal('show'); 
document.getElementById('attachfle')!.style.display = 'inherit';
	this.dragAreaClass = "dragarea";
	
}
sendattachfile(){
		if(this.messageMeidaFile!==''){
			$("#sendfile").modal('show');	
		}else{
			$("#sendfile").modal('hide');	
		}
	}
	
	sendMediaMessage() {

		if(this.SIPthreasholdMessages>0){
		let objectDate = new Date();
		var cMonth = String(objectDate.getMonth() + 1).padStart(2, '0');
		var cDay = String(objectDate.getDate()).padStart(2, '0');
		var createdAt = objectDate.getFullYear()+'-'+cMonth+'-'+cDay+'T'+objectDate.getHours()+':'+objectDate.getMinutes()+':'+objectDate.getSeconds()

		var bodyData = {
			InteractionId: this.selectedInteraction.InteractionId,
			CustomerId: this.selectedInteraction.customerId,
			SPID:this.SPID,
			AgentId: this.AgentId,
			messageTo:this.selectedInteraction.Phone_number,
			message_text: this.chatEditor.value || "",
			Message_id:this.newMessage.value.Message_id,
			mediaSize:this.mediaSize,
			message_media: this.messageMeidaFile,
			media_type: this.mediaType,
			quick_reply_id: '',
			template_id:'',
			message_type: this.showChatNotes,
			created_at:new Date()
		}

		let input = {
			spid: this.SPID,
		};
		this.settingService.clientAuthenticated(input).subscribe(response => {

			if (response.status === 404) {
				this.showToaster('Oops You\'re not Authenticated ,Please go to Account Settings and Scan QR code first to link your device.','warning')
				return;
			}

			if (response.status === 200 && response.message === 'Client is ready !') {
				this.apiService.sendNewMessage(bodyData).subscribe(async data => {
					var responseData:any = data
					// if (responseData.middlewareresult.status === '401') {
					// 	this.showToaster('Oops You\'re not Authenticated ,Please go to Account Settings and Scan QR code first to link your device.','warning')
					// 	return;
					// };
					// if(responseData.middlewareresult.status === '200') {
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
									"created_at": createdAt,
									"mediaSize":bodyData.mediaSize
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
								this.chatEditor.value ='';
								this.messageMeidaFile='';
								this.mediaType='';
								this.SIPthreasholdMessages=this.SIPthreasholdMessages-1
							}
				
				
							}else{
								this.selectedNote.message_text= bodyData.message_text
							}
							
				
							this.newMessage.reset({
								Message_id: ''
							});
					// }
				});
			}
		});
	}else{
		this.showToaster('Oops! CIP message limit exceed please wait for 5 min...','warning')
	}
		// this.sendMessage()
        this.closeAllModal();
		$("#sendfile").modal('hide');	
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
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
		let spid = this.SPID
		this.mediaType = files[0].type
		const data = new FormData();
		data.append('dataFile',imageFile ,imageFile.name);
		let name='teambox'
			this.apiService.uploadfile(data,spid,name).subscribe(uploadStatus => {
			let responseData:any = uploadStatus
			if(responseData.filename){
				this.messageMeidaFile = responseData.filename
				this.mediaSize=responseData.fileSize
				console.log(this.mediaSize);
				this.sendattachfile();
				console.log(this.messageMeidaFile);
				this.showAttachmenOption=false;
			}

			});
		  };	
	}
			
	ngOnInit() {
		switch(this.loginAs) {
			case 1:
				this.loginAs='Admin'
				break;
			case 2:
				this.loginAs='Manager'
				break;
			case 3:
				this.loginAs='Agent'
				break;
			case 4:
				this.loginAs='Helper'
				break;
			default:
				this.loginAs='Agent'
		}
		this.routerGuard()
		this.getAgents()
		this.getAllInteraction()
		this.getCustomers()
		this.getquickReply()
		this.getTemplates()
		this.subscribeToNotifications()
		this.getAttributeList()
        this.sendattachfile()
		this.getQuickResponse()
		this.getUserList()
		this.getTagData()
		this.NewContactForm = this.newContact;
        this.EditContactForm = this.editContact;
	}

	ngAfterViewInit() {
		  this.scrollChatToBottom();
	  }

	scrollChatToBottom() {
		const chatWindowElement = this.chatSection?.nativeElement;
		if (chatWindowElement) {
			chatWindowElement.scrollTop = chatWindowElement.scrollHeight;
		  }

	  }

	async subscribeToNotifications() {
		let notificationIdentifier = {
			"UniqueSPPhonenumber" : (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number,
			"spPhoneNumber": JSON.parse(sessionStorage.getItem('SPPhonenumber')!)
		}
		this.websocketService.connect(notificationIdentifier);
			this.websocketService.getMessage().pipe(debounceTime(200)).subscribe(message => {
				if(message != undefined )
				{
					console.log("Seems like some message update from webhook");
					console.log(message)
					try{
						let msgjson = message;

						try {
							msgjson = JSON.parse(message);
						}
						catch (je) {
	                	//console.log("it could already be a JSON");
						}
						if(msgjson.displayPhoneNumber)
						{
							console.log("Got notification to update messages : "+ msgjson.displayPhoneNumber);  
							if(msgjson.updateMessage)
							{
								this.getAllInteraction(false)	
								// setTimeout(() => {
								this.selectInteraction(this.selectedInteraction)
								this.scrollChatToBottom()
								this.tickUpdate(message)
							// }, 100);

							}					
						}
					}
					catch(e)
					{
						console.log(e);
					}
				}
			});
	}

	async getquickReply(){
		this.apiService.getquickReply(this.SPID).subscribe(quickReply =>{
			this.QuickReplyListMain = quickReply
			this.QuickReplyList = quickReply
		})
		
	}

	async getQuickResponse(){
		this.settingService.getTemplateData(this.SPID,0).subscribe(response => {
		  this.QuickReplyList=response.templates;
		});    
	  }	  


	async getTemplates(){
		let spid = Number(this.SPID)
		this.settingService.getApprovedTemplate(spid,1).subscribe(allTemplates =>{
			this.allTemplatesMain = allTemplates.templates
			console.log(this.allTemplatesMain)
			this.allTemplates = allTemplates.templates
	
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
		// console.log(this.selectedInteraction)
		this.showFullProfile = !this.showFullProfile
	}
	toggleAttachedMediaView(){
		this.showAttachedMedia = !this.showAttachedMedia
	}

	updateOptedIn(event:any){
		this.OptedIn = event.target.checked ? 'Yes': 'No';
	}
	getCustomers(){

		this.apiService.getCustomers(this.SPID).subscribe(data =>{
			this.contactList= data
			console.log(this.contactList)
			const names: string[] = this.contactList.map((contact: { Name: any; }) => contact.Name);
			const email: string[] = this.contactList.map((contact: {emailId:any; }) => contact.emailId);
			const phone: string[] = this.contactList.map((contact: {Phone_number: any; }) => contact.Phone_number);
			console.log(names);
			console.log(email);
			console.log(phone);
		});
	}
	
	getAgents(){
		this.apiService.getAgents(this.SPID).subscribe(data =>{
			this.agentsList= data
			this.agentsList.forEach((item: { name: string; nameInitials: string; }) => {
                const nameParts = item.name.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts[1] || '';
                const nameInitials = firstName.charAt(0)+ ' ' +lastName.charAt(0);
    
                item.nameInitials = nameInitials;
            });
			console.log(this.agentsList,'agentlist')
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
				this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
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
		}, 2000);

		setTimeout(() => {
			this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
		}, 2000);

		if(dataList[0] && selectInteraction){
			this.selectInteraction(dataList[0])
		}


	}
	async updatePinnedStatus(item: any) {
		var bodyData = {
		  AgentId: this.AgentId,
		  isPinned: item.isPinned,
		  InteractionId: item.InteractionId
		};
	  
		this.apiService.updateInteractionPinned(bodyData).subscribe(async response => {
		  item.isPinned = !item.isPinned;
		//   this.sortItemsByPinnedStatus(); // After updating, sort the items
		});
	  }

// 	  sortItemsByPinnedStatus() {
//   this.items.sort((a, b) => {
//     // Pinned items come first
//     if (a.isPinned && !b.isPinned) {
//       return -1;
//     }
//     // Unpinned items come next
//     if (!a.isPinned && b.isPinned) {
//       return 1;
//     }
//     // If both are pinned or both are unpinned, maintain their original order
//     return 0;
//   });
// }

	async getFilteredInteraction(filterBy:any){
		await this.apiService.getFilteredInteraction(filterBy,this.AgentId,this.AgentName,this.SPID).subscribe(async data =>{
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
			console.log(dataList,'DataList *****')
			if(this.selectedInteraction ){
				this.selectedInteraction = dataList.filter((item: any)=> item.InteractionId == this.selectedInteraction.InteractionId)[0];
			}
			this.getAssicatedInteractionData(dataList,selectInteraction)
			
		});
		this.scrollChatToBottom()
	}
	async getSearchInteraction(event:any){
		console.log('Search keyup', event.target.value);
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

	tickUpdate(message: any) {
		if (message.Message_id !== undefined && message.msg_status !== undefined && message.message_direction === 'Out') {
		  if (message.msg_status === '1') {
			return '../../../../assets/img/teambox/tick-gry.svg';
		  } else if (message.msg_status === '2') {
			return '../../../../assets/img/teambox/duble-tick-g.svg';
		  } else if (message.msg_status === '3') {
			return '../../../../assets/img/teambox/double-tick-green.svg';
		  } else if (message.msg_status === null || message.msg_status === '9') {
			return '../../../../assets/img/teambox/error.svg';
		  }
		}
	  }

	  
	threasholdMessages(allMessage:any){
		let messageCount =0
		if(allMessage.length>0){
			
			for(var i=0;i<allMessage.length;i++){
				var fiveMinuteAgo = new Date( Date.now() - 1000 * (60 * this.messageTimeLimit) )
				var messCreated = new Date(allMessage[i].created_at)
				if(messCreated > fiveMinuteAgo ){
					messageCount++
				}
			}
			
		 }
		 return messageCount

	}
	getProgressBar(lastMessage:any){
		let progressbar:any=[];
		if(lastMessage){
			var date = lastMessage?.created_at
			var currentDate:any = new Date()
			var messCreated:any = new Date(date)
			var seconds = Math.floor((currentDate - messCreated) / 1000);
			var interval:any = seconds / 31536000;
		
			interval = seconds / 2592000;
			interval = seconds / 86400;
			interval = seconds / 3600;

			var hour =parseInt(interval)
			if (hour < 24) {
				var hrPer = (100*hour)/24
				var hourLeft =24-parseInt(interval)
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
		var date = lastMessage?.created_at
		var currentDate:any = new Date()
		var messCreated:any = new Date(date)
		var seconds = Math.floor((currentDate - messCreated) / 1000);
		var interval:any = seconds / 31536000;
	
		interval = seconds / 2592000;
		interval = seconds / 86400;
		interval = seconds / 3600;

		var hour =parseInt(interval)
		if (hour < 24) {
			var hrPer = (100*hour)/24
			var hourLeft =24-parseInt(interval)
		}else{
			var hrPer =100
			this.hourLeft =0
			if(this.selectedInteraction['interaction_status']!=='Resolved'){
				// this.updateConversationStatus('Resolved')
			}
		}
		
		
			var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
			var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
			var hoursBH = hours < 10 ? "0" + hours : hours;
			var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
			var time = hoursBH + ":" + minutes  + " " + am_pm;
			return time
		
		}else{
			var hrPer =100
			this.hourLeft =0
			return '';
		}
	}

	selectInteraction(Interaction: any) {
		// if (this.chatEditor) {
		//   this.chatEditor.value = 'Your message...';
		//   this.showChatNotes = 'text';
		// }
	  
		for (let i = 0; i < this.interactionList.length; i++) {
		  this.interactionList[i].selected = false;
		}
	  
		Interaction['selected'] = true;
		this.selectedInteraction = Interaction;
		this.contactId = Interaction.customerId;
		this.selected=Interaction.selected;
		console.log(Interaction);
		this.selectedCountryCode = Interaction.countryCode;

		this.Allmessages = this.selectedInteraction.allmessages;
		this.getPausedTimer();
		setTimeout(() => {
			this.scrollChatToBottom();
		}, 1000);
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
		this.selectedInteraction['AutoReplyStatus']='Enable'
	}

}

counter(i: number) {
	return new Array(i);
}

filterInteraction(filterBy:any){
	this.selectedInteraction=[]
	if(filterBy != 'All'){
		this.getFilteredInteraction(filterBy)
	}else{
		this.getAllInteraction()
	}
	this.interactionFilterBy=filterBy
	this.getAllInteraction()
	this.ShowFilerOption =false

}
toggleFilerOption(){
	this.showfilter=!this.showfilter;
}

toggleContactOption(){
	this.ShowContactOption =!this.ShowContactOption;
}
closeFilterOptions() {
    this.showfilter = false;
  }

toggleChannelOption(){
	this.ShowChannelOption =!this.ShowChannelOption;
	this.ShowLeadStatusOption = false;
	this.ShowGenderOption = false;
}
toggleGenderOption(){
	this.ShowGenderOption =!this.ShowGenderOption;
	this.ShowLeadStatusOption = false;
	this.ShowChannelOption = false;
}
selectChannelOption(ChannelName:any){
	this.selectedChannel = ChannelName
	this.ShowChannelOption=false
}
hangeEditContactInuts(item:any){
	if(item.target.name =='OptInStatus'){
		this.EditContactForm['OptInStatus'] = item.target.checked ? 'Yes': 'No';
	}else{
		this.EditContactForm[item.target.name] = item.target.value
	}
}
toggleLeadStatusOption(){
	this.ShowLeadStatusOption=!this.ShowLeadStatusOption;
	this.ShowChannelOption = false;
	this.ShowGenderOption =!this.ShowLeadStatusOption;
}


hangeEditContactSelect(name:any,value:any){
	this.EditContactForm.get(name)?.setValue(value);
	console.log(this.editContact)
	this.ShowChannelOption=false
	this.ShowGenderOption=false;
	this.ShowLeadStatusOption=false;
	

}

stopPropagation(event: Event) {
    event.stopPropagation();
  }
  closeLeadStatusOption() {
    this.ShowLeadStatusOption = false;
  }

  closeGenderOption() {
    this.ShowGenderOption = false;
  }

  
  closeChannelOption() {
    this.ShowChannelOption = false;
  }
 
  closeMentionDialog() {
    this.showMention = false;
  }



updateCustomer(){
	var bodyData = {
	Name: this.EditContactForm.get('Name')?.value,
	countryCode: this.EditContactForm.get('country_code')?.value,
	Phone_number: this.EditContactForm.get('Phone_number')?.value,
	displayPhoneNumber: this.EditContactForm.get('displayPhoneNumber')?.value,
	channel: this.EditContactForm.get('channel')?.value,
	OptInStatus: this.EditContactForm.get('OptInStatus')?.value,
	emailId: this.EditContactForm.get('emailId')?.value,
	ContactOwner: this.EditContactForm.get('ContactOwner')?.value,
	customerId: this.EditContactForm.get('customerId')?.value
	};
	console.log(bodyData)
		
	 if(this.EditContactForm.valid) {
		this.apiService.updatedCustomer(bodyData).subscribe(async response =>{
		this.selectedInteraction['Name']=this.EditContactForm.Name
		this.selectedInteraction['countryCode']=this.EditContactForm.country_code
		this.selectedInteraction['Phone_number']=this.EditContactForm.value.Phone_number
		this.selectedInteraction['displayPhoneNumber']=this.EditContactForm.displayPhoneNumber
		this.selectedInteraction['channel']=this.EditContactForm.channel
		this.selectedInteraction['status']=this.EditContactForm.status
		this.selectedInteraction['OptInStatus']=this.EditContactForm.OptInStatus
		this.selectedInteraction['emailId']=this.EditContactForm.emailId
		this.selectedInteraction['ContactOwner']=this.EditContactForm.ContactOwner
		this.selectedInteraction['CustomerId']=this.EditContactForm.customerId
	
			if(this.modalReference){
				this.modalReference.close();
			}
			this.showToaster('Contact information updated...','success');
			this.getAllInteraction(false);
			this.getCustomers();
		});
	}
	else {
		this.EditContactForm.markAllAsTouched();
	} 


}


filterContactByType(ChannelName:any){
	this.selectedChannel = ChannelName
	this.getSearchContact();
	this.ShowContactOption=false
}

toggleConversationStatusOption(){
	if(this.loginAs !='Agent'){
	this.ShowConversationStatusOption =!this.ShowConversationStatusOption
	}else if(this.selectedInteraction.assignTo.AgentId == this.AgentId){
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
	if(this.loginAs =='Agent' || this.selectedInteraction.interaction_status !='Resolved'){
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
markItRead(){

	if(this.selectedInteraction['UnreadCount'] > 0) {
			this.selectedInteraction.messageList.map((messageGroup:any)=>{
				messageGroup.items.map((message:any)=>{
					if(message.message_direction!='Out' && message.is_read==0){
						var bodyData = {
							Message_id:message.Message_id
						}
						this.apiService.updateMessageRead(bodyData).subscribe(data =>{
							let selectedInteraction =this.selectedInteraction;
							selectedInteraction['UnreadCount']=selectedInteraction['UnreadCount']>0?selectedInteraction['UnreadCount']-1:0
							this.selectedInteraction =selectedInteraction
							message.is_read=1;	
						})
				   }
				});
		});
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
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
	// document.getElementById("smartrepliesModal")!.style.display="inherit";
}


closeAutoReplyDialog() {
    // Close the dialog when clicking outside
    this.AutoReplyOption = false;
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
	console.log(bodyData)
	this.apiService.updateInteraction(bodyData).subscribe(async response =>{
		this.selectedInteraction['AutoReplyStatus'] =optionValue	
		this.AutoReplyType ='Pause are '+optionType	
		this.AutoReplyOption=false;
		this.selectedInteraction['paused_till'] =pausedTill;
		this.getPausedTimer()
		this.showToaster('Pause Applied','success')
		console.log(this.selectedInteraction)
	})
}

// Function to format the phone number using libphonenumber-js
formatPhoneNumber(contactForm: FormGroup) {
	const phoneNumber = contactForm.get('displayPhoneNumber')?.value;
	const countryCode = contactForm.get('country_code')?.value;
	const phoneControl = contactForm.get('Phone_number');
  
	if (phoneNumber && countryCode && phoneControl) {
	  const phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
	  const formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);
  
		const formattedValue = formattedPhoneNumber?.formatInternational().replace(/[\s+]/g, '');
		phoneControl.setValue(formattedValue);
	}
  }

  updatePhoneNumber() {
    const phoneNumber = this.EditContactForm['displayPhoneNumber'];
    const countryCode = this.EditContactForm['country_code'];
    let formattedPhoneNumber = null;
      if (phoneNumber && countryCode) {
        const phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
        formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);
          this.EditContactForm.patchValue({
            Phone_number: formattedPhoneNumber ? formattedPhoneNumber.formatInternational().replace(/[\s+]/g, '') : '',
          });
		  console.log('Formatted Phone Number:', this.EditContactForm.Phone_number);
		  console.log(phoneNumber);
		console.log(countryCode)
    }
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
			this.showToaster('Conversations is Blocked','success')
		}else{
			this.showToaster('Conversations is UnBlocked','success')
		}
		console.log(ResponseData);
	});
}

handelBlockConfirm(){
	if(this.modalReference){
		this.modalReference.close();
	}	
	this.blockCustomer(this.selectedInteraction)
}
handleInnerClick(event: Event): void {
    // Stop the propagation of the click event to prevent it from reaching the outer div
    event.stopPropagation();
  }

handelStatusConfirm(){
	if(this.modalReference){
		this.modalReference.close();
	}
	if (this.selectedInteraction['interaction_status'] === 'Resolved' && this.hourLeft === 0) {
        this.hourLeft = 24;
		this.updateConversationStatus('Open');
    }
    
  else {
        this.updateConversationStatus('Resolved');
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
	this.apiService.deleteInteraction(bodyData).subscribe(async response => {
			this.showToaster('Conversations deleted...','success')
			this.getAllInteraction();
	});	
}

toggleTagsModal(updatedtags:any){
	if(this.modalReference){
		this.modalReference.close();
	}

	this.selectedTags = ''; 
	
	var activeTags = this.selectedInteraction['tags'];
	for(var i=0;i<this.tagsoptios.length;i++){
		var tagItem = this.tagsoptios[i]
		if(activeTags.indexOf(tagItem.name)>-1){
			tagItem['status']=true;
			this.selectedTags += tagItem.name+','
		}
		else {
			tagItem['status'] = false;
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
		this.selectedInteraction['tags'] = [];
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
	this.EditContactForm.get('Name')?.setValue(this.selectedInteraction.Name)
	this.EditContactForm.get('country_code')?.setValue(this.selectedInteraction.countryCode)
	this.EditContactForm.get('Phone_number')?.setValue(this.selectedInteraction.Phone_number)
	this.EditContactForm.get('displayPhoneNumber')?.setValue(this.selectedInteraction.displayPhoneNumber)
	this.EditContactForm.get('channel')?.setValue(this.selectedInteraction.channel)
	this.EditContactForm.get('OptInStatus')?.setValue(this.selectedInteraction.OptInStatus)
	this.EditContactForm.get('emailId')?.setValue(this.selectedInteraction.emailId)
	this.EditContactForm.get('ContactOwner')?.setValue(this.selectedInteraction.ContactOwner)
	this.EditContactForm.get('channel')?.setValue(this.selectedInteraction.channel)
	this.EditContactForm.get('customerId')?.setValue(this.selectedInteraction.customerId)
	this.modalReference = this.modalService.open(updatecustomer,{ size:'md', windowClass:'white-bg'});
}


triggerDeleteCustomer(openDeleteAlertmMessage:any){
	if(this.modalReference){
		this.modalReference.close();
	}
	if(this.loginAs!='Agent'){
	this.confirmMessage= 'Are you sure you want to Delete this conversation?'
	this.modalReference = this.modalService.open(openDeleteAlertmMessage,{ size:'sm', windowClass:'white-bg'});
	}else{
	this.showToaster('Opps you dont have permission','warning')
	}
}
triggerBlockCustomer(BlockStatus:any,openBlockAlertmMessage:any){
	if(this.modalReference){
		this.modalReference.close();
	}
	if(this.loginAs !='Agent'){
	this.confirmMessage= 'Are you sure you want to '+BlockStatus+' this conversation?'
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
			this.confirmMessage= 'Are you sure you want to '+status+' this conversation?'
			this.modalReference = this.modalService.open(openStatusAlertmMessage,{ size:'sm', windowClass:'white-bg'});
   
	}
}

updateConversationStatus(status:any) {
	var bodyData = {
		Status:status,
		InteractionId:this.selectedInteraction.InteractionId
	}
	this.apiService.updateInteraction(bodyData).subscribe(async response =>{
		this.ShowConversationStatusOption=false
		// this.showToaster('Conversations updated to '+status+'...','success')

		// var responseData:any = response
		// var bodyData = {
		// 	InteractionId: this.selectedInteraction.InteractionId,
		// 	AgentId: this.AgentId,
		// 	MappedBy: this.AgentId
		// }
		// this.apiService.updateInteractionMapping(bodyData).subscribe(responseData =>{
		// this.apiService.getInteractionMapping(this.selectedInteraction.InteractionId).subscribe(mappingList =>{
		// 	var mapping:any  = mappingList;
		// 	this.selectedInteraction['assignTo'] =mapping[mapping.length - 1];
		// })

		// });
		
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

createCustomer() {
	this.newContact.value.SP_ID = this.SPID;
	this.newContact.value.Channel = this.selectedChannel;
	this.newContact.value.OptedIn = this.OptedIn;
	var bodyData = this.newContact.value;
	console.log(bodyData);
		if(this.newContact.valid) {
			this.apiService.createCustomer(bodyData).subscribe(
				async (response:any) => {
					var responseData: any = response;
					var insertId: any = responseData.insertId;
					if (insertId) {
						this.createInteraction(insertId);
						this.newContact.reset();
						this.getAllInteraction();
						this.getCustomers();
					}},
				async (error) => {
				  if (error.status === 409) {
					this.showToaster('Phone Number already exist. Please Try another Number', 'error');
				  }
				}
			  );
		}
		else {
			this.newContact.markAllAsTouched();
		}

  }
  

createInteraction(customerId:any) {
var bodyData = {
	customerId: customerId,
	spid:this.SPID

}
this.apiService.createInteraction(bodyData).subscribe(async data =>{
	if(this.modalReference){
		this.modalReference.close();
	}
	this.getAllInteraction();
	this.getCustomers();
});

}

closeAssignOption() {
    // Close the assign options when clicking outside
    this.ShowAssignOption = false;
  }

  closeConversationStatusOption() {
    // Close the conversation status options when clicking outside
    this.ShowConversationStatusOption = false;
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
	console.log(note)
	this.hideNoteOption()
	if(note && this.selectedNote.Message_id != note.Message_id){
	note.selected=true
	this.selectedNote= note
	}else{
		note.selected=false
		this.selectedNote= []
	
	}
	$("#agModal").modal('show'); 
	$('body').removeClass('modal-open');
	$('.modal-backdrop').remove();
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
	var tempDivElement = document.createElement("div");   

	tempDivElement.innerHTML = this.chatEditor.value;
	let value =this.chatEditor.value?.replaceAll('&nbsp;',' ')?.replaceAll(/ <\/em>/g, '_ ')?.replaceAll(/ <\/span>/g, '~ ')?.replaceAll(/ <\/strong>/g, '* ')?.replaceAll(/<\/strong> /g, '*');
    let val = tempDivElement.textContent || tempDivElement.innerText || "";
	if (this.chatEditor.value == null || val.trim()=='') {
		this.showToaster('! Please enter a message before sending.','error');
		return;
	}

	 else {
		let postAllowed =false;
		if(this.loginAs == 'Manager' || this.loginAs == 'Admin' || this.showChatNotes == 'notes'){
			postAllowed =true;
		}else if(this.selectedInteraction.assignTo && this.selectedInteraction.assignTo.AgentId == this.AgentId){
			postAllowed =true;
		}
		
		if(postAllowed){
		if(this.SIPthreasholdMessages>0){
		let objectDate = new Date();
		var cMonth = String(objectDate.getMonth() + 1).padStart(2, '0');
		var cDay = String(objectDate.getDate()).padStart(2, '0');
		var createdAt = objectDate.getFullYear()+'-'+cMonth+'-'+cDay+'T'+objectDate.getHours()+':'+objectDate.getMinutes()+':'+objectDate.getSeconds()

		var bodyData = {
			InteractionId: this.selectedInteraction.InteractionId,
			CustomerId: this.selectedInteraction.customerId,
			SPID:this.SPID,
			AgentId: this.AgentId,
			messageTo:this.selectedInteraction.Phone_number,
			message_text: value || "",
			Message_id:this.newMessage.value.Message_id,
			message_media: this.messageMeidaFile,
			media_type: this.mediaType,
			quick_reply_id: '',
			template_id:'',
			message_type: this.showChatNotes,
			created_at:new Date(),
			mediaSize:this.mediaSize,
			spNumber:this.spNumber
		}
		console.log(bodyData,'Bodydata')
		let input = {
			spid: this.SPID,
		};
		this.settingService.clientAuthenticated(input).subscribe(response => {

			if (response.status === 404) {
				this.showToaster('Oops You\'re not Authenticated ,Please go to Account Settings and Scan QR code first to link your device.','warning')
				return;
			}

			if (response.status === 200 && response.message === 'Client is ready !') {
				this.apiService.sendNewMessage(bodyData).subscribe(async data => {
					var responseData:any = data
					// if (responseData.middlewareresult.status === '401') {
					// 	this.showToaster('Oops You\'re not Authenticated ,Please go to Account Settings and Scan QR code first to link your device.','warning')
					// 	return;
					// };
					// if(responseData.middlewareresult.status === '200') {
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
									"created_at": createdAt,
									"mediaSize":bodyData.mediaSize
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
								this.chatEditor.value ='';
								this.messageMeidaFile='';
								this.mediaType='';
								this.SIPthreasholdMessages=this.SIPthreasholdMessages-1
							}
				
				
							}else{
								this.selectedNote.message_text= bodyData.message_text
							}
							
				
							this.newMessage.reset({
								Message_id: ''
							});
					// }
				});
			}
		});


		}else{
			this.showToaster('Oops! CIP message limit exceed please wait for 5 min...','warning')
		}
	}else {
		this.showToaster('Oops! You are not allowed to post content','warning')
	 }
	}


}

//   /  GET ATTRIBUTE LIST  /
  getAttributeList() {
   this.apiService.getAttributeList(this.SPID)
   .subscribe((response:any) =>{
	if(response){
		let attributeListData = response?.result;
		this.attributesList = attributeListData.map((attrList:any) => attrList.displayName);
		console.log(this.attributesList);
	}
  })
}
	  addfilters() {
		this.closeAllModal();
		$('body').removeClass('modal-hide');
		$('.modal-backdrop').remove();
	  }

      limitCharacters(message: string) {
        let maxLength = 50;
        if (message.length <= maxLength) {
        return message;
        } else {
		return this.showFullMessage ? message : message.substring(0,maxLength) + "...";
        }
    }

		toggleShowFullMessage() {
			this.showFullMessage = !this.showFullMessage;
		}

		getUserList() {
		let spid = Number(this.SPID)
			this.settingService.getUserList(spid)
			.subscribe(result =>{
			  if(result){
				this.userList =result?.getUser;      
			  }
	  
			});
		  }

		/* GET VARIABLE VALUES */
		getVariables(sentence: string, first: string, last: string) {
		let goodParts: string[] = [];
	
		if (!sentence || sentence.trim() === '') {
			return goodParts;
		}
	
		const allParts = sentence.split(first);
	
		allParts.forEach((part: string, index: number) => {
			if (index !== 0) {
				const closingIndex = part.indexOf(last);
				if (closingIndex !== -1) {
					const goodOne = part.substring(0, closingIndex);
					goodParts.push("{{" + goodOne + "}}");
				}
			}
		});
		return goodParts;
	}
			
		
			previewTemplate() {
				let isVariableValue:string = this.selectedTemplate.BodyText + this.selectedTemplate.Header;
		
				if (isVariableValue) {
				  this.allVariablesList = this.getVariables(isVariableValue, "{{", "}}");
			  };
		
			}

			getTagData() {
				let spid = Number(this.SPID)
				this.settingService.getTagData(spid).subscribe(result => {
				  if (result) {
					  let tagList = result.taglist;
					  this.tagsoptios = tagList.map((tag:any) => ({
					      id:tag.ID,			
						  name:tag.TagName,
						  color:tag.TagColour,
						  status:false
					  }));
					  console.log(this.tagsoptios);
						}
					});
			}
		  
}