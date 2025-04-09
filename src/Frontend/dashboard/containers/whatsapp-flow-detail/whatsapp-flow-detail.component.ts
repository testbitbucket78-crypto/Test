import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GridService } from '../../services/ag-grid.service';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { TeamboxService } from 'Frontend/dashboard/services/teambox.service';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'sb-whatsapp-flow-detail',
  templateUrl: './whatsapp-flow-detail.component.html',
  styleUrls: ['./whatsapp-flow-detail.component.scss']
})
export class WhatsappFlowDetailComponent {

  @Input() flowId: any;
  @Input() flowName: string ='';
  @Output() closeFlowDetail = new EventEmitter<string>();

    columnDefs: ColDef[] | any = [
            {
                field: 'name',
                headerName: 'Flow Name',
                width:200,
                suppressSizeToFit: false,
                resizable: true,
                sortable: true,
                cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            },
            {
                field: 'flowId',
                headerName: 'Flow Id',
                width:160,
                suppressSizeToFit: false,
                resizable: true,
                cellStyle: { background: '#FBFAFF', opacity: 0.86 },
                sortable: true,
            },
            {
                field: 'status',
                headerName: 'Status',
                width:150,
                suppressSizeToFit: false,
                resizable: true,
                sortable: true,
                cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            },
            {
                field: 'response',
                headerName: 'Responses',
                width:130,
                suppressSizeToFit: false,
                resizable: true,
                sortable: true,
                cellStyle: { background: '#FBFAFF', opacity: 0.86 },
            }
        ];
        public gridapi!: GridApi;
        paginationPageSize: string = '10';
      currPage: any = 10;
      totalPage: any;
      paging: any = 1;
      lastElementOfPage: any;
  
      flowList: any =[];
      rowData: any =[];
      attributesList: any =[];  
      filteredCustomFields: any =[];
      spId:number;
      ColumnMapping:any =[];
      initColumnMapping:any =[];
       data: Record<string, string>[] = [
        {
          flow_token: "<FLOW_TOKEN>",
          optional_param1: "<value1>"
        },
        {
          flow_token: "<ANOTHER_FLOW_TOKEN>",
          optional_param2: "<value2>",
          extra_param: "<extra_value>"
        },
        {
          optional_param1: "<value3>",
          optional_param2: "<value4>"
        },
        {
          flow_token: "<FLOW_TOKEN_3>",
          optional_param1: "<value5>",
          optional_param3: "<value6>"
        }
      ];

      types:string[] =['Text','Number','Select','Switch','Date','Time','Multi Select' ];

    constructor( public GridService: GridService, private _teamboxService: TeamboxService,public settingsService: SettingsService){
      this.spId = Number(sessionStorage.getItem('SP_ID'));  
    }
  
    ngOnInit(): void {
      this.getAttributeList();
      this.getFlowDetail();
      this.extractUniqueKeys(this.data);
      //this.setEverything();
    }
  
    onGridReady(params: GridReadyEvent) {
      this.gridapi = params.api;
    }
    
