import { Component,AfterViewInit, OnInit,ViewChild, ElementRef,HostListener  } from '@angular/core';

import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamboxService } from './../../services';


@Component({
  selector: 'sb-teambox',
  templateUrl: './teambox.component.html',
  styleUrls: ['./teambox.component.scss']
})

export class TeamboxComponent implements AfterViewInit, OnInit {
	@ViewChild('notesSection') notesSection: ElementRef |undefined; 
	@ViewChild('chatSection') chatSection: ElementRef |undefined; 
	
	input = 'Raman';
	disabled = false;
  
  
	active = 1;
	SPID=2;
	TeamLeadId=44;
	AgentId=45;
	showFullProfile=false;
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
	
	newContact: any;
	newMessage:any;
	interactionFilterBy:any='All'
	AutoReplyEnableOption:any=['Extend Pause for 5 mins','Extend Pause for 10 mins','Extend Pause for 15 mins','Extend Pause for 20 mins'];
	AutoReplyPauseOption:any=['Pause for 5 mins','Pause for 10 mins','Pause for 15 mins','Pause for 20 mins','Auto Reply are Paused'];
	AutoReply:any='Extend Pause for 5 mins';
	AutoReplyType:any= 'Auto Reply are Paused';
	dragAreaClass: string='';
	


    constructor(private http: HttpClient,private apiService: TeamboxService,config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
		config.windowClass= 'teambox-pink';
		this.newContact= fb.group({
			Name: new FormControl('', Validators.required),
			Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
			Channel: new FormControl('', Validators.required),
			
		});
		this.newMessage =fb.group({
			message_text: new FormControl('', Validators.required),
			Message_id:new FormControl(''),
		});

	}


openAttachmentBox(attachmentbox:any){
	this.showattachmentbox=true
	this.dragAreaClass = "dragarea";
	
}
closeAttachmentBox(){

	this.showattachmentbox=false
}

	onFileChange(event: any) {
		let files: FileList = event.target.files;
		this.saveFiles(files);
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
	
		if (files.length > 1){
			console.log("Only one file at time allow");
		}
		else {
		  console.log(files[0].size,files[0].name,files[0].type);
		}
	  }

    ngOnInit() {
		
		this.getAgents()
		this.getAllInteraction()
		this.getCustomers()

		
	}
	ngAfterViewInit() {
		setTimeout(() => {
			this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
			this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
		  }, 1000);
	}

