import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { routingRulesData } from 'Frontend/dashboard/models/settings.model';


@Component({
  selector: 'sb-routing-rules',
  templateUrl: './routing-rules.component.html',
  styleUrls: ['./routing-rules.component.scss']
})
export class RoutingRulesComponent implements OnInit {

  @ViewChild('myForm') myForm!: NgForm;

  spId = 0;
  contactowner = 0;
  assignagent = 0;
  broadcast = 1;
  roundrobin = 0;
  conversationallowed = "";
  manualassign = 0;
  enableAdmin=0;
  assignuser= "";
  timeoutperiod= "";
  defaultAssignRule='broadcast';
  missedChatOption = '';
  isadmin= 0;
  selectuser="";
  isMissChatAssigContactOwner=0;
  assignspecificuser= 0;
  usernames!:string;
  userId!:number;
  userList:any;
  routingRulesData = <routingRulesData>{};
  chatAssignTimeoutPattern:RegExp = /^(?:[1-9]\d{0,2}|1[0-3]\d{2}|1440)$/;


  errorMessage='';
	successMessage='';
	warningMessage='';

  constructor(private apiService:SettingsService) { }

  ngOnInit(): void {
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getRoutingRules();
    this.getUserList();
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


  routingRulesState(action: string,checked: boolean) { 
    if (action === 'contactowner') {
      this.contactowner = checked ? 1 : 0;
    } if (action === 'assignagent') {
      this.assignagent = checked ? 1 : 0;
     } 
  }

  defaultAssignmentRules(option:string) {
    if(option==='broadcast') {
      this.defaultAssignRule = 'broadcast';
    } else if(option==='roundrobin') {
      this.defaultAssignRule = 'roundrobin';
    } else if (option ==='manualassign') {
      this.defaultAssignRule = 'manualassign';
    }
    this.assignuser = '';
    this.conversationallowed = '';
  }

  missedChatOptionsChange(option: string) {
    if (option === 'isMissChatAssigContactOwner') {
      this.missedChatOption = 'isMissChatAssigContactOwner';
    } else if (option === 'isadmin') {
      this.missedChatOption = 'isadmin';
    } else if (option === 'assignspecificuser') {
      this.missedChatOption = 'assignspecificuser';
    }
    this.selectuser = '';
  }




  getUserList() {
    this.apiService.getUserList(this.spId).subscribe((result:any) =>{
      if(result){
        this.userList =result?.getUser;     
        console.log('userList:', this.userList);
        this.usernames = this.userList.map((getUser:any) => getUser.name);
        this.userId = this.userList.map((getUser:any) => getUser.uid);

      console.log(this.usernames);
      console.log(this.userId);
  
      }
  
    })
  }


  getRoutingRules() {
    this.apiService.getRoutingRulesData(this.spId).subscribe(response =>{
          const data:routingRulesData = response.autoaddition[0];
          console.log(data);

          this.contactowner = data.contactowner;
          this.assignagent = data.assignagent;
          this.broadcast = data.broadcast;
          this.roundrobin = data.roundrobin;
          this.conversationallowed = data.conversationallowed;
          this.manualassign = data.manualassign;
          this.enableAdmin = data.enableAdmin;
          this.assignuser = data.assignuser;
          this.timeoutperiod = data.timeoutperiod;
          this.isMissChatAssigContactOwner = data.isMissChatAssigContactOwner;
          this.isadmin = data.isadmin;
          this.assignspecificuser = data.assignspecificuser;
          this.selectuser = data.selectuser;
    
          if(this.broadcast==1) {
            this.defaultAssignRule = 'broadcast';
          };
          if(this.roundrobin==1) {
            this.defaultAssignRule = 'roundrobin';
          };
          if(this.manualassign==1) {
            this.defaultAssignRule = 'manualassign';
          };
          if(this.isMissChatAssigContactOwner==1) {
            this.missedChatOption = 'isMissChatAssigContactOwner';
          };
          if(this.isadmin==1) {
            this.missedChatOption = 'isadmin';
          };
          if(this.assignspecificuser==1) {
            this.missedChatOption = 'assignspecificuser';
          }
    });
console.log(this.defaultAssignRule)
  }
assignUUID(manualassign: string, assignspecificuser: string){
  const manualAssignUser = this.userList.find((user: any) => user.name === manualassign);
  const assignSpecificUser = this.userList.find((user: any) => user.name === assignspecificuser);

  if (manualAssignUser) {
    this.routingRulesData.manualAssignUid = manualAssignUser.uid;
  } else {
    console.log(`User with name '${manualassign}' not found.`);
  }

  if (assignSpecificUser) {
    this.routingRulesData.SpecificUserUid = assignSpecificUser.uid;
  } else {
    console.log(`User with name '${assignspecificuser}' not found.`);
  }

}
  saveRoutingRules() {
    this.routingRulesData.SP_ID = this.spId;
    this.routingRulesData.contactowner  = this.contactowner;
    this.routingRulesData.assignagent = this.assignagent;
    if(this.defaultAssignRule) {
      this.routingRulesData.broadcast = Number(this.defaultAssignRule === 'broadcast' ? '1' : '0');
      this.routingRulesData.roundrobin = Number(this.defaultAssignRule === 'roundrobin' ? '1' : '0');
      this.routingRulesData.conversationallowed = this.conversationallowed;
      this.routingRulesData.manualassign =  Number(this.defaultAssignRule === 'manualassign' ? '1' : '0');
      this.routingRulesData.assignuser = this.assignuser;
    };

    this.routingRulesData.timeoutperiod = this.timeoutperiod;
    if(this.missedChatOption) {
      this.routingRulesData.isMissChatAssigContactOwner = Number(this.missedChatOption === 'isMissChatAssigContactOwner' ? '1' : '0');
      this.routingRulesData.isadmin = Number(this.missedChatOption === 'isadmin' ? '1' : '0');
      this.routingRulesData.assignspecificuser = Number(this.missedChatOption === 'assignspecificuser' ? '1' : '0');
      this.routingRulesData.selectuser = this.selectuser;
    };
   this.assignUUID( this.routingRulesData.assignuser ,  this.routingRulesData.selectuser);

    if(this.myForm.valid) {
      this.apiService.saveRoutingRulesData(this.routingRulesData).subscribe(response=>{
        if(response.status === 200) {
          this.showToaster("Routing Rules Updated Successfully", "success");
          setTimeout(() => {
            this.getRoutingRules();
          }, 800);
  
        }
      });
    }
    else {
      this.showToaster('Invalid Chat Assign Timeout Period','error');
    }

    return this.routingRulesData;

  }

}

    
  