  gridOptions:any = {
    rowSelection: 'multiple',
    rowHeight: 48,
    headerHeight: 50,
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
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
  
  
    onFilterTextBoxChange() {
      const searchInput = document.getElementById('Search-Ag') as HTMLInputElement;
      const searchTerm = searchInput.value.trim().toLowerCase();
      this.gridapi.setQuickFilter(searchTerm);
      // this.contacts = this.rowData.filter((contact: any) => contact.Name.toLowerCase().includes(searchTerm));
      // this.setPaging()
    }
  
    onFocus() {
      const searchInput = document.querySelector('.search-container')
      if (searchInput)
        searchInput.classList.add('focused');
    }
  
    onBlur() {
      const searchInput = document.querySelector('.search-container')
      if (searchInput)
        searchInput.classList.remove('focused');
    }
  
    setPaging() {
      this.getGridPageSize();
  }
  
  getGridPageSize() {
      setTimeout(() => {
          this.GridService.onChangePageSize(this.paginationPageSize, this.gridapi, this.flowList);
          this.paging = this.GridService.paging;
      }, 50)
  }
  
  onBtNext() { 
      this.GridService.onBtNext(this.gridapi, this.flowList);
      this.currPage = this.GridService.currPage;
      this.paging = this.GridService.paging;
  
  }
  
  onBtPrevious() {
      this.GridService.onBtPrevious(this.gridapi, this.flowList);
      this.currPage = this.GridService.currPage;
      this.paging = this.GridService.paging;
  
  }
  
  gotoPage(page: any) {
      this.GridService.gotoPage(page, this.gridapi, this.flowList)
  }

  getAttributeList() {
    this._teamboxService.getAttributeList(this.spId).subscribe((response: any) => {
        if (response) {
            let attributeListData = response?.result;
            this.attributesList = attributeListData;
            this.attributesList.forEach((item:any)=>{
              item.isSelected= false;
              })
            console.log(this.attributesList, '----attributesList----'); 
        }
    });
}


getFlowDetail() {
  this.settingsService.getFlowDetail(55,this.flowId).subscribe((response: any) => {
      if (response) {
          this.flowList =  response?.flows;
          this.getGridPageSize();
      }
  });
}

saveFlowMapping() {
  let data = {
    spId: this.spId,
    mapping: this.ColumnMapping,
    flowId: this.flowId,
  }
  this.settingsService.saveFlowMapping(data).subscribe((response: any) => {
      if (response) {
          this.flowList =  response?.flows;
          this.getGridPageSize();
      }
  });
}

onSelectMapping(){
  this.attributesList.forEach((item:any)=>{ 
    this.ColumnMapping.forEach((mapping:any)=>{
      if(item.ActuallName == mapping.attributeMapped){
        item.isSelected = true;
        return;
      } else{
        item.isSelected = false;
      }
    })
  });
}

SaveEditColumn(){
this.initColumnMapping = this.ColumnMapping;
}

extractUniqueKeys(arr: any[]){
  const uniqueKeys = new Set<string>();
  arr.forEach((obj:any) => {
    Object.keys(obj).forEach(key => uniqueKeys.add(key));
  });
  this.filteredCustomFields = Array.from(uniqueKeys);
  console.log(this.filteredCustomFields)
  this.createMapping();
};

createMapping(){
  let mappingList:any[] =[];
  this.filteredCustomFields.forEach((item:any)=>{
    let mapping = {
      displayName: item,
      ActuallName: item,
      type: 'String',
      attributeMapped:'',
      isOverride: false,
      isInputSelected: false,
    }
    mappingList.push(mapping);
  })
  this.ColumnMapping = mappingList;
  this.initColumnMapping = mappingList;
  this.getfilteredCustomFields();
}

    getfilteredCustomFields() {
      if(this.ColumnMapping.length > 0){ 
        console.log(this.ColumnMapping, '----ColumnMapping----');        
            this.ColumnMapping.forEach((item:any)=>{
  
              let columnDesc:any = {
                field: item.ActuallName,
              headerName: item.displayName,
              flex: 2, 
              hide:false,
              resizable: true,
              minWidth: 100,
              sortable: true,
              cellStyle: { background: "#FBFAFF", opacity: 0.86 },
              }             
              // if(item.type == 'Date'){
              //   columnDesc.valueFormatter= this.dateFormatter.bind(this);
              // }
              // if(item.type == 'Time'){
              //   columnDesc.valueFormatter= this.timeFormatter.bind(this);
              // }
              this.columnDefs.push(columnDesc);
            })
          }  
            setTimeout(()=>{
              if (this.gridOptions?.api) {
                this.gridOptions?.api.sizeColumnsToFit();
              }
            },50);
    }

  closeFlowDetailComponent() {
    this.closeFlowDetail.emit(' ');
  }

closeModal(){
  this.ColumnMapping = this.initColumnMapping;
}
  onSelectEditing(idx:number){
    if(this.ColumnMapping[idx]?.isInputSelected)
    this.ColumnMapping[idx].displayName = this.ColumnMapping[idx]?.ActuallName;
    this.ColumnMapping[idx].type = '';
  }
}
