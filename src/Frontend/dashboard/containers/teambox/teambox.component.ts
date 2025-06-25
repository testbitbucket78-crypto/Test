import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, TemplateRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService, TeamboxService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { WebsocketService } from '../../services/websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { fromEvent } from "rxjs";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ToolbarService, NodeSelection, LinkService, ImageService, EmojiPickerService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
import { debounceTime, map } from 'rxjs/operators';
import { Mention } from '@syncfusion/ej2-angular-dropdowns';
import { DatePipe } from '@angular/common';
import { PhoneValidationService } from 'Frontend/dashboard/services/phone-validation.service';
import { hasEmptyValues } from '../common/Utils/file-utils';
import { BotserviceService } from 'Frontend/dashboard/services/botservice.service';
declare var $: any;
@Component({
	selector: 'sb-teambox',
	templateUrl: './teambox.component.html',
	styleUrls: ['./teambox.component.scss'],
	providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService]
})

export class TeamboxComponent implements OnInit {

	private socket$: WebSocketSubject<any> = new WebSocketSubject('wss://notify.stacknize.com/');

	incomingMessage: string = '';

	//******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}

	public fieldsData: { [key: string]: string } = { text: 'name' };
	@ViewChild('mention') mentionObj!: Mention;
	@ViewChild('notesSection') notesSection: ElementRef | any;
	@ViewChild('chatSection') chatSection: ElementRef | any;
	@ViewChild('mention_integration') chatEditor!: RichTextEditorComponent;
	@ViewChild('chatSection') scrollContainer: ElementRef | any;
	@ViewChild('messageadd') contactadd!: TemplateRef<any>;
	@ViewChildren('msg') messageElements!: QueryList<ElementRef>;

	@ViewChild('variableValue', { static: false }) variableValueForm!: NgForm;


	public selection: NodeSelection = new NodeSelection();
	public range: Range | undefined;
	public saveSelection: NodeSelection | any;


	public QuickRepliesList: { [key: string]: Object }[] = []

	public TemplateList: any = [];