	toggleChatNotes(optionvalue:any){
	 this.showChatNotes=optionvalue
	   setTimeout(() => {
	    this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
		this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
	  }, 100);
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
			console.log(data)
            this.agentsList= data
        });

	}
	async getAssicatedInteractionData(dataList:any,selectInteraction:any=true){
		dataList.forEach((item:any) => {
		this.apiService.getAllMessageByInteractionId(item.InteractionId,'text').subscribe(messageList =>{
		item['messageList'] =messageList?messageList:[]
		var lastMessage = item['messageList']?item['messageList'][item['messageList'].length - 1]:[];
		item['lastMessage'] = lastMessage
		})

		this.apiService.getAllMessageByInteractionId(item.InteractionId,'notes').subscribe(notesList =>{
			console.log(notesList)
			item['notesList'] =notesList?notesList:[]
		})


		if(item['interaction_status']!='Resolved'){
			this.apiService.getInteractionMapping(item.InteractionId).subscribe(mappingList =>{
			   var mapping:any  = mappingList;
			   item['assignTo'] =mapping?mapping[mapping.length - 1]:'';
		   })
		}

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
			console.log('/////////////////////getAllInteraction/////////////////////')
			console.log(dataList)
			this.getAssicatedInteractionData(dataList,selectInteraction)
		});

	}
	async getSearchInteraction(event:any,selectInteraction:any=true){
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

	getTagsLIst(tags:any){
		if(tags){
			const tagsArray = tags.split(',');
			return tagsArray
			}else{
			return [];
			}
	}
	timeSince(date:any) {
		if(date){
		var currentDate:any = new Date()
		var messCreated:any = new Date(date)
		var seconds = Math.floor((currentDate - messCreated) / 1000);
	  	var interval = seconds / 31536000;
	  
		if (interval > 1) {
		  return Math.floor(interval) + " years";
		}
		interval = seconds / 2592000;
		if (interval > 1) {
		  return Math.floor(interval) + " months";
		}
		interval = seconds / 86400;
		if (interval > 1) {
		  return Math.floor(interval) + " days";
		}
		interval = seconds / 3600;
		if (interval > 1) {
			var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
			var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
			var hoursBH = hours < 10 ? "0" + hours : hours;
			var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
			var time = hoursBH + ":" + minutes  + " " + am_pm;
			return time
		}
	}else{
		return ''
	}
		
	  }

	  
	getLastMessageSincePer() {
		if(this.selectedInteraction['lastMessage']){
	    var LastAgent_id = this.selectedInteraction['lastMessage']['Agent_id']	
		var selectedInteraction = this.selectedInteraction
		console.log(selectedInteraction)
		var dateTime = this.selectedInteraction['lastMessage']['created_at']
		var currentDate:any = new Date()
		var messCreated:any = new Date(dateTime)
		var seconds = Math.floor((currentDate - messCreated) / 1000);
	  
		var interval:any = seconds / 3600;
		var hour =parseInt(interval)
		if (hour >= 1 && hour < 6) {
			var hrPer = hour*6/100
			var hourLeft =6-parseInt(interval)
		}else{
			var hrPer =100
			var hourLeft =0
			if(this.selectedInteraction['interaction_status']!=='Resolved'){
				//this.updateConversationStatus('Resolved')
			}
		}
	} else{
		var hrPer =100
		var hourLeft =0
	}  
		this.progressbarPer = "--value:"+hrPer;
		this.progressbarValue= hourLeft;


    };
	


	

selectInteraction(Interaction:any){
	for(var i=0;i<this.interactionList.length;i++){
		this.interactionList[i].selected=false
	}
	Interaction['selected']=true
	this.selectedInteraction =Interaction
	this.getLastMessageSincePer()
}

getInteractionById(InteractionId:any){
	this.apiService.getInteractionById(InteractionId).subscribe(async data =>{
		var Interaction:any = data;
		var item:any =Interaction[0]
		this.apiService.getAllMessageByInteractionId(InteractionId,'text').subscribe(messageList =>{
			item['messageList'] =messageList?messageList:[]
			var lastMessage = item['messageList'][item['messageList'].length - 1];
			item['lastMessage'] = lastMessage
		})
		this.apiService.getAllMessageByInteractionId(item.InteractionId,'notes').subscribe(notesList =>{
			console.log(notesList)
			item['notesList'] =notesList
		})

         if(item['interaction_status']!='Resolved'){
		 this.apiService.getInteractionMapping(InteractionId).subscribe(mappingList =>{
			var mapping:any  = mappingList;
			item['assignTo'] =mapping[mapping.length - 1];
		})
	   }
        

		for(var i=0;i<this.interactionList.length;i++){
			this.interactionList[i].selected=false
		
		if(this.interactionList[i].InteractionId == InteractionId){
			this.interactionList[i]['selected']=true
			this.selectedInteraction= this.interactionList[i]
			this.getLastMessageSincePer()

		}
	   }
		 
		
	});
}

filerInteraction(filterBy:any){
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

filterContactByType(contactType:any){
alert(contactType)
this.ShowContactOption=false
}

toggleConversationStatusOption(){
	this.ShowConversationStatusOption =!this.ShowConversationStatusOption
}
toggleAssignOption(){
	console.log(this.selectedInteraction)

if(this.selectedInteraction.interaction_status =='Resolved' || (this.selectedInteraction.assignTo && this.selectedInteraction.assignTo.AgentId)){
this.showToaster('Already Assigned','')
}else{

this.ShowAssignOption =!this.ShowAssignOption
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
		console.log(response)
		this.selectedInteraction.AutoReplyStatus =optionValue	
		this.AutoReplyType ='Pause are '+optionType	
		this.AutoReplyOption=false;
		this.showToaster('Pause Applied','success')
	})
	
}

searchContact(event:any){
	var searchKey = event.target.value;
	this.apiService.searchCustomer(searchKey).subscribe(data =>{
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
		var responseData:any = response
		var bodyData = {
			InteractionId: this.selectedInteraction.InteractionId,
			AgentId: this.AgentId,
			MappedBy: this.AgentId
		}
		this.apiService.updateInteractionMapping(bodyData).subscribe(responseData =>{
		this.getInteractionById(this.selectedInteraction.InteractionId)
		this.apiService.getInteractionMapping(this.selectedInteraction.InteractionId).subscribe(mappingList =>{
			var mapping:any  = mappingList;
			this.selectedInteraction['assignTo'] =mapping[mapping.length - 1];
		})

		});
		
		this.selectedInteraction['interaction_status']=status
	});

}
createCustomer(){
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
	var that =this;
	setTimeout(function(){
		that.getInteractionById(insertId)
	}, 2000);
	
    
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
		this.getAllInteraction()
	
	});
}


