import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

declare var $: any;
@Component({
  selector: 'sb-manage-storage',
  templateUrl: './manage-storage.component.html',
  styleUrls: ['./manage-storage.component.scss']
})



export class ManageStorageComponent implements OnInit {
  spid:any;
  SPID:any;
  manually_deletion_days:any;
  message_type:string = '';
  textChecked:string = '';
  mediaChecked:string = '';
  errorMessage = '';
	successMessage = '';
	warnMessage = '';
  Manually_deletion_days:any;
  showMessages: boolean = false;
  noOfMessages: number = 0;
  sizeOfMessage: string = '';
  message_size:any;
  message_count:any;
  messageData: any = null;


  percentage = 73;
  constructor(private _settingsService:SettingsService) {
   }

  ngOnInit(): void {
    this.postmanualDelation();
    this.getmanualDelation();
    this.SPID = Number(sessionStorage.getItem('SP_ID'));

  }
  get formattedDashArray() {
    return this.percentage + ', 100';
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


  deletemanually(){
  		$("#Delete-Manually").modal('show');

  }
  deletemodal(){
    if(this.manually_deletion_days && this.textChecked || this.mediaChecked ){
      $("#messagedeleteModal").modal('show');
      $("#Delete-Manually").modal('hide');
    }else{
			this.showToaster("Please fill input and check the checkbox", "error");
    }
  }
  postmanualDelation(){
    let manualdeletedata={
      SPID:this.SPID,
      manually_deletion_days:this.manually_deletion_days,
      Text:this.textChecked,
      media:this.mediaChecked,
      message_type:this.message_type,
    }
    this._settingsService.postmanualDelation(manualdeletedata).subscribe(response => {
      
      console.log(response);
    })
    $("#messagedeleteModal").modal('hide');
  }
// Show the 
  getmanualDelation(){
    let showdeletedata={
      SPID:this.SPID,
      Manually_deletion_days:this.manually_deletion_days,
      message_type:this.message_type,
     }
    this._settingsService.getmanualDelation(showdeletedata).subscribe(response => {
      this.showMessages = true; // Show the messages section
      this.messageData = response.messageSize[0];
    })
  }
  updateMessageType() {
    this.message_type = (this.textChecked ? 'Text' : '') || (this.mediaChecked ? 'Media' : '');
  }

}