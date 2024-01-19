import { Component, OnInit } from '@angular/core';
import { defaultActionData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
@Component({
  selector: 'sb-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  spId:number = 0;
  selectedTab:number = 1;
  defaultActionData = <defaultActionData>{};
  isAgentActive = 0;
  isAutoReply = 0;
  isContactAdd = 0;
  isAutoReplyDisable= 0;
  autoReplyTime ='';
  agentActiveTime='';
  currentTime!: Date;


  errorMessage='';
	successMessage='';
	warningMessage='';

  constructor(private apiService:SettingsService) {
    this.currentTime = new Date();
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


  ngOnInit(): void {
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getDefaultAction();
  }

  getDefaultAction() { 
    this.apiService.getDefaultAction(this.spId).subscribe(response =>{
      const a = response.defaultaction[0];
      
     this.isAgentActive = a?.isAgentActive;
     this.isAutoReply = a?.isAutoReply;
     this.agentActiveTime = a?.agentActiveTime;
     this.isAutoReplyDisable =a?.isAutoReplyDisable;
     this.autoReplyTime = a?.autoReplyTime;
     this.isContactAdd = a?.isContactAdd;

    })
  }

  defaultActionState(action: string,checked: boolean) { 

    if (action === 'agentActiveTime') {
      this.isAgentActive = checked ? 1 : 0;
    } if (action === 'autoReplyTime') {
      this.isAutoReply = checked ? 1 : 0;
    } if (action === 'autoReplyDisable') {
      this.isAutoReplyDisable = checked ? 1 : 0;
    } if (action === 'contactAdd') {
      this.isContactAdd = checked ? 1 : 0;
    }

  }

  calculateTime(additionalMinutes: number) {
    const calcTime = new Date(this.currentTime.getTime() + additionalMinutes * 60000);
     return calcTime.toISOString().slice(0, 19).replace("T", " ");
  }

  saveDefaultAction() { 
 
    this.defaultActionData.SP_ID = this.spId;
    this.defaultActionData.agentActiveTime = this.agentActiveTime;
    this.defaultActionData.autoReplyTime = this.autoReplyTime;
    this.defaultActionData.isAgentActive = this.isAgentActive;
    this.defaultActionData.isAutoReply = this.isAutoReply;
    this.defaultActionData.isAutoReplyDisable = this.isAutoReplyDisable;
    this.defaultActionData.isContactAdd = this.isContactAdd;

    this.apiService.saveDefaultAction(this.defaultActionData).subscribe
    ((resopnse :any) => {
      if(resopnse.status ==200) {
       this.showToaster('Your settings saved sucessfully','success');
       this.getDefaultAction();
      }

    });
    ((error: any) => {
      if(error) {
        this.showToaster('An error occurred please contact adminintrator', 'error');
      }
    })


  }
}


