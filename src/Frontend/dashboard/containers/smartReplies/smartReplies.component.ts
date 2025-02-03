import { Component, OnInit,ViewChild,ElementRef, HostListener, OnDestroy  } from '@angular/core';
import { FormGroup,FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import Stepper from 'bs-stepper';
import { NgbModalConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { TeamboxService } from './../../services';
import { Router } from '@angular/router';
import { repliesList } from 'Frontend/dashboard/models/smartReplies.model';
import { Location } from '@angular/common';
import { agentMessageList } from 'Frontend/dashboard/models/smartReplies.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ToolbarService, NodeSelection, LinkService, ImageService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService,EmojiPickerService } from '@syncfusion/ej2-angular-richtexteditor';
import { hasEmptyValues } from '../common/Utils/file-utils';

declare var $: any;

@Component({
	selector: 'sb-smartReplies',
	templateUrl: './smartReplies.component.html',
	styleUrls: ['./smartReplies.component.scss'],
	providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService],
})

export class SmartRepliesComponent implements OnInit,OnDestroy {


	//******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}

	@ViewChild('notesSection') notesSection!: ElementRef;
	@ViewChild('chatSection') chatSection!: ElementRef; 
	@ViewChild('chatEditor') chatEditor!: RichTextEditorComponent;

	@ViewChild('variableValue', { static: false }) variableValueForm!: NgForm;

	public selection: NodeSelection = new NodeSelection();
	public range: Range | undefined;
	public saveSelection: NodeSelection | any;

	AgentName = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name

	isEdit: boolean = false;
	isShowSmartReplies: boolean = false;

	data: any;
	items: any;
    actions:any[]=[];
	keywords:any[]=[];
	active = 1;
	showTopNav: boolean = true;
	showSideBar = false;
	searchText ='';
	repliesData!:repliesList;
	replies:[] =[];

 // Add SmartReplies Section //

	stepper: any;
	contactowner = 0;
	val: any;
	SPID!:any;
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
		Description:new FormControl('',Validators.required),
		Channel:new FormControl('',Validators.required)
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
	allTemplatesMain:any =[];
	allTemplates:any =[];
	editedText:string ='';
	editedMessage: string = '';
	isEditable: boolean[] = [];
	addText:string ='';
	showBox:boolean = false;
	showBox1: boolean = false;
	showBox2: boolean = false;
	showattachmentbox = false;
	agentsList:any;
	ShowAssignOption = false;
	assignActionList = ["Assign Conversation", "Add Contact Tag"]; //,"Trigger Flow", "Name Update", "Resolve Conversation" "Remove Tags"
	ShowAddAction = false;
	AutoReplyEnableOption = ['Flow New Launch', 'Flow Help', 'Flow Buy Product', 'Flow Return Product'];
	ShowAutoReplyOption = false;
	AutoReplyOption = false;
	ShowAddTag = false;
	ToggleAddTag = false;
	ToggleAssignOption = false;
	addTagList!:any;
	ShowRemoveTag = false;
	ToggleRemoveTags = false;
	ShowNameUpdate = false;
    errorMessage = '';
	successMessage = '';
	warnMessage = '';
	assignedAgentList: agentMessageList [] =[];
	editableMessageIndex: number | null = null;
	csvContactColmuns:any=[];
	csvContactList:any=[];
	media_Type:string='';
	assignAddTag: [] =[];
	assignedTagList:any []=[];
	assignedTagListUuid: any []=[];
	dragAreaClass: string='';
	selectedChannel:any='WhatsApp Offical';
	contactList:any = [];
	contactSearchKey:any='';
	QuickReplyList:any=[];
	QuickReplyListMain:any=[];
	filterTemplateOption:any='';
	selectedTemplate:any  = [];
	mediaLink: string= '';
	Media:any;
	fileName!:string;
	fileSize!:number;
	attachmentMedia:any='';
	isAttachmentMedia:boolean=false;
	MatchingCriteria:any;
	matchingCriteria:any;
	selectedcriteria:any;
	templateStates: { [key: string]: boolean } = {};
	attribute: string = '';
	indexSelected: number = 0;
	templateChecked: boolean = false;
	allVariables: string = '';
	InitallVariables:any;
	selectedAttribute: any;
	fallbackvalue: string[] = [];
	isFallback: any[] = [];
	isFilterTemplate:any = {
		Marketing: true,
		Utility: true,
		Authentication: true
	  };
	showInfo:boolean = false;
	showInfoIcon:boolean = false;

	    /**richtexteditor **/ 
		showQuickResponse: any = false;
		showAttributes: any = false;
		showQuickReply: any = false;
		showInsertTemplate: any = true;
		showAttachmenOption: any = false;
		showvariableoption:any=false;
		slideIndex = 0;
		PauseTime: any = '';
		confirmMessage: any;
		showEditTemplateMedia: any = false;
		TemplatePreview: any = false;
		messageMeidaFile: any = '';
		mediaType: any = '';
		showMention: any = false;
		editTemplate: any = false;
		searchKey:string='';
		attributesearch!:string;
		allVariablesList:string[]=[];
		buttonsVariable: { label: string; value: string; isAttribute: boolean; Fallback: string }[] = [];
		indexSelectedForDynamicURL: number = 0;
	    isDynamicURLClicked! :boolean;
		variableValues:string[]=[];
		isLoading!: boolean;
		attributesList!:any;
		userList:any;
		userId!:number;
		ShowChannelOption:any=false;
		isAssigned:any=false;
		isEditAssigned:any=false;
		AssignedIndex:any = 0;
		channelOption : any = [];
		
		lastCursorPosition: Range | null = null;
		templateName:string='';
		templatelanguage:string ='';
		templateButton:any =[];
		// channelOption:any=[
		// 	{value:1,label:'WhatsApp Official',checked:false},
		// 	{value:2,label:'WhatsApp Web',checked:false}];
	
		public tools: object = {
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
					tooltipText: 'Quick Replies',
					undo: true,
					click: this.ToggleQuickReplies.bind(this),
					template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/quick-replies.svg"></div></button>'
				},
				{   tooltipText: 'Insert Template',
					undo: true,
					click: this.ToggleInsertTemplateOption.bind(this),
					template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
						+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/insert-temp.svg"></div></button>'
				}]
		};
		public pasteCleanupSettings: object = {
			prompt: false,
			plainText: true,
			keepFormat: false,
		};
	isSendButtonDisabled=false
	click: any;
	selecetdpdf: any='';
	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService, private fb: FormBuilder, private router:Router, private tS :TeamboxService,public settingsService:SettingsService,private elementRef: ElementRef,private location:Location) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}

	selectTemplate(template:any){
		this.templateChecked = true;
		this.selectedTemplate =template
	}

	ngOnInit() {
        this.isLoading = true;
		$('body').addClass('modal-smart-reply-open');

		this.SPID = Number(sessionStorage.getItem('SP_ID'));

	// used settimeout to properly initalize bs-stepper after DOM load
		setTimeout(() => {
			this.stepper = new Stepper($('.bs-stepper')[0], {
				linear: true,
				animation: true
			});
		});

		this.newMessage = this.fb.group({
			message_text: ''
		});
	     this.routerGuard();
	     this.getUserList();
		 this.getTagData()
		 this.getAttributeList();
		 this.getTemplatesList();
		 this.getQuickResponse();
		 this.routerGuard();
		 this.getReplies();
		 this.getWhatsAppDetails();
		}

	ngAfterViewInit() {
		if (this.chatSection) {
			this.scrollChatToBottom();
		}
	}

	ngOnDestroy() {
		$('body').removeClass('modal-smart-reply-open');

	}

	goToStep(step:number) {
		this.stepper.to(step);
	  }


	scrollChatToBottom() {
		const chatWindowElement: HTMLElement = this.chatSection.nativeElement;
        chatWindowElement.scrollTop = chatWindowElement.scrollHeight;
	    chatWindowElement.querySelector('.e-toolbar');
	  }


