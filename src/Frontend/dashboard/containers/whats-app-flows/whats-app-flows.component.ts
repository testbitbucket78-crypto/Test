import { Component, OnInit } from '@angular/core';
import { GridService } from '../../services/ag-grid.service';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { integer } from 'aws-sdk/clients/cloudfront';

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
              field: 'flowname',
              headerName: 'Flow Name',
              width:430,
              suppressSizeToFit: false,
              resizable: true,
              sortable: true,
              cellStyle: { background: '#FBFAFF', opacity: 0.86 },
          },
          {
              field: 'flowid',
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
    isFilterApplied:boolean = false;
    initflowList: any;
    spId:number;
    isShowDetails:boolean = false;
    flowId:number = 0;
    flowName:string = '';
    mapping: any = {};
    channelSelected: string = '';
    channelPhoneNumber: string = '';
    channelOption:any;
    ShowAssignOption:boolean = false;
    isLoading:boolean = false;    
        successMessage = '';
    errorMessage = '';
    warningMessage = '';
	 modalReference: any;
    // <option value="PUBLISHED">PUBLISHED</option>
    //                 <option value="DRAFT">DRAFT</option>
    //                 <option value="DEPRECATED">DEPRECATED</option>
    //                 <option value="BLOCKED">BLOCKED</option>
    //                 <option value="THROTTLED">THROTTLED</option>
    flowfilter:any[] = [
      {label:'PUBLISHED',checked:false},
      {label:'DRAFT',checked:false},
      {label:'DEPRECATED',checked:false},
      {label:'BLOCKED',checked:false},
      {label:'THROTTLED',checked:false},
    ]
    initflowfliter:any =[];
   
  constructor( public GridService: GridService,public settingsService: SettingsService, private modalService: NgbModal){
    this.spId = Number(sessionStorage.getItem('SP_ID'));
  }

  ngOnInit(): void {    
  this.isLoading = true;
    this.getFlowList();
    this.getWhatsAppDetails();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridapi = params.api;
  }

  rowClicked = (event: any) => {
// if(event.data?.responses > 0){
this.isShowDetails = true;
    this.flowId = event.data?.flowid;
    this.flowName = event.data?.flowname;
    this.mapping = JSON.parse(event.data?.col_Mapping || '{}');
// } else{
//   this.showToaster('error', 'There is no responce')
// }
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
  div.addEventListener('click', this.onButtonClick.bind(this, element));
  return div;
}


onButtonClick(data:any, event: any) {
  console.log(data,'---------data-------------');
 this.creatWhatsAppFlow(true,data?.flowid)
}







  onFilterTextBoxChange(srchText:any) {
    // const searchInput = document.getElementById('Search-Ag') as HTMLInputElement;
    // const searchTerm = srchText.value.trim().toLowerCase();
    this.gridapi.setQuickFilter(srchText);
    //this.flowList = this.rowData.filter((contact: any) => contact.Name.toLowerCase().includes(searchTerm));
    this.setPaging();
  }

  	toggleAssignOption(){
		this.ShowAssignOption =!this.ShowAssignOption
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
         this.onBtFirst();
    }, 50)
}

    onBtFirst(){
      this.GridService.onBtFirst(this.gridapi, this.flowList);
        this.currPage = this.GridService.currPage;
        this.paging = this.GridService.paging;
       // this.getContact();
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
  this.settingsService.getFlowData(this.spId).subscribe((response: any) => {
      if (response) {     
          console.log(response);
          this.initflowList =  response?.flows;
          this.flowList =  response?.flows;
          this.getGridPageSize();   
  setTimeout(() => {
    this.isLoading = false;
  }, 100); 
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
    if(selectedValue != 'All') {
    this.flowList = this.initflowList.filter((item: any) => {
      return item.status == selectedValue;
    });
  }else{
    this.flowList = this.initflowList;
  }
}

    onFilterChanged() {
        setTimeout(() => {
            const rowCount = this.gridOptions.api.getModel().getRowCount();
            if (rowCount === 0) {
                this.gridapi.showNoRowsOverlay();
            } else {
                this.gridapi.hideOverlay();
            }
        }, 100);
    }

    creatWhatsAppFlow(preview:boolean=false,flowid:any){
      let data ={
        spId:this.spId,
        flowId:flowid,
        isPreview:preview,
      }
      this.settingsService.whatsAppFlowUrl(data).subscribe((response: any) => {
      if (response) {     
          window.open(response?.url, '_blank');
      }
  });
       
    }

    
	filterCampaign(filtercampaign: any) {
    this.initflowfliter =JSON.parse(JSON.stringify(this.flowfilter));
		this.closeAllModal()
		this.modalReference = this.modalService.open(filtercampaign,{size: 'sm', windowClass:'white-pink'});
	}

  cancelfilter(){
    this.flowfilter =JSON.parse(JSON.stringify(this.initflowfliter));
  }

  
	closeAllModal(){
		if(this.modalReference){
			this.modalReference.close();
	    }
	}


  filterFlows() {
  const selectedFilters = this.flowfilter
    .filter(f => f.checked)
    .map(f => f.label);

    console.log(selectedFilters,'------------selectedFilters--------------');

  if (selectedFilters.length == 0) {
    this.isFilterApplied = false;
    this.flowList = JSON.parse(JSON.stringify(this.initflowList));
  } else{
this.isFilterApplied = true;
  // Step 3: filter based on selected statuses
  this.flowList =  this.initflowList.filter((flow:any) =>
    selectedFilters.includes(flow.status)
  );  
}
  this.getGridPageSize();
  this.closeAllModal();
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
