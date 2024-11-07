import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ColDef, GridApi, GridReadyEvent, CellStyle, CellClassParams } from 'ag-grid-community';
import { SettingsService } from '../../services/settings.service';
import { RolesData, rights } from '../../models/settings.model';
import * as agGrid from 'ag-grid-community';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridService } from '../../services/ag-grid.service';
import { DatePipe } from '@angular/common';
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
            field: 'RoleName',
            headerName: 'Role Name',
            width:200,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            cellClass:this.cellStyle
        //    cellStyle: params => {
        //     if (params.value > 70000) {
        //       return { color: 'red', fontWeight: 'bold' };
        //     } else if (params.value > 50000) {
        //       return { color: 'orange' };
        //     } else {
        //       return { color: 'green' };
        //     }
        //   }
        },
        {
            field: 'rights',
            headerName: 'No. of Rights',
            width:120,
            suppressSizeToFit: false,
            resizable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            sortable: true,
        },
        {
            field: 'NoOfUser',
            headerName: 'No. of Users',
            width:200,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            cellStyle: { background: '#FBFAFF', opacity: 0.86 },
        },
        {
            field: 'created_at',
            headerName: 'Last Modified',
            width:200,
            suppressSizeToFit: false,
            resizable: true,
            sortable: true,
            valueFormatter:  this.dateFormatter.bind(this),
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
    subRightsArrowRotate: boolean = false;
    usersArrowRotate: boolean = false;
    successMessage='';
    errorMessage='';
    warningMessage='';
    paginationPageSize: string = "10";
    currPage: any = 10;
    totalPage: any;
    paging: any = 1;
    lastElementOfPage: any;
    isLoading!:boolean;
    disabledRights=[7,22,23,24,25,28,29,30,46,47,48];
    constructor(public _settingsService: SettingsService,public settingsService: SettingsService,private datePipe:DatePipe, private fb: FormBuilder, public GridService: GridService) {
        this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.getRolesList();
        this.getSubRightsList();
        this.getRightsList();
        this.myForm = this.fb.group({
            roleName: ['', Validators.required],
          });
    }

    cellStyle(params: agGrid.CellClassParams):string {
            if (params.value=='Admin' || params.value=='Agent') { 
                params.data.created_at = ''       
                return 'purpelCellStyle';
            } else {
                return 'defaultCellStyle';
            }
      }

    rowClicked = (event: any) => {
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
        suppressPaginationPanel: true,
        overlayNoRowsTemplate:
            '<span style="padding: 10px; background-color: #FBFAFF; box-shadow: 0px 0px 14px #695F972E;">No rows to show</span>',
        overlayLoadingTemplate:
            '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
    };

    onGridReady(params: GridReadyEvent) {
        this.gridapi = params.api;
    }

    dateFormatter(params: any): string {
        const date = new Date(params.value);
        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        const formattedDate = this.datePipe.transform(date, this._settingsService.dateFormat);
        return formattedDate ? formattedDate : '';
    }

    getRolesList() {
        this._settingsService.getRolesList(this.sp_Id).subscribe(result => {
            this.isLoading = false;
            if (result) {
                this.rolesList = result?.getRoles;
                this.rolesListinit = result?.getRoles;
                this.gridOptions.api.sizeColumnsToFit();
                this.getGridPageSize()
               
            }
        });
    }

    getRightsList() {
        this._settingsService.getRightsList().subscribe(result => {
            if (result) {
                this.rights = result?.Rights;
                this.Rights = this.rights?.length;
                setTimeout(()=>{this.setRightsAccSubRights();},30)
                
            }
        });
    }

    getSubRightsList() {
        this._settingsService.getSubRightsList().subscribe(result => {
            if (result) {
                this.subRightRes = result?.subRightRes
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
                        accessRight: item?.accessRight
                    });
                }
            });
        }
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
        },
					async (error) => {
					  if (error.status === 409) {
						this.showToaster('error','Role name already exist. Please Try another name');

					  }
                    }
        );
    } else{
        this.myForm.markAllAsTouched();
    }
    }

    editRolesDetails(){
        if(this.roleData?.RoleName != 'Admin' && this.roleData?.RoleName != 'Agent'){
        $('#rolesModal').modal('show');
        this.showSideBar = false;
        } else{
            this.showToaster('error','You cannot edit/delete these default roles.');
        }

    }

    deleteRolesDetails(){
        if(this.roleData?.RoleName != 'Admin' && this.roleData?.RoleName != 'Agent'){
        $('#deleteModal').modal('show');
        this.showSideBar = false;
        }else{
            this.showToaster('error','You cannot edit/delete these default roles.');
        }

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
        rolesData.RoleName = this.settingsService.trimText(this.myForm.controls.roleName.value);
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
        this.setPaging()
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
     this.selectedSubRights = [];
        this.subPrivileges.forEach((idx:any)=>{
           let val = this.subRightRes.filter((item:any)=> item.id == Number(idx));

           if(val[0])
           this.selectedSubRights.push(val[0]);
        });
    }

    onToggleSubRights(isShown: boolean) {
        this.subRightsArrowRotate = isShown;
    }
    onToggleUser(isShown: boolean) {
        this.usersArrowRotate = isShown;
    }

    resetArrowState(isReset: boolean) {
        this.subRightsArrowRotate = isReset;
        this.usersArrowRotate = isReset;
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
        this.GridService.onBtNext(this.gridapi, this.rolesList);
        this.currPage = this.GridService.currPage;
        this.paging = this.GridService.paging;

    }

    onBtPrevious() {
        this.GridService.onBtPrevious(this.gridapi, this.rolesList);
        this.currPage = this.GridService.currPage;
        this.paging = this.GridService.paging;

    }

    gotoPage(page: any) {
        this.GridService.gotoPage(page, this.gridapi, this.rolesList)
    }


    checkRole(){
        if(this.roleData?.RoleName == 'Admin' || this.roleData?.RoleName == 'Agent'){
            this.showToaster('error','You cannot edit/delete these default roles');
        }
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

      stopPropagation(event:any){
        if (this.roleData?.RoleName === 'Admin' || this.roleData?.RoleName === 'Agent') {
            event.stopPropagation();
          }
      }

      getDisableRight(subRight:any,index:any){
        if(this.disabledRights.includes(subRight?.id)){
            return true;
        } else if(subRight.accessRight == 1){
            let subrights =this.totalRights[index].subRights.filter((item:any)=>item.isSelected == true);
            if(subrights.length>1 && subRight?.isSelected)
                return true;
            else
                return false;
        } else return false;
      }

      setFirstRight(index:any,event:any){
        if(event.target.checked){
            let idx = this.totalRights[index].subRights.findIndex((item:any)=> item.accessRight == 1);
            if(idx >-1)
                this.totalRights[index].subRights[idx].isSelected = true;
        }
      }
}