openaddMessage(messageadd: any) {
	if(this.modalReference){
	this.modalReference.close();
	}
	this.modalReference = this.modalService.open(messageadd,{windowClass:'teambox-pink'});
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
	var AllnotesList = this.selectedInteraction.notesList
	for(var i=0;i<AllnotesList.length;i++){
		AllnotesList[i]['selected']=false
	}
	this.selectedInteraction['notesList']=AllnotesList
}
editNotes(){
	this.hideNoteOption()
	this.newMessage.reset({
		message_text: this.selectedNote.message_text,
		Message_id: this.selectedNote.Message_id
	   });
	 
}
updateReadStatus(message:any){
if(message.is_read==0){
	var bodyData = {
		Message_id:this.selectedNote.Message_id
	}
	this.apiService.updateMessageRead(bodyData).subscribe(async data =>{

	})
}

}
getUnreadMessageCount(){
var allMessage = this.selectedInteraction.messageList
let unreadCount = 0
if(allMessage){
for(var i=0;i<allMessage.length;i++){
	if(allMessage[i]['is_read'] == 0){
		unreadCount=unreadCount+1
	}
}
}
return unreadCount;
	
}
deleteNotes(){
	this.hideNoteOption()
	var bodyData = {
		Message_id:this.selectedNote.Message_id,
		deleted:1,
		deleted_by:this.AgentId
	}
	console.log(bodyData)
	this.apiService.deleteMessage(bodyData).subscribe(async data =>{

	})
	

}

sendMessage(){
	
	var bodyData = {
		InteractionId: this.selectedInteraction.InteractionId,
		AgentId: this.AgentId,
		messageTo:this.selectedInteraction.Phone_number,
		message_text: this.newMessage.value.message_text,
		Message_id:this.newMessage.value.Message_id,
		message_media: ' ',
		Quick_reply_id: ' ',
		message_type: this.showChatNotes
	}
	this.apiService.sendNewMessage(bodyData).subscribe(async data =>{
		var responseData:any = data
		console.log(responseData)
		if(this.newMessage.value.Message_id==''){
		
		var insertId:any = responseData.insertId
		if(insertId){
			var lastMessage ={
				"interaction_id": bodyData.InteractionId,
				"Message_id": insertId,
				"message_direction": "Out",
				"Agent_id": bodyData.AgentId,
				"message_text": this.newMessage.value.message_text,
				"message_media": bodyData.message_media,
				"Message_template_id": bodyData.message_media,
				"Quick_reply_id": bodyData.message_media,
				"Type": bodyData.message_media,
				"ExternalMessageId": bodyData.message_media,
				"careated_at": new Date()
			}
			
			
			if(this.showChatNotes=='text'){
				this.selectedInteraction.lastMessage= lastMessage
				this.selectedInteraction.messageList.push(lastMessage)
			}else{
			this.selectedInteraction.notesList.push(lastMessage)
			}
		
			this.getLastMessageSincePer()
     	}


		}else{
			this.selectedNote.message_text= this.newMessage.value.message_text
		}
		setTimeout(() => {
			this.chatSection?.nativeElement.scroll({top:this.chatSection?.nativeElement.scrollHeight})
			this.notesSection?.nativeElement.scroll({top:this.notesSection?.nativeElement.scrollHeight})
		  }, 100);

		this.newMessage.reset({
			message_text: '',
			Message_id: ''
		   });


	});
	

	/*
    var bodyDataFB:any=JSON.stringify({
		"messaging_product": "whatsapp",    
    	"recipient_type": "individual",
		"to": "919988664020",
		"text": {
			"body": this.newMessage.value.message_text
		}
	  
	  });
    var config:any = {
	  headers: {
      'Authorization': `Bearer EAABx7u3iFZBYBAJZBnZCmklY1s5uZC5120NfeEnGMkKj9GGYfEKeOVKzD2ZCguRyluWs5UifG0TIirp068IZCq1NUGZAZCxdZA4AIZBBC7oIZBOS4xYtTnqhUjlA1k8vuEhhZCD0ZBcvXVDz2J1Dhk6IXZCdeuAOZBqCaZBM2vZCZBEdHSEPGeN4dWPZCrrSnLoutf66vKSPkwHdbuv3U3T9gZDZD`,
      'Content-Type': 'application/json'
    }
  };


  this.http.post("https://graph.facebook.com/v15.0/116650038030003/messages",bodyDataFB,config).subscribe(data =>{
		console.log(data)
  })*/

  

}


}

