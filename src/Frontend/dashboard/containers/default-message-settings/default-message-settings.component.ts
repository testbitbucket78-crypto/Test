import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { defaultMessagesData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { TeamboxService } from 'Frontend/dashboard/services';
import { ToolbarService, LinkService, ImageService, EmojiPickerService,CountService } from '@syncfusion/ej2-angular-richtexteditor';
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
  @ViewChild('chatEditor') chatEditor!: RichTextEditorComponent
  
  spId:number = 0;
  selectedType: string = 'text';
  selectedCategory!: number;
  selectedMessage: any;
  value:any;
  fileName: any; 
  characterCount: number = 0;
  selectedTitle:string='';
  selectedDescription:string='';
  selectedPreview: string = '';
  defaultMessageForm!:FormGroup;
  showSideBar:boolean=false;
  defaultMessages:any [] =[];
  defaultMessagesData: any;
  attributesList:any=[];
  attributesearch!:string;

  defaultMessageData = [
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

  constructor(private apiService:SettingsService,private _teamboxService:TeamboxService) { }
  prepareUserForm(){
    return new FormGroup({
      value:new FormControl(null),
      link:new FormControl(null),
      override:new FormControl(null),
      autoreply:new FormControl(null),
    });
  }
  ngOnInit(): void {
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.defaultMessageForm =this.prepareUserForm();
    this.value = this.defaultMessageForm.get('value')?.value;
    this.getAttributeList();
    this.getDefaultMessages();

  }

  onEditorChange(value: any) {
    this.defaultMessageForm.get('value')?.setValue(value);
  }

	closeAllModal(){
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();
	}	

  closeAtrrModal() {
    $("#welcomGreeting").modal('show');
    $("#atrributemodal").modal('hide');
  }

ToggleAttributesOption(){
	this.closeAllModal()
	$("#welcomGreeting").modal('hide');
  $("#atrributemodal").modal('show');
}

ToggleSideBar() {
  this.showSideBar = !this.showSideBar;
}

selectAttributes(item:any){
  const selectedValue = item;
  this.closeAllModal();
  let htmlcontent = '';
  const selectedAttr = `${htmlcontent} {{${selectedValue}}}`;
  this.onEditorChange(selectedAttr)
}

getAttributeList() {
  this._teamboxService.getAttributeList(this.spId)
  .subscribe((response:any) =>{
  if(response){
  let attributeListData = response?.result;
  this.attributesList = attributeListData.map((attrList:any) => attrList.displayName);
}
})
}
  showMessageType(type: string) {
    this.selectedType = type;
  }
  
  selectedButtonType(type: number) {
    this.selectedCategory = type;
  }

  previewImageAndVideo(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
        const file = inputElement.files[0];
        const reader = new FileReader();

        reader.onload = (e: any) => {
            const fileType = file.type;
            if (fileType.startsWith('image')) {
                this.selectedPreview = e.target.result as string;
            }
            console.log(this.selectedPreview);
        };
        reader.readAsDataURL(file);
    }
}

  saveVideoAndDocument(files: FileList) {
    if (files[0]) {
        let File = files[0];
        this.fileName = this.truncateFileName(File.name, 25);
        let spid = this.spId
        let mediaType = files[0].type;
        const data = new FormData();
        data.append('dataFile', File, File.name);
        data.append('mediaType', mediaType);
        this._teamboxService.uploadfile(data,spid).subscribe(uploadStatus => {
            let responseData: any = uploadStatus;
            if (responseData.filename) {
                this.selectedPreview = responseData.filename.toString();
                console.log(this.selectedPreview);
            }
        });
    }
}

uploadThroughLink() {
  let value = this.defaultMessageForm.get('link')?.value;
  this.selectedPreview = value;
}

onFileChange(event: any) {
    let files: FileList = event.target.files;
    this.saveVideoAndDocument(files);
}

truncateFileName(fileName: string, maxLength: number): string {
  if (fileName.length > maxLength) {
    return fileName.substring(0, maxLength) + '...';
  }
  return fileName;
}

  // remove form values
  removeValue() {
    this.selectedPreview = '';
    this.fileName='';
    this.defaultMessageForm.get('link')?.setValue(null);
}



  getDefaultMessages() {
    this.apiService.getDefaultMessages(this.spId).subscribe(response => {
        this.defaultMessages = response.defaultaction
        console.log(response.defaultaction);
    })
  }

  getDefaultMessageById(title: string) {
    this.selectedMessage = this.defaultMessages.find((message:any) =>message.title === title);
    console.log(this.selectedMessage)
    // this.showSideBar = true;
  }

  addDefaultMessageData() {
    let defaultMessagesData = this.copyDefaultMesssageData();
    // this.apiService.addDefaultMessages(defaultMessagesData).subscribe(response => {
    //     if(response.status === 200) {
    //       this.defaultMessageForm.reset();
    //       $("#welcomGreeting").modal('hide');

    //     }
    // });
  }

  populateData(data:any) {
    // this.defaultMessagesData = data
    let selectedData = data;
    console.log(selectedData)
    this.selectedTitle = selectedData.title;
    this.selectedDescription = selectedData.description;
  }

  copyDefaultMesssageData() {
    let defaultMessagesData:defaultMessagesData = <defaultMessagesData>{};

    defaultMessagesData.spid = this.spId;
    defaultMessagesData.uid = 0;
    defaultMessagesData.title = this.selectedTitle;
    defaultMessagesData.description = this.selectedDescription;
    defaultMessagesData.message_type = this.selectedType;
    defaultMessagesData.value = this.defaultMessageForm.controls.value.value;
    defaultMessagesData.link = this.selectedPreview;
    defaultMessagesData.override = this.defaultMessageForm.controls.override.value;
    defaultMessagesData.autoreply = this.defaultMessageForm.controls.autoreply.value;
    console.log(defaultMessagesData);
    return defaultMessagesData;
  }

  // patchFormValue(){
  //   const data = this.defaultMessagesData;
  //   for(let prop in data){
  //     let value = data[prop as keyof typeof data];
  //     if(this.defaultMessageForm.get(prop))
  //     this.defaultMessageForm.get(prop)?.setValue(value)
  //   }  
  // }

}
