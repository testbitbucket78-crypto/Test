import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { routingRulesData } from 'Frontend/dashboard/models/settings.model';

@Component({
  selector: 'sb-routing-rules',
  templateUrl: './routing-rules.component.html',
  styleUrls: ['./routing-rules.component.scss']
})
export class RoutingRulesComponent implements OnInit {

  spId = 0;
  contactowner = 0;
  assignagent = 0;
  broadcast = 1;
  roundrobin = 0;
  conversationallowed = "";
  manualassign = 0;
  assignuser= "";
  timeoutperiod= "";
  isadmin= 0;
  selectuser="";
  assignspecificuser= 0;
  usernames!:string;
  userId!:number;

  userList:any;

  routingRulesData = <routingRulesData>{};


  errorMessage='';
	successMessage='';
	warningMessage='';

  constructor(private apiService:SettingsService) { }

  ngOnInit(): void {
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.getRoutingRules();
    this.getUserList();
    // this.saveRoutingRules();
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
    }if (action === 'broadcast') {
      this.broadcast = checked ? 1 : 0;
    }if (action === 'roundrobin') {
      this.roundrobin = checked ? 1 : 0;
    } if (action === 'manualassign') {
      this.manualassign = checked ? 1 : 0;
    } if (action === 'isadmin') {
      this.isadmin = checked ? 1 : 0;
    } if (action === 'assignspecificuser') {
      this.assignspecificuser = checked ? 1 : 0;
      console.log('assignspecificuser:', this.assignspecificuser);
    } 

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
          const data = response.autoaddition[0];
          console.log(data);

          this.contactowner = data.contactowner;
          this.assignagent = data.assignagent;
          this.broadcast = data.broadcast;
          this.roundrobin = data.roundrobin;
          this.conversationallowed = data.conversationallowed;
          this.manualassign = data.manualassign;
          this.assignuser = data.assignuser;
          this.timeoutperiod = data.timeoutperiod;
          this.isadmin = data.isadmin;
          this.assignspecificuser = data.assignspecificuser;
          this.selectuser = data.selectuser;

          
    });

  }

  saveRoutingRules() {
    this.routingRulesData.SP_ID = this.spId;
    this.routingRulesData.contactowner  = this.contactowner;
    this.routingRulesData.assignagent = this.assignagent;
    this.routingRulesData.broadcast = this.broadcast;
    this.routingRulesData.roundrobin = this.roundrobin;
    this.routingRulesData.conversationallowed = this.conversationallowed;
    this.routingRulesData.manualassign = this.manualassign;
    this.routingRulesData.assignuser = this.assignuser;
    this.routingRulesData.timeoutperiod = this.timeoutperiod;
    this.routingRulesData.isadmin = this.isadmin;
    this.routingRulesData.assignspecificuser = this.assignspecificuser;
    this.routingRulesData.selectuser = this.selectuser;


    this.apiService.saveRoutingRulesData(this.routingRulesData).subscribe(response=>{
      if(response.status === 200) {
        this.showToaster("Routing Rules Updated Successfully", "Success");
        this.getRoutingRules();
      }
    })

  }

}

    
  