// add smart replies //

showAddSmartRepliesModal() {
	$("#smartrepliesModal").modal('show');
	// $('body').addClass('modal-add-smart-reply-open');
	$('body').removeClass('modal-smart-reply-open');
	this.isShowSmartReplies = true;
	this.isEditAssigned = false;
}

/*** rich text editor ***/

    hideModal!: boolean;
	closeAllModal() {
		// this.showAttachmenOption = false
		// this.messageMeidaPopup = false
		this.templateChecked = false;
		this.showAttributes = false
		this.showInsertTemplate = false
		this.editTemplate = false
		this.TemplatePreview = false
		this.showQuickReply = false
		this.showMention = false
		this.ShowAddAction = false;
		this.showSideBar = false
		this.selectedTemplate = [];
		this.variableValues=[];
		this.attributesearch = '';
		this.searchKey = '';
		this.variableValueForm.reset();
		$("#attachmentbox").modal('hide');
		$("#showAttributes").modal('hide');
		$("#insertTemplate").modal('hide');
		$("#templatePreview").modal('hide');
		$("#editTemplate").modal('hide');
		$("#showQuickReply").modal('hide');
		$("#sendfile").modal('hide');
		document.getElementById('addsmartreplies')!.style.display = 'inherit';
	}

	removeModalBackdrop() {
		$('.modal-backdrop').remove();
		// $('body').removeClass('modal-add-smart-reply-open');
		$('body').addClass('modal-smart-reply-open');
		this.goToStep(1);
		this.clearSmartreplyModalData();
	}

	clearSmartreplyModalData() {
		this.newReply.reset()
		this.newReply1.reset()
		this.newMessage.reset()
		this.keywords = []
		this.model = []
		this.isEdit = false;
		this.selectedcriteria = ''
		this.assignedAgentList = []
		this.assignedTagList = []
		//this.assignActionList = []
		this.getTemplatesList()
		this.ShowChannelOption = false
		this.isShowSmartReplies = false
		
	}

	// editMedia(){
	// 	$("#editTemplate").modal('hide');
	// 	$("#templatePreview").modal('hide');  
	// 	$("#editTemplateMedia").modal('show'); 
	// }

	editMedia() {
		$("#editTemplate").modal('hide');
		$("#attachmentbox").modal('show');
	}
	
	getWhatsAppDetails() {
		this.settingsService.getWhatsAppDetails(this.SPID)
		.subscribe((response:any) =>{
		 if(response){
			 if (response && response.whatsAppDetails) {
				this.channelOption = response.whatsAppDetails.map((item : any)=> ({
				  value: item.id,
				  label: item.channel_id,
				  connected_id: item.connected_id,
				  channel_status: item.channel_status
				}));
			  }
		 }
	   })
	 }
	showTemplatePreview() {
		console.log(this.variableValues,'VARIBALE VALUES');
		if (hasEmptyValues(this.buttonsVariable)) {
            this.showToaster('Variable value should not be empty', 'error');
            return;
        }

		if(this.variableValues.length!==0 && this.allVariablesList.length!==0) {
			this.addVariable();
			this.replaceVariableInTemplate();
			$("#editTemplate").modal('hide'); 
			$("#templatePreview").modal('show'); 
		}

		else if (this.allVariablesList.length==0) {
			$("#editTemplate").modal('hide'); 
			$("#templatePreview").modal('show'); 
		}
		else {
			this.showToaster('Variable value should not be empty','error')
		}

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
		this.InitallVariables = allVariables;
	}
	
	
	addAttributeInVariables(item: any) {
		if (item) {
			this.selectedAttribute = item;
		  }
		}


	closeEditMedia() {
		$("#editTemplate").modal('show'); 
		$("#attachmentbox").modal('hide');
		$("#editTemplateMedia").modal('hide'); 
		this.isAttachmentMedia = false;
		this.showSideBar = false;
	}

	ToggleAttachmentBox() {
		// this.closeAllModal()
	    $("#attachmentbox").modal('show');
        document.getElementById('addsmartreplies')!.style.display = 'none';
		this.dragAreaClass = "dragarea";

	}
	onFileChange(event: any) {
		let files: FileList = event.target.files;
		this.saveFiles(files);
		
	}
	sendattachfile(){
		if (this.isAttachmentMedia === false) {
			if (this.messageMeidaFile !== '') {
				$("#sendfile").modal('show');
				$("#attachmentbox").modal('hide');
			}
		}
		
		else {
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
				$("#attachmentbox").modal('hide');
				$("#editTemplate").modal('show');
				this.messageMeidaFile='';
			} else {
				this.showToaster('! Please only upload media that matches selected template', 'error');
				$("#attachmentbox").modal('hide');
				$("#editTemplate").modal('show');
				this.messageMeidaFile='';
				
			}
		}
		this.showSideBar = false
		this.isAttachingLoader = false;
	}

	cancelEditTemplateMedia(){
		$("#editTemplate").modal('show'); 
		$("#editTemplateMedia").modal('hide'); 
	}

	updateEditTemplateMedia(){
		$("#editTemplate").modal('show'); 
		$("#editTemplateMedia").modal('hide'); 
	}
	isAttachingLoader! : boolean;
	saveFiles(files: FileList) {
		this.isAttachingLoader = true;
		if (files.length > 0) {
		  let fileName: any = files[0].name;
		  let fileExt: string = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
		  let spid = this.SPID
		  if (['pdf', 'jpg', 'jpeg', 'png', 'mp4'].includes(fileExt)) {
			let mediaType = files[0].type;
			let fileSize = files[0].size;

			const fileSizeInMB: number = parseFloat((fileSize / (1024 * 1024)).toFixed(2));
			const imageSizeInMB: number = parseFloat((5 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
			const docVideoSizeInMB: number = parseFloat((10 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
	  
			const data = new FormData();
			data.append('dataFile', files[0], fileName);
			data.append('mediaType', mediaType);
	  
			if((mediaType == 'video/mp4' || mediaType == 'application/pdf') && fileSizeInMB > docVideoSizeInMB) {
				this.showToaster('Video / Document File size exceeds 10MB limit','error');
			}

			else if ((mediaType == 'image/jpg' || mediaType == 'image/jpeg' || mediaType == 'image/png' || mediaType == 'image/webp') && fileSizeInMB > imageSizeInMB) {
				this.showToaster('Image File size exceeds 5MB limit','error');
			}

			else {
				let name='smartReply'
				this.tS.uploadfile(data,spid,name).subscribe(uploadStatus => {
				  let responseData: any = uploadStatus;
				  if (responseData.filename) {
					this.messageMeidaFile = responseData.filename;
					this.attachmentMedia = responseData.filename;
					this.mediaType = mediaType;
					this.fileName = fileName;
					this.fileSize = fileSizeInMB;
					this.showAttachmenOption = false;
					this.sendattachfile();
				  }
				});
			}
		
	  
			if (['pdf', 'jpg', 'jpeg', 'png'].includes(fileExt)) {
			  let reader: FileReader = new FileReader();
			  reader.readAsText(files[0]);
	  
			  let tabalHeader: any[] = [];
			  let tabalRows: any[] = [];
	  
			  reader.onload = (e) => {
				let content: string = reader.result as string;
				const results = content.split("\n");
				let i = 0;
				results.map((row: any) => {
				  if (row) {
					const rowCol = row.split(",");
					if (i == 0) {
					  tabalHeader = rowCol;
					} else {
					  tabalRows.push(rowCol);
					}
					i++;
				  }
				});
	  
				this.csvContactColmuns = tabalHeader;
				let contactsData: any[] = [];
				tabalRows.map((rowbh: any) => {
				  let row: any = {};
				  for (var k = 0; k < tabalHeader.length; k++) {
					let keyName: any = tabalHeader[k].replace('\r', '');
					keyName = keyName.replaceAll(' ', '');
					let value: any = rowbh[k];
					console.log(keyName);
					row[keyName] = value != '\r' ? value : 'null';
				  }
				  contactsData.push(row);
				});
	  
				console.log('Contacts Data:', contactsData);
				this.csvContactList = contactsData;
				this.selecetdpdf = fileName;
			  }
			}
		  } else {
			this.showToaster('Please upload a PDF, image, or video (mp4) file only...', 'error');
		  }
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
		console.log(this.stepper);
		console.log(this.stepper._currentIndex);
		if (event.dataTransfer.files && this.stepper._currentIndex == 2) {
		let files: FileList = event.dataTransfer.files;
		this.saveFiles(files);
		}
	 }
	 getMimeTypePrefix(mimeType: string): string {
		return mimeType.split('/')[0];
	  }
	sendMediaMessage(){
		// this.saveMessage();
		// this.Media=this.messageMeidaFile;
		this.closeAllModal()
		console.log(this.mediaType)
		console.log(this.messageMeidaFile)
		let mediaName
		const fileNameWithPrefix = this.messageMeidaFile.substring(this.messageMeidaFile.lastIndexOf('/') + 1);
		let originalName;
		let getMimeTypePrefix = this.getMimeTypePrefix(this.mediaType);
		if (this.mediaType === 'video/mp4') {
			originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
			originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
		} else {
			originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
		}

		let mediaContent:any;
		if(this.mediaType == 'image/jpeg' || this.mediaType == 'image/jpg' || this.mediaType == 'image/png' || this.mediaType == 'image/webp') {
			mediaContent ='<p><img style="width:100%; height:100%" src="'+this.messageMeidaFile+'" /></p>'
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> '+originalName+'</p>'
		  }
		  else if(this.mediaType == 'video/mp4') {
			  mediaContent ='<p><video controls width="100%" height="100%" src="'+this.messageMeidaFile+'"></video></p>'
			  mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> '+originalName+'</p>'
		  }
		  else if(this.mediaType == 'application/pdf') {
			//media_type ='document';
		getMimeTypePrefix ='document';
			  mediaContent ='<p><a href="'+this.messageMeidaFile+'"><img style="width:14px; height:17px" src="../../../../assets/img/settings/doc.svg" />'+this.fileName+'</a></p>'
			  mediaName ='<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" alt="icon"/>'+originalName+'</p>'
		  }

		const editorElement = this.chatEditor?.contentModule?.getEditPanel?.();

		if (editorElement) {
		const existingMediaElement = editorElement.querySelector('.custom-class-attachmentType');
		
		if (existingMediaElement) {
			const newElement = document.createElement('div');
			newElement.innerHTML = mediaName+ '<br>';
			editorElement.replaceChild(newElement.firstElementChild!, existingMediaElement);
		} else {
			const editorValue = this.chatEditor.value ?? '<br>';
			this.chatEditor.value = mediaName + editorValue;
		}
		}
		let item = {
			media_type: getMimeTypePrefix,
		    }
		// this.chatEditor.value = mediaContent;
		this.addingStylingToMedia(item);
	}

	toggleChannelOption(){
		this.ShowChannelOption=!this.ShowChannelOption;
	}
	
	ToggleAttributesOption() {
		this.closeAllModal()
		$("#showAttributes").modal('show');
		const selection = window.getSelection();		
		this.lastCursorPosition = selection?.getRangeAt(0) || null;
        document.getElementById('addsmartreplies')!.style.display = 'none';
	}
	ToggleQuickReplies() {
		this.closeAllModal()
		$("#showQuickReply").modal('show');
		document.getElementById('addsmartreplies')!.style.display = 'none';
	}


	ToggleInsertTemplateOption() {
		this.closeAllModal()
		$("#insertTemplate").modal('show');
        document.getElementById('addsmartreplies')!.style.display = 'none';
		this.fallbackvalue = [];
		this.allTemplates = JSON.parse(JSON.stringify(this.allTemplatesMain));
	}

	showeditTemplate(){
	if(this.selectedTemplate.length!==0 ) {
		$("#editTemplate").modal('show'); 
		$("#insertTemplate").modal('hide'); 
		this.isAttachmentMedia = true;
		this.previewTemplate();
	}
	else {
		this.showToaster('! Please Select Any Template To Proceed','error');
	}

   }
	
	openVariableOption(indexSelected: number) {
		this.indexSelected = indexSelected;
		this.attribute = '';
	$("#showvariableoption").modal('show'); 
	$("#editTemplate").modal('hide');
	}

	openVariableOptionDynamicURL(indexSelected: number) {
		this.indexSelectedForDynamicURL = indexSelected;
		this.isDynamicURLClicked = true;
		$("#showvariableoption").modal('show'); 
		$("#editTemplate").modal('hide'); 
	}
	closeVariableOption() {
		this.attributesearch=''; 
		$("#showvariableoption").modal('hide');
		$("#editTemplate").modal('show'); 
	}

	UpdateVariable(event: any, index: number) {
		let currentValue = event.target.value;
		const forbiddenKeys = ['{', '}'];
		if (forbiddenKeys.some(key => currentValue.includes(key))) {
			currentValue = currentValue.replace(/[{}]/g, '');
			event.target.value = currentValue;
		}

		if( this.isFallback[index] == true) {
			event.target.value = ''
            currentValue = '';
			this.variableValues[index] = "";
			this.fallbackvalue[index] = "";
		}
		this.isFallback[index] = this.isCustomValue(currentValue);
	    if(!this.isFallback[index]){
			this.fallbackvalue[index] = "";
		}
		console.log(this.selectedTemplate)
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
	isCustomValue(value: string): boolean {
		if(value){
			let isMatched = false
			const availableAttributes = this.attributesList.map((attribute: string) => `{{${attribute}}}`);
            availableAttributes.forEach((attribute: string) =>{
				if(attribute == value){
                   isMatched = true;
				}

			});
			return isMatched
		}
		else {
			return false;
		}
	  }
	SaveVariableOption() {
		if(this.isDynamicURLClicked){
			this.buttonsVariable[this.indexSelectedForDynamicURL].value = '{{'+this.selectedAttribute+'}}';
			this.buttonsVariable[this.indexSelectedForDynamicURL].isAttribute = this.isCustomValue('{{'+this.selectedAttribute+'}}');
			this.buttonsVariable[this.indexSelectedForDynamicURL].Fallback = this.attribute;
			this.isDynamicURLClicked = false;
		}
		this.variableValues[this.indexSelected] = '{{'+this.selectedAttribute+'}}';
		this.fallbackvalue[this.indexSelected] = this.attribute;
		this.isFallback[this.indexSelected] = this.isCustomValue('{{'+this.selectedAttribute+'}}');
		this.resetAttributeSelection();
		$("#showvariableoption").modal('hide'); 
		$("#editTemplate").modal('show'); 
	}
	resetAttributeSelection() {
		this.attribute = '';
		this.selectedAttribute = '';
	}

	// selectAttributes(item:any) {
	// 	this.closeAllModal();
	// 	const selectedValue = item;
	// 	let content:any = this.chatEditor.value || '';
	// 	content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
	// 	content = content+'<span contenteditable="false" class="e-mention-chip"><a _ngcontent-yyb-c67="" href="mailto:" title="">{{'+selectedValue+'}}</a></span>'
	// 	this.chatEditor.value = content;
	// }
	selectAttributes(item:any) {
		const selectedValue = item;
		let content:any ='';	
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
		newNode.innerHTML =  '<span contenteditable="false" class="e-mention-chip"><a _ngcontent-yyb-c67="" title="">{{'+selectedValue+'}}</a></span>';
		this.lastCursorPosition?.insertNode(newNode);
	}

	selectQuickReplies(item:any){
		this.closeAllModal()
		let mediaContent;
		let mediaName;
		const fileNameWithPrefix = item.Links.substring(item.Links.lastIndexOf('/') + 1);
		let originalName;
		if (item.media_type === 'video') {
			originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
			originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
		} else {
			originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
		}
		if(item.media_type == 'image') {
		  mediaContent ='<p><img style="width:100%; height:100%" src="'+item.Links+'"></p>'
		  mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> '+originalName+'</p>'
		}
		else if(item.media_type == 'video') {
			mediaContent ='<p><video controls style="width:100%; height:100%" src="'+item.Links+'"></video></p>'
			mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> '+originalName+'</p>'
		}
		else if(item.media_type == 'document') {
			mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
			mediaName ='<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" />'+originalName+'</p>'
		}
		else {
			mediaContent=''
		}
		if(item.Links) this.messageMeidaFile = item.Links

		var htmlcontent = mediaName ? mediaName : ''+item.BodyText;
		this.chatEditor.value = htmlcontent;
		this.addingStylingToMedia(item);	
	}

	addingStylingToMedia(item: any){
		if (item.media_type === 'image' || item.media_type === 'video' || item.media_type === 'document' || item.media_type == 'application') {
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
				crossButton.style.border ='none';
				crossButton.style.outline ='none';
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
				parentElement.appendChild(crossButton);

				parentElement.style.pointerEvents = 'none';
                parentElement.setAttribute('contenteditable', 'false'); 
	
				crossButton.addEventListener('click', () => {
					if (media && media.parentElement) {
						media.remove();
					  }
					  if (crossButton && crossButton.parentElement) {
						crossButton.remove();
					  }
					  const mediaNameElement = editorContent?.querySelector('.custom-class-attachmentType');
					  if (mediaNameElement) {
						mediaNameElement.remove();
					  }
					  if (this.mediaType) this.mediaType = '';
					  if(this.messageMeidaFile) this.messageMeidaFile = '';
				});
			  });
			}, 0); 
		  }
	}
	isImage(media: string): boolean {
		if(!media) return false;
		return media.match(/\.(jpeg|jpg|gif|png)$/) != null;
	  }
	
	  isVideo(media: string): boolean {
		if(!media) return false;
		return media.match(/\.(mp4|webm|ogg)$/) != null;
	  }
	  isDocument(media: string): boolean {
		if(!media) return false;
		return /\.(pdf|doc|docx|xls|xlsx)$/i.test(media);
	  }
	// insertTemplate(item:any) {
	// 	this.closeAllModal()
	// 	let mediaContent;
	// 	let mediaName;
	// 	const fileNameWithPrefix = item.Links.substring(item.Links.lastIndexOf('/') + 1);
	// 	let originalName;
	// 	if (item.media_type === 'video') {
	// 		originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
	// 		originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
	// 	} else {
	// 		originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
	// 	}
	// 	if(item.media_type === 'image') {
	// 	  mediaContent ='<p><img style="width:100%; height:100%" src="'+item.Links+'"></p>';
	// 	  mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> '+originalName+'</p>'
	// 	}
	// 	else if(item.media_type === 'video') {
	// 		mediaContent ='<p><video controls style="width:100%; height:100%" src="'+item.Links+'"></video></p>';
	// 		mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> '+originalName+'</p>'
	// 	}
	// 	else if(item.media_type === 'document') {
	// 		mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>';
	// 		mediaName ='<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" />'+originalName+'</a></p>'
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
	// 	this.addingStylingToMedia(item);
	// }


	searchQuickReply(event:any){
		let searchKey = event.target.value
		if(searchKey.length>2){
		var allList = this.QuickReplyListMain
		let FilteredArray = [];
		for(var i=0;i<allList.length;i++){
			var content = allList[i].Header.toLowerCase()
				if(content.indexOf(searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allList[i])
				}
		}
		this.QuickReplyList = FilteredArray
	    }else{
			this.QuickReplyList = this.QuickReplyListMain
		}
	}
	searchContact(event:any){
		this.contactSearchKey = event.target.value;
		this.getSearchContact()
		
	}
	getSearchContact(){
		let SPID = sessionStorage.getItem('SP_ID')
		this.tS.searchCustomer(this.selectedChannel,SPID,this.contactSearchKey).subscribe(data =>{
			this.contactList= data
		});
	}

	toggleInfoIcon() {
		this.showInfoIcon = !this.showInfoIcon;
	  }

	  showToolTip(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('fallback-tooltip')) {
			this.showInfo = true;
		}
	}
	  
	insertTemplateInChat(item:any){
		// $("#templatePreview").modal('hide');
		this.closeAllModal();
		let mediaContent
		if(item.media_type == 'image') {
		  mediaContent ='<p><img style="width:100%; height:100%" src="'+item.Links+'"></p>'
		}
		else if(item.media_type == 'video') {
			mediaContent ='<p><video controls style="width:100%; height:100%" src="'+item.Links+'"></video></p>'
		}
		else if(item.media_type == 'document') {
			mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
		}
		let htmlcontent = '';
		if (item.Header && item.media_type == 'text') {
			htmlcontent += '<p><strong>'+item.Header+'</strong></p>';
		}

		if(mediaContent && item.media_type!== 'text') {
			htmlcontent += mediaContent
		}
	
		htmlcontent +='<p>'+ item.BodyText+'</p>';
		if (item.FooterText) {
			htmlcontent+='<p class="temp-footer">'+item.FooterText+'</p>';
		}
		if(item.Links) this.messageMeidaFile = item.Links
		this.chatEditor.value =htmlcontent;
		this.isAttachmentMedia = false;
		this.templateName =item?.TemplateName;
		this.templatelanguage =item?.Language;
		this.templateButton  =item?.buttons;
		this.addMessage(true,htmlcontent,item?.Header,item?.BodyText);
	}

	searchTemplate(event:any){
		this.searchKey = event.target.value
		if(this.searchKey.length>2){
		var allList = this.allTemplatesMain
		let FilteredArray: any[] = [];
		for(var i=0;i<allList.length;i++){
			var content = allList[i].TemplateName.toLowerCase()
				if(content.indexOf(this.searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allList[i])
				}
		}
		this.allTemplates = FilteredArray
	    }else{
			this.allTemplates = this.allTemplatesMain
		}
	}

	filterTemplate(temType:any){


	// 	if(temType.target.checked){
		var type= temType.target.value;
		this.isFilterTemplate[type] = !this.isFilterTemplate[type];
	
		let allList  =this.allTemplatesMain;
	// 	for(var i=0;i<allList.length;i++){
	// 			if(allList[i]['Category'] == type){
	// 				allList[i]['isDeleted']=1
	// 			}
	// 	}
	//    }else{
	// 	var type= temType.target.value;
	// 	for(var i=0;i<allList.length;i++){
	// 			if(allList[i]['Category'] == type){
	// 				allList[i]['isDeleted']=0
	// 			}
	// 	}
	//    }
		var newArray=[];
		for(var m=0;m<allList.length;m++){
		var category = allList[m]['Category'];
			if(this.isFilterTemplate[category]){
			newArray.push(allList[m])
			}

		}
		this.allTemplates= newArray
	
		
	}

	async getquickReply(){
		this.tS.getquickReply(this.SPID).subscribe(quickReply =>{
			this.QuickReplyListMain = quickReply
			this.QuickReplyList = quickReply
		})
		
	}

	showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}	
		else if(type=='warn'){
			this.warnMessage=message;
		}
		else if(type=='error'){
			this.errorMessage=message;
		}
	
		setTimeout(() => {
			this.hideToaster()
		}, 5000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.warnMessage='';
		this.errorMessage='';
	}

	/***add keyword and remove keyowrd method***/

	addKeyword() {
		let trimmedKeyword = this.keyword.trim();
	
		if (!trimmedKeyword) {
		  this.showToaster('! Please add a keyword','error');
		  return;
		}
		let isDuplicate = this.keywords.some((existingKeyword) => {
		  return existingKeyword.toLowerCase() === trimmedKeyword.toLowerCase();
		});
	
		if (isDuplicate) {
			this.showToaster('! Keyword already added','error');
		} else {
		  this.keywords.push(trimmedKeyword);
		  this.keyword = '';
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

	addMessage(isTemplate:boolean=false,templateTxt:string='',headerText:string='',bodyText:string='') {
		// var tempDivElement = document.createElement("div");   
		// tempDivElement.innerHTML = this.chatEditor.value;
		// let val = tempDivElement.textContent || tempDivElement.innerText || "";
		let value = isTemplate ?templateTxt :(this.chatEditor.value || "");

		if (!value) {
			this.showToaster('! Please type your message first','error');
			return;
		}
		let mediaType = '';
        if(this.chatEditor.value){
			value = this.removeMediaTags(this.chatEditor.value);
			value = this.removeClass(value);
			if(this.messageMeidaFile) mediaType = this.getMediaType(this.messageMeidaFile);
		}

		if (this.editableMessageIndex !== null && this.editableMessageIndex >= 0 && this.editableMessageIndex < this.assignedAgentList.length) {

			this.assignedAgentList[this.editableMessageIndex].Message = value;
			this.assignedAgentList[this.editableMessageIndex].Media = this.messageMeidaFile;
	
			this.editableMessageIndex = null;
			this.isEditable = [];
		} else {

			this.assignedAgentList.push({
				ActionID: 0, 
				Message: value, 
				Value: '', 
				ValueUuid: '',
				Media: this.messageMeidaFile,
				MessageVariables: this.allVariables,
				media_type : mediaType,
				isTemplate:isTemplate,
				headerText: headerText,
				bodyText: bodyText,
				name: this.templateName,
				language: this.templatelanguage,
				buttons: this.templateButton,
				buttonsVariable: this.buttonsVariable
			});
		}
		this.messageMeidaFile = '';
		console.log(this.assignedAgentList,'ADDED MESSAGE DATA')
		this.templateButton = [];
		this.buttonsVariable = [];
			this.chatEditor.value = '';

			setTimeout(() => {
				this.scrollChatToBottom();
				this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
				this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
			}, 100);
		}
		removeMediaTags(htmlContent: string): string {
			let updatedHtml = htmlContent.replace(/<img[^>]*>[^<]*|<video[^>]*>[^<]*<\/video>/gi, '');
			updatedHtml = updatedHtml.replace(/<[^\/>]+>\s*<\/[^>]+>/gi, '');
			return updatedHtml;
		  }
		  removeClass(htmlContent: string): string {
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = htmlContent;
			const mediaElements = tempDiv.querySelectorAll('.custom-class-attachmentType');
			mediaElements.forEach(element => element.remove());
			return tempDiv.innerHTML;
		  }
		  getMediaType(url: string): string | '' {
			const extensionToMimeType: { [key: string]: string } = {
			  'jpeg': 'image/jpeg','jpg': 'image/jpeg','png': 'image/png',
			  'gif': 'image/gif','bmp': 'image/bmp','webp': 'image/webp',
			  'mp4': 'video/mp4','webm': 'video/webm','ogg': 'video/ogg',
			  'mp3': 'audio/mpeg','wav': 'audio/wav','pdf': 'application/pdf',
			  'doc': 'application/doc','docx': 'application/docx','xls': 'application/xls',
			  'xlsx': 'application/xlsx','ppt': 'application/ppt','pptx': 'application/pptx',
			};
			const extension = url.split('.').pop()?.toLowerCase();
			return extension ? extensionToMimeType[extension] || '' : '';
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

	/* edit message and assinged conversation */ 
	toggleEditable(index: number) {
		this.isEditable[index] = !this.isEditable[index];
		this.editableMessageIndex = this.isEditable[index] ? index : null;
		if(this.assignedAgentList[index]?.ValueUuid){
			this.ShowAssignOption = true;
			this.isEditAssigned =true;
			this.AssignedIndex = index;
		}else{
	    const element = document.getElementById(`msgbox-body${index}`);
		let getMimeTypePrefix;
		let mediaName;
		let Link;
        if(this.assignedAgentList[index]?.Media){
			let mediaType
			Link = this.assignedAgentList[index].Media;
			mediaType = this.getMediaType(Link);
			const fileNameWithPrefix = Link.substring(Link.lastIndexOf('/') + 1);
			getMimeTypePrefix = this.getMimeTypePrefix(mediaType);
			let originalName;
				if (getMimeTypePrefix === 'video') {
					originalName = fileNameWithPrefix.substring(0, fileNameWithPrefix.lastIndexOf('-'));
					originalName = originalName + fileNameWithPrefix.substring(fileNameWithPrefix.lastIndexOf('.'));
				} else {
					originalName = fileNameWithPrefix.substring(fileNameWithPrefix.indexOf('-') + 1);
				}

			if(getMimeTypePrefix == 'image') {
				mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/photo-icon.svg" alt="icon"> '+originalName+'</p>'
			  }
			  else if(getMimeTypePrefix == 'video') {
				  mediaName = '<p class="custom-class-attachmentType"><img src="/assets/img/teambox/video-icon.svg" alt="icon"> '+originalName+'</p>'
			  }
			  else if(getMimeTypePrefix == 'application' || getMimeTypePrefix == 'document') {
				  mediaName ='<p class="custom-class-attachmentType"><img src="/assets/img/teambox/document-icon.svg" alt="icon"/>'+originalName+'</p>'
			  }
		}

		  if (element) {
			// element.focus();
			let currentValue = element.innerHTML ?? '<br>';
			if(mediaName) this.chatEditor.value = mediaName + currentValue;
			else this.chatEditor.value = currentValue;
			console.log(element);
			if(getMimeTypePrefix){
				this.messageMeidaFile = Link;
				let item ={
					media_type: getMimeTypePrefix
				  }
				this.addingStylingToMedia(item);
			}
			
		  }
		}
		
	  }
	
	  closeAddAction() {
		// Close the dialog when clicking outside
		this.ShowAddAction = false;
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
	this.ShowAddAction = false;
  }
  else if (this.assignActionList[index] === "Add Contact Tag") {
	  this.ShowRemoveTag =false;
	  $("#addTagModal").modal('show'); 
	  this.ShowAddAction = false;

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

stopPropagation(event: Event) {
    event.stopPropagation();
  }
 
  closeEditableSection() {
	// Iterate over the array and set isEditable to false for all messages
	this.isEditable.forEach((_, index) => {
	  this.isEditable[index] = false;
	});
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
				if(item.Value == this.agentsList[index].name) 
				isExist = true;
			}
		})
		if(!isExist) {
			this.isAssigned = true;
			if(this.isEditAssigned){
				this.assignedAgentList[this.AssignedIndex] = { Message: '', ActionID: 2, Value: this.agentsList[index].name,ValueUuid: this.agentsList[index].uuid, Media: '', MessageVariables: '', media_type : '',isTemplate:false,headerText: '',bodyText: '',buttons:[],language:'',name:'',buttonsVariable:[]}
			}else{
				this.assignedAgentList.push({ Message: '', ActionID: 2, Value: this.agentsList[index].name,ValueUuid: this.agentsList[index].uuid, Media: '', MessageVariables: '', media_type: '',isTemplate:false,headerText: '',bodyText: '',buttons:[],language:'',name:'',buttonsVariable:[]})
			}
		}
			
	}

	addTags(index: number, e:any) {
		console.log(e,index);
		var isExist = false;
		console.log(this.assignedTagList,' tags list');
		this.assignedAgentList.forEach(item => {
			if (item.ActionID == 1) {
				  isExist= true;
				  if (e.target.checked) {
					  if (!item.Value.includes(this.addTagList[index])) {
						  console.log(this.addTagList[index]);
						  // item.Value.push(this.addTagList[index]);
						  this.assignedTagList.push(this.addTagList[index].TagName);
						  this.assignedTagListUuid.push(this.addTagList[index].ID);
					  }
				  }
				  else {
					var idx = this.assignedTagList.findIndex(item => item == this.addTagList[index]) 
					console.log(idx);
					console.log(this.assignedTagList[idx]);
					this.assignedTagList.splice(idx,1);
					this.assignedTagListUuid.splice(idx,1);
				  }
				
		}
		})
		if (!isExist) {
			this.assignedTagList = [];
			this.assignedTagList.push(this.addTagList[index].TagName);
			this.assignedTagListUuid.push(this.addTagList[index].ID);
			this.assignedAgentList.push({ Message: '', ActionID: 1, Value: this.assignedTagList,ValueUuid: this.assignedTagListUuid,Media: '', MessageVariables: '', media_type: '',isTemplate:false,headerText: '',bodyText: '',buttons:[],language:'',name:'',buttonsVariable:[]});
			console.log('new value');
		}
		console.log(this.assignedAgentList);
		console.log(this.assignedTagList);
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
	getNewSmartReplyData() {
		console.log(this.newReply);
		if (this.newReply.valid) {
			this.next();
		} else {
			this.showToaster("! Title ,Description and Channel is Required","error");
		}
	}

	onSelectionChange(entry: any): void {
		this.model = entry;
		console.log(this.model)


		sessionStorage.setItem('MatchingCriteria',this.model)
		this.selectedcriteria=this.model;
		console.log(this.model);
	}

	scloseAddActionDialog() {
		// Close the dialog when clicking outside
		this.ShowAddAction = false;
	  }
	
	

	sendNewSmartReply(smartreplysuccess: any, smartreplyfailed: any) {
		this.isLoading = true;
		var data = {
		  SP_ID: sessionStorage.getItem('SP_ID'),
		  Title: this.newReply.value.Title,
		  Description: this.newReply.value.Description,
		  Channel: this.newReply.value.Channel,
		  MatchingCriteria: this.model,
		  Keywords: this.keywords || [], 
		  ReplyActions: this.assignedAgentList || [],
		  Tags: this.assignedTagList || [],
		  TagsUuid: this.assignedTagListUuid || [],
		};
		let isMessage:boolean = false
		for (const action of data.ReplyActions) {
		   if (action.ActionID === 0) {
			 isMessage = true;
			 break;
		   }
		 }
	  
		console.log(data);
		if (data.Keywords.length > 0 && isMessage) {
		  this.apiService.addNewReply(data).subscribe(
			(response: any) => {
			  console.log(response);
			  if (response.status === 200) {
				this.isLoading = false;
				this.location.replaceState(this.location.path());
				this.modalService.dismissAll(smartreplysuccess);
				this.reloadCurrentRoute();
				this.isEditAssigned = false;
				this.removeModalBackdrop()
				this.getReplies();
			  }
			},
			(error: any) => {
			  if (error.status === 500) {
				this.modalService.open(smartreplyfailed);
			  } else {
				this.showToaster("! Internal Server Error Please try after some time","error");
	
			  }
			}
		  );
		} else {
		  this.showToaster("! Message cannot be empty","warn");
		}
	}
	reloadCurrentRoute() {
		this.router.navigateByUrl('/reload', { skipLocationChange: true }).then(() => {
			this.router.navigate([decodeURI(this.location.path())]);
		  });
	  }
	private modalRef!: NgbModalRef;
	smartReplySuccess(smartreplysuccess: any) {
		if(this.assignedAgentList.length) this.modalRef = this.modalService.open(smartreplysuccess);
		else this.showToaster('! Please type your message first','error');
		// this.removeModalBackdrop()
		// this.modalService.dismissAll()
		// this.showSideBar = false;
		// this.getReplies();
		// this.location.replaceState(this.location.path());
		// window.location.reload();
	  }


	  /*  METHOD FOR VERIFY KEYWORD DUPLICACY  */

	verifyKeyword() {

		const isEmptyKeyword = this.keywords.some(k => k.trim() !=='');
		if (!isEmptyKeyword || !this.selectedcriteria){
			this.showToaster("! Keyword and Matching Criteria required",'error');
			return;
		}
		
		 else {
			var data= {
				SP_ID: sessionStorage.getItem('SP_ID'),
				Keywords: this.keywords
			}

			if(this.isEdit == false) {
				this.apiService.duplicatekeywordSmartReply(data)
				.subscribe(
				 (response: any) => {
				 console.log(response)
				 if (response.status === 200) {
					 this.next();				
				 }
			 
			 },
				 (error: any) => {
					 if (error.status === 409) {
						 this.showToaster('! Duplicate keyword found Please try other keyword.',"error");
					 }
					 else {					
						 this.showToaster("! Internal Server Error Please try after some time","error");
					 
					 }
			 });
			}
			else {
				this.next();
			}

		}

	}

	  /*  TOGGLE FUZZY, EXACT & CONTAINS DIVs  */

	onToggleBox(event: MouseEvent, showBox: boolean, showBox1: boolean, showBox2: boolean) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('form-check-label-img')) {
		  this.showBox = showBox;
		  this.showBox1 = showBox1;
		  this.showBox2 = showBox2;
		}
	  }

	  onClickFuzzy(event: MouseEvent) {
		this.onToggleBox(event, true, false, false);
	  }
	  
	  onClickExact(event: MouseEvent) {
		this.onToggleBox(event, false, true, false);
	  }
	  
	  onClickContains(event: MouseEvent) {
		this.onToggleBox(event, false, false, true);
	  }

	  /*  GET USER LIST  */
	  getUserList(){
		this.settingsService.getUserList(this.SPID,1)
		.subscribe((result:any) =>{
		  if(result){
			this.userList =result?.getUser;  
			this.userList.forEach((item: { name: string; nameInitials: string; }) => {
                const nameParts = item.name.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts[1] || '';
                const nameInitials = firstName.charAt(0)+ ' ' +lastName.charAt(0);
    
                item.nameInitials = nameInitials;
            });
			this.agentsList = []
			for(let i=0 ; i<this.userList.length; i++) {
				this.agentsList.push({
					name: this.userList[i].name,
					nameInitials: this.userList[i].nameInitials,
					profileImg: this.userList[i].profile_img,
					RoleName:this.userList[i].RoleName,
					uuid: this.userList[i].uid
				});
			}
		  }
	  
		});
	  }
  /*  GET TAG LIST  */
	  getTagData(){
		this.settingsService.getTagData(this.SPID)
		.subscribe(result =>{
		  if(result){
		   let tagListData = result.taglist; 
			this.addTagList = tagListData;
		  }
	  
		})
	  }
  /*  GET ATTRIBUTE LIST  */
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

  /*  GET TEMPLATES LIST  */
  getTemplatesList() {
	let spid = Number(this.SPID)
	this.settingsService.getApprovedTemplate(spid,1).subscribe(allTemplates =>{
		allTemplates?.templates.forEach((item:any) => {
			item.buttons = JSON.parse(item?.buttons ? item?.buttons :'[]');
		});
		this.allTemplatesMain = allTemplates.templates
		this.allTemplates = allTemplates.templates

	})
	
}
  /*  Get Quick Response List  */
  getQuickResponse(){
	this.settingsService.getTemplateData(this.SPID,0).subscribe(response => {
	  this.QuickReplyListMain=response.templates;
	  this.QuickReplyList=response.templates;
	  console.log(this.QuickReplyList, 'QUICK REPLIES LIST');
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
			let isVariableValue='';
			if(this.selectedTemplate.media_type == 'text') {
				isVariableValue = this.selectedTemplate.Header + this.selectedTemplate.BodyText;
			}
			else {
				isVariableValue = this.selectedTemplate.BodyText;
			};
				if (isVariableValue) {
				  this.allVariablesList = this.getVariables(isVariableValue, "{{", "}}");
			  }

			  this.buttonsVariable=[];
			  if (this.selectedTemplate?.buttons.length) {
				  this.buttonsVariable = this.selectedTemplate?.buttons
					  .filter((button: any) => button?.webType === 'Dynamic')
					  .map((button: any, index: any) => ({
						  label: button?.webUrl,
						  value: '',
						  Fallback: '',
						  isAttribute: ''
					  }));
			  }
			}

		// replaceVariableInTemplate() {
		// 	this.mediaLink = this.selectedTemplate.Links;
		// 	this.allVariablesList.forEach((placeholder, index) => {
		// 		const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
		// 		if(this.selectedTemplate.media_type == 'text') {
		// 			this.selectedTemplate.Header = this.selectedTemplate.Header.replace(regex, this.variableValues[index]);
		// 		}
		// 		this.selectedTemplate.BodyText = this.selectedTemplate.BodyText.replace(regex, this.variableValues[index]);
		// 	});
		// }
	
		replaceVariableInTemplate() {
			let val:any =[];
			this.allVariablesList.forEach((placeholder, index) => {
				const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
				if(this.selectedTemplate.media_type == 'text') {
					this.selectedTemplate.Header = this.selectedTemplate.Header.replace(regex, '{{' + index + '}}');
				}
				val.push({idx:'{{' + index + '}}',value:this.variableValues[index]});
				this.selectedTemplate.BodyText = this.selectedTemplate.BodyText.replace(regex, '{{' + index + '}}');
			});
			val.forEach((placeholder:any) => {
				const regex = new RegExp(placeholder?.idx?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
				if(this.selectedTemplate.media_type == 'text') {
					this.selectedTemplate.Header = this.selectedTemplate.Header.replace(regex, placeholder?.value);
				}
				this.selectedTemplate.BodyText = this.selectedTemplate.BodyText.replace(regex, placeholder?.value);
			});
		}
		populateValues(item:any) {

		}
	




	 // Smart Replies Section // 

	getReplies() {
		var SP_ID=sessionStorage.getItem('SP_ID')
		this.apiService.getSmartReply(SP_ID).subscribe((data: any) => {
			this.isLoading = false;
			console.log(data,'replies data')
			this.replies = data;
		});
	}

	toggleSideBar() {
		this.showSideBar = !this.showSideBar
	}
	getRepliesByID(data:any) {
		this.isLoading = true;
		this.apiService.sideNav(data.ID).subscribe((response => {
			this.data = response;
			console.log(this.data)
			this.repliesData = <repliesList> {} ;
			this.repliesData.Channel = this.data[0].Channel;
			this.repliesData.Description = this.data[0].Description;
			this.repliesData.Title = this.data[0].Title;
			this.repliesData.ID = this.data[0].ID;
			this.repliesData.CreatedDate = this.data[0].CreatedDate;
			this.repliesData.ModifiedDate = this.data[0].ModifiedDate;
			this.repliesData.MatchingCriteria = this.data[0].MatchingCriteria; 
			this.repliesData.Keyword = [];
			this.repliesData.ActionList = [];
			this.repliesData.Media=this.data[0].Media;
			var keywordTemp = this.data[0].Keyword;
			for(let i=0;i<this.data.length;i++){
				if(!this.repliesData.Keyword.includes(this.data[i].Keyword)) 
					this.repliesData.Keyword.push(this.data[i].Keyword)

				   if(keywordTemp==this.data[i].Keyword) {
					this.repliesData.ActionList.push(
						{
							Message: this.data[i].Message,
							Name: this.data[i].Name, 
							Value: this.data[i].Value,
							Media: this.data[i].Media,
							buttons: JSON.parse(this.data[i].buttons),
						});
				   }
			}
			this.showSideBar = true;
			this.isLoading = false;
			console.log(this.repliesData.ActionList,'Action List')
			this.items = this.data[0]		
		}))

	}

	parseTags(tagsString: string): string[] {
		let tags;
		  tags = JSON.parse(tagsString);	
		return tags.join(', ');
	  }

	deleteRepliesById (data:any) {
		this.isLoading = true;
		let deleteId = {ID:data[0].ID};
		this.apiService.deletesmartReply(deleteId).subscribe((response) => {
			    this.getReplies();
				this.toggleSideBar();
			}
			
		)};

	editSmartReply(step:number) {
		console.log(this.repliesData);
		this.isEdit = true;
		this.showSideBar = false;
		this.showAddSmartRepliesModal();
		this.goToStep(step);
		this.newReply.get('Title')?.setValue(this.repliesData.Title)
		this.newReply.get('Description')?.setValue(this.repliesData.Description)
		this.newReply.get('Channel')?.setValue(this.repliesData.Channel)
		this.keywords = this.repliesData.Keyword
		this.model = this.repliesData.MatchingCriteria
		this.selectedcriteria = this.repliesData.MatchingCriteria

		for (let i=0;i<this.repliesData.ActionList.length;i++) {
			let ActionId:number = 0
			let Value = this.data[i].Value
			let uuid = this.data[i].uuid
			if(this.repliesData.ActionList[i].Name == ''){
				ActionId = 0
			}
			if (this.repliesData.ActionList[i].Name == 'Assign Conversation') {
				ActionId = 2
			}
			if (this.repliesData.ActionList[i].Name == 'Add Contact Tag') {
				ActionId = 1
				Value = JSON.parse(this.data[i].Value)
			}
			this.assignedAgentList.push(
				{	ActionID: ActionId,
					Message: this.data[i].Message,
					Value: Value,
					ValueUuid: uuid,
					Media: this.data[i].Media,
					MessageVariables: this.allVariables,
					media_type: this.data[i].media_type,					
					isTemplate:this.data[i]?.isTemplate,
					headerText: this.data[i]?.headerText,
					bodyText: this.data[i]?.bodyText,
					name: this.data[i]?.templateName,
					language: this.data[i]?.templatelanguage,
					buttons: this.data[i]?.buttons? JSON.parse(this.data[i]?.buttons) : this.data[i]?.templateButton,
					buttonsVariable: this.data[i]?.buttonsVariable
				});
		}
		console.log(this.assignedAgentList,'MESSAGE DATA')
	 }

	 updateSmartReplies(smartreplysuccess: any, smartreplyfailed: any) {
		this.isLoading = true;
	  const BodyData = {
			ID: this.repliesData.ID,
			Title: this.newReply.get('Title')?.value,
			Channel:this.newReply.get('Channel')?.value,
			Description: this.newReply.get('Description')?.value,
			MatchingCriteria: this.model,
			Keywords: this.keywords || [], 
			ReplyActions: this.assignedAgentList || [],
			Tags: this.assignedTagList || []
	     }
		 let isMessage:boolean = false
		 for (const action of BodyData.ReplyActions) {
			if (action.ActionID === 0) {
			  isMessage = true;
			  break;
			}
		  }

			console.log(BodyData);
			if (BodyData.Keywords.length > 0 && isMessage) {
			   this.apiService.updateSmartReply(BodyData)
			.subscribe(
			   (response: any) => {
				if (response.status == 200) {
					this.isLoading = false;
					//$("#smartrepliesModal").modal('hide'); 
					//this.modalService.open(smartreplysuccess);
					this.modalService.dismissAll(smartreplysuccess);
					this.location.replaceState(this.location.path());
				    this.reloadCurrentRoute();
					this.removeModalBackdrop();
					this.getReplies();
				   }
				},
				(error: any) => {
				if (error) {
					this.modalService.open(smartreplyfailed);
				  } 
				}
			);
			} else {
			this.showToaster("! Message cannot be empty","warn");
			}

		}

		selectChannel(channel:any){
			this.newReply.get('Channel')?.setValue(channel.label);
			console.log(channel.label)
			this.ShowChannelOption=false;
			this.allTemplates = this.allTemplates.filter((item:any) => item.Channel == channel.label);
			this.allTemplatesMain =JSON.parse(JSON.stringify(this.allTemplatesMain.filter((item:any) => item.Channel == channel.label)));
		}

  }
