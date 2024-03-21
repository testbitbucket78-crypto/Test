import { Component, OnInit,ViewChild,ElementRef, Input, Output, EventEmitter,AfterViewInit  } from '@angular/core';
import { FormGroup,FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import Stepper from 'bs-stepper';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { TeamboxService } from './../../services';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { agentMessageList } from 'Frontend/dashboard/models/smartReplies.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ToolbarService, NodeSelection, LinkService, ImageService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService,EmojiPickerService } from '@syncfusion/ej2-angular-richtexteditor';
import { isNullOrUndefined } from 'is-what';


declare var $: any;

@Component({
	selector: 'sb-addSmartReplies',
	templateUrl: './addSmartReplies.component.html',
	styleUrls: ['./addSmartReplies.component.scss'],
	providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService],
})
export class AddSmartRepliesComponent implements OnInit, AfterViewInit {


	// ******* Router Guard  *********//
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

	@Input() isEdit: boolean = false;
	@Input() smartReplyData: any;
	@Output() getReplies = new EventEmitter<string> (); 
	AgentName = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name


	active = 1;
	stepper: any;
	contactowner = 0;
	data: any;
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
	dragAreaClass: string='';
	selectedChannel:any='WhatsApp Offical';
	contactList:any = [];
	contactSearchKey:any='';
	QuickReplyList:any=[];
	QuickReplyListMain:any=[];
	filterTemplateOption:any='';
	selectedTemplate:any  = [];
	Media:any;
	MatchingCriteria:any;
	matchingCriteria:any;
	selectedcriteria:any;
	templateStates: { [key: string]: boolean } = {};

	templateChecked: boolean = false;

	isFilterTemplate:any = {
		Marketing: true,
		Utility: true,
		Authentication: true
	  };

	showInfoIcon:boolean = false;

    /**richtexteditor **/ 
	showQuickResponse: any = false;
	showAttributes: any = false;
	showQuickReply: any = false;
	showInsertTemplate: any = true;
	showAttachmenOption: any = false;
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
	variableValues:string[]=[];


	attributesList!:any;
	userList:any;
	userId!:number;

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

	isSendButtonDisabled=false
    click: any;
	selecetdpdf: any='';

	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService, private fb: FormBuilder, private router:Router, private tS :TeamboxService,private settingsService:SettingsService,private elementRef: ElementRef,private location:Location) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = true;
	}


	selectTemplate(template:any){
		this.templateChecked = true;
		this.selectedTemplate =template
	}
	ngOnInit() {

		this.SPID = Number(sessionStorage.getItem('SP_ID'));

		this.stepper = new Stepper($('.bs-stepper')[0], {
			linear: true
			,
			animation: true
		});

		this.newMessage = this.fb.group({
			message_text: ''
		});

	     this.getUserList();
		 this.getTagData()
		 this.getAttributeList();
		 this.getTemplatesList()
		 this.routerGuard();
		 this.getQuickResponse();

	}

	ngAfterViewInit() {
		if (this.chatSection) {
		  this.scrollChatToBottom();
		}
	  }

	scrollChatToBottom() {
		const chatWindowElement: HTMLElement = this.chatSection.nativeElement;
        chatWindowElement.scrollTop = chatWindowElement.scrollHeight;
	    const toolbar = chatWindowElement.querySelector('.e-toolbar');
	
	  }

