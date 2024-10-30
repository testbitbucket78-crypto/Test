import { Component, OnInit, ViewChild } from '@angular/core';
import {SettingsService} from 'Frontend/dashboard/services/settings.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import{ repliestemplateList } from 'Frontend/dashboard/models/settings.model';
import{ templateList } from 'Frontend/dashboard/models/settings.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TeamboxService } from 'Frontend/dashboard/services/teambox.service';
import { ToolbarService, NodeSelection, LinkService, ImageService, EmojiPickerService, CountService} from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
declare var $:any;

@Component({
  selector: 'sb-quick-response',
  templateUrl: './quick-response.component.html',
  styleUrls: ['./quick-response.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService,CountService]
})
export class QuickResponseComponent implements OnInit {

  showCampaignDetail:boolean=false;
  created_By:any;
  modalReference:any;
  spid!:number;
  getTemplate:any;
  searchText:string='';

  ID:number=0;
  data: any;
  repliestemplateData!:repliestemplateList;
  templatesquickdata!:templateList;
  usertemplateForm!:FormGroup;
  items: any;
  templates!:any[];
  initTemplates!:any[];
  messagemedia:any;
  selectedType: string = 'text';
  numberCount: number = 0;
  rolesList:any;

  Links:any;
  TemplateName:any;
  BodyText:any;
  Channel:any;
  result:any;
  Header:any;
  isTemplate:any;

  ischannel='';
  isWhatsappWeb:boolean = false;
  isWhatsappOfficial:boolean = false;
  errorMessage = '';
	successMessage = '';
	warnMessage = '';
  attributesearch:string='';
  attributesList:any=[];
  profilePicture!: string;
  channelOption: any = [];
  ShowChannelOption! : boolean;
  isLoading!:boolean;
  fileName: any; 
  selectedPreview: string = '';
  loadingVideo:boolean = false;
  @ViewChild('chatEditor') chatEditor?: RichTextEditorComponent | any;

  public tools: object = {
      items: [
          'Bold',
          'Italic',
          'StrikeThrough',
          'EmojiPicker',
          {
              tooltipText: 'Attributes',
              undo: true,
              click: this.ToggleAttributesOption.bind(this),
              template:
                  '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >' +
                  '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>',
          },
      ],
  };

  public pasteCleanupSettings: object = {
    prompt: false,
    plainText: true,
    keepFormat: false,
};
  lastCursorPosition: Range | null = null;
  
  constructor(config: NgbModalConfig,private modalService: NgbModal,public apiService:SettingsService,public settingsService:SettingsService, private _teamboxService: TeamboxService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.created_By = (JSON.parse(sessionStorage.getItem('loginDetails')!))?.name;
    this.profilePicture = JSON.parse(sessionStorage.getItem('loginDetails')!)?.profile_img;
    this.Template();
    this.usertemplateForm=this.prepareUserForm();
    this.getformvalue();
    this.getAttributeList();
    this.getWhatsAppDetails();
  }
  
  getWhatsAppDetails() {
		this.apiService.getWhatsAppDetails(this.spid)
		.subscribe((response:any) =>{
		 if(response){
			 if (response && response.whatsAppDetails) {
				this.channelOption = response.whatsAppDetails.map((item : any)=> ({
				  value: item?.id,
				  label: item?.channel_id,
				  connected_id: item?.connected_id,
          channel_status: item?.channel_status
				}));
			  }
		 }
	   })
	 }
     stopPropagation(event: Event) {
        event.stopPropagation();
      }
      selectChannel(channel:any){
      this.usertemplateForm.get('channel_id')?.setValue(channel?.value);
      this.usertemplateForm.get('Channel')?.setValue(channel?.label);
      this.ShowChannelOption=false
	  }

  	toggleCampaign(){
		this.showCampaignDetail =!this.showCampaignDetail 
		}

    filterChannels(filterchannels: any) {
      if (this.modalReference) {
          this.modalReference.close();
      }
      this.modalReference = this.modalService.open(filterchannels, {
          size: 'sm',
          windowClass: 'white-pink',
          backdrop: 'static',
          keyboard: false,
      });
  }

  prepareUserForm(){
    return new FormGroup({
      Links:new FormControl(),
      TemplateName:new FormControl(),
      Header:new FormControl('',[
        Validators.required,
        Validators.pattern(/^[a-zA-Z.-]+(?:\s+[a-zA-Z.-]+)*$/),
        Validators.minLength(2),
      ]),
      BodyText:new FormControl(),
      Channel:new FormControl('',[Validators.required]),
    });
  }
  

closeAtrrModal() {
  this.attributesearch ='';
  $('#atrributemodal').modal('hide');
  $('#welcomGreeting').modal('show');
}

ToggleAttributesOption(){
const selection = window.getSelection();
this.lastCursorPosition = selection?.getRangeAt(0) || null;
$('#atrributemodal').modal('show');
//$('#welcomGreeting').modal('hide');
}

  selectAttributes(item:any){
  this.closeAtrrModal();
  const selectedValue = item;
  let content:any = this.chatEditor.value || '';

  const container = document.createElement('div');
  container.innerHTML = this.chatEditor?.value;
  const text = container.innerText;
  const attLenght = selectedValue.length;
  if((text.length + attLenght +4) > 1024 ){
    this.showToaster("text length should not exceed 1024 limit!", 'error');
  }else{
  this.insertAtCursor(selectedValue);
  }

  }


  insertAtCursor(selectedValue: any) {
    const spaceNode = document.createElement('span');
    spaceNode.innerHTML = '&nbsp;'; 
    spaceNode.setAttribute('contenteditable', 'true');
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



  getAttributeList() {
    let spId = this.spid
  this._teamboxService.getAttributeList(spId)
  .subscribe((response:any) =>{
  if(response){
  let attributeListData = response?.result;
  this.attributesList = attributeListData.map((attrList:any) => attrList?.displayName);
  }
  });
  }

onEditorChange(value: string | null): void {
    this.usertemplateForm.get('BodyText')?.setValue(value);
}


filterQuickRes(){
  if(this.isWhatsappWeb && this.isWhatsappOfficial)
    this.templates = this.initTemplates
  else if(!this.isWhatsappWeb && this.isWhatsappOfficial)
    this.templates = this.initTemplates.filter(item=> item?.Channel == 'WA API')
  else if(this.isWhatsappWeb && !this.isWhatsappOfficial)
    this.templates = this.initTemplates.filter(item=> item?.Channel == 'WA Web')
  else
    this.templates = this.initTemplates;

}


  Template(){
    this.apiService.getTemplateData(this.spid,0).subscribe(response => {
      this.isLoading = false;
      this.templates=response?.templates;
      this.initTemplates=response?.templates;
    });    
  }
  
  getRolesList(){
    this.apiService.getTemplateData(this.spid,0).subscribe(response =>{
      if(response){
       this.rolesList = response?.getRoles;
        
      }
  
    })
  }


  saveTemplate(){
    let val = this.usertemplateForm.controls.Header.value;
    let temp = this.templates.filter(item => item?.Header == val)[0];
    if(temp && this.ID != temp?.ID)
    this.showToaster('Quick response already exist with this name !','error');
    else{
    if(this.usertemplateForm.valid){
    let userData=this.saveformmtemplate();
    this.apiService.addTemplate(userData).subscribe(response=>{
      if(response){
        this.Template();          
      $("#welcomGreeting").modal('hide');          
      $("#deleteModal").modal('hide');          
      this.showCampaignDetail = false;          
      }
    });
  }else{
    this.usertemplateForm.markAllAsTouched();
  }
}
  }



  saveformmtemplate(){
    let userData:templateList =<templateList>{};
    userData.isTemplate=0;
    userData.spid=this.spid;
    userData.ID=this.ID;
    userData.created_By=this.created_By;
    userData.Links=this.usertemplateForm.controls.Links.value;
    userData.Links = this.selectedPreview;
    userData.TemplateName=this.usertemplateForm.controls.TemplateName.value;
    userData.Channel=this.usertemplateForm.controls.Channel.value;
    userData.Header=this.usertemplateForm.controls.Header.value;
    userData.BodyText=this.usertemplateForm.controls.BodyText.value;
    userData.media_type = this.selectedType;
    return userData;

  };


 getformvalue(){
  const data=this.usertemplateForm;
  for(let prop in data){
    let value=data[prop as keyof typeof data]
    if(this.usertemplateForm.get(prop))
    this.usertemplateForm.get(prop)?.setValue(value)
  }
 }


  gettemplateByID(data:any) {
    this.repliestemplateData=data;
    const a= this.repliestemplateData.Links;
    this.messagemedia=a;
}


deleteTemplate(){
  const TemplateID = {
    ID: this.repliestemplateData?.ID
  }
  this.apiService.deleteTemplateData(TemplateID)  
  .subscribe(result =>{
    if(result){
      $("#deleteModal").modal('hide');
      this.showCampaignDetail = false;
      this.Template(); 
    }
  });
}

copyCampaign() {
  this.editQuickResponse();
  this.ID = 0;
  this.usertemplateForm.controls.Header.setValue('Copied ' + this.repliestemplateData.Header);
  let nameExist = this.initTemplates.filter((item:any)=>item.TemplateName == ('Copied ' + this.repliestemplateData.Header));
        if(nameExist.length >0){
          this.usertemplateForm.controls.Header.setValue((`Copied_${Math.random()} ` + this.repliestemplateData.Header));
        }
  this.saveTemplate();
}

newQuickResponse(){
  this.usertemplateForm = this.prepareUserForm();
  this.ID = 0;
}

showMessageType(type: string) {
  this.selectedType = type;
  this.usertemplateForm.get('Links')?.setValue(null);
  this.selectedPreview = '';
}  

removeValue() {
  this.selectedPreview = '';
  this.fileName='';
  this.usertemplateForm.get('Links')?.setValue(null);
}


onFileChange(event: any) {
  let files: FileList = event?.target?.files;
  this.saveVideoAndDocument(files);
}

 
saveVideoAndDocument(files: FileList) {
  if (files[0]) {
      let File = files[0];
      this.fileName = this.truncateFileName(File.name, 25);
      let spid = this.spid
      let mediaType = files[0].type;
      let fileSize = files[0].size;

      const fileSizeInMB: number = parseFloat((fileSize / (1024 * 1024)).toFixed(2));
			const imageSizeInMB: number = parseFloat((5 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
			const docVideoSizeInMB: number = parseFloat((10 * 1024 * 1024 / (1024 * 1024)).toFixed(2));

      const data = new FormData();
      data.append('dataFile', File, File.name);
      data.append('mediaType', mediaType);

      if((mediaType == 'video/mp4' || mediaType == 'application/pdf') && fileSizeInMB > docVideoSizeInMB) {
				this.showToaster('Video / Document File size exceeds 10MB limit','error');
			}

			else if ((mediaType == 'image/jpg' || mediaType == 'image/jpeg' || mediaType == 'image/png' || mediaType == 'image/webp') && fileSizeInMB > imageSizeInMB) {
				this.showToaster('Image File size exceeds 5MB limit','error');
			}

      else {
        this.loadingVideo = true;
        let name='template-message'
        this._teamboxService.uploadfile(data,spid,name).subscribe(uploadStatus => {
            let responseData: any = uploadStatus;
            if (responseData.filename) {
                this.selectedPreview = responseData.filename.toString();
            }
            this.loadingVideo = false;
        },
        (error) => {
          this.loadingVideo = false;
          this.showToaster("Video File Size is Too Large, Max 10MB size is Allowed!", 'error');
   });
      }

   
  }
}

truncateFileName(fileName: string, maxLength: number): string {
  if (fileName.length > maxLength) {
    return fileName.substring(0, maxLength) + '...';
  }
  return fileName;
}

editQuickResponse(){
 this.ID = this.repliestemplateData.ID;
 this.usertemplateForm.controls.Links.setValue(this.repliestemplateData.Links);
 this.usertemplateForm.controls.TemplateName.setValue(this.repliestemplateData.TemplateName);
 this.usertemplateForm.controls.Channel.setValue(this.repliestemplateData.Channel);
 this.usertemplateForm.controls.Header.setValue(this.repliestemplateData.Header);
 this.usertemplateForm.controls.BodyText.setValue(this.repliestemplateData.BodyText);
 this.BodyText = this.repliestemplateData.BodyText;
 this.selectedPreview = this.repliestemplateData.Links;
 this.selectedType = this.repliestemplateData?.media_type;
}

getCharacterCount(val:string) {
 this.numberCount = val.length;
}

checkQuickResponseName(e:any){
let val = e.target.value;
let temp = this.templates.filter(item => item?.Header == val)[0];
if(temp && this.ID != temp.ID)
this.showToaster('Quick response already exist with this name !','error');

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

    
onContentChange() {
  //const text = this.chatEditor?.value;
  const container = document.createElement('div');
  container.innerHTML = this.chatEditor?.value;
  const text = container.innerText;
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g; 
  const characterCount = text?.replace(emojiRegex, '__').length || 0; 
  if (characterCount > 1024) {
    const trimmedContent = this.trimContent(text, characterCount);
    this.chatEditor.value = trimmedContent;
  } 
}

trimContent(text: string, characterCount: number): string {
  const emojisToAdd = 1; 
  const extraCharacters = characterCount - 1024 + emojisToAdd;
  let trimmedText = text.substr(0, text.length - extraCharacters);
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/;
  if (emojiRegex.test(trimmedText)) {
    trimmedText = trimmedText.slice(0, -2);
  }
  return trimmedText;
}

}