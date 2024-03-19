import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { defaultMessagesData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { TeamboxService } from 'Frontend/dashboard/services';
import { ToolbarService, NodeSelection, LinkService, ImageService, EmojiPickerService,CountService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';

declare var $:any;
@Component({
  selector: 'sb-default-message-settings',
  templateUrl: './default-message-settings.component.html',
  styleUrls: ['./default-message-settings.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService,CountService]
})
export class DefaultMessageSettingsComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('chatEditor') chatEditor!: RichTextEditorComponent; 
  
  spId:number = 0;
  selectedType:string = 'text';
  selectedCategory:number = 0;
  selectedMessageData=<defaultMessagesData>{};
  value:any;
  isOverride = 0;
  fileName: any;
  Isdisable = 0;
  characterCount:number = 0;
  selectedTitle:string='';
  selectedDescription:string='';
  selectedPreview: string = '';
  defaultMessageForm!:FormGroup;
  showSideBar:boolean = false;
  defaultMessages:any[]=[];
  defaultMessageDataInit:any[]=[];
  defaultMessagesData:any[]=[];
  attributesList:any=[];
  attributesearch:string='';
  loadingVideo: boolean = false;

  errorMessage='';
	successMessage='';
	warningMessage='';

  public defaultMessageData = [
    {
    id:0,
    title:'Welcome Greeting',
    description:'A default welcome message will be sent to the customer in case a chat is initiated but no keyword is matched.'
    },
    {
      id:1,
      title:'No Agent Reply',
      description:'Configure a reply message to be sent during working hours if customer waits more than the defined minutes here.'
    },
    {
      id:2,
      title:'Out of Office',
      description:'When the customer messages out of business working hours, and no keyword is matched, customer will be sent a message as defined here.'
    },
    {
      id:3,
      title:'No Customer Reply Reminder',
      description:'Configure a reminder message if the chat is still open and it’s 23 hours since last message from the customer while a reply is awaited from him'
    },
    {
      id:4,
      title:'All Agents Offline',
      description:'Configure a different message to be sent when its business working hour and all the agents are offline'
    },
    {
      id:5,
      title:'No Customer Reply Timeout',
      description:'Configure a message to be sent to the customer if no reply is received for the defined minutes here before the chat is marked closed'
    }
  ];

  public tools: object = {
		items: [
			
			'Bold', 'Italic', 'StrikeThrough','EmojiPicker',
		{
			tooltipText: 'Attributes',
			undo: true,
			click: this.ToggleAttributesOption.bind(this),
			template: '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >'
					+ '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>'
		}
  ]};

  constructor(private apiService:SettingsService,private _teamboxService:TeamboxService,private fb: FormBuilder) { }
  prepareUserForm(){
    return this.fb.group ({
      value: ['',Validators.maxLength(1024)],
      link: [''],
      override: [0],
      autoreply: ['']
    });
  }
  ngOnInit(): void {
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.defaultMessageForm =this.prepareUserForm();
    this.value = this.defaultMessageForm.get('value')?.value;
    // console.log(this.selectedMessageData)
    this.getAttributeList();
    this.getDefaultMessages();
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
		}, 3000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.errorMessage='';
		this.warningMessage='';
	}

  // onEditorChange(value: any) {
  //   this.defaultMessageForm.get('value')?.setValue(value);
  // }

	// closeAllModal(){
	// 	$('body').removeClass('modal-open');
	// 	$('.modal-backdrop').remove();
	// }	

  closeAtrrModal() {
    this.attributesearch ='';
    $("#welcomGreeting").modal('show');
    $("#atrributemodal").modal('hide');
  }

ToggleAttributesOption(){
	// this.closeAllModal()
	$("#welcomGreeting").modal('hide');
  $("#atrributemodal").modal('show');
}

selectAttributes(item:any){
  this.closeAtrrModal();
  const selectedValue = item;
  let content:any = this.chatEditor.value || '';
  content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
  content = content+ '<span style="color:#000">{{'+selectedValue+'}}</span>'
  this.chatEditor.value = content;
}



getAttributeList() {
  this._teamboxService.getAttributeList(this.spId)
  .subscribe((response:any) =>{
  if(response){
  let attributeListData = response?.result;
  this.attributesList = attributeListData.map((attrList:any) => attrList.displayName);
   }
 });
}

showMessageType(type: string) {   
  this.selectedType = type;
  if (this.selectedType === 'text') {
    this.defaultMessageForm.get('value')?.setValidators([Validators.required]);
    this.defaultMessageForm.get('link')?.clearValidators();
  }
  else if (this.selectedType === 'video' || this.selectedType === 'document' || this.selectedType === 'image') {
    this.defaultMessageForm.get('link')?.setValidators([Validators.required]);
    this.defaultMessageForm.get('value')?.clearValidators();
  }
  else {
    this.defaultMessageForm.get('link')?.clearValidators();
    this.defaultMessageForm.get('value')?.clearValidators();
  }
  this.defaultMessageForm.get('link')?.updateValueAndValidity();
  this.defaultMessageForm.get('value')?.updateValueAndValidity();


  // validator for autoreply timeout //
  if(this.selectedCategory === 1) {
    this.defaultMessageForm.get('autoreply')?.setValidators([Validators.required,Validators.pattern('^(?:[1-9]|[1-9][0-9]|1[01][0-9]|120)$')]);
  }

  else if (this.selectedCategory === 5) {
    this.defaultMessageForm.get('autoreply')?.setValidators([Validators.required,Validators.pattern('^(?:[1-9]|[1-9][0-9]{0,2}|1[0-3][0-9]{2}|1440)$')]);
  }
  else {
    this.defaultMessageForm.get('autoreply')?.clearValidators();
    this.defaultMessageForm.get('autoreply')?.updateValueAndValidity();
  }
}

  
  selectedButtonType(type: number) {
    this.selectedCategory = type;
  }

  uploadMessageMedia(files: FileList) {
    if (files[0]) {
        let File = files[0];
        this.fileName = this.truncateFileName(File.name, 25);
        let spid = this.spId
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
          let name='defaultmessages'
          this.loadingVideo = true;
          this._teamboxService.uploadfile(data,spid,name).subscribe(uploadStatus => {
              let responseData: any = uploadStatus;
              if (responseData.filename) {
                  this.selectedPreview = responseData.filename.toString();
                  this.defaultMessageForm.get('link')?.setValue(this.selectedPreview);
                  // console.log(this.selectedPreview);
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

uploadThroughLink() {
  let value = this.defaultMessageForm.get('link')?.value;
  this.selectedPreview = value;
}

onFileChange(event: any) {
    let files: FileList = event.target.files;
    this.uploadMessageMedia(files);
}

truncateFileName(fileName: string, maxLength: number): string {
  if (fileName.length > maxLength) {
    return fileName.substring(0, maxLength) + '...';
  }
  return fileName;
}

removeMedia() {
  this.selectedPreview = '';
  this.fileName='';
  this.defaultMessageForm.get('link')?.setValue(null);
}

  // remove values //
  removeValue() {
    this.showSideBar=false;
    this.selectedPreview = '';
    this.fileName='';
    this.value = null;
    this.selectedType='text';
    this.selectedMessageData=<defaultMessagesData>{};
    this.defaultMessageForm.clearAsyncValidators();
    // this.defaultMessageForm.clearValidators();
    this.defaultMessageForm.reset();
}

  getDefaultMessages() {
    this.apiService.getDefaultMessages(this.spId).subscribe(response => {
        this.defaultMessages = response.defaultaction
        // console.log(response.defaultaction);
        
        // combine data coming from api into defaultMessageData array //
        this.defaultMessageDataInit = this.defaultMessageData.map(defaultMessage => {
          const matchedData = this.defaultMessages.find(Item => Item.title === defaultMessage.title);
          if (matchedData) {
            return { ...defaultMessage, ...matchedData };
          } else {
            return defaultMessage;
          }
        });
        // console.log(this.defaultMessageDataInit);
    })
  }

  addEditDefaultMessageData() {
    var tempDivElement = document.createElement("div");   

	   tempDivElement.innerHTML = this.chatEditor.value;
     let val = tempDivElement.textContent || tempDivElement.innerText || "";

     if(val.trim()=='' && this.selectedType==='text') {
      this.defaultMessageForm.invalid;
      return;
     }

     else {
      if (this.defaultMessageForm.valid) {
        const defaultMessagesData = this.copyDefaultMesssageData();
        this.apiService.addEditDefaultMessages(defaultMessagesData).subscribe
        (response => {
          if(response.status === 200) {
            this.defaultMessageForm.reset();
            this.getDefaultMessages();
            this.removeValue();
            $("#welcomGreeting").modal('hide');
            this.showSideBar = false;
          }
      },
         (error) => {
          if(error.status === 413) {
            this.showToaster('Media file size is too large, Maximum of 10mb size is allowed!','error')
          }
      });
      }
     }

  }

  editDefaultMessages() { 
    $("#welcomGreeting").modal('show');
    this.selectedType = this.selectedMessageData.message_type;
    this.selectedTitle = this.selectedMessageData.title;
    this.selectedDescription = this.selectedMessageData.description;
    this.selectedPreview = this.selectedMessageData.link;
    this.defaultMessageForm.clearAsyncValidators();
  }

  isShowSideBar(data:any,type: number) {
      this.showSideBar = true;
      this.selectedMessageData = data;
      this.selectedCategory = type;
      this.patchFormValue();
      console.log(data);
  }

  populateData(data:any) {
    this.defaultMessagesData = data;
    this.selectedTitle = data.title;
    this.selectedDescription = data.description;
  }

  copyDefaultMesssageData() {
    const defaultMessagesData:defaultMessagesData = <defaultMessagesData>{};

    defaultMessagesData.spid = this.spId;
    if (this.selectedMessageData.uid!=null) {
      defaultMessagesData.uid = this.selectedMessageData.uid;
    }
    else {
      defaultMessagesData.uid = 0;
    }
    defaultMessagesData.title = this.selectedTitle;
    defaultMessagesData.description = this.selectedDescription;
    defaultMessagesData.message_type = this.selectedType;
    defaultMessagesData.value = this.defaultMessageForm.controls.value.value;
    defaultMessagesData.link = this.selectedPreview;
    defaultMessagesData.override = this.defaultMessageForm.controls.override.value;
    defaultMessagesData.autoreply = this.defaultMessageForm.controls.autoreply.value;
    defaultMessagesData.Is_disable = this.Isdisable;
    // console.log(defaultMessagesData);
    return defaultMessagesData;
  }

  patchFormValue(){
    const data = this.selectedMessageData;
    for(let prop in data){
      let value = data[prop as keyof typeof data];
      if(this.defaultMessageForm.get(prop))
      this.defaultMessageForm.get(prop)?.setValue(value)
    }  
  }

  toggleDeletePopup() {
    $("#deleteModal").modal('show');
  }
  
  deleteDefaultMessage() {
    const deleteBody = {
      spid: this.spId,
      uid: this.selectedMessageData.uid
    }
    this.apiService.deleteDefaultMessage(deleteBody).subscribe(response => {
      try {
        if(response) {
          $("#deleteModal").modal('hide');
          this.showSideBar =false;
          this.removeValue();
          this.getDefaultMessages();
        }
      } catch (error) {
        console.error('An error occurred while deleting the message.',error)
      }
    
    });
  }


  enableDisable(event:any) {
	  this.Isdisable = event.target.checked;
    let isDisable = this.Isdisable ? 1 : 0;
    const body = {
      uid: this.selectedMessageData.uid,
      Is_disable: isDisable
    }
    this.apiService.enableDisableDefaultMessage(body).subscribe(response=>{
      if(response) {
        this.getDefaultMessages();
      }
    });
	}

  IsOverride(event:any) {
    this.isOverride = event.target.checked;
    let override = this.isOverride ? 1 : 0;
    this.defaultMessageForm.patchValue({ override: override });
}

}
