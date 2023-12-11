import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SettingsService } from '../../services/settings.service';
import { TeamData, userTeamDropDown } from '../../models/settings.model';
declare var $:any;

@Component({
  selector: 'sb-team-settings',
  templateUrl: './team-settings.component.html',
  styleUrls: ['./team-settings.component.scss']
})
export class TeamSettingsComponent implements OnInit {

  columnDefs:ColDef [] = [{field: 'id', headerName: 'Id', width: 110, filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 }},
    {field: 'team_name', headerName: 'Team Name', width: 300, filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 }},
    { field: 'users_count', headerName: 'No. of Users', width: 170, filter: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 }, sortable: true, },
    { field: 'updated_at', headerName: 'Last Modified', width: 270,filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 } }];
public gridapi!:GridApi;
sp_Id:number;
userList:any[] =[];
selectedUser:userTeamDropDown[]= [];
showSideBar:boolean=false;
teamName!:string;
selectedTeamId!:number;
teamList:any;
teamListInit:any;
teamData:any;
profilePicture!:string;


  constructor(private _settingsService:SettingsService) {
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
   }

  ngOnInit(): void {
    this.getTeamList();
    this.getUserList();
    this.profilePicture = (JSON.parse(sessionStorage.getItem('loginDetails')!)).profile_img;

  }

  rowClicked = (event: any) => {
    console.log(event);
    this.teamData = event.data;
    this.showSideBar = true;
    this.teamName = this.teamData?.team_name;
    this.selectedTeamId = this.teamData?.id;
    this.selectUsers();
  };  

gridOptions = {rowSelection: 'multiple',
  rowHeight: 48,
  headerHeight: 50,
  suppressRowClickSelection: true,
  groupSelectsChildren: true,
  onRowClicked: this.rowClicked,
  noRowsOverlay:true,
  pagination: true,
  paginationAutoPageSize: true,
  paginateChildRows:true,
  overlayNoRowsTemplate: '<span style="padding: 10px; background-color: #FBFAFF; box-shadow: 0px 0px 14px #695F972E;">No rows to show</span>',
  overlayLoadingTemplate:'<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
};

onGridReady(params: GridReadyEvent) {
  this.gridapi = params.api;
}

getTeamList(){
  this._settingsService.getTeamList(this.sp_Id)
  .subscribe((result:any) =>{
    if(result){
     this.teamList = result?.listofteams;
    this.setTeamData();
    }

  })
}


getUserList(){
  this._settingsService.getUserList(this.sp_Id)
  .subscribe((result:any) =>{
    if(result){
      this.userList =result?.getUser;     
      this.setUserList(); 
    }

  })
}

setUserList(){
  this.selectedUser =[];
  this.userList.forEach((item:any)=>{
    this.selectedUser.push({uid:item.uid,isSelected:false,name:item.name,profile_img:item.profile_img});
  })
}

selectUsers(){
  this.setUserList();
  this.selectedUser.forEach((item:any)=>{
    if(this.teamData.uid.includes(item.uid))
    item.isSelected = true;
  });
}



saveTeamDetails(){
  let teamData = this.copyTeamsData();
  this._settingsService.saveTeamData(teamData)
  .subscribe(result =>{
    if(result){
      this.getTeamList();      
      $("#teamsModal").modal('hide');
      
    }
  })
}

deleteTeam(){
  let teamId = <any>{};
  teamId.id = this.teamData?.id;
  teamId.SP_ID = this.sp_Id;
  this._settingsService.deleteTeamData(teamId)
  .subscribe(result =>{
    if(result){
      this.getTeamList();
      this.showSideBar = false;
      $("#deleteModal").modal('hide');
    }
  })
}

copyTeamsData(){
  let teamData:TeamData =<TeamData>{};
  teamData.SP_ID = this.sp_Id;
  teamData.team_name = this.teamName;
  teamData.userIDs = [];
  this.selectedUser.forEach((item:any)=>{
    if(item.isSelected == true)
    teamData.userIDs.push(item.uid);
  })
  return teamData;

}


setTeamData(){
  let teamList2:any =[];
  this.teamList.forEach((item:any) =>{
    let idx  = teamList2.findIndex((i:any) => i.id == item.id);
    if(idx >-1){    
      if(teamList2[idx]?.uid?.length) {
        teamList2[idx]?.uid.push(item.uid);
      }
    }else{
      let uids =item.uid;
      item.uid = [];
      item.uid.push(uids);
      teamList2.push(item);
    }
  })
  this.teamList = JSON.parse(JSON.stringify(teamList2));
  this.teamListInit = JSON.parse(JSON.stringify(teamList2));
}


searchUserData(srchText:string){
  this.teamList =[];
  this.teamListInit.forEach((item:any) =>{
    if(item.team_name.includes(srchText))
    this.teamList.push(item);
  })
}

addRole() {
  
}

}
