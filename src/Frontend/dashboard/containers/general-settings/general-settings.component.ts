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
  userList:any[] =[];
  initUserList:any[] =[];
  currentLoggedInUserUID: number = 0;
  defaultAdminUid:number=0;
  isLoading! : boolean;


  errorMessage='';
	successMessage='';
	warningMessage='';

  constructor(private apiService:SettingsService,public settingsService:SettingsService) { 
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
    this.isLoading = true;
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getDefaultAction();
    this.getUserList();
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
     this.defaultAdminUid = a?.defaultAdminUid;
     this.isLoading = false;
    //  console.log(a);

    })
  }
 

  getUserList() {
    this.currentLoggedInUserUID = JSON.parse(sessionStorage.getItem('loginDetails')!).uid;

    this.apiService.getUserList(this.spId,1).subscribe((result:any) =>{
      if(result){
        this.userList =result?.getUser;     
        console.log('userList:', this.userList);
        this.initUserList = this.userList.filter((item)=> item.RoleName == 'Admin');
      }
    })
  }

  defaultActionState(action: string,checked: boolean) { 

    if (action === 'agentActiveTime') {
      this.isAgentActive = checked ? 1 : 0;
      if(this.isAgentActive==0) {
        this.pauseAgentActiveTime = 0;
        this.agentActiveTime ='';
      }else{
        this.pauseAgentActiveTime = 5;
      }
    }; if (action === 'autoReplyTime') {
      this.isAutoReply = checked ? 1 : 0;
      this.isAutoReplyDisable = checked ?this.isAutoReplyDisable : 0;
        if(this.isAutoReply==0) {
          this.autoReplyTime ='';
          this.pauseAutoReplyTime = 0;
          this.pausedTill ='';
        }else{
          this.pauseAutoReplyTime = 5;
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
    this.defaultActionData.defaultAdminUid = this.defaultAdminUid;
    console.log(this.defaultAdminUid)

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


