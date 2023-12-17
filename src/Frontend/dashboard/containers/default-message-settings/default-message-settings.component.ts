import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { defaultMessagesData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ToolbarService,NodeSelection, LinkService, ImageService, EmojiPickerService } from '@syncfusion/ej2-angular-richtexteditor';
import { RichTextEditorComponent, HtmlEditorService } from '@syncfusion/ej2-angular-richtexteditor';
declare var $:any;
@Component({
  selector: 'sb-default-message-settings',
  templateUrl: './default-message-settings.component.html',
  styleUrls: ['./default-message-settings.component.scss']
})
export class DefaultMessageSettingsComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('chatEditor') chatEditor: RichTextEditorComponent | any; 

  public selection: NodeSelection = new NodeSelection();
	public range: Range | undefined;
	public saveSelection: NodeSelection | any;

  
  spId:number = 0;
  selectedType: string = 'text';
  selectedCategory!: number;
  selectedMessage: any;
  videoSelected = false;
  defaultMessageForm!:FormGroup;
  showSideBar:boolean=false;
  defaultMessages:any [] =[];
  defaultMessagesData: any;
  custommesage='<p>Your message...</p>'
  showEmoji=false;
  dragAreaClass: string='';


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

  constructor(private apiService:SettingsService) { }

 

  prepareUserForm(){
    return new FormGroup({
      value:new FormControl(null),
      link:new FormControl(null),
      override:new FormControl(null),
      autoreply:new FormControl(null),
    });
  }

  
	closeAllModal(){
		this.showEmoji =false;
		$("#quikpopup").modal('hide');
		$("#atrributemodal").modal('hide');
		$("#insertmodal").modal('hide');
		$("#attachfle").modal('hide');
		$('body').removeClass('modal-open');
		$('.modal-backdrop').remove();

	}	

  toggleEmoji(){
    this.closeAllModal()
    this.showEmoji = !this.showEmoji;
    (this.chatEditor.contentModule.getEditPanel() as HTMLElement).focus();
    this.range = this.selection.getRange(document);
    this.saveSelection = this.selection.save(this.range, document);
        
  }
  
ToggleAttributesOption(){
	this.closeAllModal()
	$("#atrributemodal").modal('show'); 

}
ToggleInsertTemplateOption(){
	this.closeAllModal()
	$("#insertmodal").modal('show'); 
	}

ToggleQuickReplies(){
	this.closeAllModal()
	$("#quikpopup").modal('show'); 
}


  ToggleAttachmentBox(){
    this.closeAllModal()
    $("#attachfle").modal('show'); 
  document.getElementById('attachfle')!.style.display = 'inherit';
    this.dragAreaClass = "dragarea";
    
  }

  ngOnInit(): void {
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.defaultMessageForm =this.prepareUserForm();
    this.getDefaultMessages();

  }

  showMessageType(type: string) {
    this.selectedType = type;
  }
  

	handleKeyPress(event: KeyboardEvent) {
		
		// Check if the pressed key is "Enter"
		if (event.key === 'Enter' && !event.shiftKey) {
			// Prevent sending the message when Enter is pressed without Shift
			
			event.preventDefault();
		 // Call your send message function here
		  }
	  }

  selectedButtonType(type: number) {
    this.selectedCategory = type;
  }

  handleVideoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      this.videoPlayer.nativeElement.src = objectURL;
      this.videoSelected = true;
    }
  }

  getDefaultMessages() {
    this.apiService.getDefaultMessages(this.spId).subscribe(response => {
        this.defaultMessages = response.defaultaction
        console.log(response.defaultaction);
    })
  }

  getDefaultMessageById(uid: number) {
    this.selectedMessage = this.defaultMessages.find((message:any) =>message.uid === uid);
    this.showSideBar = true;
  }

  addDefaultMessageData() {
    let defaultMessagesData = this.copyDefaultMesssageData();

    this.apiService.addDefaultMessages(defaultMessagesData).subscribe(response => {
      
        if(response.status === 200) {
          this.defaultMessageForm.reset();
          $("#welcomGreeting").modal('hide');

        }
    });
  }


  copyDefaultMesssageData() {
    let defaultMessagesData:defaultMessagesData = <defaultMessagesData>{};

    defaultMessagesData.SP_ID = this.spId;
    defaultMessagesData.uid = 1;
    defaultMessagesData.title = 'Add Message for Welcome Greeting';
    defaultMessagesData.description = 'A default welcome message will be sent to the customer in case a chat is initiated but no keyword is matched.';
    defaultMessagesData.message_type = 'text';
    defaultMessagesData.value = this.defaultMessageForm.controls.value.value;
    defaultMessagesData.link = this.defaultMessageForm.controls.link.value;
    defaultMessagesData.override = this.defaultMessageForm.controls.override.value;
    defaultMessagesData.autoreply = this.defaultMessageForm.controls.autoreply.value;

    return defaultMessagesData;

  }

  patchFormValue(){
    const data = this.defaultMessagesData;
    for(let prop in data){
      let value = data[prop as keyof typeof data];
      if(this.defaultMessageForm.get(prop))
      this.defaultMessageForm.get(prop)?.setValue(value)
    }  
  }

}
