import { Component, OnInit } from '@angular/core';
import { campaignAlertUser,RolesData, campaignDataResponsePost, campaignFormData, workingData, workingDataResponsePost, workingFormData } from '../../models/settings.model';
import { isNullOrUndefined } from 'is-what';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'sb-campaign-settings',
  templateUrl: './campaign-settings.component.html',
  styleUrls: ['./campaign-settings.component.scss']
})
export class CampaignSettingsComponent implements OnInit {
  selectedTab:number = 1;
  daysList=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  //daysList=[{day:'Monday',isDisabled: false},{day:'Tuesday',isDisabled: false},{day:'Wednesday',isDisabled: false},{day:'thursday',isDisabled: false},{day:'Friday',isDisabled: false},{day:'Saturday',isDisabled: false},{day:'Saturday',isDisabled: false}];
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
alertUsers:any[] =[];
workingFormData:campaignFormData[]=[];
isSelected:any;
keywords: string[] = [];
roleName!:string;
roleData:any;
totalRights:any[]= [];



campaignAlertData:any;
campaignTestData:any;

  constructor(private _settingsService:SettingsService) {
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
   }

  ngOnInit(): void {
    this.getUserList();
    this.getCampaignTimingList();
    this.getCampaignAlertData();
  }

  removeKeyword(index: number): void {
    this.selectedUser.splice(index, 1);
  }
  addWorkingHours(){
    this.workingFormData.push({day:[],start_time:'',end_time:''})
  }


  manageWorkingHour(){
    this.workingFormData =[];
    if(isNullOrUndefined(this.workingData) || this.workingData.length==0)
    this.addWorkingHours();
    else
    this.workingFormData = this.workingData;    
  }

  getUserList(){
    this._settingsService.getUserListData(this.sp_Id)
    .subscribe((result:any) =>{
      if(result){
        this.userList =result?.userlist;    
      }
  
    })
  }

  getCampaignAlertData(){
    this._settingsService.getCampaignData(this.sp_Id)
    .subscribe((result:any) =>{
      if(result){
        this.campaignAlertData = result?.getCampaignAlerts;        
        this.selectUsers();
        console.log(result);
      }
  
    })
  }

  getCampaignTestData(){
    this._settingsService.getTestCampaignData(this.sp_Id)
    .subscribe((result:any) =>{
      if(result){
        this.campaignTestData = result?.getCampaignAlerts;        
        this.selectUsers();
        console.log(result);
      }
  
    })
  }

  getCampaignTimingList(){
    this._settingsService.getCampaignTimingList(this.sp_Id)
    .subscribe((result:any) =>{
      if(result){
        let timingData =result?.seletedCampaignTimings;  
        timingData.forEach((data:any)=>{
          let flag = false;
          this.workingData.forEach(item=>{
            if(data.start_time ==item.start_time && data.end_time ==item.end_time){
              item.day.push(data.day);
              flag =  true;
            }
          })
          if(flag == false){
            let dayArr:string[] =[];
            dayArr.push(data.day);
            this.workingData.push({day:dayArr,start_time:data.start_time,end_time:data.end_time})
          }
        })
        console.log(this.workingData);
      }
  
    })
  }

  saveCampaignDetails(){
    let campaignResponse = this.copyCampaignTimingFormValues();
    this._settingsService.saveCampaignTiming(campaignResponse)
    .subscribe(result =>{
      if(result){
        console.log(result);
        this.getCampaignTimingList();
        //this.workingData = result?.result;
      }
    })
  }

  saveCampaignAlert(){
    let campaignAlertData= this.copyAlertUserValue();
    this._settingsService.updateCampaignData(campaignAlertData)
    .subscribe(result =>{
      if(result){
        console.log(result);
        this.getCampaignAlertData();
        //this.workingData = result?.result;
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
    campaignResponse.days = this.workingFormData;    
    return campaignResponse;
  }

  setUserList(){
    this.selectedUser =[];
    this.userList.forEach((item:any)=>{
      this.selectedUser.push({uid:item.uid,isSelected:false,name:item.name,mobile_number:item.mobile_number,UserType:item.UserType,emailId:item.email_id});
    })
  }

  selectUsers(){
    this.setUserList();
    this.selectedUser.forEach((item:any)=>{
      if(this.campaignAlertData.findIndex((idx:any) => idx.uid == item.uid) >-1)
      item.isSelected = true;
    });
  }

  searchData(srchText:string){
    this.alertUsers =[];
    // this.rolesListinit.forEach((item:any) =>{
    //   if(item.RoleName.includes(srchText))
    //   this.rolesList.push(item);
    // })
  }

  rowClicked = (event: any) => {
    console.log(event);
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
  
}
