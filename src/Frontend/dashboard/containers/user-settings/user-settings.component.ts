import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { UserData, rights } from '../../models/settings.model';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'sb-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  
  columnDefs:ColDef [] = [{field: 'uid', headerName: 'User Id', width: 70,  filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 }},
    {field: 'name', headerName: 'User Name', width: 150, filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 }},
    { field: 'email_id', headerName: 'Email Id', width: 170, filter: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 }, sortable: true, },
    { field: 'mobile_number', headerName: 'Phone No.', width: 110, filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 } },
    { field: 'UserType', headerName: 'Roles Assigned', width: 110,  filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 } },
    { field: 'IsActive', headerName: 'Current Status', width: 110,  filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 } },
    { field: 'age', headerName: 'Last Active', width: 110,  filter: true, sortable: true, cellStyle: { background: "#FBFAFF", opacity: 0.86 } },
  ];
public gridapi!:GridApi;
sp_Id:number;
rights!:rights[];
totalRights:any[]= [];
showSideBar:boolean=false;
roleName!:string;
selectedRoleId!:number;
userDetailForm!:FormGroup;
uid:number =0;
rolesList:any;
userList:any;
userListInIt:any;
userData:any;
isActive:any;


  constructor(private _settingsService:SettingsService) {
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
   }

   onGridReady(params: GridReadyEvent) {
    this.gridapi = params.api;
  }

  ngOnInit(): void {
    this.userDetailForm =this.prepareUserForm();
    this.getUserList();
    this.getRolesList();
    this.uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
  }

  rowClicked = (event: any) => {
    console.log(event);
    this.userData = event.data;
    this.showSideBar = true;
    this.uid = this.userData?.uid;
    this.isActive = this.userData
    this.patchFormValue();
  };  

  addUser(){
    this.uid;
    this.userDetailForm =this.prepareUserForm();
  }

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

  prepareUserForm(){
    return new FormGroup({
      email_id:new FormControl(),
      name:new FormControl(),
      mobile_number:new FormControl(),
      UserType:new FormControl()
    });
  }
  
getUserList(){
  this._settingsService.getUserList(this.sp_Id)
  .subscribe(result =>{
    if(result){
      this.userList =result?.getUser;
      this.userListInIt = result?.getUser;
      
    }

  })
}

getRolesList(){
  this._settingsService.getRolesList(this.sp_Id)
  .subscribe(result =>{
    if(result){
     this.rolesList = result?.getRoles;
      
    }

  })
}

  
saveRolesDetails(){
  let userData = this.copyUserData();
  this._settingsService.saveUserData(userData)
  .subscribe(result =>{
    if(result){
      this.getUserList();            
    }
  })
}

copyUserData(){
  let userData:UserData =<UserData>{};
  userData.SP_ID = this.sp_Id;
  userData.UserType = this.userDetailForm.controls.UserType.value;
  userData.email_id = this.userDetailForm.controls.email_id.value;
  userData.mobile_number = this.userDetailForm.controls.mobile_number.value;
  userData.name = this.userDetailForm.controls.name.value;
  userData.uid = this.uid;
  return userData;
}

patchFormValue(){
  const data = this.userData;
  for(let prop in data){
    let value = data[prop as keyof typeof data];
    if(this.userDetailForm.get(prop))
    this.userDetailForm.get(prop)?.setValue(value)
  }  
}

getRoleNameById(id:number){
let roleData = this.rolesList.filter((item:any)=>item.roleID == id)[0];
return roleData ? roleData.roleName : '';
}

deleteUser(){
  let userId = <any>{};
  userId.uid = this.uid
  this._settingsService.deleteUserData(userId)
  .subscribe(result =>{
    if(result){
      this.getUserList();
      this.showSideBar = false;
      
    }
  })
}
  
activeDeActiveUser(){
  let userData = <any>{};
  userData.uid = this.uid;
  userData.IsActive = this.isActive;
  this._settingsService.activeUser(userData)
  .subscribe(result =>{
    if(result){
      this.getUserList();            
    }
  })
}

searchUserData(srchText:string){
  this.userList =[];
  this.userListInIt.forEach((item:any) =>{
    if(item.name.includes(srchText) || item.email_id.includes(srchText) || item.mobile_number.includes(srchText))
    this.userList.push(item);
  })
}


}
