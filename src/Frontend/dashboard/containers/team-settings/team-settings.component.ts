import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SettingsService } from '../../services/settings.service';
import { TeamData, userTeamDropDown } from '../../models/settings.model';
declare var $:any;

@Component({
    selector: 'sb-team-settings',
    templateUrl: './team-settings.component.html',
    styleUrls: ['./team-settings.component.scss'],
})
export class TeamSettingsComponent implements OnInit {
    columnDefs: ColDef[] = [
        {
            field: 'id',
            headerName: 'Id',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'team_name',
            headerName: 'Team Name',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'users_count',
            headerName: 'No. of Users',
            flex: 1,
            resizable: true,
            filter: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            sortable: true,
        },
        {
            field: 'updated_at',
            headerName: 'Last Modified',
            flex: 1,
            resizable: true,
            filter: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
    ];
    public gridapi!: GridApi;
    sp_Id: number;
    userList: any[] = [];
    selectedUser: userTeamDropDown[] = [];
    showSideBar: boolean = false;
    teamName!: string;
    selectedTeamId: number = 0;
    teamList: any;
    teamListInit: any;
    teamData: any;
    profilePicture!: string;
    Id!: number;
    users_count!: number;

    constructor(private _settingsService: SettingsService) {
        this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
    }

    ngOnInit(): void {
        this.getTeamList();
        this.getUserList();
        this.profilePicture = JSON.parse(sessionStorage.getItem('loginDetails')!).profile_img;
    }

    rowClicked = (event: any) => {
        console.log(event);
        this.teamData = event.data;
        this.showSideBar = true;
        this.teamName = this.teamData?.team_name;
        this.selectedTeamId = this.teamData?.id;
        this.selectUsers();
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

    onGridReady(params: GridReadyEvent) {
        this.gridapi = params.api;
    }

    getTeamList() {
        this._settingsService.getTeamList(this.sp_Id).subscribe((result: any) => {
            if (result) {
                this.teamList = result?.listofteams;
                this.setTeamData();
            }
        });
    }

    getUserList() {
        this._settingsService.getUserList(this.sp_Id).subscribe((result: any) => {
            if (result) {
                this.userList = result?.getUser;
                this.users_count = this.selectedUser?.length;
                console.log(this.users_count);
                this.setUserList();
            }
        });
    }

    setUserList() {
        this.selectedUser = [];
        this.userList.forEach((item: any) => {
            this.selectedUser.push({
                uid: item.uid,
                isSelected: false,
                name: item.name,
                profile_img: item.profile_img,
            });
        });
    }

    selectUsers() {
        this.setUserList();
        this.selectedUser.forEach((item: any) => {
            if (this.teamData.uid.includes(item.uid)) item.isSelected = true;
        });
    }

    saveTeamDetails() {
        let teamData = this.copyTeamsData();

        if (this.selectedTeamId == 0) {
            this._settingsService.saveTeamData(teamData).subscribe(result => {
                if (result) {
                    this.getTeamList();
                    $('#teamsModal').modal('hide');
                }
            });
        } else {
            this._settingsService.editTeam(teamData).subscribe(result => {
                if (result) {
                    this.getTeamList();
                    $('#teamsModal').modal('hide');
                }
            });
        }
    }

    deleteTeam() {
        let teamId = <any>{};
        teamId.id = this.selectedTeamId;
        teamId.SP_ID = this.sp_Id;
        this._settingsService.deleteTeamData(teamId).subscribe(result => {
            if (result) {
                this.getTeamList();
                this.showSideBar = false;
                $('#deleteModal').modal('hide');
            }
        });
    }
    copyTeamsData() {
        let teamData: TeamData = <TeamData>{};
        teamData.SP_ID = this.sp_Id;
        teamData.team_name = this.teamName;
        teamData.userIDs = [];
        teamData.id = this.selectedTeamId; // Set the team ID


        // Populate userIDs based on your logic
        this.selectedUser.forEach((item: any) => {
            if (item.isSelected == true){
                teamData.userIDs.push(item.uid);
            } 
        });

        return teamData;
    }

    setTeamData() {
        let teamList2: any = [];
        this.teamList.forEach((item: any) => {
            let idx = teamList2.findIndex((i: any) => i.id == item.id);
            if (idx > -1) {
                if (teamList2[idx]?.uid?.length) {
                    teamList2[idx]?.uid.push(item.uid);
                }
            } else {
                let uids = item.uid;
                item.uid = [];
                item.uid.push(uids);
                teamList2.push(item);
            }
        });
        this.teamList = JSON.parse(JSON.stringify(teamList2));
        this.teamListInit = JSON.parse(JSON.stringify(teamList2));
    }

    searchUserData(srchText: string) {        
        this.gridOptions.api.setQuickFilter(srchText);
    }

    addTeam() {
        this.selectedTeamId = 0;
        this.teamName ='';
        this.selectedUser.forEach((item: any) => {
            item.isSelected = false;
        })
        console.log(this.selectedUser);
    }
}
