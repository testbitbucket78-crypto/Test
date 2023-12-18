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
    roleData: any;
    Rights!: number;

    constructor(private _settingsService: SettingsService) {
        this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
    }

    ngOnInit(): void {
        this.getRolesList();
        this.getRightsList();
        this.getSubRightsList();
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
                console.log(result);
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

    subRightRes = [
        {
            id: 1,
            rightsID: 1,
            subRights: 'Access Dashboard summary content',
            isDeleted: 0,
            created_at: '2023-06-16T06:19:06.000Z',
            updated_at: null,
        },
        {
            id: 2,
            rightsID: 2,
            subRights: 'Access Contacts section',
            isDeleted: 0,
            created_at: '2023-06-16T06:20:02.000Z',
            updated_at: null,
        },
        {
            id: 3,
            rightsID: 2,
            subRights: 'View contact details (from other places also if access is allowed)',
            isDeleted: 0,
            created_at: '2023-06-16T06:21:23.000Z',
            updated_at: null,
        },
        {
            id: 4,
            rightsID: 2,
            subRights: 'Create or add new contact',
            isDeleted: 0,
            created_at: '2023-06-16T06:21:57.000Z',
            updated_at: null,
        },
        {
            id: 5,
            rightsID: 2,
            subRights: 'Edit and Delete own contacts (user is contact owner)',
            isDeleted: 0,
            created_at: '2023-06-16T06:22:20.000Z',
            updated_at: null,
        },
        {
            id: 6,
            rightsID: 2,
            subRights: 'Edit and Delete others contacts (user is not contact owner)',
            isDeleted: 0,
            created_at: '2023-06-16T06:22:55.000Z',
            updated_at: null,
        },
        {
            id: 7,
            rightsID: 2,
            subRights: 'Allow ownership change of own contacts to others',
            isDeleted: 0,
            created_at: '2023-06-16T06:23:17.000Z',
            updated_at: null,
        },
        {
            id: 8,
            rightsID: 2,
            subRights: 'Allow ownership change of others contacts to anyone',
            isDeleted: 0,
            created_at: '2023-06-16T06:24:00.000Z',
            updated_at: null,
        },
        {
            id: 9,
            rightsID: 2,
            subRights: 'Bulk Import, Export and Delete',
            isDeleted: 0,
            created_at: '2023-06-16T06:24:21.000Z',
            updated_at: null,
        },
        {
            id: 10,
            rightsID: 2,
            subRights: 'View, Create, Edit & Delete Saved Lists',
            isDeleted: 0,
            created_at: '2023-06-16T06:24:41.000Z',
            updated_at: null,
        },
        {
            id: 11,
            rightsID: 3,
            subRights: 'Access Teambox section',
            isDeleted: 0,
            created_at: '2023-06-16T06:25:40.000Z',
            updated_at: null,
        },
        {
            id: 12,
            rightsID: 3,
            subRights:
                'View unassigned conversations, assigned to me (open and my resolved), assigned to my team as a whole and where I am mentioned in notes',
            isDeleted: 0,
            created_at: '2023-06-16T06:26:26.000Z',
            updated_at: null,
        },
        {
            id: 13,
            rightsID: 3,
            subRights:
                'View conversations assigned to any member in my team (open and resolved by them)',
            isDeleted: 0,
            created_at: '2023-06-16T07:51:35.000Z',
            updated_at: null,
        },
        {
            id: 14,
            rightsID: 3,
            subRights:
                'View conversations assigned to any member in any team (open and resolved by them)',
            isDeleted: 0,
            created_at: '2023-06-16T07:52:06.000Z',
            updated_at: null,
        },
        {
            id: 15,
            rightsID: 3,
            subRights: 'View any contact and initiate conversation',
            isDeleted: 0,
            created_at: '2023-06-16T07:52:28.000Z',
            updated_at: null,
        },
        {
            id: 16,
            rightsID: 3,
            subRights: 'Create new contact, and Delete contact',
            isDeleted: 0,
            created_at: '2023-06-16T07:52:51.000Z',
            updated_at: null,
        },
        {
            id: 17,
            rightsID: 3,
            subRights: 'Block/Unblock Contact',
            isDeleted: 0,
            created_at: '2023-06-16T07:53:34.000Z',
            updated_at: null,
        },
        {
            id: 18,
            rightsID: 3,
            subRights: 'Edit Contact (update tags, custom attributes, message opt-in, etc)',
            isDeleted: 0,
            created_at: '2023-06-16T07:54:01.000Z',
            updated_at: null,
        },
        {
            id: 19,
            rightsID: 3,
            subRights: 'Send template messages',
            isDeleted: 0,
            created_at: '2023-06-16T07:54:25.000Z',
            updated_at: null,
        },
        {
            id: 20,
            rightsID: 3,
            subRights: 'Unassign an assigned conversation for anyone',
            isDeleted: 0,
            created_at: '2023-06-16T07:54:47.000Z',
            updated_at: null,
        },
        {
            id: 21,
            rightsID: 3,
            subRights: 'Assign unassigned conversations to self',
            isDeleted: 0,
            created_at: '2023-06-16T07:55:23.000Z',
            updated_at: null,
        },
        {
            id: 22,
            rightsID: 3,
            subRights: 'Assign my conversation to others',
            isDeleted: 0,
            created_at: '2023-06-16T07:55:45.000Z',
            updated_at: null,
        },
        {
            id: 23,
            rightsID: 3,
            subRights: 'Assign unassigned conversations to others',
            isDeleted: 0,
            created_at: '2023-06-16T07:56:08.000Z',
            updated_at: null,
        },
        {
            id: 24,
            rightsID: 3,
            subRights: 'Assign others conversations to anyone',
            isDeleted: 0,
            created_at: '2023-06-16T07:57:24.000Z',
            updated_at: null,
        },
        {
            id: 25,
            rightsID: 4,
            subRights: 'View Campaigns',
            isDeleted: 0,
            created_at: '2023-06-16T07:57:52.000Z',
            updated_at: null,
        },
        {
            id: 26,
            rightsID: 4,
            subRights: 'Create, Edit & Delete Campaigns',
            isDeleted: 0,
            created_at: '2023-06-16T07:58:26.000Z',
            updated_at: null,
        },
        {
            id: 27,
            rightsID: 5,
            subRights: 'View Funnels',
            isDeleted: 0,
            created_at: '2023-06-16T07:58:54.000Z',
            updated_at: null,
        },
        {
            id: 28,
            rightsID: 5,
            subRights: 'Create, Edit & Delete Funnels',
            isDeleted: 0,
            created_at: '2023-06-16T07:59:13.000Z',
            updated_at: null,
        },
        {
            id: 29,
            rightsID: 6,
            subRights: 'View Flows',
            isDeleted: 0,
            created_at: '2023-06-16T07:59:35.000Z',
            updated_at: null,
        },
        {
            id: 30,
            rightsID: 6,
            subRights: 'Create, Edit & Delete Flows',
            isDeleted: 0,
            created_at: '2023-06-16T08:00:08.000Z',
            updated_at: null,
        },
        {
            id: 31,
            rightsID: 7,
            subRights: 'View Smart Replies',
            isDeleted: 0,
            created_at: '2023-06-16T08:00:36.000Z',
            updated_at: null,
        },
        {
            id: 32,
            rightsID: 7,
            subRights: 'Create, Edit & Delete Smart Replies',
            isDeleted: 0,
            created_at: '2023-06-16T08:01:01.000Z',
            updated_at: null,
        },
        {
            id: 33,
            rightsID: 8,
            subRights: 'View, apply filters & export',
            isDeleted: 0,
            created_at: '2023-06-16T08:01:32.000Z',
            updated_at: null,
        },
        {
            id: 34,
            rightsID: 9,
            subRights: 'View, apply filters & export',
            isDeleted: 0,
            created_at: '2023-06-16T08:01:58.000Z',
            updated_at: null,
        },
        {
            id: 35,
            rightsID: 10,
            subRights: 'View, apply filters & export',
            isDeleted: 0,
            created_at: '2023-06-16T08:02:15.000Z',
            updated_at: null,
        },
        {
            id: 36,
            rightsID: 11,
            subRights: 'Default Actions',
            isDeleted: 0,
            created_at: '2023-06-16T08:02:42.000Z',
            updated_at: null,
        },
        {
            id: 37,
            rightsID: 11,
            subRights: 'Inbox Notification',
            isDeleted: 0,
            created_at: '2023-06-16T08:03:06.000Z',
            updated_at: null,
        },
        {
            id: 38,
            rightsID: 11,
            subRights: 'Manage Storage',
            isDeleted: 0,
            created_at: '2023-06-16T08:03:31.000Z',
            updated_at: null,
        },
        {
            id: 39,
            rightsID: 12,
            subRights: 'Business Profile & Set Working Hours ',
            isDeleted: 0,
            created_at: '2023-06-16T08:04:04.000Z',
            updated_at: null,
        },
        {
            id: 40,
            rightsID: 12,
            subRights: 'View, Create, Edit & Delete Roles, Teams and Users',
            isDeleted: 0,
            created_at: '2023-06-16T08:04:32.000Z',
            updated_at: null,
        },
        {
            id: 41,
            rightsID: 13,
            subRights: 'Manage Channels',
            isDeleted: 0,
            created_at: '2023-06-16T08:05:16.000Z',
            updated_at: null,
        },
        {
            id: 42,
            rightsID: 13,
            subRights: 'Manage API tokens',
            isDeleted: 0,
            created_at: '2023-06-16T08:05:38.000Z',
            updated_at: null,
        },
        {
            id: 43,
            rightsID: 13,
            subRights: 'Integrations',
            isDeleted: 0,
            created_at: '2023-06-16T08:05:55.000Z',
            updated_at: null,
        },
        {
            id: 44,
            rightsID: 14,
            subRights: 'View, Create, Edit & Delete Attributes',
            isDeleted: 0,
            created_at: '2023-06-16T08:06:20.000Z',
            updated_at: null,
        },
        {
            id: 45,
            rightsID: 14,
            subRights: 'View, Create, Edit & Delete Tags',
            isDeleted: 0,
            created_at: '2023-06-16T08:06:52.000Z',
            updated_at: null,
        },
        {
            id: 46,
            rightsID: 15,
            subRights: 'View and Edit Routing Plans',
            isDeleted: 0,
            created_at: '2023-06-16T08:07:24.000Z',
            updated_at: null,
        },
        {
            id: 47,
            rightsID: 15,
            subRights: 'View, Create, Edit & Delete Quick Response',
            isDeleted: 0,
            created_at: '2023-06-16T08:07:45.000Z',
            updated_at: null,
        },
        {
            id: 48,
            rightsID: 16,
            subRights: 'Set campaign timing, alerts and test numbers',
            isDeleted: 0,
            created_at: '2023-06-16T08:08:18.000Z',
            updated_at: null,
        },
        {
            id: 49,
            rightsID: 16,
            subRights: 'View, Create, Edit & Delete Template messages',
            isDeleted: 0,
            created_at: '2023-06-16T08:08:43.000Z',
            updated_at: null,
        },
        {
            id: 50,
            rightsID: 17,
            subRights: 'Edit & update profile and Password',
            isDeleted: 0,
            created_at: '2023-06-16T08:09:12.000Z',
            updated_at: null,
        },
        {
            id: 51,
            rightsID: 17,
            subRights: 'Manage wallet, subscription plans and usage history',
            isDeleted: 0,
            created_at: '2023-06-16T08:09:40.000Z',
            updated_at: null,
        },
    ];
}
