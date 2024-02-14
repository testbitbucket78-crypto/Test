import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { UserData, rights } from '../../models/settings.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
declare var $: any;

@Component({
    selector: 'sb-user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
    columnDefs: ColDef[] | any = [
        {
            field: 'uid',
            headerName: 'User Id',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'name',
            headerName: 'User Name',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'email_id',
            headerName: 'Email Id',
            flex: 2,
            resizable: true,
            filter: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            sortable: true,
        },
        {
            field: 'mobile_number',
            headerName: 'Phone No.',
            flex: 2,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'UserType',
            headerName: 'Roles Assigned',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'IsActive',
            headerName: 'Current Status',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            valueFormatter: (value:any) => {
                  return value.value == 1 ? 'Active' : 'In Active';
              },
        },
        {
            field: 'age',
            headerName: 'Last Active',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
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
    
    constructor(private _settingsService: SettingsService) {
        this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
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
            this.userData = event.data;
            this.showSideBar = true;
            this.uid = this.userData?.uid;
            console.log(this.uid);
            this.isActive = this.userData.IsActive == 1 ? false : true ;
            this.patchFormValue();
        }
    };    

    gridOptions:any = {
        rowSelection: 'multiple',
        rowHeight: 48,
        headerHeight: 50,
        suppressRowClickSelection: true,
        groupSelectsChildren: true,
        onRowClicked: this.rowClicked,
        noRowsOverlay: true,
        pagination: true,
        paginationPageSize: 15,
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
                Validators.pattern(/^[a-zA-Z.-]+(?:\s+[a-zA-Z.-]+)*$/),
                Validators.minLength(2),
              ]),
            mobile_number: new FormControl(null,[Validators.required]),
            UserType: new FormControl([Validators.required]),
        });
    }
    getUserList() {
        this._settingsService.getUserList(this.sp_Id).subscribe(result => {
            if (result) {
                this.userList = result?.getUser;
                this.userListInIt = result?.getUser;
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
            this._settingsService.saveUserData(userData).subscribe(result => {
                if (result) {
                    this.userDetailForm.reset();
                    $('#userModal').modal('hide');
                    this.getUserList();
                }
             });
            }
        else {
            this._settingsService.editUserData(userData).subscribe(result => {
                if (result) {
                    this.userDetailForm.reset();
                    $('#userModal').modal('hide');
                    this.showSideBar = false;
                    this.getUserList();
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
        userData.name = this.userDetailForm.controls.name.value;
        userData.uid = this.uid;
        return userData;
    }

    patchFormValue() {
        const data = this.userData;
        this.selectedUserData =data;
        console.log(this.searchUserData)
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

    activeDeActiveUser() {
        let userData = <any>{};
        userData.uid = this.uid;
        userData.isActive = this.isActive? 2 : 0;
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
}
