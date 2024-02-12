import { Component, OnInit } from '@angular/core';
import { defaultActionData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
@Component({
  selector: 'sb-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  spId = 0;
  selectedTab = 1;
  defaultActionData = <defaultActionData>{};
  isAgentActive = 0;
  isAutoReply = 0;
  isContactAdd = 0;
  isAutoReplyDisable= 0;
  autoReplyTime ='';
  pauseAutoReplyTime = 0;
  pauseAgentActiveTime = 0;
  agentActiveTime='';
  pausedTill='';
  date!:Date;
  agentInactivePattern:RegExp = /^(?:[1-9]\d{0,1}|[1-4]\d{2}|500)$/;
  pauseAutoTimePattern:RegExp = /^(?:[1-9]\d{0,2}|1[0-3]\d{2}|1440)$/;



  errorMessage='';
	successMessage='';
	warningMessage='';

  constructor(private apiService:SettingsService) { 
    this.date = new Date();
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
      const a:defaultActionData = response.defaultaction[0];
      
     this.isAgentActive = a?.isAgentActive;
     this.isAutoReply = a?.isAutoReply;
     this.agentActiveTime = a?.agentActiveTime;
     this.isAutoReplyDisable =a?.isAutoReplyDisable;
     this.autoReplyTime = a?.autoReplyTime;
     this.isContactAdd = a?.isContactAdd;
     this.pausedTill = a?.pausedTill;
     this.pauseAgentActiveTime = a?.pauseAgentActiveTime;
     this.pauseAutoReplyTime = a?.pauseAutoReplyTime;
    //  console.log(a);

    })
  }

  defaultActionState(action: string,checked: boolean) { 

    if (action === 'agentActiveTime') {
      this.isAgentActive = checked ? 1 : 0;
      if(this.isAgentActive==0) {
        this.pauseAgentActiveTime = 0;
        this.agentActiveTime ='';
      }
    }; if (action === 'autoReplyTime') {
      this.isAutoReply = checked ? 1 : 0;
        if(this.isAutoReply==0) {
          this.autoReplyTime ='';
          this.pauseAutoReplyTime = 0;
          this.pausedTill ='';
        }
    }; if (action === 'autoReplyDisable') {
      this.isAutoReplyDisable = checked ? 1 : 0;
    }; if (action === 'contactAdd') {
      this.isContactAdd = checked ? 1 : 0;
    }

  }

  autoRepliesPausedTill(pauseDuration:number) {
    if(this.isAutoReply=1) {
      this.autoReplyTime = this.date.toString();
      let calcTime = new Date(this.date.getTime() + pauseDuration * 60000);
      this.pausedTill = calcTime.toString();
    }
    else {
      this.autoReplyTime = '';
      this.pausedTill= '';
      this.pauseAutoReplyTime=0;
    };
  }

  agentInactiveTill(inactiveTime:number) {
    if(this.isAgentActive=1) {
      let calcTime = new Date(this.date.getTime() + inactiveTime * 60000);
      this.agentActiveTime = calcTime.toString();
    }
    else{
      this.agentActiveTime = '';
      this.pauseAgentActiveTime = 0;
    }
  }

  saveDefaultAction() { 
 
    this.defaultActionData.SP_ID = this.spId;
    this.defaultActionData.agentActiveTime = this.agentActiveTime;
    this.defaultActionData.autoReplyTime = this.autoReplyTime;
    this.defaultActionData.isAgentActive = this.isAgentActive;
    this.defaultActionData.isAutoReply = this.isAutoReply;
    this.defaultActionData.isAutoReplyDisable = this.isAutoReplyDisable;
    this.defaultActionData.isContactAdd = this.isContactAdd;
    this.defaultActionData.pausedTill = this.pausedTill;
    this.defaultActionData.pauseAgentActiveTime = this.pauseAgentActiveTime;
    this.defaultActionData.pauseAutoReplyTime = this.pauseAutoReplyTime;
    // console.log(this.defaultActionData)

    this.apiService.saveDefaultAction(this.defaultActionData).subscribe
    ((resopnse :any) => {
      if(resopnse.status == 200) {
       this.showToaster('Your settings saved sucessfully','success');
       setTimeout(() => {
        this.getDefaultAction();
       }, 500);
      }

    });
    ((error: any) => {
      if(error) {
        this.showToaster('An error occurred please contact adminintrator', 'error');
      }
    })


  }
}


