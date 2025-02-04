import { Component, OnInit } from '@angular/core';
import { campaignAlertUser,RolesData, campaignDataResponsePost, campaignFormData, workingData, workingDataResponsePost, workingFormData } from '../../models/settings.model';
import { isNullOrUndefined } from 'is-what';
import { SettingsService } from '../../services/settings.service';
import { FormGroup } from '@angular/forms';
declare var $:any;
@Component({
  selector: 'sb-campaign-settings',
  templateUrl: './campaign-settings.component.html',
  styleUrls: ['./campaign-settings.component.scss']
})
export class CampaignSettingsComponent implements OnInit {
  selectedTab:number = 1;
  daysList=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];


  dropdownSettings = {
    singleSelection: false,
    idField: 'day',
    textField: 'day',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3
};
workingData:campaignFormData[]=[];
sp_Id:number;
userList:any[] =[];
selectedUser:any[] =[];
isAlertUser:boolean= false;
alertUsers:any[] =[];
workingFormData:campaignFormData[]=[];
isSelected:any;
keywords: string[] = [];
roleName!:string;
roleData:any;
totalRights:any[]= [];
rolesList:any;
userDetailForm!:FormGroup;
isLoading!:boolean;
errorMessage = '';
successMessage = '';
warnMessage = '';
campaignAlertData:any;
campaignTestData:any;
  timming!: boolean;
  Testcampaign!: boolean;
  alertscamp!: boolean;

  constructor(public _settingsService:SettingsService,public settingsService:SettingsService) {
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
   }

  ngOnInit(): void {
    this.isLoading = true
    this.getUserList();
    this.getCampaignTimingList();
    this.getCampaignAlertData();
    this.getCampaignTestData();
  }

  removeKeyword(index: number): void {
    this.selectedUser.splice(index, 1);
  }
  addWorkingHours(){
    this.workingFormData.push({day:[],start_time:'',end_time:''})
  }
  campaignalerts(){
    this.alertscamp=!this.alertscamp;
  }
  closeUtility(){
    this.timming=false;
    this.Testcampaign=false;
    this.alertscamp=false;
  }
  testcamp(){
    this.Testcampaign=!this.Testcampaign;
  }
	stopPropagation(event: Event) {
    event.stopPropagation();
    }
  timinginfo(){
    this.timming=!this.timming;
  }
  manageWorkingHour(){
    this.workingFormData =[];
    if(isNullOrUndefined(this.workingData) || this.workingData.length==0)
    this.addWorkingHours();
    else
    this.workingFormData = this.workingData;    
  }

  getUserList(){
    this._settingsService.getUserList(this.sp_Id,1)
    .subscribe((result:any) =>{
      if(result){
        this.userList =result?.getUser;    
      }
  
    })
  }

  getCampaignAlertData(){
    this._settingsService.getCampaignData(this.sp_Id)
    .subscribe((result:any) =>{
      if(result){
        this.campaignAlertData = result?.getCampaignAlerts;  
      }  
    })
  }

  getCampaignTestData(){
    this._settingsService.getTestCampaignData(this.sp_Id)
    .subscribe((result:any) =>{
      this.isLoading = false;
      if(result){
        this.campaignTestData = result?.getCampaignTest; 

      }
  
    })
  }

  removeWorkingHours(index:any){
    this.workingFormData.splice(index,1);
  }
  getCampaignTimingList(){
    this._settingsService.getCampaignTimingList(this.sp_Id)
    .subscribe((result:any) =>{
      if(result){
        this.workingData = [];
        let timingData =result?.seletedCampaignTimings;  
        timingData.forEach((data:any)=>{
          let flag = false;
          this.workingData.forEach(item=>{
            if(data.start_time ==item?.start_time && data?.end_time ==item?.end_time){
              item.day.push(data.day);
              flag =  true;
            }
          })
          if(flag == false){
            let dayArr:string[] =[];
            dayArr.push(data.day);
            this.workingData.push({day:dayArr,start_time:data?.start_time,end_time:data?.end_time})
          }
        })

      }
  
    })
  }
  confirmTimiming(){
    $("#confirmModal").modal('show');
  }

  saveCampaignDetails(){
    let campaignResponse = this.copyCampaignTimingFormValues();
    this._settingsService.saveCampaignTiming(campaignResponse)
    .subscribe(result =>{
      if(result){
        this.getCampaignTimingList();
        $("#workingHourModal").modal('hide');

      }
    })
  }

  saveCampaignAlert(){
    let campaignAlertData= this.copyAlertUserValue();
    this._settingsService.updateCampaignData(campaignAlertData)
    .subscribe(result =>{
      if(result){
        this.getCampaignAlertData();
        this.selectedUser = [];
        $("#teamsModal").modal('hide');

      }
    })
  }

  saveCampaignTest(){
    let campaignAlertData= this.copyAlertUserValue();
    this._settingsService.updateCampaignTestData(campaignAlertData)
    .subscribe(result =>{
      if(result){
        this.getCampaignTestData();
        this.selectedUser = [];
        $("#teamsModal").modal('hide');

      }
    })
  }

  copyAlertUserValue(){
    let alertUserData :campaignAlertUser = <campaignAlertUser>{};
    alertUserData.SP_ID = this.sp_Id;
    alertUserData.uid =[];
    this.selectedUser.forEach((item)=>{
      if(item.isSelected)
      alertUserData.uid.push(item?.uid)
    })
    return alertUserData;
  }

  copyCampaignTimingFormValues(){
    let campaignResponse:campaignDataResponsePost = <campaignDataResponsePost>{};
    campaignResponse.sp_id = this.sp_Id; 
    campaignResponse.days = [];
    this.workingFormData.forEach(item=>{
      if(item.day?.length >0){
        campaignResponse.days.push(item);
      }
    });
    return campaignResponse;
  }

  setUserList(){
    this.selectedUser =[];
    this.userList.forEach((item:any)=>{
      this.selectedUser.push({uid:item.uid,isSelected:false,name:item.name,mobile_number:item?.registerPhone,UserType:item.UserType,emailId:item.email_id});
    })
  }

  selectUsers(data:[]){
    this.setUserList();
    this.selectedUser.forEach((item:any)=>{
      if(data.findIndex((idx:any) => idx.uid == item.uid) >-1)
      item.isSelected = true;
    });
  }

  searchData(srchText:string){
    this.alertUsers =[];
  }

  rowClicked = (event: any) => {
    this.roleData = event.data;
    this.roleName = this.roleData?.RoleName;
  };  

  copyRolesData(){
    let rolesData:RolesData =<RolesData>{};
    rolesData.SP_ID = this.sp_Id;
    rolesData.RoleName = this.roleName;
    rolesData.Privileges ='';
    let subRoles:any[]=[]
    this.totalRights.forEach(item=>{
      item.subRights.forEach((subitem:any)=>{
        if(subitem?.isSelected == true){
          subRoles.push(subitem?.id);
        }                                                                       
      })
    });
    rolesData.subPrivileges = subRoles.toString();
    return rolesData;
  
  }
  getSelectedRoles(): any[] {
    const selectedRoleID = this.userDetailForm.controls.UserType.value;
  
    const selectedRoles = this.rolesList.filter((item:any) => item.roleID === selectedRoleID);
  
    return selectedRoles;
  }
  getRolesList(){
    this._settingsService.getRolesList(this.sp_Id)
    .subscribe(result =>{
      if(result){
       this.rolesList = result?.getRoles;
        
      }
  
    })
  }

  getCheckedCount(){
    let val =  this.selectedUser.filter(item => item.isSelected == true);
    let length = this.isAlertUser ? 5 : 2;
    if(val.length == length)
    return true;
    else
    return false;
  }
  
  editCampaignAlertUser(){      
    this.isAlertUser = true;
    this.selectUsers(this.campaignAlertData);
  }

  
  editCampaignTestUser(){   
    this.isAlertUser = false;          
    this.selectUsers(this.campaignTestData);
  }

  showCountWarning(val:boolean){
    if(this.getCheckedCount() && val){
      this.showToaster(`! Only users ${this.isAlertUser ? '5' : '2'} can be selected`, 'error');   
    }
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

}