/*** rich text editor ***/

	closeAllModal() {
		// this.showAttachmenOption = false
		// this.messageMeidaPopup = false
		this.getTemplatesList()
		this.templateChecked = false;
		this.showAttributes = false
		this.showInsertTemplate = false
		this.editTemplate = false
		this.TemplatePreview = false
		this.showQuickReply = false
		this.showMention = false
		this.ShowAddAction = false;
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
	}

	editMedia(){
		$("#editTemplate").modal('hide');
		$("#templatePreview").modal('hide');  
		$("#editTemplateMedia").modal('show'); 
	}

	showTemplatePreview() {
		console.log(this.variableValues,'VARIBALE VALUES');
		if(this.variableValues.length!==0 && this.allVariablesList.length!==0) {
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

	closeEditMedia() {
		$("#editTemplate").modal('show'); 
		$("#editTemplateMedia").modal('hide'); 
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
		if(this.messageMeidaFile!==''){
			$("#sendfile").modal('show');
			$("#attachmentbox").modal('hide');
				
		}else{
			this.showToaster('! Error Uploading Media Please Try Again','error');
			// this.closeAllModal();
		}	
	}

	cancelEditTemplateMedia(){
		$("#editTemplate").modal('show'); 
		$("#editTemplateMedia").modal('hide'); 
	}

	updateEditTemplateMedia(){
		$("#editTemplate").modal('show'); 
		$("#editTemplateMedia").modal('hide'); 
	}

	saveFiles(files: FileList) {
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
					this.mediaType = mediaType; // Set mediaType here
					this.showAttachmenOption = false;
					console.log('Media Type:', this.mediaType);
					console.log('Message Media File:', this.messageMeidaFile);
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
	  
	sendMediaMessage(){
		// this.saveMessage();
		// this.Media=this.messageMeidaFile;
		this.closeAllModal()
		console.log(this.mediaType)
		console.log(this.messageMeidaFile)
		let mediaContent:any;
		if(this.mediaType == 'image/jpeg' || this.mediaType == 'image/jpg' || this.mediaType == 'image/png' || this.mediaType == 'image/webp') {
			mediaContent ='<p><img style="width:50%; height:50%" src="'+this.messageMeidaFile+'"></p>'
		  }
		  else if(this.mediaType == 'video/mp4') {
			  mediaContent ='<p><video style="width:50%; height:50%" src="'+this.messageMeidaFile+'"></video></p>'
		  }
		  else if(this.mediaType == 'application/pdf') {
			  mediaContent ='<p><a href="'+this.messageMeidaFile+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
		  }

		  else if (this.mediaType == 'text/plain') {
			mediaContent = ''
		  }

		this.chatEditor.value = mediaContent;
	}

	
	
	ToggleAttributesOption() {
		this.closeAllModal()
		$("#showAttributes").modal('show');
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
	}

	showeditTemplate(){
	if(this.selectedTemplate.length!==0 ) {
		$("#editTemplate").modal('show'); 
		$("#insertTemplate").modal('hide'); 
		this.previewTemplate();
	}
	else {
		this.showToaster('! Please Select Any Template To Proceed','error');
	}

}

	selectAttributes(item:any) {
		this.closeAllModal();
		const selectedValue = item;
		let content:any = this.chatEditor.value || '';
		content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
		content = content+'<span style="color:#000">{{'+selectedValue+'}}</span>'
		this.chatEditor.value = content;
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
		else if(item.media_type === 'document') {
			mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
		}
		else {
			mediaContent=''
		}
		var htmlcontent = mediaContent +'<p><span style="color: #6149CD;"><b>'+item.Header+'</b></span><br>'+item.BodyText+'<br>'+item.FooterText+'<br></p>';
		this.chatEditor.value = htmlcontent
	
	}

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
	  
	insertTemplateInChat(item:any){
		// $("#templatePreview").modal('hide');
		this.closeAllModal();
		let mediaContent
		if(item.media_type === 'image') {
		  mediaContent ='<p><img style="width:50%; height:50%" src="'+item.Links+'"></p>'
		}
		else if(item.media_type === 'video') {
			mediaContent ='<p><video style="width:50%; height:50%" src="'+item.Links+'"></video></p>'
		}
		else if(item.media_type === 'document') {
			mediaContent ='<p><a href="'+item.Links+'"><img src="../../../../assets/img/settings/doc.svg" /></a></p>'
		}
		else {
			mediaContent=''
		}
		var htmlcontent = mediaContent +'<p><span style="color: #6149CD;"><b>'+item.Header+'</b></span><br>'+item.BodyText+'<br>'+item.FooterText+'<br></p>';
		this.chatEditor.value =htmlcontent
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

	addMessage() {
		// var tempDivElement = document.createElement("div");   
		// tempDivElement.innerHTML = this.chatEditor.value;
		// let val = tempDivElement.textContent || tempDivElement.innerText || "";

		if (!this.chatEditor.value) {
			this.showToaster('! Please type your message first','error');
			return;
		}

		this.assignedAgentList.push({
			ActionID: 0, 
			Message: this.chatEditor.value, 
			Value: this.chatEditor.value, 
			Media: JSON.stringify(this.messageMeidaFile)
		})

		console.log(this.assignedAgentList,'ADDED MESSAGE DATA')

			this.chatEditor.value = '';

			setTimeout(() => {
				this.scrollChatToBottom();
				this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
				this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
			}, 100);
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
		this.isEditable[index] = !this.isEditable[index];
		this.editableMessageIndex = this.isEditable[index] ? index : null;
	    const element = document.getElementById(`msgbox-body${index}`);
		setTimeout(() => { 
		
		  if (element) {
			element.focus();
			let currentValue = element.innerHTML + element.innerText
			this.chatEditor.value = currentValue;
			console.log(element);
		  }

		

		}, 100);
		
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
			this.assignedAgentList.push({Message:'', ActionID:2, Value: this.agentsList[index].name,Media:''})
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
			this.assignedTagList.push(this.addTagList[index].TagName);
			this.assignedAgentList.push({ Message: '',ActionID: 1, Value: this.assignedTagList,Media:''});
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
		const title:any = this.newReply.value.Title;
		const description:any = this.newReply.value.Description;

		if (title !== '' && description !== '') {
			sessionStorage.setItem('Title', title);
			sessionStorage.setItem('Description', description);
			this.next();
		} else {
			this.showToaster("! Title & Description Cannot be empty","error");
		}
	}

	onSelectionChange(entry: any): void {
		this.model = entry;
		console.log(this.model)


		sessionStorage.setItem('MatchingCriteria',this.model)
		this.selectedcriteria=this.model;
		console.log(this.model);
	}

	closeAddActionDialog() {
		// Close the dialog when clicking outside
		this.ShowAddAction = false;
	  }
	
	

	sendNewSmartReply(smartreplysuccess: any, smartreplyfailed: any) {
		var data = {
		  SP_ID: sessionStorage.getItem('SP_ID'),
		  Title: this.newReply.value.Title,
		  Description: this.newReply.value.Description,
		  MatchingCriteria: this.model,
		  Keywords: this.keywords || [], 
		  ReplyActions: this.assignedAgentList || [],
		  Tags: this.assignedTagList || []
		};
	  
		console.log(data);
	  
		if (data.Keywords.length > 0 && data.ReplyActions.length > 0 && isNullOrUndefined(this.chatEditor.value)) {
		  this.apiService.addNewReply(data).subscribe(
			(response: any) => {
			  console.log(response);
			  if (response.status === 200) {
				$("#smartrepliesModal").modal('hide'); 
				this.modalService.open(smartreplysuccess);
				this.getReplies.emit('');
				this.newReply.reset();
				this.newReply1.reset();
				this.newMessage.reset();
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

	  smartReplySuccess() {
		this.location.replaceState(this.location.path());
		window.location.reload();
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
		this.settingsService.getUserList(this.SPID)
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
					profileImg: this.userList[i].profile_img
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
		this.allTemplatesMain = allTemplates.templates
		console.log(this.allTemplatesMain)
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
				let isVariableValue:string = this.selectedTemplate.BodyText + this.selectedTemplate.Header;
				if (isVariableValue) {
				  this.allVariablesList = this.getVariables(isVariableValue, "{{", "}}");
			  }
			}

		replaceVariableInTemplate() {
			this.allVariablesList.forEach((placeholder, index) => {
				const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
				this.selectedTemplate.Header = this.selectedTemplate.Header.replace(regex, this.variableValues[index]);
				this.selectedTemplate.BodyText = this.selectedTemplate.BodyText.replace(regex, this.variableValues[index]);
			});
		}
	
		populateValues(item:any) {

		}

}