import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SettingsService } from '../../services/settings.service';
import { RolesData, rights } from '../../models/settings.model';
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
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'RoleName',
            headerName: 'Roles',
            filter: true,
            flex: 1,
            resizable: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'optRights',
            headerName: 'Rights',
            flex: 1,
            resizable: true,
            filter: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            sortable: true,
        },
        {
            field: 'users_count',
            headerName: 'No. of Users',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'created_at',
            headerName: 'Last Modified',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            valueFormatter: this.dateFormatter,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
    ];
    public gridapi!: GridApi;
    sp_Id: number;
    userList: number[] = [1, 1, 2, 3, 4, 5, 6, 7];
    rights!: rights[];
    totalRights: any[] = [];
    showSideBar: boolean = false;
    roleName!: string;
    selectedRoleId!: number;
    rolesList: any;
    rolesListinit: any;
    subRightRes:[]=[];
    roleData: any;
    Rights!: number;
    spid!:number;
    rolesData: RolesData = <RolesData>{};
    

    constructor(private _settingsService: SettingsService) {
        this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
    }

    ngOnInit(): void {
        this.getRolesList();
        this.getRightsList();
        this.getSubRightsList();
        this.userType();
    }

    rowClicked = (event: any) => {
        console.log(event);
        this.roleData = event.data;
        this.showSideBar = true;
        this.roleName = this.roleData?.RoleName;
        this.selectedRoleId = this.roleData?.roleID;
        this.setSelectedSubRights();
    };

    gridOptions = {
        rowSelection: 'multiple',
        rowHeight: 48,
        headerHeight: 50,
        suppressRowClickSelection: true,
        groupSelectsChildren: true,
        onRowClicked: this.rowClicked,
        noRowsOverlay: true,
        pagination: true,
        paginationAutoPageSize: true,
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
                
            }
        });
    }

    getRightsList() {
        this._settingsService.getRightsList().subscribe(result => {
            if (result) {
                this.rights = result?.Rights;
                this.Rights = this.rights?.length;
                console.log(this.Rights);
                this.setRightsAccSubRights();
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
        this._settingsService.getrolesdata(this.spid,this.userType).subscribe(result => {
            if (result) {
                console.log(this.subRightRes);
            }
        });
    }
  

    addRole() {
        this.selectedRoleId = 0;
        this.roleName = '';
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
        let roleData = this.copyRolesData();
        this._settingsService.saveRolesData(roleData).subscribe(result => {
            if (result) {
                this.getRolesList();
                $('#rolesModal').modal('hide');
            }
        });
    }

    deleteRole() {
        this._settingsService
            .deleteRolesData(this.sp_Id, this.roleData?.roleID)
            .subscribe(result => {
                if (result) {
                    this.getRolesList();
                    this.showSideBar = false;
                }
            });
    }

    copyRolesData() {
        let rolesData: RolesData = <RolesData>{};
        rolesData.SP_ID = this.sp_Id;
        rolesData.RoleName = this.roleName;
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
        this.rolesList = [];
        this.rolesListinit.forEach((item: any) => {
            if (item.RoleName.includes(srchText)) this.rolesList.push(item);
        });
    }

}