	filteredCustomFields: any;
	public tools: object = {
		items: [

			'Bold', 'Italic', 'StrikeThrough', 'EmojiPicker',
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
			},
			{
				tooltipText: 'Insert Bot',
				undo: true,
				click: this.ToggleBotOption.bind(this),
				template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width: 16px;padding-bottom: 2px;" src="/assets/img/teambox/bot.svg"></div></button>'
			},
		]
	};
	public pasteCleanupSettings: object = {
		prompt: false,
		plainText: true,
		keepFormat: false,
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

	templateChecked: boolean = false;
	showInfoIcon: boolean = false;
	showQuickResponse: any = false;
	showAttributes: any = false;
	showQuickReply: any = false;
	showInsertTemplate: any = true;
	showAttachmenOption: any = false;
	slideIndex = 0;
	PauseTime: any = '';
	confirmMessage: any;
	messagesAll: string[] = [];
	messagesRead: string[] = [];
	newMessagesNumber: number = 0;
	active = 1;
	showTopNav: boolean = true;
	SPID = sessionStorage.getItem('SP_ID')
	TeamLeadId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
	uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
	AgentId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
	AgentName = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name
	isPaused = (JSON.parse(sessionStorage.getItem('loginDetails')!)).isPaused != 0 ? true : false
	loginAs: any;
	spNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number
	messageTimeLimit = 10;
	SIPmaxMessageLimt = 100;
	SIPthreasholdMessages = 1;
	isTemplate: boolean = false;
	headerText: string = '';
	bodyText: string = '';
	showFullProfile = false;
	showAttachedMedia = false;
	showattachmentbox = false;
	ShowFilerOption = false;
	ShowContactOption = false;
	showfilter = false;
	AutoReplyOption = false;
	ShowConversationStatusOption = false;
	ShowAssignOption = false;
	selectedInteraction: any = [];
	selectedNote: any = [];
	contactList: any = [];
	contactListInit: any = [];
	contactId: number = 0;
	interactionList: any = [];
	unreadList: number = 0;
	interactionListMain: any = [];
	selectedTemplate: any = [];
	messageMediaFile: string = '';
	variableValues: string[] = [];
	agentsList: any = [];
	assigineeList: any = [];
	filteredAgentList: any;
	mentionAgentsList: any = [];
	modalReference: any;
	OptedIn = 'No';
	searchFocused = false;
	searchChatFocused = false;
	isRefresh: boolean = true;
	errorMessage = '';
	successMessage = '';
	warningMessage = '';
	status = '';
	showChatNotes = 'text';
	message_text = '';
	selectedChannel: any = '';
	contactSearchKey: any = '';
	ShowChannelOption: any = false;
	CountryCode!: any;
	selectedCountryCode!: string;
	newContact: FormGroup;
	editContact: FormGroup;
	ShowGenderOption: any = false;
	ShowLeadStatusOption: any = false;
	attributesearch!: string;
	quickreplysearch!: string;
	templatesearchreply!: string;
	header!: string;
	messageStatus: any;
	Messageid: any;
	messageStatusMap: Map<number, string> = new Map<number, string>();
	Allmessages: any = [];
	Messagedirection: any;
	Interaction: any
	items: any[] = [];
	newMessage: any;
	interactionFilterBy: any = 'All'
	interactionSearchKey: any = ''
	tagsoptios: any = [];
	selectedTags: any = '';
	AutoReplyEnableOption: any = ['Extend Pause for 5 mins', 'Extend Pause for 10 mins', 'Extend Pause for 15 mins', 'Extend Pause for 20 mins', 'Enable'];
	AutoReplyPauseOption: any = ['Pause for 5 mins', 'Pause for 10 mins', 'Pause for 15 mins', 'Pause for 20 mins', 'Auto Reply are Paused', 'Enable'];
	AutoReply: any = '';
	AutoReplyType: any = '';
	dragAreaClass: string = '';
	editTemplate: any = false;
	showEditTemplateMedia: any = false;
	TemplatePreview: any = false;
	messageMeidaFile: any = '';
	mediaType: any = '';
	attachmentMedia: any = '';
	isAttachmentMedia: boolean = false;
	showMention: any = false;
	NewContactForm: any = [];
	EditContactForm: any = [];
	QuickReplyList: any = [];
	QuickReplyListMain: any = [];
	allTemplates: any = [];
	allTemplatesMain: any = [];
	filterTemplateOption: any = '';
	attributesList: any = [];
	WhatsAppDetailList: any = [];
	dynamicDropdownSettings = {};
	showFullMessage: boolean = false;
	maxLength: number = 150;
	allmessages: any = [];
	mediaSize: any;
	hourLeft: number = 0;
	userList: any;
	allVariablesList: string[] = [];
	buttonsVariable: { label: string; value: string; isAttribute: boolean; Fallback: string }[] = [];
	indexSelectedForDynamicURL: number = 0;
	isDynamicURLClicked!: boolean;
	showInfo: boolean = false;
	selected: boolean = false;
	filterChannel: string = '';
	indexSelected: number = 0;
	attribute: string = '';
	fallbackvalue: string[] = [];
	selectedAttribute: any;
	isFilterTemplate: any = {
		Marketing: true,
		Utility: true,
		Authentication: true
	};
	allVariables: string = '';
	isFallback: any[] = [];
	currentPage: number = 0;
	contactCurrentPage: number = 0;
	pageSize: number = 10;
	contactPageSize: number = 10;
	messageRangeStart: number = 0;
	messageRangeEnd: number = 30;
	selectedInteractionList: any[] = [];
	isCompleted: boolean = false;
	isContactCompleted: boolean = false;
	isMessageCompletedNotes: boolean = false;
	isMessageCompletedMedia: boolean = false;
	isMessageCompletedText: boolean = false;
	isShowAttributes: boolean = false;
	isUploadingLoader!: boolean;
	isLoading!: boolean;
	isLoadingOlderMessage!: boolean;
	srchText: string = '';
	selectedModalIndex: number = 0;
	isAgmodalOpened!: boolean;
	templateName: string = '';
	templatelanguage: string = '';
	templateButton: any[] = [];
	public insertImageSettings: object = {
		width: '50px',
		height: '50px'
	};
	isLoadingOnScroll!: boolean;
	event = 'teamBox';
	lastCursorPosition: Range | null = null;
	constructor(private http: HttpClient, private apiService: TeamboxService, public settingService: SettingsService, public settingsService: SettingsService, config: NgbModalConfig, private modalService: NgbModal, private fb: FormBuilder, private elementRef: ElementRef, private renderer: Renderer2, private router: Router, private websocketService: WebsocketService,
		public phoneValidator: PhoneValidationService, private datePipe: DatePipe,
		private dashboardService: DashboardService, public botService: BotserviceService,
		private route: ActivatedRoute) {


		config.backdrop = 'static';
		config.keyboard = false;
		config.windowClass = 'teambox-pink';

		this.newContact = fb.group({
			SP_ID: new FormControl(''),
			Name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^(?:[a-zA-Z.0-9]+|(?:a to z))(?: [a-zA-Z0-9]+)*$')]),
			country_code: new FormControl('IN +91', { nonNullable: true }),
			Phone_number: new FormControl(''),
			displayPhoneNumber: new FormControl('', [Validators.pattern('^[0-9]+$'), Validators.required, Validators.minLength(6), Validators.maxLength(15)])
		});
		this.editContact = fb.group({
			customerId: new FormControl(''),
			Name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^(?:[a-zA-Z.0-9]+|(?:a to z))(?: [a-zA-Z0-9]+)*$')]),
			country_code: new FormControl(''),
			displayPhoneNumber: new FormControl('', [Validators.pattern('^[0-9]+$'), Validators.required, Validators.minLength(6), Validators.maxLength(15)]),
			Phone_number: new FormControl(''),
			emailId: new FormControl('', [Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'), Validators.minLength(5), Validators.maxLength(50)]),
			ContactOwner: new FormControl('', Validators.required),
			channel: new FormControl(''),
			OptInStatus: new FormControl('')
		});

		this.newMessage = fb.group({
			Message_id: new FormControl(''),
		});
	}
	selectTemplate(template: any) {
		this.templateChecked = true;
		this.selectedTemplate = template

		// 	let template_json = JSON.parse(this.selectedTemplate?.template_json)[0];
		// 	let buttons = [];
		// 	if(template_json && template_json?.components){
		// 		if(template_json?.components[1]?.button){
		// 	for(let item of template_json?.components[1]?.button){
		// 	if(item){
		// 		buttons.push({name:item});
		// 	  }
		// 	  }
		//     }
		// 	this.selectedTemplate['buttons'] = buttons;
		// 	console.log(this.selectedTemplate,'selected temp;ate')
		//   }
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

	toggleChatNotes(optionvalue: any) {
		if (this.chatEditor) {
			if (optionvalue == 'text') {
				this.chatEditor.value = '';
				this.tools = {
					items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker',
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
							template: '<button  style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
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

			} else {
				this.chatEditor.value = '';
				this.tools = {
					items: ['Bold', 'Italic', 'StrikeThrough', 'EmojiPicker',
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
		this.showChatNotes = optionvalue
		setTimeout(() => {
			this.chatSection?.nativeElement.scroll({ top: this.chatSection?.nativeElement?.scrollHeight })
			this.notesSection?.nativeElement.scroll({ top: this.notesSection?.nativeElement?.scrollHeight })
		}, 100);
	}

	closeAllModal() {
		this.OptedIn = 'No';
		this.modalReference?.close();
		this.selectedTemplate = [];
		this.filterChannel = '';
		this.templateChecked = false;
		this.showAttachmenOption = false
		this.messageMeidaFile = false
		this.showAttributes = false
		this.newContact.reset()
		this.editTemplate = false
		this.TemplatePreview = false
		this.showQuickReply = false
		this.showMention = false
		this.attributesearch = '';
		this.header = '';
		this.quickreplysearch = '';
		this.variableValueForm.reset();
		this.variableValues = [];
		this.newContact.reset();
		// this.getTemplates();
		this.mediaType = ''
		this.attachmentMedia = ''

		$("#editTemplateMedia").modal('hide');
		$("#insertBotmodal").modal('hide');
		$("#templatePreview").modal('hide');
		$("#quikpopup").modal('hide');
		$("#atrributemodal").modal('hide');
		$("#insertmodal").modal('hide');
		$("#editTemplate").modal('hide');
		$("#attachfle").modal('hide');
		$("#sendfile").modal('hide');
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();

	}
	// editMedia(){
	// 	$("#editTemplate").modal('hide');
	// 	$("#templatePreview").modal('hide');  
	// 	$("#editTemplateMedia").modal('show'); 
	// }

	editMedia() {
		$("#editTemplate").modal('hide');
		$("#attachfle").modal('show');

	}
	closeEditMedia() {
		$("#editTemplate").modal('show');
		$("#attachfle").modal('hide');
		$("#editTemplateMedia").modal('hide');
		this.isAttachmentMedia = false;
	}
	cancelEditTemplateMedia() {
		this.closeAllModal()
	}
	updateEditTemplateMedia() {
		$("#editTemplate").modal('show');
		$("#editTemplateMedia").modal('hide');
	}

	openVariableOption(indexSelected: number) {
		this.indexSelected = indexSelected;
		$("#showvariableoption").modal('show');
		this.isShowAttributes = true;
		$("#editTemplate").modal('hide');
	}
	openVariableOptionDynamicURL(indexSelected: number) {
		this.indexSelectedForDynamicURL = indexSelected;
		this.isDynamicURLClicked = true;
		$("#showvariableoption").modal('show');
		this.isShowAttributes = true;
		$("#editTemplate").modal('hide');
	}
	closeVariableOption() {
		this.attributesearch = '';
		$("#showvariableoption").modal('hide');
		this.isShowAttributes = false;
		$("#editTemplate").modal('show');
	}
	SaveVariableOption() {
		if (this.isDynamicURLClicked) {
			this.buttonsVariable[this.indexSelectedForDynamicURL].value = '{{' + this.selectedAttribute + '}}';
			this.buttonsVariable[this.indexSelectedForDynamicURL].isAttribute = this.isCustomValue('{{' + this.selectedAttribute + '}}');
			this.buttonsVariable[this.indexSelectedForDynamicURL].Fallback = this.attribute;
			this.isDynamicURLClicked = false;
		} else {
			this.variableValues[this.indexSelected] = '{{' + this.selectedAttribute + '}}';
			this.fallbackvalue[this.indexSelected] = this.attribute;
			this.isFallback[this.indexSelected] = this.isCustomValue('{{' + this.selectedAttribute + '}}');
		}
		this.resetAttributeSelection();
		$("#showvariableoption").modal('hide');
		this.isShowAttributes = false;
		$("#editTemplate").modal('show');
	}
	resetAttributeSelection() {
		this.attribute = '';
		this.selectedAttribute = '';
	}
	showTemplatePreview() {
		console.log(this.variableValues, 'VARIBALE VALUES');
		if (hasEmptyValues(this.buttonsVariable)) {
			this.showToaster('Variable value should not be empty', 'error')
			return
		}

		if (this.variableValues?.length !== 0 && this.allVariablesList?.length !== 0) {
			this.addVariable();
			this.replaceVariableInTemplate();
			$("#editTemplate").modal('hide');
			$("#templatePreview").modal('show');
		}

		else if (this.allVariablesList.length == 0) {
			$("#editTemplate").modal('hide');
			$("#templatePreview").modal('show');
		}
		else {
			this.showToaster('Variable value should not be empty', 'error')
		}


	}

	onCreate() {
		const instance: any = this.chatEditor;
		instance.contentModule.getDocument().addEventListener("keydown", (e: any) => {
			// if (e.key === 's' && e.ctrlKey === true) {

			// }
			console.log('abcd');
			if (this.modalReference) {
				this.modalReference.close();
			}

		});
	}

	addVariable() {
		const allVariables = [];
		for (let i = 0; i < this.allVariablesList.length; i++) {
			const variable = {
				label: this.allVariablesList[i],
				value: this.variableValues[i],
				fallback: this.fallbackvalue[i],
				isFallback: this.isFallback[i],
			};
			allVariables.push(variable);
		}
		this.allVariables = JSON.stringify(allVariables);
	}
	addAttributeInVariables(item: any) {
		if (item) {
			this.selectedAttribute = item;
		}
	}

	replaceVariableInTemplate() {
		let val: any = [];
		this.allVariablesList.forEach((placeholder, index) => {
			const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
			if (this.selectedTemplate?.media_type == 'text') {
				this.selectedTemplate.Header = this.selectedTemplate?.Header?.replace(regex, '{{' + index + '}}');
			}
			val.push({ idx: '{{' + index + '}}', value: this.variableValues[index] });
			this.selectedTemplate.BodyText = this.selectedTemplate?.BodyText?.replace(regex, (match: any) => {
				return '{{' + index++ + '}}';
			});
		});

		val.forEach((placeholder: any) => {
			const regex = new RegExp(placeholder?.idx?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
			if (this.selectedTemplate?.media_type == 'text') {
				this.selectedTemplate.Header = this.selectedTemplate?.Header.replace(regex, placeholder?.value);
			}
			this.selectedTemplate.BodyText = this.selectedTemplate?.BodyText.replace(regex, placeholder?.value);
		});
	}

	//replaceVariableInTemplate() {
	// 	let header = this.selectedTemplate.Header;
	// 	let BodyText = this.selectedTemplate.BodyText;
	// 	this.allVariablesList.forEach((placeholder, index) => {
	// 		const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
	// 		if(this.selectedTemplate.media_type == 'text') {
	// 			header = this.selectedTemplate.Header.replace(regex, this.variableValues[index]);
	// 		}
	// 		BodyText = this.selectedTemplate.BodyText.replace(regex, this.variableValues[index]);
	// 	});
	// 	this.selectedTemplate.Header = header;
	// 	this.selectedTemplate.BodyText = BodyText;
	// }
	// insertTemplate(item:any) {
	// 	this.closeAllModal()
	// 	let mediaContent
	// 	if(item.media_type === 'image') {
	// 	  mediaContent ='<p><img style="width:100%; height:100%" src="'+item.Links+'"></p>'
	// 	}
	// 	else if(item.media_type === 'video') {
	// 		mediaContent ='<p><video controls style="width:100%; height:100%" src="'+item.Links+'"></video></p>'
	// 	}
	// 	else if(item.media_type === 'document') {
	// 		mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
	// 	}

	// 	let htmlcontent = '';
	// 	if (item.Header && item.media_type == 'text') {
	// 		htmlcontent += '<p><strong>'+item.Header+'</strong></p><br>';
	// 	}

	// 	if(mediaContent && item.media_type!== 'text') {
	// 		htmlcontent += mediaContent
	// 	}

	// 	htmlcontent +='<p>'+ item.BodyText+'</p>'+'<br>';
	// 	if (item.FooterText) {
	// 		htmlcontent+='<p>'+item.FooterText+'</p>';
	// 	}
	// 	this.chatEditor.value =htmlcontent
	// 	this.isAttachmentMedia = false;
	// 	this.isTemplate = true;
	// 	this.mediaType = item.media_type;
	// 	this.messageMeidaFile = item.Links;
	// 	//this.addingStylingToMedia(item);
	//console.log(htmlcontent);
	// 	this.sendMediaMessage(true,htmlcontent)
	// }
	insertTemplate(item: any) {
		this.closeAllModal()
		let mediaContent;
		let mediaName;
		const fileNameWithPrefix = item?.Links.substring(item.Links.lastIndexOf('/') + 1);
		let originalName;
		if (item.media_type === 'video') {
			originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
			originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
		} else {
			originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
		}
		if (item?.media_type === 'image') {
			mediaContent = '<p><img style="width:100%; height:100%" src="' + item?.Links + '"></p>';
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> ' + originalName + '</p>'
		}
		else if (item?.media_type === 'video') {
			mediaContent = '<p><video controls style="width:100%; height:100%" src="' + item?.Links + '"></video></p>';
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> ' + originalName + '</p>'
		}
		else if (item?.media_type === 'document') {
			mediaContent = '<p><a href="' + item?.Links + '"><img src="../../../../assets/img/settings/doc.svg" /></a></p>';
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" alt="icon"/>' + originalName + '</p>'
		}

		let htmlcontent = '';
		if (item?.Header && item?.media_type == 'text') {
			htmlcontent += '<p><strong>' + item?.Header + '</strong></p>';
		}

		if (mediaContent && item?.media_type !== 'text') {
			htmlcontent += mediaName
		}

		htmlcontent += item?.BodyText;
		if (item?.FooterText && item?.FooterText !== '') {
			htmlcontent += '<p class="temp-footer">' + item?.FooterText + '</p>';
		}
		//this.chatEditor.value =htmlcontent
		this.isAttachmentMedia = false;
		this.isTemplate = true;
		let temp = this.allTemplatesMain.filter((it: any) => it.ID == item.ID)[0];
		this.headerText = temp?.Header;
		this.bodyText = temp?.BodyText;
		this.templateName = item?.TemplateName;
		this.templatelanguage = this.settingService?.filterListLanguage.find((lang: any) => lang.label === item?.Language)?.code || '';
		this.mediaType = item?.media_type;
		this.messageMeidaFile = item?.Links;
		this.templateButton = item?.buttons
		this.addingStylingToMedia(item);
		console.log(htmlcontent);
		this.sendMessage(true, htmlcontent);
	}

	processMediaType(mediaType: any, message_media: any, messageMeidaFile: any): string {
		if (message_media) {
			const extension = message_media.split('.').pop()?.toLowerCase();
			const mimeTypeMap: Record<string, string> = {
				'jpg': 'jpeg', 'jpeg': 'jpeg', 'png': 'png', 'gif': 'gif',
				'mp4': 'mp4', 'mov': 'quicktime', 'avi': 'x-msvideo', 'wmv': 'x-ms-wmv',
				'pdf': 'pdf', 'doc': 'msword', 'docx': 'vnd.openxmlformats-officedocument.wordprocessingml.document',
				'ppt': 'vnd.ms-powerpoint', 'pptx': 'vnd.openxmlformats-officedocument.presentationml.presentation'
			};

			const mimeType = mimeTypeMap[extension!];
			if (mimeType) {
				if (mediaType === 'image') {
					this.mediaType = `image/${mimeType}`;
				} else if (mediaType === 'video') {
					this.mediaType = `video/${mimeType}`;
				} else if (mediaType === 'document') {
					this.mediaType = `application/${mimeType}`;
				}
			}
		}
		if (messageMeidaFile) {
			return this.removeMediaTags(messageMeidaFile);
		} else return messageMeidaFile;
	}
	removeMediaTags(htmlContent: string): string {
		let updatedHtml = htmlContent.replace(/<img[^>]*>[^<]*|<video[^>]*>[^<]*<\/video>/gi, '');
		updatedHtml = updatedHtml.replace(/<p[^>]*><a[^>]*href=['"][^'"]*\.(pdf|doc|docx|ppt|pptx)['"][^>]*>[^<]*<\/a><\/p>/gi, '');
		updatedHtml = updatedHtml.replace(/\sstyle="([^"]*)"/gi, (match, styles) => {
			const allowedStyles = ['text-decoration: line-through'];
			const filteredStyles = styles
				.split(';')
				.map((style: any) => style.trim())
				.filter((style: any) => allowedStyles.includes(style));
			return filteredStyles?.length > 0 ? ` style="${filteredStyles.join('; ')}"` : '';
		});
		updatedHtml = updatedHtml.replace(/<button[^>]*>✖<\/button>/gi, '');
		return updatedHtml;
	}
	showeditTemplate() {
		if (this.selectedTemplate.length !== 0) {
			$("#editTemplate").modal('show');
			$("#insertmodal").modal('hide');
			this.isAttachmentMedia = true;
			this.previewTemplate();
		}
		else {
			this.showToaster('! Please Select Any Template To Proceed', 'error');
		}

	}
	openNewMessagePopup() {
		setTimeout(() => {
			this.route.queryParams.subscribe(params => {
				let isMessage = params['isNewMessage'] === 'true' ? true : false;
				if (isMessage) {
					this.openaddMessage(this.contactadd);
					this.header = params['srchText'] ? params['srchText'] : '';
					this.searchContact(this.header);
					console.log(this.header);
				}
			});
		}, 50)
	}
	ToggleShowMentionOption() {
		this.closeAllModal()
		setTimeout(() => { this.showMention = !this.showMention }, 50)

	}
	InsertMentionOption(user: any) {
		let content: any = this.chatEditor.value || '';
		content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
		content = content + '<span contenteditable="false" class="e-mention-chip"><a _ngcontent-yyb-c67="" href="mailto:" title="">@' + user?.name + '</a></span>'
		this.chatEditor.value = content;
		// content = content+'<span> </span>'
		// this.chatEditor.value = content;
		setTimeout(() => {
			this.attachMentionHandlers();
		}, 10);
		this.showMention = false;
		//this.selectInteraction(this.selectedInteraction)
	}

	attachMentionHandlers() {
		const mentions = document.getElementById('defaultRTE')?.querySelectorAll('.mention');
		mentions?.forEach((mention: HTMLElement | any) => {
			mention.addEventListener('click', this.moveCursorToEndOfMention);
		});
	}

	moveCursorToEndOfMention(event: MouseEvent) {
		const mention = event.target as HTMLElement;
		if (mention && mention.nextSibling) {
			const range = document.createRange();
			const selection = window.getSelection();
			range.setStartAfter(mention);
			range.collapse(true);
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}

	ToggleInsertTemplateOption() {
		if (this.selectedInteraction?.assignTo?.AgentId == this.uid || this.showChatNotes == 'notes') {
			// if((this.showChatNotes=='text' && this.selectedInteraction.channel=='WhatsApp Official' && this.selectedInteraction?.progressbar?.progressbarValue >0) ||(this.showChatNotes=='text' && this.selectedInteraction.channel=='WhatsApp Web') || this.showChatNotes=='notes' )
			// {
			$("#insertmodal").modal('show');
			//}
			this.fallbackvalue = [];
			this.allTemplates = JSON.parse(JSON.stringify(this.allTemplatesMain));
		}
	}

	ToggleBotOption() {
		if (this.selectedInteraction?.assignTo?.AgentId == this.uid || this.showChatNotes != 'notes') {
			if ((this.showChatNotes == 'text' && this.selectedInteraction.channel == 'WhatsApp Official' && this.selectedInteraction?.progressbar?.progressbarValue > 0) || (this.showChatNotes == 'text' && this.selectedInteraction.channel == 'WhatsApp Web') || this.showChatNotes != 'notes') {
				$("#insertBotmodal").modal('show');
				this.fallbackvalue = [];
			}
		}
	}




	ToggleAttributesOption() {
		if (this.selectedInteraction?.assignTo?.AgentId == this.uid || this.showChatNotes == 'notes') {
			if ((this.showChatNotes == 'text' && this.selectedInteraction?.channel == 'WA API' && this.selectedInteraction?.progressbar?.progressbarValue > 0) || (this.showChatNotes == 'text' && this.selectedInteraction.channel == 'WA Web') || this.showChatNotes == 'notes') {
				const selection = window.getSelection();
				this.lastCursorPosition = selection?.getRangeAt(0) || null;
				this.closeAllModal()
				$("#atrributemodal").modal('show');
			}
		}

	}

	showToolTip(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target?.classList?.contains('fallback-tooltip')) {
			this.showInfo = true;
		}
	}
	UpdateVariable(event: any, index: number) {
		let currentValue = event?.target?.value;
		const forbiddenKeys = ['{', '}'];
		if (forbiddenKeys.some(key => currentValue.includes(key))) {
			currentValue = currentValue.replace(/[{}]/g, '');
			event.target.value = currentValue;
		}

		if (this.isFallback[index] == true) {
			event.target.value = ''
			currentValue = '';
			this.variableValues[index] = "";
			this.fallbackvalue[index] = "";
		}
		this.isFallback[index] = this.isCustomValue(currentValue);
		if (!this.isFallback[index]) {
			this.fallbackvalue[index] = "";
		}
	}
	UpdateButtonsVariableState(event: any, index: number) {
		let currentValue = event?.target?.value;
		const forbiddenKeys = ['{', '}'];
		if (forbiddenKeys.some(key => currentValue.includes(key))) {
			currentValue = currentValue.replace(/[{}]/g, '');
			event.target.value = currentValue;
		}

		if (this.buttonsVariable[index].isAttribute == true) {
			event.target.value = ''
			currentValue = '';
			this.buttonsVariable[index].value = "";
			this.buttonsVariable[index].Fallback = "";
		}
		this.buttonsVariable[index].isAttribute = this.isCustomValue(currentValue);
		if (!this.buttonsVariable[index].isAttribute) {
			this.buttonsVariable[index].Fallback = "";
		}
	}

	selectAttributes(item: any) {
		const selectedValue = item;
		let content: any = '';
		content = this.chatEditor.value || '';
		const container = document.createElement('div');
		container.innerHTML = this.chatEditor?.value;
		this.insertAtCursor(selectedValue);
		this.closeAllModal();
	}

	insertAtCursor(selectedValue: any) {
		const spaceNode = document.createElement('span');
		spaceNode.innerHTML = '&nbsp;';
		spaceNode.setAttribute('contenteditable', 'false');
		this.lastCursorPosition?.insertNode(spaceNode);
		setTimeout(() => {
			const range = document.createRange();
			const selection = window.getSelection();
			range.setStartAfter(spaceNode);
			range.setEndAfter(spaceNode);

			selection?.removeAllRanges();
			selection?.addRange(range);
		}, 100);
		const newNode = document.createElement('span');
		newNode.innerHTML = '<span contenteditable="false" class="e-mention-chip"><a _ngcontent-yyb-c67="" title="">{{' + selectedValue + '}}</a></span>';
		this.lastCursorPosition?.insertNode(newNode);
	}



	isCustomValue(value: string): boolean {
		if (value) {
			let isMatched = false
			const availableAttributes = this.attributesList.map((attribute: string) => `{{${attribute}}}`);
			availableAttributes.forEach((attribute: string) => {
				if (attribute == value) {
					isMatched = true;
				}

			});
			return isMatched
		}
		else {
			return false;
		}
	}

	ToggleQuickReplies() {

		if (this.selectedInteraction?.assignTo?.AgentId == this.uid || this.showChatNotes == 'notes') {
			if ((this.showChatNotes == 'text' && this.selectedInteraction?.channel == 'WA API' && this.selectedInteraction?.progressbar?.progressbarValue > 0) || (this.showChatNotes == 'text' && this.selectedInteraction.channel == 'WA Web') || this.showChatNotes == 'notes') {
				this.closeAllModal()
				this.getQuickResponse();
				$("#quikpopup").modal('show');
			}
		}
	}


	selectQuickReplies(item: any) {
		this.closeAllModal()
		let mediaContent
		let mediaName
		const fileNameWithPrefix = item?.Links.substring(item?.Links.lastIndexOf('/') + 1);
		let originalName;
		if (item?.media_type === 'video') {
			originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
			originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
		} else {
			originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
		}
		if (item?.media_type === 'text') { mediaName = '' }
		else if (item?.media_type === 'image') {
			mediaContent = '<p><img style="width:100%; height:100%" src="' + item?.Links + '"></p>'
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> ' + originalName + '</p>'
		}
		else if (item?.media_type === 'video') {
			mediaContent = '<p><video controls style="width:100%; height:100%" src="' + item?.Links + '"></video></p>'
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> ' + originalName + '</p>'
		}
		else {
			mediaContent = '<p style="text-align: center;><a href="' + item?.Links + '"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" alt="icon"/>' + originalName + '</p>'
		}
		var htmlcontent = mediaName + item?.BodyText;
		this.chatEditor.value = htmlcontent
		this.mediaType = item?.media_type
		this.messageMediaFile = item?.Links;
		this.addingStylingToMedia(item);
	}
	addingStylingToMedia(item: any) {
		if (item?.media_type === 'image' || item?.media_type === 'video' || item?.media_type === 'document') {
			setTimeout(() => {
				const editorContent = this.chatEditor.element.querySelector('.e-content');
				const mediaElements = editorContent?.querySelectorAll('img, video');

				mediaElements?.forEach((element) => {
					const media = element as HTMLElement;

					media.style.width = '18px';
					media.style.height = '10%';
					media.style.position = 'inherit';
					media.style.zIndex = '99';

					const crossButton = document.createElement('button');
					crossButton.textContent = '✖';
					crossButton.style.position = 'absolute';
					crossButton.style.right = '5px';
					crossButton.style.zIndex = '100';
					crossButton.style.background = '#ffffff';
					crossButton.style.color = 'red';
					crossButton.style.width = '24px';
					crossButton.style.border = 'none';
					crossButton.style.outline = 'none';
					crossButton.style.borderRadius = '50%';
					crossButton.style.cursor = 'pointer';
					crossButton.style.pointerEvents = 'auto';

					const parentElement = media.parentElement as HTMLElement;
					parentElement.style.position = 'relative';
					parentElement.style.width = '34%';
					parentElement.style.overflow = 'hidden';
					parentElement.style.textOverflow = 'ellipsis';
					parentElement.style.whiteSpace = 'nowrap';
					parentElement.style.paddingRight = '30px';
					parentElement.style.border = '0.5px solid';
					parentElement.style.padding = '4px';

					parentElement.style.pointerEvents = 'none';
					parentElement.setAttribute('contenteditable', 'false');
					parentElement.appendChild(crossButton);

					crossButton.addEventListener('click', () => {
						const mediaNameElement = editorContent?.querySelector('.custom-class-attachmentType');
						if (mediaNameElement) {
							mediaNameElement.remove();
						}
						if (this.mediaType) {
							this.mediaType = ''
							this.messageMeidaFile = ''
						}
						media.remove();
						crossButton.remove();
					});
				});
			}, 0);
		}
	}
	searchQuickReply(event: any) {
		let searchKey = event.target.value || '';
		if (searchKey.length > 2) {
			var allList = this.QuickReplyListMain
			let FilteredArray = [];
			for (var i = 0; i < allList.length; i++) {
				var content = allList[i]?.title?.toLowerCase()
				if (content.indexOf(searchKey.toLowerCase()) !== -1) {
					FilteredArray.push(allList[i])
				}
			}
			this.QuickReplyList = FilteredArray
		} else {
			this.QuickReplyList = this.QuickReplyListMain
		}
	}

	searchTemplate(event: any) {
		let searchKey = event.target.value || '';
		if (searchKey.length > 2) {
			var allList = this.allTemplatesMain
			let FilteredArray: any[] = [];
			for (var i = 0; i < allList.length; i++) {
				var content = allList[i]?.TemplateName.toLowerCase()
				if (content.indexOf(searchKey.toLowerCase()) !== -1) {
					FilteredArray.push(allList[i])
				}
			}
			this.allTemplates = FilteredArray
		} else {
			this.allTemplates = this.allTemplatesMain;
		}
	}


	filterTemplate(temType: any) {

		var type = temType.target.value;
		this.isFilterTemplate[type] = !this.isFilterTemplate[type];

		let allList = this.allTemplatesMain;

		var newArray = [];
		for (var m = 0; m < allList.length; m++) {
			var category = allList[m]['Category'];
			if (this.isFilterTemplate[category]) {
				newArray.push(allList[m])
			}

		}
		this.allTemplates = newArray

	}

	ToggleAttachmentBox() {

		if (this.selectedInteraction?.assignTo?.AgentId == this.uid || this.showChatNotes == 'notes') {
			if ((this.showChatNotes == 'text' && this.selectedInteraction.channel == 'WA API' && this.selectedInteraction?.progressbar?.progressbarValue > 0) || (this.showChatNotes == 'text' && this.selectedInteraction.channel == 'WA Web') || this.showChatNotes == 'notes') {
				this.closeAllModal()
				$("#attachfle").modal('show');
				document.getElementById('attachfle')!.style.display = 'inherit';
				this.dragAreaClass = "dragarea";
			}
		}
	}
	sendattachfile() {
		if (this.isAttachmentMedia === false) {
			if (this.messageMeidaFile !== '') {
				$("#sendfile").modal('show');
			} else {
				$("#sendfile").modal('hide');
			}
		} else {
			let mediaCategory;
			if (this.mediaType.startsWith('image/')) {
				mediaCategory = 'image';
			} else if (this.mediaType.startsWith('video/')) {
				mediaCategory = 'video';
			} else if (this.mediaType === 'application/') {
				mediaCategory = 'document';
			}

			if (this.selectedTemplate.media_type === mediaCategory) {
				this.selectedTemplate.Links = this.attachmentMedia;
				$("#attachfle").modal('hide');
				$("#editTemplate").modal('show');
				this.messageMeidaFile = '';
			} else {
				this.showToaster('! Please only upload media that matches selected template', 'error');
				$("#attachfle").modal('hide');
				$("#editTemplate").modal('show');
				this.messageMeidaFile = '';
			}
		}
	}

	getMimeTypePrefix(mimeType: string): string {
		return mimeType.split('/')[0];
	}
	attachMedia(Link: string, media_type: string) {
		this.closeAllModal()
		let mediaName
		const fileNameWithPrefix = Link.substring(Link.lastIndexOf('/') + 1);
		let originalName;
		let getMimeTypePrefix = this.getMimeTypePrefix(media_type);
		if (getMimeTypePrefix === 'video/') {
			originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
			originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
		} else {
			originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
		}
		console.log(getMimeTypePrefix);
		if (getMimeTypePrefix === 'image') {
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> ' + originalName + '</p>'
		}
		else if (getMimeTypePrefix === 'video') {
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> ' + originalName + '</p>'
		}
		else {
			media_type = 'document';
			getMimeTypePrefix = 'document';
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" alt="icon"/>' + originalName + '</p><br>'
		}
		const editorElement = this.chatEditor?.contentModule?.getEditPanel?.();

		if (editorElement) {
			const existingMediaElement = editorElement.querySelector('.custom-class-attachmentType');

			if (existingMediaElement) {
				const newElement = document.createElement('div');
				newElement.innerHTML = mediaName + '<br>';
				editorElement.replaceChild(newElement.firstElementChild!, existingMediaElement);
			} else {
				const editorValue = this.chatEditor.value ?? '<br>';
				this.chatEditor.value = mediaName + editorValue;
			}
		}
		this.mediaType = media_type
		this.messageMediaFile = Link;
		let item = {
			media_type: getMimeTypePrefix,
		}
		this.addingStylingToMedia(item);
	}
	sendMediaMessage(isTemplate: boolean = false, templateTxt: string = '') {
		if (this.SIPthreasholdMessages > 0) {
			let objectDate = new Date();
			console.log(this.chatEditor.value);
			var cMonth = String(objectDate.getMonth() + 1).padStart(2, '0');
			var cDay = String(objectDate.getDate()).padStart(2, '0');
			var createdAt = objectDate.getFullYear() + '-' + cMonth + '-' + cDay + 'T' + objectDate.getHours() + ':' + objectDate.getMinutes() + ':' + objectDate.getSeconds()
			var bodyData = {
				InteractionId: this.selectedInteraction.InteractionId,
				CustomerId: this.selectedInteraction.customerId,
				SPID: this.SPID,
				AgentId: this.AgentId,
				messageTo: this.selectedInteraction.Phone_number,
				message_text: isTemplate ? templateTxt : (this.chatEditor.value || ""),
				Message_id: this.newMessage.value.Message_id,
				mediaSize: this.mediaSize,
				message_media: this.messageMeidaFile,
				media_type: this.mediaType,
				quick_reply_id: '',
				template_id: '',
				message_type: this.showChatNotes,
				created_at: new Date()
			}

			let input = {
				spid: this.SPID,
			};
			this.settingService.clientAuthenticated(input).subscribe(response => {
				//response.status === 404
				if (response.status === 404 && this.showChatNotes != 'notes' && this.selectedInteraction?.channel != 'WA API') {
					this.showToaster('The Channel of this conversation is currently disconnected. Please Reconnect this channel from Account Settings to use it.', 'error')
					return;
				}
				//response.status === 200 && response.message === 'Client is ready !
				else if ((response.status === 200 && response.message === 'Client is ready !') || this.showChatNotes == 'notes' || (this.selectedInteraction?.channel == 'WA API')) {
					this.apiService.sendNewMessage(bodyData).subscribe(async data => {
						var responseData: any = data
						if (this.newMessage.value.Message_id == '') {
							var insertId: any = responseData.insertId
							if (insertId) {
								var lastMessage = {
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
									"mediaSize": bodyData.mediaSize
								}

								if (this.showChatNotes == 'text') {
									// var allmessages =this.selectedInteraction.allmessages
									// this.selectedInteraction.lastMessage= lastMessage
									// allmessages.push(lastMessage)
									// this.selectedInteraction.messageList =this.groupMessageByDate(allmessages)
									this.getMessagesById(insertId);
									setTimeout(() => {
										this.chatSection?.nativeElement.scroll({ top: this.chatSection?.nativeElement.scrollHeight })
									}, 500);

								} else {
									var allnotes = this.selectedInteraction.allnotes
									allnotes.push(lastMessage)
									this.selectedInteraction.notesList = this.groupMessageByDate(allnotes)
									setTimeout(() => {
										this.notesSection?.nativeElement.scroll({ top: this.notesSection?.nativeElement.scrollHeight })
									}, 500);


								}
								this.chatEditor.value = '';
								this.messageMeidaFile = '';
								this.mediaType = '';
								this.SIPthreasholdMessages = this.SIPthreasholdMessages - 1;
								this.isTemplate = false;
								this.headerText = '';
								this.bodyText = '';
								this.templateButton = [];
								this.buttonsVariable = [];
							}


						} else {
							this.selectedNote.message_text = bodyData.message_text
						}


						this.newMessage.reset({
							Message_id: ''
						});
					});
				}
				// },
				// (error)=> {
				// 	if(error) {
				// 		this.showToaster('Internal Server Error Please Contact System Adminstrator','error');
				// 	}
			});
		} else {
			this.showToaster('Oops! CIP message limit exceed please wait for 5 min...', 'warning')
		}
		// this.sendMessage()
		this.closeAllModal();
		$("#sendfile").modal('hide');
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
	}
	onFileChange(event: any) {
		this.isUploadingLoader = true;
		let files: FileList = event.target.files;
		this.saveFiles(files);

	}
	downloadFile(fileUrl: any) {
		window.open(fileUrl, '_blank')
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
		if (event.dataTransfer.files) {
			this.dragAreaClass = "dragarea";
			event.preventDefault();
			// event.stopPropagation();

			// let files: FileList = event.dataTransfer.files;
			// this.saveFiles(files);
		}
	}

	saveFiles(files: FileList) {
		if (files[0]) {
			let imageFile = files[0]
			let spid = this.SPID
			if ((files[0].type == 'video/mp4' || files[0].type == 'application/pdf' || files[0].type == 'image/jpg' || files[0].type == 'image/jpeg' || files[0].type == 'image/png' || files[0].type == 'image/webp')) {
				this.mediaType = files[0].type
				let fileSize = files[0].size;

				const fileSizeInMB: number = parseFloat((fileSize / (1024 * 1024)).toFixed(2));
				const imageSizeInMB: number = parseFloat((5 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
				const docVideoSizeInMB: number = parseFloat((10 * 1024 * 1024 / (1024 * 1024)).toFixed(2));

				const data = new FormData();
				data.append('dataFile', imageFile, imageFile.name);

				if ((this.mediaType == 'video/mp4' || this.mediaType == 'application/pdf') && fileSizeInMB > docVideoSizeInMB) {
					this.showToaster('Video / Document File size exceeds 10MB limit', 'error');
				}

				else if ((this.mediaType == 'image/jpg' || this.mediaType == 'image/jpeg' || this.mediaType == 'image/png' || this.mediaType == 'image/webp') && fileSizeInMB > imageSizeInMB) {
					this.showToaster('Image File size exceeds 5MB limit', 'error');
				}

				else {
					let name = 'teambox'
					this.apiService.uploadfile(data, spid, name).subscribe(uploadStatus => {
						let responseData: any = uploadStatus
						if (responseData.filename) {
							this.messageMeidaFile = responseData.filename;
							this.messageMediaFile = responseData.filename;
							this.attachmentMedia = responseData.filename;
							this.mediaSize = responseData.fileSize
							console.log(this.mediaSize);
							console.log(this.selectedTemplate);
							this.sendattachfile();
							console.log(this.messageMeidaFile);
							this.showAttachmenOption = false;
							this.isUploadingLoader = false;
						}

					});
				}
			} else {
				this.showToaster('Please select valid file type', 'error')
			}

		};
	}

	async ngOnInit() {
		this.isLoading = true;
		switch (this.loginAs) {
			case 1:
				this.loginAs = 'Admin'
				break;
			case 2:
				this.loginAs = 'Manager'
				break;
			case 3:
				this.loginAs = 'Agent'
				break;
			case 4:
				this.loginAs = 'Helper'
				break;
			default:
				this.loginAs = 'Agent'
		}
		this.routerGuard()
		this.getCustomFieldsData();
		//this.getAgents()
		this.getUserList()
		this.getBotList()
		this.getInteractionsOnScroll()
		this.getContactOnScroll()
		//this.getCustomers()
		this.getquickReply()
		// this.getTemplates()
		this.subscribeToNotifications();
		this.getAttributeList();
		//  this.sendattachfile();
		this.getQuickResponse();
		this.getTagData();
		this.getWhatsAppDetails();
		this.openNewMessagePopup();
		this.NewContactForm = this.newContact;
		this.EditContactForm = this.editContact;

		this.dynamicDropdownSettings = {
			singleSelection: false,
			idField: 'id',
			textField: 'optionName',
			selectAllText: 'Select All',
			unSelectAllText: 'UnSelect All',
			itemsShowLimit: 3,
			allowSearchFilter: false
		};
	}

	ngAfterViewInit() {
		this.scrollChatToBottom();
	}

	scrollChatToBottom() {
		const chatWindowElement = this.chatSection?.nativeElement;
		const notesWindowElement = this.notesSection?.nativeElement
		if (chatWindowElement) {
			chatWindowElement.scrollTop = chatWindowElement.scrollHeight;
		}
		if (notesWindowElement) {
			notesWindowElement.scrollTop = notesWindowElement.scrollHeight;
		}
	}

	async subscribeToNotifications() {
		let notificationIdentifier = {
			"UniqueSPPhonenumber": (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number,
			"spPhoneNumber": JSON.parse(sessionStorage.getItem('SPPhonenumber')!)
		}
		this.websocketService.connect(notificationIdentifier);
		this.websocketService.getMessage()?.pipe().subscribe((message: any) => {
			console.log(message);
			console.log(this.interactionList, 'check id');
			if (message != undefined) {
				console.log("Seems like some message update from webhook");
				console.log(message)
				try {
					let msgjson = message;

					try {
						msgjson = JSON.parse(message);
					}
					catch (je) {
						//console.log("it could already be a JSON");
					}
					if (msgjson.displayPhoneNumber) {
						console.log(this.selectedInteraction);
						console.log("Got notification to update messages : " + msgjson.displayPhoneNumber);
						if (msgjson.message) {
							if (msgjson.message == this.selectedInteraction?.InteractionId) {
								if (msgjson.msg_id == 'Assign Agent') {
									this.getInteraction(this.selectedInteraction?.InteractionId);

								} else if (msgjson.msg_id == 'Status changed') {
									this.getInteractionStatus(this.selectedInteraction?.InteractionId);
								}
								else {
									if (msgjson.msg_status == "IN" || msgjson?.status == "IN") {
										//this.updateMessages();
										this.getMessagesById(msgjson?.msg_id);
										setTimeout(() => {
											this.chatSection?.nativeElement.scroll({ top: this.chatSection?.nativeElement.scrollHeight })
										}, 600);
									} else {
										// if(msgjson.msg_status == 1){
										// this.getMessageData(this.selectedInteraction,true)
										// }else{
										if (msgjson.msg_id == 'Smartreply')
											this.getMessageData(this.selectedInteraction, true);
										else
											this.getMessageData(this.selectedInteraction, true, true)
										//}
									}
								}
							} else {
								this.updateInteraction(msgjson.message);
							}
							//this.getAllInteraction(false)	
							// setTimeout(() => {
							//this.selectInteraction(this.selectedInteraction)
							this.scrollChatToBottom()
							this.tickUpdate(message)
							// }, 100);

						}
					}
				}
				catch (e) {
					console.log(e);
				}
			}
		});
	}

	async getquickReply() {
		this.apiService.getquickReply(this.SPID).subscribe(quickReply => {
			this.QuickReplyListMain = quickReply
			this.QuickReplyList = quickReply
		})

	}

	updateMessages() {
		this.getMessageData(this.selectedInteraction, true);
	}

	async updateInteraction(id: any) {
		console.log(this.interactionList);
		let idx = this.interactionList.findIndex((items: any) => items.InteractionId == id);
		if (idx > -1) {
			console.log(this.interactionList);
			// if(this.interactionList[idx]['messageList'])
			// 	await this.getMessageData(this.interactionList[idx],true);
			// else
			this.getInteractionDataById(idx)
			console.log(this.interactionList);
			setTimeout(() => {
				let item = this.interactionList[idx];
				let count = 0;
				this.interactionList[idx]['message_text'] = item['allmessages'] ? item['allmessages'][item['allmessages'].length - 1]['message_text'] : [];
				item['allmessages'].forEach((it: any) => {
					if (it.is_read == 0)
						count++;
				})
				this.interactionList[idx]['LastMessageDate'] = item['allmessages'] ? item['allmessages'][item['allmessages'].length - 1]['created_at'] : [];
				this.interactionList[idx]['UnreadCount'] = count;
				this.updateUnreadCount();
				this.interactionList = this.moveItemToFirstPosition(this.interactionList, idx);
				this.interactionListMain = JSON.parse(JSON.stringify(this.interactionList));
			}, 400)
			console.log(this.interactionList[idx]);
		}
	}

	moveItemToFirstPosition(items: any[], idx: any): any[] {
		if (idx > -1) {
			const item = items.splice(idx, 1)[0];
			items.unshift(item);
		}
		console.log(items);
		return items;
	}


	async getQuickResponse() {
		this.settingService.getTemplateData(this.SPID, 0).subscribe(response => {
			this.QuickReplyList = response.templates;
		});
	}


	async getTemplates(channel: any) {
		let spid = Number(this.SPID)

		this.settingService.getApprovedTemplate(spid, 1).subscribe(allTemplates => {
			allTemplates?.templates.forEach((item: any) => {
				item.buttons = JSON.parse(item?.buttons ? item?.buttons : '[]');
			});

			this.allTemplatesMain = allTemplates.templates
			console.log(this.allTemplatesMain)
			this.allTemplates = allTemplates.templates;

			this.allTemplates = this.allTemplates.filter((item: any) => item.Channel == channel);
			this.allTemplatesMain = JSON.parse(JSON.stringify(this.allTemplatesMain.filter((item: any) => item.Channel == channel)));

		})

	}

	focusInChatFunction() {
		this.searchChatFocused = true
	}

	focusOutChatFunction() {
		this.searchChatFocused = false
	}
	focusInFunction() {
		this.searchFocused = true
	}
	focusOutFunction() {
		this.searchFocused = false
	}
	toggleProfileView() {
		// console.log(this.selectedInteraction)
		this.showFullProfile = !this.showFullProfile
	}
	toggleAttachedMediaView() {
		this.showAttachedMedia = !this.showAttachedMedia
	}

	updateOptedIn(event: any) {
		this.OptedIn = event.target.checked ? 'Yes' : 'No';
	}
	getCustomers(isAddContacts: boolean = false) {
		let rangeStart = this.contactCurrentPage;
		let rangeEnd = this.contactCurrentPage + this.contactPageSize;
		this.isLoading = rangeStart == 0 ? true : false;
		this.apiService.getCustomers(this.SPID, rangeStart, rangeEnd).subscribe((data: any) => {
			this.isLoadingOnScroll = false;
			this.isLoading = false;
			this.isContactCompleted = data?.isCompleted ? data?.isCompleted : false;
			if (isAddContacts) {
				this.contactList.push(...data?.results);
				this.contactListInit.push(...data?.results);
			}
			else {
				this.contactList = data?.results;
				this.contactListInit = data?.results;
			}
		});
	}

	getAgents() {
		this.apiService.getAgents(this.SPID).subscribe(data => {
			this.agentsList = data;
			if (this.agentsList.length) this.filteredAgentList = this.agentsList;
			this.agentsList.forEach((item: { name: string; nameInitials: string; }) => {
				const nameParts = item.name.split(' ');
				const firstName = nameParts[0] || '';
				const lastName = nameParts[1] || '';
				const nameInitials = firstName.charAt(0) + ' ' + lastName.charAt(0);

				item.nameInitials = nameInitials;
			});
			this.mentionAgentsList = this.agentsList.filter((item: any) => item.uid != this.uid);
			console.log(this.agentsList, 'agentlist')
		});

	}
	async getAssicatedInteractionData(dataList: any, selectInteraction: any = true) {

		let threasholdMessages = 0
		dataList.forEach((item: any, idx: number) => {

			item['tags'] = this.getTagsList(item.tag)

			this.apiService.getAllMessageByInteractionId(item.InteractionId, 'text', this.SPID).subscribe(messageList => {
				item['messageList'] = messageList ? this.groupMessageByDate(messageList) : []
				item['allmessages'] = messageList ? messageList : []

				var lastMessage = [];
				if (item['allmessages']) {
					let filteredMsg = item['allmessages'].filter((item: any) => item.message_direction == 'In');
					lastMessage = filteredMsg[filteredMsg.length - 1]
				}
				console.log(lastMessage);
				item['lastMessage'] = lastMessage
				item['lastMessageReceved'] = this.timeSinceLastMessage(item.lastMessage)
				item['progressbar'] = this.getProgressBar(item.lastMessage)
				item['UnreadCount'] = this.getUnreadCount(item.allmessages)


				var messageSentCount: any = this.threasholdMessages(item.allmessages)
				threasholdMessages = threasholdMessages + messageSentCount
				this.SIPthreasholdMessages = this.SIPmaxMessageLimt - threasholdMessages
				// if(idx==(dataList.length-1) && !this.isNewInteraction) {
				// 	this.getUpdatedList(dataList);
				// 	this.isNewInteraction = false;
				// } 
			})

			this.apiService.getAllMessageByInteractionId(item.InteractionId, 'notes', this.SPID).subscribe(notesList => {
				item['notesList'] = notesList ? this.groupMessageByDate(notesList) : []
				item['allnotes'] = notesList ? notesList : []
			})

			this.apiService.getAllMessageByInteractionId(item.InteractionId, 'media', this.SPID).subscribe(mediaList => {
				item['allmedia'] = mediaList ? mediaList : []
			})


			this.apiService.getInteractionMapping(item.InteractionId).subscribe(mappingList => {
				var mapping: any = mappingList;
				item['assignTo'] = mapping ? mapping[mapping.length - 1] : '';
			})

			this.apiService.checkInteractionPinned(item.InteractionId, this.AgentId).subscribe(pinnedList => {
				var isPinnedArray: any = pinnedList
				if (isPinnedArray.length > 0) {
					this.notesSection?.nativeElement.scroll({ top: this.notesSection?.nativeElement.scrollHeight })
					item['isPinned'] = true

				} else {
					item['isPinned'] = false
				}
			})


		});
		// console.log(dataList,'Data LIST')
		this.interactionList = dataList
		this.interactionListMain = dataList



		setTimeout(() => {
			this.notesSection?.nativeElement.scroll({ top: this.notesSection?.nativeElement.scrollHeight })
		}, 2000);

		setTimeout(() => {
			this.chatSection?.nativeElement.scroll({ top: this.chatSection?.nativeElement.scrollHeight })
		}, 2000);

		if (dataList[0] && selectInteraction) {
			this.selectInteraction(0)
		}


	}

	async getInteractionDataById(idx: number) {
		let item: any = {};
		item = this.interactionList[idx];
		let threasholdMessages = 0;
		item['tags'] = this.getTagsList(item?.tag);
		this.apiService.getAllMessageByInteractionId(item.InteractionId, 'text', this.SPID).subscribe((res: any) => {
			this.isMessageCompletedText = res.isCompleted;
			let messageList = res.result;
			item['messageList'] = messageList ? this.groupMessageByDate(messageList) : []
			console.log(item['messageList']);
			item['allmessages'] = messageList ? messageList : []

			var lastMessage = [];
			if (item['allmessages']) {
				let filteredMsg = item['allmessages'].filter((item: any) => item.message_direction == 'IN');
				lastMessage = filteredMsg[filteredMsg.length - 1]
			}
			console.log(lastMessage);
			item['lastMessage'] = lastMessage
			item['lastMessageReceved'] = this.timeSinceLastMessage(item.lastMessage)
			item['progressbar'] = this.getProgressBar(item.lastMessage)
			item['UnreadCount'] = this.getUnreadCount(item.allmessages)

			var messageSentCount: any = this.threasholdMessages(item.allmessages)
			threasholdMessages = threasholdMessages + messageSentCount
			this.SIPthreasholdMessages = this.SIPmaxMessageLimt - threasholdMessages

		})

		this.apiService.getAllMessageByInteractionId(item.InteractionId, 'notes', this.SPID).subscribe((res1: any) => {
			this.isMessageCompletedNotes = res1.isCompleted;
			let notesList = res1.result;
			item['notesList'] = notesList ? this.groupMessageByDate(notesList) : []
			item['allnotes'] = notesList ? notesList : []
		})

		this.apiService.getAllMessageByInteractionId(item.InteractionId, 'media', this.SPID).subscribe((res2: any) => {
			this.isMessageCompletedMedia = res2.isCompleted;
			let mediaList = res2.result;
			item['allmedia'] = mediaList ? mediaList : []
		})


		this.apiService.getInteractionMapping(item.InteractionId).subscribe(mappingList => {
			var mapping: any = mappingList;
			item['assignTo'] = mapping ? mapping[mapping.length - 1] : '';
		})

		this.apiService.checkInteractionPinned(item.InteractionId, this.AgentId).subscribe(pinnedList => {
			var isPinnedArray: any = pinnedList
			if (isPinnedArray.length > 0) {
				this.notesSection?.nativeElement.scroll({ top: this.notesSection?.nativeElement.scrollHeight })
				item['isPinned'] = true

			} else {
				item['isPinned'] = false
			}
		})

		this.interactionList[idx] = item;
		this.interactionListMain[idx] = item;

		// if(this.interactionList[idx]){
		// 	this.selectInteraction(idx)
		// }
	}

	async getMessageData(selectedInteraction: any, isNewMessage: boolean, updateMessage: boolean = false) {
		let item: any = {};
		let rangeStart = isNewMessage ? 0 : this.messageRangeStart;
		let rangeEnd = isNewMessage ? 1 : this.messageRangeEnd;
		let originalScrollPosition = this.scrollContainer?.nativeElement?.scrollTop;
		const originalScrollHeight = this.scrollContainer?.nativeElement?.scrollHeight;
		console.log(originalScrollHeight);
		item = selectedInteraction;
		this.apiService.getAllMessageByInteractionId(item.InteractionId, 'text', this.SPID, rangeStart, rangeEnd).subscribe((res: any) => {
			let messageList = res.result;
			let val = messageList ? this.groupMessageByDate(messageList) : [];
			let val1 = messageList ? messageList : [];
			if (isNewMessage && !updateMessage) {
				val.forEach(childObj => {
					const parentObjIndex = item['messageList']?.findIndex((parentObj: any) => parentObj.date === childObj.date);
					if (parentObjIndex !== -1) {
						item['messageList'][parentObjIndex].items = [...item['messageList'][parentObjIndex].items, ...childObj.items];
					} else {
						item['messageList']?.push(childObj);
					}
				})
				item['allmessages'].push(...val1);
			} else if (isNewMessage && updateMessage) {
				let idx = this.interactionList.findIndex((item: any) => item.InteractionId == selectedInteraction.InteractionId);
				val.forEach(childObj => {
					const parentObjIndex = item['messageList']?.findIndex((parentObj: any) => parentObj.date === childObj.date);
					if (parentObjIndex !== -1) {
						item['messageList'][parentObjIndex].items[item['messageList'][parentObjIndex].items.length - 1] = childObj.items[0];
						if (idx != -1) {
							this.interactionList[idx].message_text = childObj.items[0].message_text;
							this.interactionList[idx].LastMessageDate = childObj.items[0].created_at;
							//this.interactionList[idx].message_media = 'text';
						}
					} else {
						item['messageList']?.push(childObj);
					}
				})
				//item['messageList'].splice(item['messageList'].length-1,1)
				item['allmessages'].splice(item['allmessages'].length - 1, 1)
				// item['messageList'].push(val);
				item['allmessages'].push(val1);

			}
			else {
				this.isMessageCompletedText = res.isCompleted;
				item['messageList'] = [...val, ...item['messageList']];
				item['allmessages'] = [...val1, ...item['allmessages']];
			}
			this.isLoadingOlderMessage = false;
		})

		// this.apiService.getAllMessageByInteractionId(item.InteractionId,'notes',this.SPID,rangeStart,rangeEnd).subscribe((res1:any) =>{
		// 	let notesList = res1.result;
		// 	let val = notesList?this.groupMessageByDate(notesList):[];
		// 	this.isMessageCompletedNotes = res1.isCompleted;
		// 	let val1 = notesList?notesList:[];
		// 	if(isNewMessage){
		// 		item['notesList'].push(...val);
		// 		item['allnotes'].push(...val1);
		// 	}else{
		// 	this.isMessageCompletedNotes = res1.isCompleted;
		// 	item['notesList'] =[...val, ...item['notesList']];
		// 	item['allnotes'] =[...val1, ...item['allnotes']];
		// 	}
		// })

		this.apiService.getAllMessageByInteractionId(item.InteractionId, 'media', this.SPID, rangeStart, rangeEnd).subscribe((res2: any) => {
			let mediaList = res2.result;
			let val = mediaList ? mediaList : [];
			if (isNewMessage) {
				item['allmedia'].push(...val);
			} else {
				this.isMessageCompletedMedia = res2.isCompleted;
				item['allmedia'] = [...val, ...item['allmedia']];
			}
		})

		if (!isNewMessage) {
			setTimeout(() => {
				originalScrollPosition = originalScrollPosition == 0 ? 15 : originalScrollPosition;
				const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
				const scrollDifference = newScrollHeight - originalScrollHeight;
				this.scrollContainer.nativeElement.scrollTop = originalScrollPosition + scrollDifference;
				console.log(originalScrollPosition, newScrollHeight, originalScrollHeight)
			}, 800)
		}
	}

	getNoteData(selectedInteraction: any) {
		let item: any = {};
		item = selectedInteraction;
		let rangeStart = 0;
		let rangeEnd = 30;
		this.apiService.getAllMessageByInteractionId(item.InteractionId, 'notes', this.SPID, rangeStart, rangeEnd).subscribe((res1: any) => {
			let notesList = res1.result;
			let val = notesList ? this.groupMessageByDate(notesList) : [];
			this.isMessageCompletedNotes = res1.isCompleted;
			let val1 = notesList ? notesList : [];
			item['notesList'] = val;
			item['allnotes'] = val1;
		})
	}

	getUpdatedList(dataList: any) {
		console.log(dataList, 'Data LIST')
		this.interactionList = []
		this.interactionListMain = []

		dataList.forEach((item: any) => {
			if (item?.allmessages?.length > 0) {
				this.interactionList.push(item)
				this.interactionListMain.push(item)
			}
		})
	}
	async updatePinnedStatus(item: any) {
		var bodyData = {
			AgentId: this.AgentId,
			isPinned: item.PinnedInteractionID ? true : false,
			InteractionId: item.InteractionId
		};
		let idx = this.interactionList.findIndex((it: any) => it?.InteractionId == item.InteractionId);

		this.apiService.updateInteractionPinned(bodyData).subscribe(async response => {
			this.interactionList[idx].isPinned = !item.isPinned;
			this.interactionList[idx].PinnedInteractionID = this.interactionList[idx].PinnedInteractionID ? null : -1;
			console.log(this.interactionList[idx].PinnedInteractionID)
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

	async getMessagesById(messageId: any) {
		await this.apiService.getsavedMessages(this.SPID, messageId).subscribe(async (data: any) => {
			var dataList: any = data?.result;
			console.log(data);
			let item = this.selectedInteraction;
			let val = dataList ? this.groupMessageByDate(dataList) : [];
			let val1 = dataList ? dataList : [];
			val.forEach(childObj => {
				const parentObjIndex = item['messageList']?.findIndex((parentObj: any) => parentObj.date === childObj.date);
				if (parentObjIndex !== -1) {
					item['messageList'][parentObjIndex].items = [...item['messageList'][parentObjIndex].items, ...childObj.items];
				} else {
					item['messageList']?.push(childObj);
				}
			})
			item['allmessages'].push(...val1);
			item.message_text = val1[0]?.message_text;
			item.message_media = val1[0]?.message_media;
			item.media_type = val1[0]?.media_type;
		});
	}

	async getFilteredInteraction(filterBy: any) {
		await this.apiService.getFilteredInteraction(filterBy, this.AgentId, this.AgentName, this.SPID).subscribe(async data => {
			var dataList: any = data;
			this.getAssicatedInteractionData(dataList)
		});
	}

	async getAllInteraction(selectInteraction: any = true, isSearchInteraction: boolean = false) {
		let bodyData = {
			SearchKey: this.interactionSearchKey,
			FilterBy: this.interactionFilterBy,
			AgentId: this.AgentId,
			SPID: this.SPID,
			AgentName: this.AgentName,
			RangeStart: this.currentPage,
			RangeEnd: this.currentPage + this.pageSize
		}

		await this.apiService.getAllInteraction(bodyData).subscribe(async (data: any) => {
			this.isLoading = false;
			var dataList: any = data?.conversations;
			this.isCompleted = data?.isCompleted
			console.log(dataList, 'DataList *****')
			if (this.selectedInteraction && !isSearchInteraction) {
				this.selectedInteraction = dataList.filter((item: any) => item.InteractionId == this.selectedInteraction.InteractionId)[0];
			}
			//this.getAssicatedInteractionData(dataList,selectInteraction)
			setTimeout(() => {
				dataList.forEach((item: any) => {
					if (item.InteractionMapping != -1) {
						item.assignAgent = this.userList.filter((items: any) => items.uid == item.InteractionMapping)[0]?.name;
						console.log(this.userList);
					} else {
						item.assignAgent = 'Unassigned';
					}

				})
			}, 100)
			if (selectInteraction) {
				this.interactionList.push(...dataList);
				this.interactionListMain.push(...dataList);
			} else {
				this.interactionList = dataList;
				this.interactionListMain = dataList;
			}
			this.unreadList = this.interactionList.filter((item: any) => item?.UnreadCount != 0).length;
			if (!isSearchInteraction) {
				//this.selectedInteractionList =
				console.log('selectInteraction(0)');
				this.selectInteraction(0);
			}

		});
		this.scrollChatToBottom()
	}

	async getSearchInteractions(key: string) {
		await this.apiService.getSearchInteraction(key, 0, this.SPID).subscribe(async (data: any) => {
			var dataList: any = data?.result;
			this.interactionList = dataList;
			this.interactionListMain = dataList;
			this.unreadList = this.interactionList.filter((item: any) => item?.UnreadCount != 0).length;
			this.isCompleted = true;
		})
	}
	async getSearchInteraction(event: any) {
		console.log('Search keyup', event.target.value);
		if (event.target.value.length > 2) {
			var searchKey = event.target.value
			this.interactionSearchKey = searchKey;
			this.currentPage = 0;
			this.pageSize = 10;
			this.getSearchInteractions(searchKey);
		}
		else {
			this.interactionSearchKey = '';
			this.currentPage = 0;
			this.pageSize = 10;
			this.getAllInteraction(false, true);
		}

	}

	async seacrhInChat(event: any, selectInteraction: any = true) {
		//console.log('seacrhInChat')
		let searchKey = event.target.value
		if (searchKey.length > 1) {
			let FilteredArray = []
			let allmessages = []
			if (this.showChatNotes == 'text') {
				allmessages = this.selectedInteraction['allmessages']
			} else {
				allmessages = this.selectedInteraction['allnotes']
			}
			for (var i = 0; i < allmessages.length; i++) {
				let text = allmessages[i]['message_text']
				let content = text.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
				content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
				content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
				content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
				content = content.replace('&nbsp;', '\n')
				content = content.replace(/<br[^>]*>/g, '\n')
				content = content.replace(/<\/?[^>]+(>|$)/g, "")
				content = content.toLowerCase()

				if (content.indexOf(searchKey.toLowerCase()) !== -1) {
					FilteredArray.push(allmessages[i])
				}
			}

			if (this.showChatNotes == 'text') {
				this.selectedInteraction['messageList'] = FilteredArray.length > 0 ? this.groupMessageByDate(FilteredArray) : [{}]
			} else {
				this.selectedInteraction['notesList'] = FilteredArray.length > 0 ? this.groupMessageByDate(FilteredArray) : [{}]
			}


		} else {
			this.selectedInteraction['messageList'] = this.groupMessageByDate(this.selectedInteraction['allmessages'])
			this.selectedInteraction['notesList'] = this.groupMessageByDate(this.selectedInteraction['allnotes'])
		}

	}


	getFormatedDate(date: any) {
		if (date) {
			var time = new Date(new Date(date).toString());
			var timeString = time.toLocaleString('en-US', { hour: "2-digit", minute: "2-digit" })
			const tempDate: any = new Date(date).toString().split(' ');
			const formattedDate: any = tempDate['2'] + ' ' + tempDate['1'] + ' ' + tempDate['3'] + ', ' + timeString;
			return formattedDate
		} else {
			return '';
		}

	}

	getTagsList(tags: any) {
		if (tags) {
			const tagsArray = tags.split(',');
			return tagsArray
		} else {
			return [];
		}
	}

	dateSince(date: any) {
		if (date) {
			const monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];
			var a = new Date()
			var b = new Date(date)

			const _MS_PER_DAY = 1000 * 60 * 60 * 24;
			var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
			var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
			var groupDate = b.getDate() + ' ' + monthNames[b.getMonth()] + ' ' + b.getFullYear();
			var diffDays: any = Math.floor((utc1 - utc2) / _MS_PER_DAY);
			if (diffDays < 1) {
				return 'Today';
			}
			if (diffDays < 2) {
				return 'Yesterday';
			} else {
				return this.datePipe.transform(b, this.settingService.dateFormat);
			}

		} else {
			return ''
		}

	}


	timeSince(date: any) {
		if (date) {
			var messCreated = new Date(date)
			var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
			var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
			var hoursBH = hours < 10 ? "0" + hours : hours;
			var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
			var time = hoursBH + ":" + minutes + " " + am_pm;
			return this.datePipe.transform(messCreated, this.settingService.timeFormat == '12' ? 'hh:mm a' : 'HH:mm');

		} else {
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
			} else if (message.msg_status === '9') {
				return '../../../../assets/img/teambox/error.svg';
			} else {
				return '../../../../assets/img/teambox/tick-gry.svg';
			}
		}
	}


	threasholdMessages(allMessage: any) {
		let messageCount = 0
		if (allMessage.length > 0) {

			for (var i = 0; i < allMessage.length; i++) {
				var fiveMinuteAgo = new Date(Date.now() - 1000 * (60 * this.messageTimeLimit))
				var messCreated = new Date(allMessage[i].created_at)
				if (messCreated > fiveMinuteAgo) {
					messageCount++
				}
			}

		}
		return messageCount

	}
	getProgressBar(lastMessage: any) {
		let progressbar: any = [];
		if (lastMessage) {
			var date = lastMessage?.created_at
			var currentDate: any = new Date()
			var messCreated: any = new Date(date)
			var seconds = Math.floor((currentDate - messCreated) / 1000);
			var interval: any = seconds / 31536000;

			interval = seconds / 2592000;
			interval = seconds / 86400;
			interval = seconds / 3600;

			var hour = parseInt(interval)
			if (hour < 24) {
				var hrPer = (100 * hour) / 24
				var hourLeft = 24 - parseInt(interval)
			} else {
				var hrPer = 100
				var hourLeft = 0
			}
			progressbar['progressbarPer'] = "--value:" + hrPer;
			progressbar['progressbarValue'] = hourLeft;

		} else {
			var hrPer = 100
			var hourLeft = 0
			progressbar['progressbarPer'] = "--value:" + hrPer;
			progressbar['progressbarValue'] = hourLeft;
		}
		return progressbar;
	}
	timeSinceLastMessage(lastMessage: any) {
		if (lastMessage) {
			var date = lastMessage?.created_at
			var currentDate: any = new Date()
			var messCreated: any = new Date(date)
			var seconds = Math.floor((currentDate - messCreated) / 1000);
			var interval: any = seconds / 31536000;

			interval = seconds / 2592000;
			interval = seconds / 86400;
			interval = seconds / 3600;

			var hour = parseInt(interval)
			if (hour < 24) {
				var hrPer = (100 * hour) / 24
				var hourLeft = 24 - parseInt(interval)
			} else {
				var hrPer = 100
				this.hourLeft = 0
				if (this.selectedInteraction['interaction_status'] !== 'Resolved' && this.selectedInteraction['isBlocked'] != 1) {
					//this.updateConversationStatus('Resolved')
				}
			}


			var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
			var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
			var hoursBH = hours < 10 ? "0" + hours : hours;
			var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
			var time = hoursBH + ":" + minutes + " " + am_pm;
			return time

		} else {
			var hrPer = 100
			this.hourLeft = 0
			return '';
		}
	}

	async selectInteraction(idx: number,) {
		console.log(this.interactionList, 'check id')
		let Interaction = this.interactionList[idx];
		this.selectedInteraction = Interaction;
		//if(this.selectedInteractionList.findIndex(i => i == idx) == -1){
		//this.selectedInteractionList.push(idx)
		await this.getInteractionDataById(idx);
		//}
		for (const item of this.interactionList) {
			item['selected'] = false;
		}
		Interaction['selected'] = true;
		this.contactId = Interaction.customerId;
		let channel = Interaction['channel'];
		this.getTemplates(channel);
		this.selectedCountryCode = Interaction['countryCode'];
		this.Allmessages = Interaction['allmessages'];
		this.selectedInteraction = Interaction;
		this.isRefresh = false;
		setTimeout(() => { this.isRefresh = true; }, 50)
		this.getPausedTimer();
		setTimeout(() => {
			this.scrollChatToBottom();
		}, 1000);
	}

	formatDaysData(data: any): string {
		if (Array.isArray(data) && data.every(item => item.id && item.optionName)) {
			return data.map(day => `${day.id}:${day.optionName}`).join(',');
		}
		console.warn("Unexpected data format. Please check the input.");
		return data;
	}
	getPausedTimer() {
		//console.log('getPausedTimer')

		clearInterval(this.PauseTime);
		if (this.selectedInteraction.paused_till) {
			var countDownDate = new Date(this.selectedInteraction.paused_till).getTime();
			let that = this;
			this.PauseTime = setInterval(function () {

				// Get today's date and time
				var now = new Date().getTime();

				// Find the distance between now and the count down date
				var distance = countDownDate - now;

				// Time calculations for days, hours, minutes and seconds
				var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = Math.floor((distance % (1000 * 60)) / 1000);

				// Display the result in the element with id="demo"
				that.selectedInteraction['PausedTimer'] = minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');

				// If the count down is finished, write some text
				if (distance < 0) {
					clearInterval(that.PauseTime);
					that.selectedInteraction['PausedTimer'] = "";
					that.selectedInteraction['AutoReplyStatus'] = 'Auto Reply are Paused'
				}
			}, 1000);
		} else {
			this.selectedInteraction['PausedTimer'] = "";
			this.selectedInteraction['AutoReplyStatus'] = 'Enable'
		}

	}

	counter(i: number) {
		return new Array(i);
	}

	filterInteraction(filterBy: any) {
		this.selectedInteraction = []
		// if(filterBy != 'All'){
		// 	this.getFilteredInteraction(filterBy)
		// }else{
		// 	this.getAllInteraction(false);
		// }
		this.interactionFilterBy = filterBy
		this.getAllInteraction(false);
		this.ShowFilerOption = false;
		this.showfilter = false;

	}
	toggleFilerOption() {
		this.showfilter = !this.showfilter;
		this.ShowFilerOption = !this.ShowFilerOption;
	}

	toggleContactOption() {

		this.ShowContactOption = !this.ShowContactOption;
	}
	closeFilterOptions() {
		this.showfilter = false;
	}

	toggleChannelOption() {
		this.ShowChannelOption = !this.ShowChannelOption;
		this.ShowLeadStatusOption = false;
		this.ShowGenderOption = false;
	}
	toggleGenderOption() {
		this.ShowGenderOption = !this.ShowGenderOption;
		this.ShowLeadStatusOption = false;
		this.ShowChannelOption = false;
	}
	selectChannelOption(Channel: any) {
		if (Channel.channel_status == 0) {
			this.showToaster('This Channel is currently disconnected. Please Reconnect this channel from Account Settings to use it.', 'error');
			return;
		}
		if (Channel?.channel_status == 1) {
			this.selectedChannel = Channel?.channel_id;
			this.ShowChannelOption = false;
		} else {
			this.showToaster('This Channel is currently disconnected. Please Reconnect this channel from Account Settings to use it', 'error');
		}
	}
	hangeEditContactInuts(item: any) {
		if (item.target.name == 'OptInStatus') {
			this.editContact.get('OptInStatus')?.setValue(item.target.checked ? 'Yes' : 'No');
			this.OptedIn = item.target.checked;
		} else {
			this.EditContactForm[item.target.name] = item.target.value
		}
	}
	toggleLeadStatusOption() {
		this.ShowLeadStatusOption = !this.ShowLeadStatusOption;
		this.ShowChannelOption = false;
		this.ShowGenderOption = !this.ShowLeadStatusOption;
	}


	hangeEditContactSelect(name: any, value: any) {
		this.editContact.get(name)?.setValue(value);
		console.log(this.editContact)
		this.ShowChannelOption = false
		this.ShowGenderOption = false;
		this.ShowLeadStatusOption = false;


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


	updateCustomer() {
		// var bodyData = {
		// Name: this.EditContactForm.get('Name')?.value,
		// countryCode: this.EditContactForm.get('country_code')?.value,
		// Phone_number: this.EditContactForm.get('Phone_number')?.value,
		// displayPhoneNumber: this.EditContactForm.get('displayPhoneNumber')?.value,
		// channel: this.EditContactForm.get('channel')?.value,
		// OptInStatus: this.EditContactForm.get('OptInStatus')?.value,
		// emailId: this.EditContactForm.get('emailId')?.value,
		// ContactOwner: this.EditContactForm.get('ContactOwner')?.value,
		// customerId: this.EditContactForm.get('customerId')?.value
		// };
		//console.log(bodyData)
		let contactData = this.copyContactFormData();
		const contactOwner = contactData.result.find((item: any) => item.ActuallName === 'ContactOwner');
		if (contactOwner) {
			const uidFound = this.userList.find((item: any) => item?.name == contactOwner.displayName);
			if (uidFound) contactData.result.push({
				displayName: uidFound?.uid,
				ActuallName: 'uid'
			})
		}
		if (this.editContact.valid) {
			this.dashboardService.editContact(contactData, this.contactId, this.SPID).subscribe(
				(response: any) => {
					if (response) {
						if (this.modalReference) {
							this.modalReference.close();
						}
						this.showToaster('Contact information updated...', 'success');
						//this.getAllInteraction(false);
						this.updateContactData();
						//this.getCustomers();				
						this.getMessageData(this.selectedInteraction, true)
						this.filterChannel = '';
					}
				},
				(error: any) => {
					if (error) {

						if (error.status == 409)
							this.showToaster('Phone Number already exist !', 'error');
						else
							this.showToaster(error.message, 'error');
					}
				});




			// this.apiService.updatedCustomer(bodyData).subscribe(async response =>{
			// this.selectedInteraction['Name']=this.EditContactForm.Name
			// this.selectedInteraction['countryCode']=this.EditContactForm.country_code
			// this.selectedInteraction['Phone_number']=this.EditContactForm.value.Phone_number
			// this.selectedInteraction['displayPhoneNumber']=this.EditContactForm.displayPhoneNumber
			// this.selectedInteraction['channel']=this.EditContactForm.channel
			// this.selectedInteraction['status']=this.EditContactForm.status
			// this.selectedInteraction['OptInStatus']=this.EditContactForm.OptInStatus
			// this.selectedInteraction['emailId']=this.EditContactForm.emailId
			// this.selectedInteraction['ContactOwner']=this.EditContactForm.ContactOwner
			// this.selectedInteraction['CustomerId']=this.EditContactForm.customerId

			// 	if(this.modalReference){
			// 		this.modalReference.close();
			// 	}
			// 	this.showToaster('Contact information updated...','success');
			// 	//this.getAllInteraction(false);
			// 	this.getCustomers();
			// 	this.filterChannel='';
			// });
		}
		else {
			this.EditContactForm.markAllAsTouched();
		}
	}

	updateContactData() {
		let data = this.selectedInteraction;
		for (let prop in data) {
			let value = data[prop as keyof typeof data];
			if (this.editContact.get(prop)) {
				this.selectedInteraction[prop as keyof typeof data] = this.editContact.get(prop)?.value;
			}
		}
		if (this.selectedInteraction['column9']) {
			this.selectedInteraction['column9'] = this.formatDaysData(this.selectedInteraction['column9']);
		}
	}

	copyContactFormData() {
		let name = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name;
		let ContactFormData = {
			result: [
				{
					displayName: this.SPID,
					ActuallName: "SP_ID"
				},
				{
					displayName: this.editContact.controls.Name.value,
					ActuallName: "Name"
				},
				{
					displayName: this.editContact.controls.country_code.value,
					ActuallName: "CountryCode"
				},
				{
					displayName: this.editContact.controls.Phone_number.value,
					ActuallName: "Phone_number"
				},
				{
					displayName: this.editContact.controls.displayPhoneNumber.value,
					ActuallName: "displayPhoneNumber"
				},
				{
					displayName: this.editContact.controls.emailId.value,
					ActuallName: "emailId"
				},
				{
					displayName: this.editContact.controls.ContactOwner.value,
					ActuallName: "ContactOwner"
				},
				{
					displayName: this.selectedInteraction['tag'],
					ActuallName: "tag"
				},
				{
					displayName: this.OptedIn ? 'Yes' : 'No',
					ActuallName: "OptInStatus"
				},
			],
			SP_ID: this.SPID,
			event: this.event,
			action: 'Contact Updated ',
			action_at: new Date(),
			action_by: name,
		}

		if (this.filteredCustomFields.length > 0) {
			this.filteredCustomFields.forEach((item: any) => {
				if (item.type == 'Select') {
					let selectedOption = item.options.filter((opt: any) => opt.id == this.editContact.get(item.ActuallName)?.value?.toString())[0];
					console.log(this.editContact.get(item.ActuallName)?.value);
					console.log(item.options);
					if (selectedOption)
						ContactFormData.result.push({ displayName: `${selectedOption?.id}:${selectedOption?.optionName}`, ActuallName: item.ActuallName });
				}
				else if (item.type == 'Multi Select') {
					let values = ''
					console.log(this.editContact.get(item.ActuallName)?.value)
					if (this.editContact.get(item.ActuallName)?.value) {
						this.editContact.get(item.ActuallName)?.value?.forEach((ite: any) => {
							values = (values ? values + ',' : '') + ite.id + ':' + ite.optionName;
						})
					}
					console.log(values);
					ContactFormData.result.push({ displayName: values, ActuallName: item.ActuallName });
				}
				else {
					ContactFormData.result.push({ displayName: this.editContact.get(item.ActuallName)?.value, ActuallName: item.ActuallName });
				}
			})
		}
		//     if (isEditTag) {
		//       let tag = ContactFormData.result.find((item: any) => item.ActuallName === "tag");
		//           if (tag) {
		//             let tagArr:any =[];
		//             this.tagListData.forEach((item:any)=>{
		//               if(item.isSelected)
		//               tagArr.push(item.ID);
		//             })
		//               tag.displayName = tagArr.join(', ');
		//     }
		//   }
		//    if (!isEditTag) {
		//       let tagArray = this.editContact.controls.tag.value;
		//       console.log(tagArray)
		//       let tagString = tagArray?.map((tag: any) => `${tag.item_id}`).join(', ');
		//       console.log(tagString)

		//       let tagField = ContactFormData.result.find((item: any) => item.ActuallName === "tag");
		//       if (tagField) {
		//           tagField.displayName = tagString;
		//   }

		//  };
		return ContactFormData
	}

	filterContactByType(Channel: any) {
		if (Channel.channel_status == 0) {
			this.showToaster('This Channel is currently disconnected. Please Reconnect this channel from Account Settings to use it.', 'error');
			return;
		}
		if (Channel?.channel_status == 1) {
			this.selectedChannel = Channel?.channel_id;

			this.contactList.forEach((item: any) => {
				item.channel = this.selectedChannel;
			});
			console.log(this.contactList)
			//this.getSearchContact();
			this.ShowContactOption = false;
		} else {
			this.showToaster('Chhanel is not active', 'error');
		}
	}

	toggleConversationStatusOption() {
		if (this.selectedInteraction.isBlocked != 1) {
			//if(this.loginAs !='Agent'){
			this.ShowConversationStatusOption = !this.ShowConversationStatusOption
			//}else if(this.selectedInteraction.assignTo?.AgentId == this.AgentId){
			//	this.ShowConversationStatusOption =!this.ShowConversationStatusOption
			// }else{
			// 	this.showToaster('Opps you dont have permission','warning')
			// }
			this.ShowAssignOption = false;
		} else {
			this.showToaster('Sorry, this contact is Blocked.', 'error');
		}
	}

	toggleAssignOption() {
		if (this.selectedInteraction.isBlocked != 1) {
			this.ShowConversationStatusOption = false;
			if (this.selectedInteraction.interaction_status != 'Open') {
				this.showToaster('Only Open Conversations can be assigned', 'warning')
			} else {
				if (this.loginAs == 'Agent' || this.selectedInteraction.interaction_status == 'Open') {
					this.ShowAssignOption = !this.ShowAssignOption
				} else {
					this.showToaster('Opps you dont have permission', 'warning')
				}
			}
		} else {
			this.showToaster('Sorry, this contact is Blocked.', 'error');
		}
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
	markItRead() {
		if (this.selectedInteraction['UnreadCount'] > 0) {
			this.selectedInteraction.messageList.map((messageGroup: any) => {
				messageGroup.items.map((message: any) => {
					if (message.message_direction != 'Out' && message.is_read == 0) {
						var bodyData = {
							Message_id: message.Message_id
						}
						this.apiService.updateMessageRead(bodyData).subscribe(data => {
							let selectedInteraction = this.selectedInteraction;
							selectedInteraction['UnreadCount'] = selectedInteraction['UnreadCount'] > 0 ? selectedInteraction['UnreadCount'] - 1 : 0
							this.selectedInteraction = selectedInteraction
							message.is_read = 1;

						})
					}
				});
			});
			this.updateUnreadCount();
		}

	}

	updateUnreadCount() {
		let idx = this.interactionList.findIndex((item: any) => item.InteractionId == this.selectedInteraction.InteractionId);
		if (idx > -1) {
			this.interactionList[idx].UnreadCount = 0;
		}
		this.unreadList = this.interactionList.filter((item: any) => item?.UnreadCount != 0).length;
	}


	getUnreadCount(messages: any) {
		let unreadCount = 0
		for (var i = 0; i < messages.length; i++) {
			if (messages[i].message_direction == 'IN' && messages[i].message_direction && messages[i].is_read == 0) {
				unreadCount = unreadCount + 1
			}
		}
		return unreadCount;
	}

	hideToaster() {
		this.successMessage = '';
		this.errorMessage = '';
		this.warningMessage = '';
	}
	toggleAutoReply() {
		this.AutoReplyOption = !this.AutoReplyOption
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
		// document.getElementById("smartrepliesModal")!.style.display="inherit";
	}


	closeAutoReplyDialog() {
		// Close the dialog when clicking outside
		this.AutoReplyOption = false;
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

		var bodyData = {
			AutoReply: optionValue,
			InteractionId: this.selectedInteraction.InteractionId,
			updated_at: new Date(),
			paused_till: pausedTill
		}
		console.log(bodyData)
		this.apiService.updateInteraction(bodyData).subscribe(async response => {
			this.selectedInteraction['AutoReplyStatus'] = optionValue
			this.AutoReplyType = 'Pause are ' + optionType
			this.AutoReplyOption = false;
			this.selectedInteraction['paused_till'] = pausedTill;
			this.getPausedTimer()
			this.showToaster('Pause Applied', 'success')
			console.log(this.selectedInteraction)
		})
	}

	// Function to format the phone number using libphonenumber-js
	formatPhoneNumber(contactForm: FormGroup) {
		const phoneNumber = contactForm.get('displayPhoneNumber')?.value;
		const countryCode = contactForm.get('country_code')?.value;
		const phoneControl = contactForm.get('Phone_number');
		contactForm.get('displayPhoneNumber')?.setValidators([
			Validators.required,
			this.phoneValidator.phoneNumberValidator(contactForm.get('country_code'))
		]);
		contactForm.get('displayPhoneNumber')?.updateValueAndValidity();
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
		this.EditContactForm.get('displayPhoneNumber')?.setValidators([
			Validators.required,
			this.phoneValidator.phoneNumberValidator(this.EditContactForm.get('country_code'))
		]);
		this.EditContactForm.get('displayPhoneNumber')?.updateValueAndValidity();
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


	searchContact(event: any) {
		this.contactSearchKey = event;
		console.log(event);
		if (this.contactSearchKey)
			this.getSearchContact();
		else
			this.getCustomers();
	}

	getSearchContact() {
		this.apiService.searchCustomers(this.SPID, this.contactSearchKey).subscribe((data: any) => {
			this.contactList = data?.resultList[0];
		});
	}

	blockCustomer(selectedInteraction: any) {
		let name = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name;
		var bodyData = {
			customerId: selectedInteraction.customerId,
			isBlocked: selectedInteraction.isBlocked == 1 ? 0 : 1,
			SP_ID: this.SPID,
			action: 'Contact Updated ',
			action_at: new Date(),
			action_by: name,
		}
		this.apiService.blockCustomer(bodyData).subscribe(ResponseData => {
			this.selectedInteraction['isBlocked'] = selectedInteraction.isBlocked == 1 ? 0 : 1
			if (selectedInteraction.isBlocked == 1) {
				this.showToaster('Conversations is Blocked', 'success')
				this.selectedInteraction['interaction_status'] = 'empty';
				this.selectedInteraction['OptInStatus'] = 'No';
				this.getMessageData(this.selectedInteraction, true)
				this.updateInteractionMapping(selectedInteraction.InteractionId, -1, this.TeamLeadId)
			} else {
				this.getMessageData(this.selectedInteraction, true);
				this.showToaster('Conversations is UnBlocked', 'success');
				this.updateConversationStatus('Resolved');
			}
			console.log(ResponseData);
		});
	}

	handelBlockConfirm() {
		if (this.modalReference) {
			this.modalReference.close();
		}
		this.blockCustomer(this.selectedInteraction)
	}
	handleInnerClick(event: Event): void {
		// Stop the propagation of the click event to prevent it from reaching the outer div
		event.stopPropagation();
	}

	handelStatusConfirm() {
		if (this.modalReference) {
			this.modalReference.close();
		}
		if (this.selectedInteraction['interaction_status'] === 'Resolved' && this.hourLeft === 0) {
			this.hourLeft = 24;
			this.updateConversationStatus(this.status);
		}

		else {
			this.updateConversationStatus(this.status);
		}

	}
	handelDeleteConfirm() {
		if (this.modalReference) {
			this.modalReference.close();
		}
		var bodyData = {
			AgentId: this.AgentId,
			InteractionId: this.selectedInteraction.InteractionId
		}
		this.apiService.deleteInteraction(bodyData).subscribe(async response => {
			this.showToaster('Conversations deleted...', 'success')
			this.getAllInteraction();
		});
	}

	toggleTagsModal(updatedtags: any) {
		if (this.modalReference) {
			this.modalReference.close();
		}

		this.selectedTags = '';

		var activeTags = this.selectedInteraction['tag'];
		if (Array.isArray(activeTags)) {
			activeTags = activeTags.filter(tag => tag).join(',');
		}
		for (var i = 0; i < this.tagsoptios.length; i++) {
			var tagItem = this.tagsoptios[i]
			if (activeTags?.includes(tagItem.ID)) {
				tagItem['status'] = true;
				this.selectedTags += tagItem.ID + ','
			}
			else {
				tagItem['status'] = false;
			}
		}
		this.modalReference = this.modalService.open(updatedtags, { size: 'ml', windowClass: 'white-bg update-tag-custom' });

	}
	addTags(tagName: any) {
		if (tagName.target.checked) {
			this.selectedTags += tagName.target.value + ','
		} else {
			this.selectedTags = this.selectedTags.replace(tagName.target.value + ',', "");
		}
		//console.log(this.selectedTags)
	}

	updateTags() {
		let name = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name;
		var bodyData = {
			tag: this.selectedTags,
			customerId: this.selectedInteraction.customerId,
			action: 'Contact Updated',
			action_at: new Date(),
			action_by: name,
			SP_ID: this.SPID,
		}
		this.apiService.updateTags(bodyData).subscribe(async response => {
			this.selectedInteraction['tag'] = [];
			this.selectedInteraction['tag'] = this.getTagsList(this.selectedTags)
			this.selectedInteraction['TagNames'] = this.getTagsName(this.selectedTags)
			if (this.modalReference) {
				this.modalReference.close();
			}
			this.showToaster('Tags updated...', 'success')
			this.getMessageData(this.selectedInteraction, true)
		});

	}

	getTagsName(tags: any) {
		if (tags) {
			const tagsArray = tags.split(',');
			let tagNames = '';
			tagsArray.forEach((item: any) => {
				let tagName = this.tagsoptios.filter((it: any) => it.ID == item)[0]?.name;
				if (tagName)
					tagNames = (tagNames ? (tagNames + ',') : tagNames) + tagName;
			})
			return tagNames;
		}
	}

	triggerEditCustomer(updatecustomer: any) {
		if (this.modalReference) {
			this.modalReference.close();
		}
		// this.EditContactForm.get('Name')?.setValue(this.selectedInteraction.Name)
		// this.EditContactForm.get('country_code')?.setValue(this.selectedInteraction.countryCode)
		// this.EditContactForm.get('Phone_number')?.setValue(this.selectedInteraction.Phone_number)
		// this.EditContactForm.get('displayPhoneNumber')?.setValue(this.selectedInteraction.displayPhoneNumber)
		// this.EditContactForm.get('channel')?.setValue(this.selectedInteraction.channel)
		// this.EditContactForm.get('OptInStatus')?.setValue(this.selectedInteraction.OptInStatus)
		// this.EditContactForm.get('emailId')?.setValue(this.selectedInteraction.emailId)
		// this.EditContactForm.get('ContactOwner')?.setValue(this.selectedInteraction.ContactOwner)
		// this.EditContactForm.get('channel')?.setValue(this.selectedInteraction.channel)
		// this.EditContactForm.get('customerId')?.setValue(this.selectedInteraction.customerId)
		this.patchFormValue();
		this.modalReference = this.modalService.open(updatecustomer, { size: 'md', windowClass: 'white-bg, updateCustomerCustom' });
	}


	triggerDeleteCustomer(openDeleteAlertmMessage: any) {
		if (this.modalReference) {
			this.modalReference.close();
		}
		if (this.loginAs != 'Agent') {
			this.confirmMessage = 'Are you sure you want to Delete this conversation?'
			this.modalReference = this.modalService.open(openDeleteAlertmMessage, { size: 'sm', windowClass: 'white-bg' });
		} else {
			this.showToaster('Opps you dont have permission', 'warning')
		}
	}
	triggerBlockCustomer(BlockStatus: any, openBlockAlertmMessage: any) {
		if (this.modalReference) {
			this.modalReference.close();
		}
		if (this.loginAs != 'Agent') {
			this.confirmMessage = 'Are you sure you want to ' + BlockStatus + ' this conversation?'
			this.modalReference = this.modalService.open(openBlockAlertmMessage, { size: 'sm', windowClass: 'white-bg' });

		} else {
			this.showToaster('Opps you dont have permission', 'warning')
		}
	}
	triggerUpdateConversationStatus(status: any, openStatusAlertmMessage: any) {
		if (this.modalReference) {
			this.modalReference.close();
		}
		this.ShowConversationStatusOption = false
		if (this.selectedInteraction['interaction_status'] != status) {
			if (this.modalReference) {
				this.modalReference.close();
			}
			this.status = status;
			this.confirmMessage = 'Are you sure you want to ' + status + ' this conversation?'
			this.modalReference = this.modalService.open(openStatusAlertmMessage, { size: 'sm', windowClass: 'white-bg' });

		}
	}

	getInteractionStatus(InteractionId: any) {
		this.apiService.getInteractionStatusById(InteractionId).subscribe(async (response: any) => {
			this.selectedInteraction['interaction_status'] = response[0]?.interaction_status;
		});
	}

	updateConversationStatus(status: any) {
		let name = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name;
		var bodyData = {
			Status: status,
			InteractionId: this.selectedInteraction.InteractionId,
			action: 'Conversation ' + (status == 'Open' ? 'Opened' : status),
			action_at: new Date(),
			action_by: name,
			SP_ID: this.SPID
		}
		this.apiService.updateInteraction(bodyData).subscribe(async response => {
			this.ShowConversationStatusOption = false
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
			this.getMessageData(this.selectedInteraction, true);
			if (status == 'Open' && !this.selectedInteraction.assignTo) {
				setTimeout(() => { this.updateInteractionMapping(this.selectedInteraction.InteractionId, this.uid, this.TeamLeadId) }, 200);
			}

			if (status == 'Resolved') {
				setTimeout(() => { this.updateInteractionMapping(this.selectedInteraction.InteractionId, -1, this.TeamLeadId) }, 200);
			}

			this.selectedInteraction['interaction_status'] = status;
		});

	}

	groupMessageByDate(messageList: any) {
		const data = messageList;
		// data.sort(function(a:any, b:any) {
		// 	var dateA = new Date(a.Message_id);
		// 	var dateB = new Date(b.Message_id);
		// 	return dateA > dateB ? 1 : -1; 
		// });
		data.sort(function (a: any, b: any) {
			var dateA = new Date(a.created_at);
			var dateB = new Date(b.created_at);
			return dateA > dateB ? 1 : -1;
		});


		const groups = data.reduce((groups: any, transactions: any) => {
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
		bodyData['isTemporary'] = 1;
		bodyData['OptInStatus'] = this.OptedIn;
		console.log(bodyData);
		if (this.newContact.valid) {
			if (this.selectedChannel != '') {
				if (this.OptedIn == 'Yes') {
					this.apiService.createCustomer(bodyData).subscribe(
						async (response: any) => {
							var responseData: any = response;
							var insertId: any = responseData.customerId;
							$("#contactadd").modal('hide');
							if (this.modalReference) {
								this.modalReference.close();
							}
							if (insertId) {
								if (responseData?.interactionId?.length == 0) {
									this.createInteraction(insertId);
								} else {
									let interactionId = responseData?.interactionId[0]?.InteractionId;
									let idx = this.interactionList.findIndex((item: any) => item.InteractionId == interactionId);
									if (idx > -1) {
										this.selectInteraction(idx);
										this.interactionList[idx].Name = bodyData?.Name;
									}
									if (this.modalReference) {
										this.modalReference.close();
									}
								}
								this.newContact.reset();
								//this.getAllInteraction();
								//this.getCustomers();
								this.OptedIn = 'No';
								this.filterChannel = '';
								this.showToaster('Contact created successfully', 'success');
							}
						},
						async (error) => {
							if (error.status === 409) {
								this.showToaster('Phone Number already exist. Please Try another Number', 'error');
								//this.OptedIn = 'No';
							}
						}
					);
				}
				else {
					this.showToaster('! Contact Opt In is required ', 'error');
				}
			}
			else {
				this.showToaster('! Channel Selection is required ', 'error');
			}
		}
		else {
			this.newContact.markAllAsTouched();
			this.newContact.controls.Name.markAsDirty();
		}

	}


	createInteraction(customerId: any) {
		if (this.selectedChannel != '') {
			var bodyData = {
				customerId: customerId,
				spid: this.SPID,
				channel: this.selectedChannel,
				IsTemporary: 1
			}
			this.apiService.createInteraction(bodyData).subscribe(async (data: any) => {
				if (data.status != 409) {
					if (this.modalReference) {
						this.modalReference.close();
					}
					// this.isNewInteraction=true;
					//this.getInteractionsFromStart();
					//this.getCustomers();
					this.filterChannel = '';
					//item['messageList'] = [...val, ...item['messageList']];
					//item['allmessages'] = [...val1, ...item['allmessages']];
					this.interactionList = [...data.interaction, ...this.interactionList]
					this.interactionListMain = [...data.interaction, ...this.interactionListMain];
					this.selectInteraction(0);
					this.updateConversationStatus('Open');
					console.log(this.interactionList);
					//this.getAllInteraction()
				} else {
					console.log('xyzzzz')
					this.showToaster(data.msg, 'error');
				}
			}, async (error) => {
				console.log(error);
				if (error?.error?.status === 409) {
					this.showToaster(error?.error?.msg, 'error');
					//this.OptedIn = 'No';
				}
			});
		}
		else {
			this.showToaster('! Channel Selection is required ', 'error');
		}

	}

	getInteractionsFromStart() {
		this.interactionList = [];
		this.interactionListMain = [];
		this.selectedInteractionList = [];
		this.currentPage = 0;
		this.pageSize = 10;
		this.selectedInteraction = [];
		this.getAllInteraction();

	}

	closeAssignOption() {
		// Close the assign options when clicking outside
		this.ShowAssignOption = false;
	}

	closeConversationStatusOption() {
		// Close the conversation status options when clicking outside
		this.ShowConversationStatusOption = false;
	}


	updateInteractionMapping(InteractionId: any, AgentId: any, MappedBy: any) {
		this.ShowAssignOption = false;
		let name = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name;
		let agentName = this.userList.filter((items: any) => items.uid == AgentId)[0]?.name;
		agentName = agentName == name ? 'Self' : agentName;
		agentName = AgentId == -3 ? 'Bot' : agentName
		var bodyData = {
			InteractionId: InteractionId,
			AgentId: AgentId,
			MappedBy: MappedBy,
			action: agentName ? ('Conversation Assinged to ' + agentName) : 'Conversation Unassigned',
			action_at: new Date(),
			action_by: name,
			SP_ID: this.SPID,
			lastAssistedAgent: this.selectedInteraction['InteractionMapping']
		}
		this.apiService.resetInteractionMapping(bodyData).subscribe(responseData1 => {
			this.apiService.updateInteractionMapping(bodyData).subscribe(responseData => {
				this.apiService.getInteractionMapping(InteractionId).subscribe(mappingList => {
					this.getMessageData(this.selectedInteraction, true);
					var mapping: any = mappingList;
					this.selectedInteraction['assignTo'] = mapping ? mapping[mapping.length - 1] : '';
					this.selectedInteraction['assignAgent'] = mapping && mapping?.length > 0 ? mapping[mapping.length - 1]?.name : '';
				})

			});
		});
	}

	getInteraction(InteractionId: any) {
		this.apiService.getInteractionMapping(InteractionId).subscribe(mappingList => {
			//this.getMessageData(this.selectedInteraction,true)
			var mapping: any = mappingList;
			this.selectedInteraction['assignTo'] = mapping ? mapping[mapping.length - 1] : '';
			this.selectedInteraction['assignAgent'] = mapping && mapping?.length > 0 ? mapping[mapping.length - 1]?.name : '';
		})
	}

	openaddMessage(messageadd: any) {
		this.contactCurrentPage = 0;
		this.getCustomers()
		if (this.modalReference) {
			this.modalReference.close();
		}
		this.modalReference = this.modalService.open(messageadd, { windowClass: 'teambox-pink' });
		this.getContactOnScroll();
	}

	openaddMediaGallery(mediagallery: any, slideIndex: any) {
		if (this.modalReference) {
			this.modalReference.close();
		}
		this.slideIndex = slideIndex
		this.modalReference = this.modalService.open(mediagallery, { windowClass: 'teambox-transparent' });
	}

	showNextSlides(n: any) {
		let slides = document.getElementsByClassName("mySlides");
		if (n < slides.length) {
			this.slideIndex = n + 1
		}

	}
	showPrevSlides(n: any) {
		if (n > 0) {
			this.slideIndex = n - 1
		}
	}


	openadd(contactadd: any) {
		if (this.modalReference) {
			this.modalReference.close();
		}
		this.modalReference = this.modalService.open(contactadd, { windowClass: 'teambox-white' });
	}

	toggleNoteOption(note: any, index: number) {
		console.log(note)
		this.hideNoteOption(this.selectedModalIndex)
		this.selectedModalIndex = index;
		if (note && this.selectedNote.Message_id != note.Message_id) {
			note.selected = true
			this.selectedNote = note
		} else {
			note.selected = false
			this.selectedNote = []

		}
		$(`#agmodal_${index}`).modal('show');
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove()
	}

	hideNoteOption(index: number) {
		this.isAgmodalOpened = false;
		this.selectedNote.selected = false;
		$(`#agmodal_${index}`).modal('hide');

	}
	agmodalClose(index: number) {
		this.selectedNote.selected = false;
		$(`#agmodal_${index}`).modal('hide');
	}
	editNotes(index: number) {
		this.hideNoteOption(index)
		this.chatEditor.value = this.selectedNote.message_text
		this.newMessage.reset({
			Message_id: this.selectedNote.Message_id
		});

	}

	deleteNotes() {
		this.hideNoteOption(this.selectedModalIndex)
		let agentName = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name;
		var bodyData = {
			Message_id: this.selectedNote.Message_id,
			deleted: 1,
			deleted_by: this.AgentId,
			action: 'delete by ' + agentName,
			action_at: new Date(),
			action_by: name,
			deleted_at: new Date(),
			InteractionId: this.selectedInteraction.InteractionId,
			SP_ID: this.SPID
		}
		////console.log(bodyData)
		this.apiService.deleteMessage(bodyData).subscribe(async data => {
			//console.log(data)
			this.selectedNote.is_deleted = 1;
			this.selectedNote.deleted_by = this.selectedNote.AgentName;
			this.getNoteData(this.selectedInteraction);
			this.selectedNote = [];
			if (this.modalReference) {
				this.modalReference.close();
			}
		})
	}

	openPopup(popup: any, index: number) {
		this.selectedModalIndex = index;
		this.hideNoteOption(this.selectedModalIndex);
		if (this.modalReference) {
			this.modalReference.close();
		}
		this.modalReference = this.modalService.open(popup, { size: 'sm', windowClass: 'white-bg' });
	}

	checkAuthentication() {
		let input = {
			spid: this.SPID,
		};
		this.settingService.clientAuthenticated(input).subscribe(response => {
			if (response.status === 404 && this.showChatNotes != 'notes') {
				this.showToaster('The Channel of this conversation is currently disconnected. Please Reconnect this channel from Account Settings to use it.', 'error')
				return;
			}
		})
	}

	getUserListFromMessage(value: string): string[] {
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = value;

		const mentionElements = tempDiv.querySelectorAll('a');

		const userList: string[] = [];

		mentionElements.forEach((el) => {
			let username = el.textContent?.trim();

			if (username && username.startsWith('@')) {
				username = username.substring(1);
				userList.push(username);
			}
		});

		return userList;
	}
	getUIDsFromNames(Names: any): number[] {
		const uids: number[] = [];
		const extractedNames = Names;
		extractedNames.forEach((name: string) => {
			const matchedUser = this.userList.find((user: any) => user.name === name);

			if (matchedUser) {
				uids.push(matchedUser.uid);
			}
		});

		return uids;
	}
	sendMessage(isTemplate: boolean = false, templateTxt: string = '', type: any = '') {
		var tempDivElement = document.createElement("div");

		let value = isTemplate ? templateTxt : (this.chatEditor.value || "");
		tempDivElement.innerHTML = value;
		let val = tempDivElement.textContent || tempDivElement.innerText || "";
		//	if(!isTemplate){
		if (value == null || val.trim() == '') {
			this.showToaster('! Please enter a message before sending.', 'error');
			return;
		}
		// }

		else {
			let postAllowed = false;
			if (this.loginAs == 'Manager' || this.loginAs == 'Admin' || this.showChatNotes == 'notes') {
				postAllowed = true;
			} else if (this.selectedInteraction.assignTo && this.selectedInteraction.assignTo.AgentId == this.AgentId) {
				postAllowed = true;
			}
			console.log('value----------', value)
			if (postAllowed) {
				if (this.SIPthreasholdMessages > 0) {
					let objectDate = new Date();
					var cMonth = String(objectDate.getMonth() + 1).padStart(2, '0');
					var cDay = String(objectDate.getDate()).padStart(2, '0');
					var createdAt = objectDate.getFullYear() + '-' + cMonth + '-' + cDay + 'T' + objectDate.getHours() + ':' + objectDate.getMinutes() + ':' + objectDate.getSeconds()
					if (this.messageMediaFile != '') {
						this.messageMeidaFile = this.messageMediaFile;
						value = this.processMediaType(this.mediaType, this.messageMeidaFile, value)
						this.messageMediaFile = '';
					} else if (this.messageMeidaFile) {
						value = this.processMediaType(this.mediaType, this.messageMeidaFile, value)
					} else {
						console.log(value);
						value = this.ensureSpaceBeforeTags(value);
						console.log(value);
					}

					console.log('value----------', value)
					let agentName = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name;
					let uidMentioned: number[] = [];
					if (value) {
						const userMentioned = this.getUserListFromMessage(value);
						if (userMentioned && userMentioned.length) {
							uidMentioned = this.getUIDsFromNames(userMentioned);
						}
					}
					var bodyData = {
						InteractionId: this.selectedInteraction.InteractionId,
						CustomerId: this.selectedInteraction.customerId,
						SPID: this.SPID,
						SP_ID: this.SPID,
						AgentId: this.AgentId,
						messageTo: this.selectedInteraction.Phone_number,
						message_text: value || "",
						Message_id: this.newMessage.value.Message_id,
						message_media: this.messageMeidaFile ? this.messageMeidaFile : 'text',
						media_type: this.mediaType,
						quick_reply_id: '',
						template_id: '',
						message_type: this.showChatNotes,
						created_at: new Date(),
						mediaSize: this.mediaSize,
						spNumber: this.spNumber,
						isTemplate: this.isTemplate,
						headerText: this.headerText,
						bodyText: this.bodyText,
						MessageVariables: this.allVariables,
						action: 'edited by ' + agentName,
						action_at: new Date(),
						action_by: name,
						uidMentioned: uidMentioned,
						name: this.templateName,
						language: this.templatelanguage,
						buttons: this.templateButton,
						buttonsVariable: JSON.stringify(this.buttonsVariable),
						botName: this.selectedBotobj?.name ?? '',
						botId: this.selectedBotobj?.id ?? 0
					}

					console.log(bodyData, 'Bodydata')
					let input = {
						spid: this.SPID,
					};
					if (this.newMessage.value.Message_id == '') {
						this.settingService.clientAuthenticated(input).subscribe(response => {

							if (response.status === 404 && this.showChatNotes != 'notes' && this.selectedInteraction?.channel != 'WA API') {
								this.showToaster('The Channel of this conversation is currently disconnected. Please Reconnect this channel from Account Settings to use it.', 'error')
								return;
							}
							//(response.status === 200 && response.message === 'Client is ready !' ) || this.showChatNotes == 'notes'

							else if ((response.status === 200 && response.message === 'Client is ready !') || this.showChatNotes == 'notes' || (this.selectedInteraction?.channel == 'WA API')) {
								this.apiService.sendNewMessage(bodyData).subscribe(async data => {
									var responseData: any = data
									if (this.newMessage.value.Message_id == '') {
										var insertId: any = responseData.insertId
										if (insertId) {
											let agentName = this.userList.filter((items: any) => items.uid == this.uid)[0]?.name
											var lastMessage = {
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
												"mediaSize": bodyData.mediaSize,
												"AgentName": agentName,
												//"created_at":new Date()
											}

											if (this.showChatNotes == 'text') {
												// var allmessages =this.selectedInteraction.allmessages
												// this.selectedInteraction.lastMessage= lastMessage
												// allmessages.push(lastMessage)
												// this.selectedInteraction.messageList =this.groupMessageByDate(allmessages)
												// console.log(this.selectedInteraction.messageList);
												this.getMessagesById(insertId);
												let idx = this.interactionList.findIndex((items: any) => items.InteractionId == this.selectedInteraction.InteractionId);
												if (idx > 0) {
													this.interactionList[idx].message_text = bodyData?.message_text;
													this.interactionList[idx].message_media = this.messageMeidaFile ? this.messageMeidaFile : 'text';
													this.interactionList[idx].media_type = this.mediaType;
													this.interactionList = this.moveItemToFirstPosition(this.interactionList, idx);
													this.interactionListMain = JSON.parse(JSON.stringify(this.interactionList));
												}
												setTimeout(() => {
													this.chatSection?.nativeElement.scroll({ top: this.chatSection?.nativeElement.scrollHeight })
												}, 500);

											} else {
												// var allnotes =this.selectedInteraction.allnotes
												// allnotes.push(lastMessage)
												// this.selectedInteraction.notesList =this.groupMessageByDate(allnotes)
												setTimeout(() => {
													this.notesSection?.nativeElement.scroll({ top: this.notesSection?.nativeElement.scrollHeight })
												}, 500);
												this.getNoteData(this.selectedInteraction);
												this.selectedNote = [];

											}
											this.chatEditor.value = '';
											this.messageMeidaFile = '';
											this.mediaType = '';
											this.SIPthreasholdMessages = this.SIPthreasholdMessages - 1;
											this.isTemplate = false
											this.headerText = '';
											this.bodyText = '';
											this.templateButton = [];
											this.buttonsVariable = [];
										}


									} else {
										this.selectedNote.message_text = bodyData.message_text
									}


									this.newMessage.reset({
										Message_id: ''
									});
								});
							}
							// },
							// (error)=> {
							// 	if(error.status === 500) {
							// 		this.showToaster('! Internal Server Error Please Contact System Adminstrator','error');
							// 	}
							// 	else {
							// 		this.showToaster(error.message,'error');
							// 	}
						});
					}
					else {
						this.apiService.editNotes(bodyData).subscribe(async data => {
							this.selectedNote.message_text = bodyData.message_text;
							this.newMessage.reset({
								Message_id: ''
							});
							this.chatEditor.value = '';
							// this.getMessageData(this.selectedInteraction,true)
							this.getNoteData(this.selectedInteraction);
							this.selectedNote = [];
						})
					}
				} else {
					this.showToaster('Oops! CIP message limit exceed please wait for 5 min...', 'warning')
				}
			} else {
				this.showToaster('Oops! You are not allowed to post content', 'warning')
			}
		}


	}

	//   /  GET ATTRIBUTE LIST  /
	getAttributeList() {
		this.apiService.getAttributeList(this.SPID)
			.subscribe((response: any) => {
				if (response) {
					let attributeListData = response?.result;
					this.attributesList = attributeListData.map((attrList: any) => attrList.displayName);
					console.log(this.attributesList);
				}
			})
	}
	addfilters() {
		this.closeAllModal();
		$('body').removeClass('modal-hide');
		$('.modal-backdrop').remove();
	}

	convertHtmlToText(html: string): string {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = html;

		let text = tempElement.textContent || tempElement.innerText || '';

		// Optional: Convert multiple spaces to a single space
		text = text.replace(/\s\s+/g, ' ');

		return text;
	}

	//   limitCharacters(message: string) {
	// 	const tempElement = document.createElement('div');
	// 	tempElement.innerHTML = message;

	// 	let text = tempElement.textContent || tempElement.innerText || '';

	// 	// Optional: Convert multiple spaces to a single space
	// 	text = text.replace(/\s\s+/g, ' ');
	// 	let msg ;
	//     let maxLength = 22;
	//     if (text.length <= maxLength) {
	// 		tempElement.textContent = text;
	//     return tempElement?.innerHTML;
	//     } else {
	// 	msg = this.showFullMessage ? text : text.substring(0,maxLength) + "...";
	// 	tempElement.textContent = msg;
	// 	return tempElement?.innerHTML;
	//     }
	// }


	limitCharacters(message: string, maxLength: number = 22) {
		const tempElement = document.createElement('div');
		tempElement.innerHTML = message;

		tempElement.querySelectorAll('br').forEach(br => br.remove());
		let charCount = 0;
		const truncateNode = (node: Node): boolean => {
			if (charCount >= maxLength) return true;

			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || '';
				const remainingChars = maxLength - charCount;
				if (text.length + charCount > maxLength) {
					node.textContent = text.substring(0, remainingChars) + "...";
					charCount = maxLength;
					return true;
				} else {
					charCount += text.length;
				}
			} else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
				for (let i = 0; i < node.childNodes.length; i++) {
					if (truncateNode(node.childNodes[i])) {
						while (node.childNodes.length > i + 1) {
							node.removeChild(node.childNodes[i + 1]);
						}
						return true;
					}
				}
			}
			return false;
		};

		truncateNode(tempElement);
		return tempElement.innerHTML;
	}
	toggleShowFullMessage() {
		this.showFullMessage = !this.showFullMessage;
	}

	getUserList() {
		let spid = Number(this.SPID)
		this.settingService.getUserList(spid, 1).subscribe(async (result) => {
			if (result) {
				this.userList = result?.getUser;
				this.getAllInteraction()
				for (const user of this.userList) {
					if (this.AgentId == user.uid) {
						this.loginAs = user.RoleName;
						console.log(this.loginAs, 'Current Role')
					}
				}
				this.agentsList = result?.getUser;
				if (this.agentsList.length) this.filteredAgentList = this.agentsList;
				this.agentsList.forEach((item: { name: string; nameInitials: string; }) => {
					const nameParts = item.name.split(' ');
					const firstName = nameParts[0] || '';
					const lastName = nameParts[1] || '';
					const nameInitials = firstName.charAt(0) + ' ' + lastName.charAt(0);

					item.nameInitials = nameInitials;
				});
				this.mentionAgentsList = this.agentsList.filter((item: any) => item.uid != this.uid);
				this.assigineeList = this.agentsList.filter((item: any) => item.IsActive == 1);
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
		if (this.selectedTemplate.media_type) {

			this.messageMediaFile = this.selectedTemplate.Links;
			this.mediaType = this.selectedTemplate.media_type;
		}
		let isVariableValue = '';
		if (this.selectedTemplate.media_type == 'text') {
			isVariableValue = this.selectedTemplate.Header + this.selectedTemplate.BodyText;
		}
		else {
			isVariableValue = this.selectedTemplate.BodyText;
		};

		if (isVariableValue) {
			this.allVariablesList = this.getVariables(isVariableValue, "{{", "}}");
		};
		this.buttonsVariable = [];
		if (this.selectedTemplate?.buttons.length) {
			this.buttonsVariable = this.selectedTemplate.buttons
				.filter((button: any) => button?.webType === 'Dynamic')
				.map((button: any, index: any) => ({
					label: button?.webUrl,
					value: '',
					Fallback: '',
					isAttribute: ''
				}));
		}

	}

	getTagData() {
		let spid = Number(this.SPID)
		this.settingService.getTagData(spid).subscribe(result => {
			if (result) {
				let tagList = result.taglist;
				this.tagsoptios = tagList.map((tag: any, index: number) => ({
					ID: tag.ID,
					name: tag.TagName,
					color: tag.TagColour,
					status: false
				}));
				console.log(this.tagsoptios);
			}
		});
	}

	toggleInfoIcon() {
		this.showInfoIcon = !this.showInfoIcon;
	}


	getInteractionsOnScroll() {
		const content = document.querySelector('.all_contacts');
		const scroll$ = fromEvent(content!, 'scroll').pipe(map(() => { return content!.scrollTop; }));

		scroll$.subscribe((scrollPos) => {
			let limit = content!.scrollHeight - content!.clientHeight - 1;
			if (Math.ceil(scrollPos) >= limit && !this.isCompleted) {
				this.currentPage += this.pageSize;
				// forkJoin([this.items$.pipe(take(1)), this.appService.getData(this.currentPage, this.pageSize)]).subscribe((data: Array<Array<any>>) => {
				//   const newArr = [...data[0], ...data[1]];
				//   this.obsArray.next(newArr);
				// });
				this.getAllInteraction();
			}
		});
	}


	getContactOnScroll() {
		const content = document.querySelector('.contact_list');
		if (content) {
			const scroll$ = fromEvent(content!, 'scroll').pipe(map(() => { return content!.scrollTop; }));

			scroll$.subscribe((scrollPos) => {
				this.isLoadingOnScroll = true;
				let limit = content!.scrollHeight - content!.clientHeight - 1;
				console.log(scrollPos);
				console.log(limit);
				if (Math.ceil(scrollPos) >= limit && !this.isContactCompleted) {
					this.contactCurrentPage += this.contactPageSize;
					// forkJoin([this.items$.pipe(take(1)), this.appService.getData(this.currentPage, this.pageSize)]).subscribe((data: Array<Array<any>>) => {
					//   const newArr = [...data[0], ...data[1]];
					//   this.obsArray.next(newArr);
					// });
					this.getCustomers(true);
				} else this.isLoadingOnScroll = false;
			});
		}
	}


	getOlderMessages(selectedInteraction: any) {
		this.isLoadingOlderMessage = true;
		this.messageRangeStart = this.messageRangeEnd;
		this.messageRangeEnd = this.messageRangeEnd + 30;
		this.getMessageData(selectedInteraction, false)
	}

	checkPermission() {
		if (((JSON.parse(sessionStorage.getItem('loginDetails')!)).isPaused != 0)) {
			this.showToaster('Attention! Your account has been PAUSED. Please contact your solution provider.', 'error');
			return
		}
		console.log(this.selectedInteraction);
		if (this.showChatNotes == 'text' && this.selectedInteraction.channel != 'WA API') {
			this.checkAuthentication()
		}
		if (this.selectedInteraction?.assignTo?.AgentId != this.uid && this.showChatNotes == 'text') {
			this.showToaster('Attention! You can send message only to an Open and Self assigned Conversation', 'error');
		} else if (this.showChatNotes == 'notes' && this.selectedInteraction?.interaction_status != 'Open') {
			this.showToaster('Attention! You can write Note only to an Open Conversation', 'error');
		}
	}

	onActionBegin(args: any) {
		console.log(args);
		console.log(this.mentionObj.element?.classList);
		if (args.requestType === 'EnterAction' && this.mentionObj.element?.classList?.contains('e-popup-open')) {
			console.log('abc');
			args.cancel = true;
		}
		if (args.requestType === 'Image') {
			setTimeout(() => {
				console.log('gjkdsfngs');
				const images = document.querySelectorAll('img');
				if (images.length > 0) {
					const lastImage = images[images.length - 1];
					lastImage.style.width = '50px';  // Set default width
					lastImage.style.height = '50px'; // Set default height
				}
			}, 0);
		}
	}

	getTime(time: any) {
		let date = new Date(time);
		let currDate = new Date();
		const yesterday = new Date();
		yesterday.setDate(new Date().getDate() - 1);
		if (date.getFullYear() === currDate.getFullYear() && date.getMonth() === currDate.getMonth() &&
			date.getDate() === currDate.getDate()) {
			return this.datePipe.transform(date, this.settingService.timeFormat == '12' ? 'hh:mm a' : 'HH:mm');
		} else if (date.getFullYear() === currDate.getFullYear() && date.getMonth() === currDate.getMonth() &&
			date.getDate() === yesterday.getDate()) {
			return 'Yesterday';
		} else {
			return this.datePipe.transform(date, this.settingService.dateFormat);
		}
	}
	getSplitItem(val: any) {
		if (val) {
			let selectName = val?.split(':');
			return selectName[1] ? selectName[1] : '';
		} else {
			return '';
		}
	}

	getCustomFieldsData() {
		this.settingService.getNewCustomField(Number(this.SPID)).subscribe(response => {
			let customFieldData = response.getfields;
			console.log(customFieldData);
			const defaultFieldNames: any = ["Name", "Phone_number", "emailId", "ContactOwner", "OptInStatus", "tag"];
			if (customFieldData) {
				const filteredFields: any = customFieldData?.filter((field: any) => !defaultFieldNames.includes(field.ActuallName) && field.status === 1);
				this.filteredCustomFields = filteredFields;
				this.getfilteredCustomFields();
			}
		});
	}

	getfilteredCustomFields() {
		this.filteredCustomFields.forEach((item: any) => {
			const control = new FormControl('');
			this.editContact.addControl(item.ActuallName, control);
			const controls = this.editContact.get(item.ActuallName);
			if (controls && item.mandatory == 1) {
				controls.setValidators([Validators.required]);
				controls.updateValueAndValidity();
			}
			const yearValidatorFn: ValidatorFn = (control: AbstractControl | any): { [key: string]: boolean } | null => {
				return this.yearValidator(control);
			};
			if (controls && item?.type == 'Date') {
				controls.setValidators([yearValidatorFn]);
				controls.updateValueAndValidity();
			}
			if (item?.dataTypeValues && (item?.type == 'Select' || item?.type == 'Multi Select')) {
				item.options = JSON.parse(item?.dataTypeValues);
			}
		})
		console.log(this.editContact);
	}

	yearValidator(control: FormControl): { [key: string]: boolean } | null {
		if (control.value) {
			const year = new Date(control.value).getFullYear();
			if (year.toString().length !== 4) {
				return { invalidYear: true };
			}
		}
		return null;
	}


	getMediaType(val: any) {
		if (val?.includes('image'))
			return 'Image';
		else if (val?.includes('video'))
			return 'Video';
		else if (val?.includes('application'))
			return 'Document';
		else
			return '';
	}

	//   isHttpOrHttps(text: string): boolean {
	// 	if(text)
	// 	return text.startsWith('http://') || text.startsWith('https://');
	// 	else
	// 	return false;
	//   }	

	getWhatsAppDetails() {
		this.settingService.getWhatsAppDetails(this.SPID)
			.subscribe((response: any) => {
				if (response) {
					console.log('getWhatsAppDetails')
					this.WhatsAppDetailList = response?.whatsAppDetails;
				}
			})
	}

	patchFormValue() {
		const data: any = this.selectedInteraction;
		console.log(data);
		// this.getFilterTags = data.tag ? data.tag?.split(',').map((tags: string) =>tags.trim().toString()) : [];
		// console.log(this.getFilterTags);
		// this.checkedTags = this.getFilterTags;
		// const selectedTag:string[] = data.tag?.split(',').map((tagName: string) => tagName.trim());
		// //set the selectedTag in multiselect-dropdown format
		// const selectedTags = this.tagListData.map((tag: any, index: number) => ({ idx: index, ...tag }))
		// .filter(tag => selectedTag?.includes((tag.ID).toString()))
		// .map((tag: any) => ({
		// 	item_id: tag.ID,
		// 	item_text: tag.TagName,
		// }));
		// console.log(selectedTags);
		// // this.selectedTag = data.tag
		// this.tagListData.forEach((item:any)=>{
		//   if(selectedTag?.includes((item.ID).toString())){
		// 	item['isSelected'] = true;
		//   }else{
		// 	item['isSelected'] = false;
		//   }
		// })
		for (let prop in data) {
			let value = data[prop as keyof typeof data];
			if (this.editContact.get(prop))
				this.editContact.get(prop)?.setValue(value)
			//this.editContact.get('tag')?.setValue(selectedTags); 
			let idx = this.filteredCustomFields.findIndex((item: any) => item.ActuallName == prop);
			if (idx > -1 && this.filteredCustomFields[idx] && (this.filteredCustomFields[idx].type == 'Date Time' || this.filteredCustomFields[idx].type == 'Date')) {
				if (value) {
					let dateVal = this.datePipe.transform(new Date(value), 'yyyy-MM-dd')
					this.editContact.get(prop)?.setValue(dateVal);
				}
			} else if (idx > -1 && this.filteredCustomFields[idx] && (this.filteredCustomFields[idx].type == 'Select')) {
				let val = value ? value.split(':')[0] : '';
				console.log(val);
				this.editContact.get(prop)?.setValue(val);
			} else if (idx > -1 && this.filteredCustomFields[idx] && (this.filteredCustomFields[idx].type == 'Switch')) {
				if (value?.length > 1) {
					let val = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
					this.editContact.get(prop)?.setValue(val);
				}
			}
			else if (idx > -1 && this.filteredCustomFields[idx] && this.filteredCustomFields[idx].type == 'Time') {
				let val = this.settingsService.convertTimeFormat(value, true);
				this.editContact.get(prop)?.setValue(val)
			}
			else if (idx > -1 && this.filteredCustomFields[idx] && (this.filteredCustomFields[idx].type == 'Multi Select')) {
				if (value) {
					let val = value.split(':');
					console.log(val);
					console.log(value);

					let selectName = value?.split(',');
					let names: any = [];
					selectName.forEach((it: any) => {
						let name = it.split(':');
						console.log(name);
						names.push({ id: (name[0] ? name[0] : ''), optionName: (name[1] ? name[1] : '') });
					})

					this.editContact.get(prop)?.setValue(names);
				}
			}
		}
		if (data?.countryCode) {
			// country code is sometimes +91 or sometime IN +91
			this.checkAndSetCountryCode(data);
		}
		// this.OptInStatus =data.OptInStatus
		// this.isBlocked=data.isBlocked;
	}

	getSplitMultiSelect(val: any) {
		let selectName = val?.split(',');
		let names = '';
		if (selectName && selectName?.length > 0) {
			selectName.forEach((it: any) => {
				let name = it.split(':');
				console.log(name);
				names = (names ? names + ',' : '') + (name[1] ? name[1] : '');
			})
		}
		return names;
	}
	checkAndSetCountryCode(data: any) {
		if (data?.countryCode) {
			const countryCodeOnly = this.countryCodes.map(code => code.split(' ')[1]);
			if (countryCodeOnly.includes(data.countryCode)) {
				const matchedCountry = this.countryCodes.find(code => code.includes(data.countryCode));
				this.editContact.get('country_code')?.setValue(matchedCountry);
			} else {
				const matchedCountry = this.countryCodes.find(code => code === data.countryCode);
				if (matchedCountry) {
					this.editContact.get('country_code')?.setValue(matchedCountry);
				} else {
					console.warn(`Country code ${data.countryCode} not found in the countryCodes list.`);
				}
			}
		}
	}
	filterContactOwners() {
		const searchInput = document.getElementById('contactOwnerValue') as HTMLInputElement;
		const searchTerm = searchInput.value.trim().toLowerCase();
		this.filteredAgentList = this.agentsList.filter((x: any) => x.name.toLowerCase().includes(searchTerm));
	}
	get shouldShowNoData(): boolean {
		return this.agentsList.length === 0 || !this.agentsList.some((user: any) => user.uid !== this.uid);
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		const popupElement = document.querySelector('.popup-dialog.mention');

		if (this.showMention && popupElement && !popupElement.contains(target)) {
			console.log('jhgjhg');
			this.showMention = false;
		}
	}

	changeRoutes() {
		this.router.navigate(['/dashboard/teambox']);
	}

	closeTemplatePopup() {
		this.messageMeidaFile = '';
		this.messageMediaFile = '';
		this.templateButton = [];
		this.buttonsVariable = [];
	}
	ensureSpaceBeforeTags(htmlString: string): string {
		const tags = ['strong', 'em', 'span'];

		tags.forEach(tag => {
			const spaceAfterRegex = new RegExp(`(<${tag}[^>]*>[^<]*</${tag}>)([^\\s<])`, 'g');
			htmlString = htmlString.replace(spaceAfterRegex, `$1 $2`);
			const spaceBeforeRegex = new RegExp(`([^\\s])(<${tag}(\\s|>))`, 'g');
			htmlString = htmlString.replace(spaceBeforeRegex, `$1 $2`);
		});

		console.log(htmlString);
		return htmlString;
	}
	updateValidation(controlName: any, isMandotry: any) {
		const control = this.editContact.get(controlName);
		if (control) {
			if (!control.value && (isMandotry == 1)) control.setErrors({ required: true });
			else control.setErrors(null);
			control.markAsTouched();
		}
	}

	async repliedMessage(message: any) {
		const msgs = this.selectedInteraction['allmessages'];
		const repliedMessage = msgs.find((msg: any) => msg.Message_id == message?.repliedMessageId);
		console.log(repliedMessage);
		if (repliedMessage) {
			this.moveScrollToRepliedMessage(message);
		} else {
			this.isLoadingOlderMessage = true;
			this.messageRangeStart = this.messageRangeEnd;
			this.messageRangeEnd = this.messageRangeEnd + 100;
			await this.getMessageData(this.selectedInteraction, false);
			setTimeout(() => {
				const last100msgs = this.selectedInteraction['allmessages'];
				const repliedMessages = last100msgs.find((msg: any) => msg.Message_id == message?.repliedMessageId);
				if (repliedMessages) {
					this.moveScrollToRepliedMessage(message);
				} else {
					this.showToaster('this message is either too old or Deleted', 'error');
				}
			}, 900);
		}
	}

	moveScrollToRepliedMessage(message: any) {
		const messageElement = this.messageElements.find(el => el.nativeElement.id == message?.repliedMessageId);
		if (messageElement) {
			messageElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}



	originalBotsList: any = []
	botsList: any = []
	getBotList() {

		this.botService.getBotAlldetails(this.SPID).subscribe((res: any) => {

			if (res.status == 200) {
				this.botsList = res.bots
				this.originalBotsList = [...this.botsList];
			}
		})

	}



	selectedBotobj: any = null;
	selectedbot(bot: any) {
		this.selectedBotobj = bot;
	}

	onDone() {
		if (this.selectedBotobj) {
			this.chatEditor.value = this.selectedBotobj.name
			console.log("Selected Bot:", this.selectedBotobj);
			this.sendMessage(false, '', 'bot')
			setTimeout(() => {

				this.updateInteractionMapping(this.selectedInteraction.InteractionId, -3, this.TeamLeadId)
			}, 1000)
			this.closeAllModal(); // Your custom close logic
		}
	}


	searchBotBuilder(event: any): void {
		const searchValue = event?.target?.value?.trim().toLowerCase();
		var searchKey = searchValue && searchValue.length >= 1 ? searchValue : '';

		if (!searchKey) {
			this.botsList = [...this.originalBotsList]; // Reset to full list
			return;
		}

		this.botsList = this.originalBotsList.filter((bot: any) => {
			return (
				bot.name.toLowerCase().includes(searchKey)
			);
		});
	}


}