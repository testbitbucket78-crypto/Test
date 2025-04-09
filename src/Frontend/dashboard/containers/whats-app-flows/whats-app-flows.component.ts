import { Component, OnInit } from '@angular/core';
import { GridService } from '../../services/ag-grid.service';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';

@Component({
  selector: 'sb-whats-app-flows',
  templateUrl: './whats-app-flows.component.html',
  styleUrls: ['./whats-app-flows.component.scss']
})
export class WhatsAppFlowsComponent implements OnInit {

   columnDefs: ColDef[] | any = [
    {
      headerName: '',
        headerTooltip: 'Actions',
        width: 70,
        editable: false,
        resizable: false,
        filter: false,
        sortable: false,
        cellRenderer: this.actionsCellRenderer.bind(this),
    },
          {
              field: 'name',
              headerName: 'Flow Name',
              width:430,
              suppressSizeToFit: false,
              resizable: true,
              sortable: true,
              cellStyle: { background: '#FBFAFF', opacity: 0.86 },
          },
          {
              field: 'id',
              headerName: 'Flow Id',
              width:230,
              suppressSizeToFit: false,
              resizable: true,
              cellStyle: { background: '#FBFAFF', opacity: 0.86 },
              sortable: true,
          },
          {
              field: 'status',
              headerName: 'Status',
              width:200,
              suppressSizeToFit: false,
              resizable: true,
              sortable: true,
              cellStyle: { background: '#FBFAFF', opacity: 0.86 },
          },
          {
              field: 'responses',
              headerName: 'Responses',
              width:160,
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

    flowList: any;
    initflowList: any;
    spId:number;
    isShowDetails:boolean = false;
    flowId:number = 0;
    flowName:string = '';
    channelSelected: string = '';
    channelPhoneNumber: string = '';
    channelOption:any;
    ShowAssignOption:boolean = false;
   
  constructor( public GridService: GridService,public settingsService: SettingsService){
    this.spId = Number(sessionStorage.getItem('SP_ID'));
  }

  ngOnInit(): void {
    this.getFlowList();
    this.getWhatsAppDetails();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridapi = params.api;
  }

  rowClicked = (event: any) => {

this.isShowDetails = true;
    this.flowId = event.data?.id;
    this.flowName = event.data?.name;
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

actionsCellRenderer(params: any) {
  const element = params.data;
  const buttonsHtml = `
    <img
      style="margin-left: -3px; cursor: pointer;" class="delete-button"      
      height="15px"
      width="15px"
      src="/../../assets/img/preview-svgrepo-com.svg"
      alt=""
    />  
  `;
  const div = document.createElement('div');
  div.innerHTML = buttonsHtml;
  //div.addEventListener('click', this.onButtonClick.bind(this, element));
  return div;
}

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

getFlowList() {
  this.settingsService.getFlowData(55).subscribe((response: any) => {
      if (response) {
          console.log(response);
          this.initflowList =  response?.flows;
          this.flowList =  response?.flows;
          this.getGridPageSize();
      }
  });
}

	
getWhatsAppDetails() {
  this.settingsService.getWhatsAppDetails(this.spId)
  .subscribe((response:any) =>{
   if(response){
     if (response && response?.whatsAppDetails) {
      this.channelOption = response?.whatsAppDetails.map((item : any)=> ({
        value: item?.id,
        label: item?.channel_id,
        connected_id: item?.connected_id,
        channel_status: item?.channel_status
      }));

      if(this.channelOption.length == 1){
        this.channelSelected = this.channelOption[0].label;
        this.channelPhoneNumber = this.channelOption[0].connected_id;

      }
      }
   }
   })
 }

 updateDropdown(id: string) {
  const selectedChannel = this.channelOption.find((channel: any)=> channel.connected_id === id);
  if (selectedChannel) {
    this.channelSelected = selectedChannel.label;
  }
  this.ShowAssignOption =false;
  }

  onFilterChange(event: any) {
    const selectedValue = event.target.value;
    if(selectedValue != 'all') {
    this.flowList = this.initflowList.filter((item: any) => {
      return item.status === selectedValue;
    });
  }else{
    this.flowList = this.initflowList;
  }
}

}
