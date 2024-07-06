import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { UserData, rights } from '../../models/settings.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { DatePipe } from '@angular/common';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { GridService } from '../../services/ag-grid.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
declare var $: any;

@Component({
    selector: 'sb-user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
    columnDefs: ColDef[] | any = [
        // {
        //     field: 'uid',
        //     headerName: 'User Id',
        //     width:100,
        //     suppressSizeToFit: false,
        //     resizable: true,
        //     filter: true,
        //     sortable: true,
        //     cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        // },
        {
            field: 'name',
            headerName: 'User Name',
            width:200,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            // cellRenderer: (params) => `<img style="height: 14px; width: 14px" src=${params.data.avatar} />`,
            cellRenderer: (params: { data: { name: any; };
            }) =>`<div class="user-imgs"><div class="img">${this.getInitials(params.data.name)}</div>${params.data.name ? params.data.name : ''}</div>`,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'email_id',
            headerName: 'Email Id',
            width:160,
            suppressSizeToFit: false,
            resizable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            sortable: true,
        },
        {
            field: 'mobile_number',
            headerName: 'Phone No.',
            width:150,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'RoleName',
            headerName: 'Role',
            width:130,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'IsActive',
            headerName: 'Status',
            width:130,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            valueFormatter: (value:any) => {
                  return value.value == 1 ? 'Active'  : value.value == 0 ? 'In Active' : value.value == 3 ?'Invited' : 'Disabled';
              },
        },
        // {
        //     field: 'LastLogIn',
        //     headerName: 'Last Active',
        //     width:200,
        //     suppressSizeToFit: false,
        //     resizable: false,
        //     filter: true,
        //     sortable: true,
        //     cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        //     valueFormatter: (value:any) => {
        //         if (value?.value && new Date(value.value).toString() != 'Invalid Date') {
        //             const date = new Date(value.value);      
        //             return this.datepipe.transform(date, "dd-MMM-yyyy hh:mm a");
        //           }
        //           else {
        //             return 'N/A';
        //           }
        //       },
        // },
    ];
    public gridapi!: GridApi;
    sp_Id: number;
    rights!: rights[];
    totalRights: any[] = [];
    showSideBar: boolean = false;
    roleName!: string;
    selectedRoleId!: number;
    userDetailForm!: FormGroup;
    uid:any;
    rolesList: any;
    userList: any;
    userListInIt: any;
    userData: any;
    isActive: boolean = false;
    filteredRolesList: any[] = [];
    selectedUserData: any;
    countryCodes:string[] =[];
    title: string = '';
    btnActionName: string = '';
    paginationPageSize: string = '10';
    currPage: any = 10;
    totalPage: any;
    paging: any = 1;
    lastElementOfPage: any;
    successMessage = '';
    errorMessage = '';
    warningMessage = '';
    login_uid:any;
    constructor(private _settingsService: SettingsService, private datepipe: DatePipe, public GridService: GridService) {
        this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
        this.login_uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid;        
        this.countryCodes = this._settingsService.countryCodes;
    }

    onGridReady(params: GridReadyEvent) {
        this.gridapi = params.api;
    }

    ngOnInit(): void {
        this.userDetailForm = this.prepareUserForm();
        this.getUserList();
        this.getRolesList(); 
        console.log(this.uid);
    }

    rowClicked = (event: any) => {
        console.log(event);
    
        if (this.showSideBar && this.userData && this.uid) {
            this.userData = null;
            this.showSideBar = false;
            this.uid = null;
            this.selectedUserData = null;
            this.patchFormValue();
        } else {
            this.showSideBar = true;
            this.uid = event.data?.uid;
            console.log(this.uid);
            this.isActive = event.data.IsActive == 2 ? true : false ;
            this.getUserById();
        }
    };    

    gridOptions:any = {
        rowSelection: 'multiple',
        rowHeight: 48,
        headerHeight: 50,
        suppressRowClickSelection: true,
        groupSelectsChildren: true,
        onRowClicked: this.rowClicked,
        suppressDragLeaveHidesColumns: true,
        noRowsOverlay: true,
        pagination: true,
        paginationPageSize: 15,
        suppressPaginationPanel: true,
        paginateChildRows: true,
        overlayNoRowsTemplate:
            '<span style="padding: 10px; background-color: #FBFAFF; box-shadow: 0px 0px 14px #695F972E;">No rows to show</span>',
        overlayLoadingTemplate:
            '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
    };

    prepareUserForm() {
        return new FormGroup({
            email_id: new FormControl('', [Validators.required, Validators.email]),
            name: new FormControl('',[
                Validators.required,
              //  Validators.pattern(/^[a-zA-Z.-]+(?:\s+[a-zA-Z.-]+)*$/),
                Validators.minLength(2),
              ]),
            mobile_number: new FormControl(null,[Validators.required]),
            country_code: new FormControl(['IN +91']),
            display_mobile_number:new FormControl('', Validators.compose([Validators.required, Validators.minLength(6),Validators.maxLength(15)])),
            UserType: new FormControl('',[Validators.required]),
        });
    }
    getUserList() {
        this._settingsService.getUserList(this.sp_Id).subscribe(result => {
            if (result) {
                let userData = result?.getUser.filter((item:any)=> item.uid != this.login_uid);
                this.userList =userData;
                this.userListInIt =userData;
                this.gridOptions.api.sizeColumnsToFit();
                this.getGridPageSize();
            }
        });
    }

    getUserById() {
        this._settingsService.userById(this.sp_Id,this.uid).subscribe(result => {
            if (result) {
                this.userData = result?.getUser[0];
                if(result?.getUser.length>1){
                    for(let i =1;i<result?.getUser.length; i++){
                        this.userData.team_name = this.userData.team_name +', ' + result?.getUser[i]?.team_name;
                    }
                }
                this.patchFormValue();
            }
        });
    }

    getRolesList() {
        this._settingsService.getRolesList(this.sp_Id).subscribe(result => {
            if (result) {
                this.rolesList = result?.getRoles;
            }
        });
    }

    addEditUserDetails() {
        if(this.userDetailForm.valid){
        let userData = this.copyUserData();

       if(isNullOrUndefined(this.selectedUserData)) {
            this._settingsService.saveUserData(userData).pipe(
                catchError((error) => {
                    console.log('abcd');
                    console.log(error?.msg);
                    this.showToaster('error',error?.error?.msg);
                    return of(null);  
                })
              )
            .subscribe((result:any) => {
                if (result) {
                    if(result?.status == 200){
                    this.userDetailForm.reset();
                    $('#userModal').modal('hide');
                    this.getUserList();
                    } else{
                        this.showToaster('error',result?.msg);
                    }
                }
             });
            }
        else {
            this._settingsService.editUserData(userData).pipe(
                catchError((error) => {
                    console.log('abcd');
                    console.log(error);
                    this.showToaster('error',error?.error?.msg);
                    return of(null);  
                })
              )
            .subscribe(result => {
                if (result) {
                    if(result?.status == 200){
                    this.userDetailForm.reset();
                    $('#userModal').modal('hide');
                    this.showSideBar = false;
                    this.getUserList();
                } else{
                    this.showToaster('error',result?.msg);
                }
                }
            });
        } 
    }else{
        this.userDetailForm.markAllAsTouched();
    }
     }

    copyUserData() {
        let userData: UserData = <UserData>{};
        userData.SP_ID = this.sp_Id;
        userData.UserType = this.userDetailForm.controls.UserType.value;
        userData.email_id = this.userDetailForm.controls.email_id.value;
        userData.mobile_number = this.userDetailForm.controls.mobile_number.value;
        userData.display_mobile_number = this.userDetailForm.controls.display_mobile_number.value;
        userData.country_code = this.userDetailForm.controls.country_code.value;
        userData.name = this.userDetailForm.controls.name.value;
        userData.uid = this.uid;
        userData.role = this.rolesList.filter((item:any)=> item.roleID ==this.userDetailForm.controls.UserType.value)[0].RoleName;
        return userData;
    }

    patchFormValue() {
        const data = this.userData;
        this.selectedUserData =data;
        console.log(this.userData)
        for (let prop in data) {
            let value = data[prop as keyof typeof data];
            if (this.userDetailForm.get(prop)) this.userDetailForm.get(prop)?.setValue(value);
        }
    }

    getRoleNameById(id: number) {
        let roleData = this.rolesList.filter((item: any) => item.roleID == id)[0];
        return roleData ? roleData.roleName : '';
    }

    deleteUser() {
        let userId = <any>{};
        userId.uid = this.uid;
        this._settingsService.deleteUserData(userId).subscribe(result => {
            if (result) {
                this.getUserList();
                this.showSideBar = false;
            }
        });
    }

    checkboxState(checkboxDisable: boolean) {
        this.title = `Do you really want to ${this.isActive ? 'Enable' : 'disable'} this User`;
        this.btnActionName = `Yes, ${this.isActive ? 'Enable' : 'Disable'}`;
        this.isActive = !this.isActive;
    }
    activeDeActiveUser() {
        let userData = <any>{};
        userData.uid = this.uid;
        userData.isActive = this.isActive? 2 : 1;
        this.userData.IsActive = this.isActive? 2 : 1;        
        this._settingsService.activeUser(userData).subscribe(result => {
            if (result) {
                this.getUserList();
            }
        });
    }

    searchUserData(srchText: string) {        
        this.gridOptions.api.setQuickFilter(srchText);
    }

    createUser(){
        this.userDetailForm = this.prepareUserForm();
        this.uid = 0;
        this.selectedUserData = null;
    }

    formatPhoneNumber() {
        let phoneNumber = this.userDetailForm.get('display_mobile_number')?.value;
        let countryCode = this.userDetailForm.get('country_code')?.value;
      
        if (phoneNumber && countryCode) {
          let phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
          let formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);
      
          if (formattedPhoneNumber) {
            this.userDetailForm.get('mobile_number')?.setValue(formattedPhoneNumber.formatInternational().replace(/[\s+]/g, ''));
          }
        }
        }

    getFirstName(name:any){
        const nameParts = name?.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts[1] || '';
        let firstLetterFirstName = firstName.charAt(0) || '';
        let firstLetterLastName = lastName.charAt(0) || '';
        return firstLetterFirstName + firstLetterLastName;
    }

    getInitials(name:any){
        let intials ='';
        if(name){
          let words = name.split(' ');
          let inti = words[0][0] + (words[1] ? (words[1].trim())[0] :'');
          intials =inti;
        }else{
          intials ='';
        }

        return intials;
    }
    setPaging() {
        this.getGridPageSize();
    }

    getGridPageSize() {
        setTimeout(() => {
            this.GridService.onChangePageSize(this.paginationPageSize, this.gridapi, this.rolesList);
            this.paging = this.GridService.paging;
        }, 50)
    }

    onBtNext() {
        debugger;
        this.GridService.onBtNext(this.gridapi, this.userList);
        this.currPage = this.GridService.currPage;
        this.paging = this.GridService.paging;

    }

    onBtPrevious() {
        this.GridService.onBtPrevious(this.gridapi, this.userList);
        this.currPage = this.GridService.currPage;
        this.paging = this.GridService.paging;

    }

    gotoPage(page: any) {
        this.GridService.gotoPage(page, this.gridapi, this.userList)
    }
      

showToaster(type:any,message:any){
    if(type=='success'){
      this.successMessage=message;
    }else if(type=='error'){
      this.errorMessage=message;
    }else{
      this.warningMessage=message;
    }
    setTimeout(() => {
      this.hideToaster()
    }, 5000);
    
  }
  hideToaster(){
    this.successMessage='';
    this.errorMessage='';
    this.warningMessage='';
  }
}
