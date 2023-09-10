import { Component, OnInit,  ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { defaultMessagesData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
declare var $:any;
@Component({
  selector: 'sb-default-message-settings',
  templateUrl: './default-message-settings.component.html',
  styleUrls: ['./default-message-settings.component.scss']
})
export class DefaultMessageSettingsComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  
  spId:number = 0;
  selectedType: string = 'text';
  selectedCategory!: number;
  selectedMessage: any;
  videoSelected = false;
  defaultMessageForm!:FormGroup;
  showSideBar:boolean=false;
  defaultMessages: [] =[];
  defaultMessagesData: any;


  constructor(private apiService:SettingsService) { }

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
    this.getDefaultMessages();

  }

  showMessageType(type: string) {
    this.selectedType = type;
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
