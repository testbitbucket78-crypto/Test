import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SettingsService } from '../../services/settings.service';
import { RolesData, rights } from '../../models/settings.model';
import * as agGrid from 'ag-grid-community';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $:any;

@Component({
    selector: 'sb-roles-settings',
    templateUrl: './roles-settings.component.html',
    styleUrls: ['./roles-settings.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class RolesSettingsComponent implements OnInit {
    columnDefs: ColDef[] = [
        {
            field: 'roleID',
            headerName: 'ID',
            width:100,
            suppressSizeToFit: false,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'RoleName',
            headerName: 'Roles',
            filter: true,
            width:200,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'rights',
            headerName: 'Rights',
            width:200,
            suppressSizeToFit: false,
            resizable: true,
            filter: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            sortable: true,
        },
        {
            field: 'NoOfUser',
            headerName: 'No. of Users',
            width:100,
            suppressSizeToFit: false,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'created_at',
            headerName: 'Last Modified',
            width:200,
            suppressSizeToFit: false,
            resizable: true,
            filter: true,
            sortable: true,
            valueFormatter: this.dateFormatter,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
    ];
    public gridapi!: GridApi;
    sp_Id: number;
    userList: number[] = [];
    rights!: rights[];
    totalRights: any[] = [];
    showSideBar: boolean = false;
    roleName!: string;
    selectedRoleId!: number;
    rolesList: any;
    rolesListinit: any;
    subRightRes:[]=[];
    roleData: any;
    subPrivileges: any;
    selectedSubRights =[];
    Rights!: number;
    spid!:number;
    rolesData: RolesData = <RolesData>{};
    myForm!: FormGroup;
    

    constructor(private _settingsService: SettingsService,private fb: FormBuilder) {
        this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
    }

    ngOnInit(): void {
        this.getRolesList();
        this.getSubRightsList();
        this.getRightsList();
        this.myForm = this.fb.group({
            roleName: ['', Validators.required],
          });
    }

    rowClicked = (event: any) => {
        console.log(event);
        this.roleData = event.data;
        this.subPrivileges = this.roleData?.subPrivileges?.split(',');
        this.showSideBar = true;
        this.myForm.controls.roleName.setValue(this.roleData?.RoleName);
        this.selectedRoleId = this.roleData?.roleID;
        this.setSelectedSubRights();
        this.getSubRights();
        this.userType();
    };

    gridOptions: any = {
        rowSelection: 'multiple',
        rowHeight: 48,
        headerHeight: 50,
        suppressRowClickSelection: true,
        groupSelectsChildren: true,
        suppressDragLeaveHidesColumns: true,
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

    onGridReady(params: GridReadyEvent) {
        this.gridapi = params.api;
    }

    dateFormatter(params: any) {
        const date = new Date(params.value);
        const options:{} = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-IN', options);
      }

    getRolesList() {
        this._settingsService.getRolesList(this.sp_Id).subscribe(result => {
            if (result) {
                this.rolesList = result?.getRoles;
                this.rolesListinit = result?.getRoles;
                this.gridOptions.api.sizeColumnsToFit();
                
            }
        });
    }

    getRightsList() {
        this._settingsService.getRightsList().subscribe(result => {
            if (result) {
                this.rights = result?.Rights;
                this.Rights = this.rights?.length;
                console.log(this.Rights);
                setTimeout(()=>{this.setRightsAccSubRights();},30)
                
            }
        });
    }

    getSubRightsList() {
        this._settingsService.getSubRightsList().subscribe(result => {
            if (result) {
                this.subRightRes = result?.subRightRes
                console.log(this.subRightRes);
            }
        });
    }
    userType() {
        this._settingsService.getrolesdata(this.sp_Id,this.selectedRoleId).subscribe(result => {
            if (result) {
                this.userList = result.getUser;
                
            }
        });
    }
  

    addRole() {
        this.selectedRoleId = 0;
        this.myForm.controls.roleName.setValue('');
        this.resetSubRights();
    }

    setRightsAccSubRights() {
        for (let i = 0; i < this.rights.length; i++) {
            this.totalRights.push({
                rightId: this.rights[i].id,
                rightName: this.rights[i].rightsName,
                subRights: [],
            });
            this.subRightRes.forEach((item: any) => {
                if (item.rightsID == this.rights[i]?.id) {
                    this.totalRights[this.totalRights?.length - 1].subRights.push({
                        id: item?.id,
                        rightsID: item?.rightsID,
                        subRights: item?.subRights,
                        isSelected: false,
                    });
                }
            });
        }
        console.log(this.totalRights);
    }

    saveRolesDetails() {
        if(this.myForm.valid){
            
        let roleData = this.copyRolesData();
        this._settingsService.saveRolesData(roleData).subscribe(result => {
            if (result) {
                this.getRolesList();
                $('#rolesModal').modal('hide');
                this.showSideBar = false;
            }
        });
    } else{
        this.myForm.markAllAsTouched();
    }
    }

    editRolesDetails(){
        $('#rolesModal').modal('show');

    }

    deleteRole() {
        this._settingsService
            .deleteRolesData(this.sp_Id, this.roleData?.roleID)
            .subscribe(result => {
                if (result) {
                    this.getRolesList();
                    this.showSideBar = false;
                    $('#deleteModal').modal('hide');
                }
            });
    }

    copyRolesData() {
        let rolesData: RolesData = <RolesData>{};
        rolesData.SP_ID = this.sp_Id;
        rolesData.RoleName = this.myForm.controls.roleName.value;
        rolesData.roleID = this.selectedRoleId;
        rolesData.Privileges = '';
        let subRoles: any[] = [];
        this.totalRights.forEach(item => {
            item.subRights.forEach((subitem: any) => {
                if (subitem?.isSelected == true) {
                    subRoles.push(subitem?.id);
                }
            });
        });
        rolesData.subPrivileges = subRoles.toString();
        return rolesData;
    }

    setSelectedSubRights() {
        this.resetSubRights();
        let rightsSelected: number[] = this.roleData.subPrivileges.split(',');
        this.totalRights.forEach(item => {
            item.subRights.forEach((subitem: any) => {
                if (rightsSelected.findIndex(item => item == subitem?.id) > -1)
                    subitem.isSelected = true;
            });
        });
    }

    resetSubRights() {
        this.totalRights.forEach(item => {
            item.subRights.forEach((subitem: any) => {
                subitem.isSelected = false;
            });
        });
    }

    searchData(srchText: string) {
        this.gridOptions.api.setQuickFilter(srchText);
        // this.rolesList = [];
        // console.log(srchText)
        // if(srchText !=''){
        //     this.rolesListinit.forEach((item: any) => {
        //         if (item.RoleName.includes(srchText)){
        //             this.rolesList.push(item);
        //         } 
        //     });
        // } else{
        //     this.rolesList = this.rolesListinit;
        // }
        
    }

    getSubRights(){
     //   this.subRightRes
     this.selectedSubRights = [];
        this.subPrivileges.forEach((idx:any)=>{
           let val = this.subRightRes.filter((item:any)=> item.id == Number(idx));
           console.log(val);
           if(val[0])
           this.selectedSubRights.push(val[0]);
        });
        console.log(this.selectedSubRights);
    }

}
