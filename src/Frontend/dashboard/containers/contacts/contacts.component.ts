import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { TeamboxService } from './../../services';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ColDef,GridApi,GridReadyEvent} from 'ag-grid-community';
import { Router } from '@angular/router';
import { contactsImageData } from 'Frontend/dashboard/models/dashboard.model';
import { AnyLengthString } from 'aws-sdk/clients/comprehend';
import { join } from 'path';
import { Subject } from 'rxjs';
import { GridService } from '../../services/ag-grid.service';
import { PhoneValidationService } from 'Frontend/dashboard/services/phone-validation.service';
import {ContactFilterComponent} from '../contact-filter/contact-filter.component';

declare var $: any;
@Component({
  selector: 'sb-contacts',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit,OnDestroy,AfterViewInit {
  @ViewChild('child') child!: ContactFilterComponent;

  public gridapi!:GridApi | any;


    onGridReady(params: GridReadyEvent) {
    this.gridapi = params.api;
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

  //******* Router Guard  *********//
  routerGuard = () => {
    if (sessionStorage.getItem('SP_ID') === null) {
      this.router.navigate(['login']);
    }
  }
  changingValue: boolean = false;
  arrHideColumn:any[] =[];
  isShowColumn:boolean = false;
  isShowFilter:boolean = true;
    isImport:boolean = true;
columnDefs: ColDef[] = [
  {
    field: '',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    hide:false,
    //flex: 0.5,
      editable: false,
      width: 50,
      lockPosition: 'left',
      cellClass: 'locked-col',
      suppressMovable: true,  
    //cellStyle: { background: "#FBFAFF" },
  },
   {
    headerName: '',
      headerTooltip: 'Actions',
      width: 40,
      editable: false,
      resizable: false,
      filter: false,
      sortable: false,
      //clickable: false,
      cellRenderer: this.actionsCellRenderer.bind(this),
  },
  {
    field: 'customerId',
    headerName: 'ID',
    flex: 1,
    resizable: true,
    minWidth: 50,
    hide:false,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'Name',
    headerName: 'Name',
    flex: 2,
    resizable: true,
    minWidth: 100,
    hide:false,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'displayPhoneNumber',
    headerName: 'Phone Number',
    flex: 2,
    resizable: true,
    minWidth: 100,
    hide:false,
    cellRenderer: (params: { data: { countryCode: any; displayPhoneNumber: any; };
     }) =>`${params.data.countryCode ? params.data.countryCode : ''} ${params.data.displayPhoneNumber}`,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
    sortable: true,
  },
  {
    field: 'emailId',
    headerName: 'Email',
    flex: 2,
    minWidth: 100,
    resizable: true,
    hide:false,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'OptInStatus',
    headerName: 'Message Opt-in',
    flex: 2,
    resizable: true,
    minWidth: 100,
    hide:false,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'ContactOwner',
    headerName: 'Contact Owner',
    flex: 2,
    minWidth: 100,
    resizable: true,
    hide:false,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'tag_names',
    headerName: 'Tag',
    flex: 2,
    minWidth: 100,
    resizable: true,
    hide:false,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
];


countryCodes = [
  'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
  'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
  'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
  'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
  'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
  'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1767', 'DO +1809', 'DZ +213',
  'EC +593', 'EE +372', 'EG +20', 'EH +212', 'ER +291', 'ES +34', 'ET +251', 'FI +358', 'FJ +679', 'FK +500',
  'FM +691', 'FO +298', 'FR +33', 'GA +241', 'GB +44', 'GD +1473', 'GE +995', 'GF +594', 'GG +44', 'GH +233',
  'GI +350', 'GL +299', 'GM +220', 'GN +224', 'GP +590', 'GQ +240', 'GR +30', 'GS +500', 'GT +502', 'GU +1671',
  'GW +245', 'GY +592', 'HK +852', 'HN +504', 'HR +385', 'HT +509', 'HU +36', 'ID +62', 'IE +353', 'IL +972',
  'IM +44', 'IN +91', 'IO +246', 'IQ +964', 'IR +98', 'IS +354', 'IT +39', 'JE +44', 'JM +1876', 'JO +962',
  'JP +81', 'KE +254', 'KG +996', 'KH +855', 'KI +686', 'KM +269', 'KN +1869', 'KP +850', 'KR +82', 'KW +965',
  'KY +1345', 'KZ +7', 'LA +856', 'LB +961', 'LC +1758', 'LI +423', 'LK +94', 'LR +231', 'LS +266', 'LT +370',
  'LU +352', 'LV +371', 'LY +218', 'MA +212', 'MC +377', 'MD +373', 'ME +382', 'MF +590', 'MG +261', 'MH +692',
  'MK +389', 'ML +223', 'MM +95', 'MN +976', 'MO +853', 'MP +1 670', 'MQ +596', 'MR +222', 'MS +1 664', 'MT +356',
  'MU +230', 'MV +960', 'MW +265', 'MX +52', 'MY +60', 'MZ +258', 'NA +264', 'NC +687', 'NE +227', 'NF +672',
  'NG +234', 'NI +505', 'NL +31', 'NO +47', 'NP +977', 'NR +674', 'NU +683', 'NZ +64', 'OM +968', 'PA +507',
  'PE +51', 'PF +689', 'PG +675', 'PH +63', 'PK +92', 'PL +48', 'PM +508', 'PN +872', 'PR +1 787', 'PS +970',
  'PT +351', 'PW +680', 'PY +595', 'QA +974', 'RE +262', 'RO +40', 'RS +381', 'RU +7', 'RW +250', 'SA +966',
  'SB +677', 'SC +248', 'SD +249', 'SE +46', 'SG +65', 'SH +290', 'SI +386', 'SJ +47', 'SK +421', 'SL +232',
  'SM +378', 'SN +221', 'SO +252', 'SR +597', 'SS +211', 'ST +239', 'SV +503', 'SX +1721', 'SY +963', 'SZ +268',
  'TC +1649', 'TD +235', 'TF +262', 'TG +228', 'TH +66', 'TJ +992', 'TK +690', 'TL +670', 'TM +993', 'TN +216',
  'TO +676', 'TR +90', 'TT +1868', 'TV +688', 'TW +886', 'TZ +255', 'UA +380', 'UG +256', 'US +1', 'UY +598',
  'UZ +998', 'VA +39', 'VC +1784', 'VE +58', 'VG +1284', 'VI +1340', 'VN +84', 'VU +678', 'WF +681', 'WS +685',
  'YE +967', 'YT +262', 'ZA +27', 'ZM +260', 'ZW +263'
];

    rowData = [ ];
    imageChangedEvent: any = '';
    croppedImage: any = '';
    spid!:number;
    searchText= "";
    separateDialCode = false;
    selectedCountry: any;
    data: any;
    code: any;
    contacts:any;
    name = 'Angular'; 
    checkedConatct: any[] = [];
    productForm!: FormGroup;  
    checkedcustomerId: any = [];
    editForm: any = [];
    pageOfItems: any;
    selectedTag: any;
    showTopNav: boolean = false;
    isButtonEnabled = false;
    isButtonDisabled = true;
    inputText!: string;
    inputEmail!: string;
    userid = 0; 
    profilePicture:any;
    selectedCountryCode:any;
    contactsData!:{}
    customFieldData:[] = [];
    filteredCustomFields:any;
    contactsImageData= <contactsImageData> {};
    contactId:any = 0;
    OptedIn=false;
    OptInStatus='No';
    isShowSidebar:boolean=false;
    randomNumber:number = 0;
    isBlocked:number = 0;
    showInfoIcon:boolean = false;
    ShowContactOwner:any = false;
    addContactTitle: 'add' | 'edit' = 'add';
    checkedTags: string[] = [];
    isEditTag:boolean = false;
  // multiselect 
    disabled = false;
    ShowFilter = false;
    limitSelection = false;
    cities: any = [];
    tag: any = [];
    tagListData:[] = [];
    status: any = [];
    userList!:any;
    filteredUserList: any;
    selectedItems: any = [];
    // selectedTagItems: any[] = []; 
    selectedStatusItems: any[] = []; 
    dropdownSettings = {};
    dynamicDropdownSettings = {};

    items: any;
    customerData:[]=[];
    getFilterTags: [] = [];
    intials:string ='';
    
    orderHeader: String = '';
    isDesOrder: boolean = true;

    errorMessage = '';
    successMessage = '';
    warnMessage = '';
    paginationPageSize: string = '10';
    currPage: any = 10;
    totalPage: any;
    paging: any = 1;
    lastElementOfPage: any;
   sort(headerName:String){
    this.isDesOrder = !this.isDesOrder;
    this.orderHeader = headerName;

   }

   title = 'formValidation';
   submitted = false;
   query = '';
   contactOwnerTooltip!: boolean;
   isLoading!: boolean;
  
 constructor(config: NgbModalConfig, private modalService: NgbModal,
  public phoneValidator:PhoneValidationService,
     public settingsService: SettingsService, private apiService: DashboardService, private _settingsService: SettingsService, private teamboxService: TeamboxService, private fb: FormBuilder, private router: Router, private cdRef: ChangeDetectorRef, public GridService: GridService)
 
 
 {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;  

    this.productForm = this.contactForm();
 }

 actionsCellRenderer(params: any) {
  const element = params.data;
  const buttonsHtml = `
    <img
      style="margin-left: -3px; cursor: pointer;" class="delete-button"      
      height="15px"
      width="15px"
      src="/../../assets/img/chat.svg"
      alt=""
    />  
  `;
  const div = document.createElement('div');
  div.innerHTML = buttonsHtml;
  div.addEventListener('click', this.onButtonClick.bind(this, element));
  return div;
}

onButtonClick(data:any, event: any) {
 // this.activeDistrictId = data.schoolDistrictID;
  const target = event.target;  
   // this.router.navigateByUrl(`Dashboard/teambox?isNewMessage=${true}`);
    this.router.navigate(['/dashboard/teambox'], { queryParams: { isNewMessage: true } });
}
    ngOnInit() {
      this.isLoading = true;
      this.spid = Number(sessionStorage.getItem('SP_ID'));
      document.getElementById('delete-btn')!.style.display = 'none';
      this.showTopNav = true;

      this.items = Array(150).fill(0).map((x, i) => ({ id: (i + 1), name: `Item ${i + 1}`}));
      
      this.cities = [
        { item_id: 1, item_text: 'Name' },
        { item_id: 2, item_text: 'Email' },
        { item_id: 3, item_text: 'Phone Number' },
        { item_id: 4, item_text: 'Tags' },
        { item_id: 5, item_text: 'Contact Created' },
        { item_id: 6, item_text: 'Last Conversation with' },
        { item_id: 7, item_text: 'Conversation resolved' },
        { item_id: 8, item_text: 'Last Message with' },
    ];
  this.status = [
    { item_id: 1, item_text: 'Premium' },
    { item_id: 2, item_text: 'Customer' },
    { item_id: 3, item_text: 'New Customer' },
    { item_id: 5, item_text: 'Order Complete' },
    { item_id: 6, item_text: 'New Order' },
    { item_id: 4, item_text: 'Unavailable' },
    
];

    this.dropdownSettings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: this.ShowFilter
    };

 
    this.dynamicDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'optionName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: this.ShowFilter
  };

    this.routerGuard();
		this.getContact();
    this.getUserList();
    this.getTagData();
    this.getCustomFieldsData();
    this.getPhoneNumberValidation()
    
  
} 
clearFilterChild() {
  if (this.child) {
    this.child.clearFilter();
  }
}
contactForm() {
  return this.fb.group({
    Name: new FormControl('', [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern('^(?:[a-zA-Z.0-9]+|(?:a to z))(?: [a-zA-Z0-9]+)*$')]),
    Phone_number: new FormControl(''),
    displayPhoneNumber: new FormControl('',[Validators.pattern('^[0-9]+$'),Validators.required,Validators.minLength(6),Validators.maxLength(15)]),
    countryCode:new FormControl('IN +91'),
    emailId: new FormControl('', [Validators.pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}$/),Validators.minLength(5),Validators.maxLength(50)]),
    ContactOwner: new FormControl('',[Validators.required]),
    tag: new FormControl([])
  })
}

getPhoneNumberValidation(){
  this.productForm.get('countryCode')?.valueChanges.subscribe(() => {
    this.productForm.get('displayPhoneNumber')?.setValidators([
      Validators.required,
      this.phoneValidator.phoneNumberValidator(this.productForm.get('countryCode'))
    ]);
    this.productForm.get('displayPhoneNumber')?.updateValueAndValidity();
    console.log(this.productForm);
  });
}

    validatorsToggle() {
        const displayPhoneNumber = this.productForm?.get('displayPhoneNumber');
        const countryCode = this.productForm?.get('countryCode');
        if (countryCode) {
            if (countryCode.value == 'IN +91') {
                this.productForm.controls.displayPhoneNumber.setValidators([
                    Validators.pattern('^[0-9]+$'),
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(10)
                ]);
                return true;
            } else {
                this.productForm.controls.displayPhoneNumber.setValidators([
                    Validators.pattern('^[0-9]+$'),
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(15)
                ]);
                return false;
            }
        }
    }
 onSelectionChanged(event: any) {

     this.isButtonEnabled = this.checkedConatct.length > 0 && event !== null;
     this.isShowSidebar = false;
    
  }
  
checks=false
bulk(e: any) {
  if (e.target.checked == true) {
    console.log(this.contacts[0].customerId)
    for (var i = 0; i < this.contacts.length; i++) {
      this.checkedcustomerId.push(this.contacts[i].customerId)
      this.checkedConatct.push(this.contacts[i]);
      
    }
    this.checks = true;
  }
  else {
    this.checks = false;
    this.checkedcustomerId.length = 0;
    this.checkedConatct.length=0;
  }
  console.log("this.customerId")
  console.log(this.checkedcustomerId)
}

showToaster(message:any,type:any){
  if(type=='success'){
    this.successMessage=message;
  }	
  else if(type=='warn'){
    this.warnMessage=message;
  }
  else if(type=='error'){
    this.errorMessage=message;
  }

  setTimeout(() => {
    this.hideToaster()
  }, 5000);
  
}
hideToaster(){
  this.successMessage='';
  this.warnMessage='';
  this.errorMessage='';
}

addqty(code: any) {
  this.data = code;

}

onChangePage(pageOfItems: any) {
  // update current page of items
  this.pageOfItems = pageOfItems;
}

  onItemSelect(item: any) {
    console.log('onItemSelect', item);
}
onSelectAll(items: any) {
    console.log('onSelectAll', items);
}
    
  quantities() : FormArray {  
    return this.productForm.get("quantities") as FormArray  
  }  
     
  newQuantity(): FormGroup {  
    return this.fb.group({  
      qty: '',  
      price: '',  
    })  
  }  
     
  addQuantity() {  
    this.quantities().push(this.newQuantity());  
  }  
     
  removeQuantity(i:number) {  
    this.quantities().removeAt(i);  
  }  
     
  onSubmit() {  
    console.log(this.productForm.value);  
    this.productForm.reset();

  } 

  updateOptedIn(event:any){
	  this.OptedIn = event.target.checked;
    this.productForm.value.OptedIn = this.OptedIn ? 'Yes' : 'No';
	}

	open(content:any) {
		this.modalService.open(content,{windowClass:'contact-modal'});
    this.addContactTitle = 'add';

	} 

  openExport(content:any){
    console.log(this.gridapi.getSelectedNodes())
   // this.gridapi.api.getSelectedNodes()
    if(this.gridapi.getSelectedNodes().length == 0)
      this.showToaster('Please select the Contacts you want to export first !','error');    
    else{
      this.modalService.open(content);
      this.addContactTitle = 'add';
    }
  }

  openedit(contactedit: any) {
    this.patchFormValue();
    this.modalService.open(contactedit,{windowClass:'contact-modal'});
  }
 
  getContact() {
    var SP_ID = sessionStorage.getItem('SP_ID');
    let data:any ={};
    data.SP_ID = SP_ID;
    data.Query = this.query;
    console.log(SP_ID)
    this.apiService.getFilteredContact(data).subscribe((data:any) => {
      this.isLoading = false;
      this.deleteBloackContactLoader = false;
      this.contacts = data.result;
      this.rowData = this.contacts;
      if(this.rowData.length == 0){
        this.isEmptyData();
      }
      this.productForm.get('countryCode')?.setValue('IN +91');
        console.log(this.contacts);
        this.getGridPageSize();
        
    });
  }

  isEmptyData(){
    //errors while assigning this instantly;
    setTimeout(() => {
      this.contacts = false;
  }, 50);
  }
  onchange(event:any, column:any) {
    var id = document.getElementsByClassName(column)
    if(event.target.checked === true) {
      for (let i = 0; i<id.length; i++) {
        id[i].classList.remove("tabCol")
      }
      
    //  alert("checked")
    }
    else 
    {
      for (let i = 0; i < id.length; i++) {
        id[i].classList.add("tabCol")
      }
      // console.log(column)
    }
  }
     
   resetForm() {
    Object.keys(this.productForm.controls).forEach(controlName => {
      const control = this.productForm.get(controlName);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
    this.ShowContactOwner=false;
    this.showInfoIcon=false;
    this.modalService.dismissAll()
  }
   closesidenav(items: any){
    this.productForm.reset()
    this.productForm.get('countryCode')?.setValue('IN +91');
    this.contactId=0;
    this.customerData = [];
    this.OptInStatus='No';
    this.isShowSidebar = false;
   }
   deleteBloackContactLoader! : boolean;
  deleteRow(arr:any ["id"]) {
      //this.contacts.splice(arr, 1);
      var deleteList = this.checkedConatct.map(x => x.customerId);
      var data = {

        customerId: deleteList,
        SP_ID: sessionStorage.getItem('SP_ID')
      }
      
      this.apiService.deletContactById(data).subscribe(response => {
        console.log(response)
        this.getContact();
        this.onRowSelected(null);

      });
  
  }

  toggleContactOption(){
    this.ShowContactOwner =!this.ShowContactOwner;
  }

  selectContactOwner(value:any){
    this.productForm.get('ContactOwner')?.setValue(value); 
    this.ShowContactOwner=false;
  }
  stopPropagation(event: Event) {
      event.stopPropagation();
      this.ShowContactOwner = false;
    }

  onRowSelected = (event: any) => {
       if (event === null || event === undefined) {
      this.checkedConatct = [] 
      }
      else {
      const rowChecked = this.checkedConatct.findIndex((item) => item.customerId == event.data.customerId);
      if (rowChecked < 0) {

        this.checkedConatct.push(event.data);

      }

      else {
        this.checkedConatct.splice(rowChecked, 1);

       }
      }
    console.log(this.checkedConatct.length );


    if (this.checkedConatct.length > 0 && event !== null) {
  
      document.getElementById('import-btn')!.style.display = 'none';
      document.getElementById('add-contact')!.style.display = 'none';
      document.getElementById('export-btn')!.style.display = 'block'
      document.getElementById('delete-btn')!.style.display = 'block';

    }
    else {
     
      document.getElementById('import-btn')!.style.display = 'block';
      document.getElementById('add-contact')!.style.display = 'block';
      document.getElementById('export-btn')!.style.display = 'block';
      document.getElementById('delete-btn')!.style.display = 'none';

   
    }
   
  };


   rowClicked = (event: any) => {
    this.isShowSidebar=true; 
    this.getContactById(event.data);
    this.addContactTitle= 'edit';
    this.patchFormValue();
    this.gridOptions.api.deselectAll();
    this.checkedConatct = [];
    setTimeout(()=>{this.isShowSidebar=true;
      document.getElementById('import-btn')!.style.display = 'block';
      document.getElementById('add-contact')!.style.display = 'block';
      document.getElementById('export-btn')!.style.display = 'block';
      document.getElementById('delete-btn')!.style.display = 'none';
    },50);
  };
  


  gridOptions:any = {

    rowSelection: 'multiple',
    rowHeight: 48,
    headerHeight: 50,
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
    onRowClicked: this.rowClicked,
    onRowSelected: this.onRowSelected,
    pagination: true,
    paginationAutoPageSize: false,
    paginationPageSize: 10,
    paginateChildRows:true,
    suppressPaginationPanel: true,
    overlayNoRowsTemplate: '<span style="padding: 10px; background-color: #FBFAFF; box-shadow: 0px 0px 14px #695F972E;">No records found.</span>',
    overlayLoadingTemplate:'<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
  
  };

  
  copyContactFormData(isEditTag:boolean) {
    let ContactFormData = {
        result: [
          {
            displayName:this.spid,
            ActuallName:"SP_ID"
          },
            {
                displayName: this.productForm.controls.Name.value,
                ActuallName: "Name"
            },
            {
              displayName: this.productForm.controls.countryCode.value,
              ActuallName: "CountryCode"
           },
            {
                displayName: this.productForm.controls.Phone_number.value,
                ActuallName: "Phone_number"
            },
            {
              displayName: this.productForm.controls.displayPhoneNumber.value,
              ActuallName: "displayPhoneNumber"
           },
            {
                displayName: this.productForm.controls.emailId.value,
                ActuallName: "emailId"
            },
            {
              displayName: this.productForm.controls.ContactOwner.value,
              ActuallName: "ContactOwner"
            },
            {
              displayName: '',
              ActuallName: "tag"
            },
            {
              displayName: this.OptedIn ? 'Yes' : 'No',
              ActuallName: "OptInStatus"
            },
        ],
        SP_ID:this.spid
    }

    if(this.filteredCustomFields.length >0){
      this.filteredCustomFields.forEach((item:any)=>{
        if(item.type =='Select'){
          let selectedOption = item.options.filter((opt:any)=>opt.id == this.productForm.get(item.ActuallName)?.value?.toString())[0];
          console.log(this.productForm.get(item.ActuallName)?.value);
          console.log(item.options);
          if(selectedOption)
          ContactFormData.result.push({displayName:`${selectedOption?.id}:${selectedOption?.optionName}`,ActuallName:item.ActuallName});
        }
        else if(item.type =='Multi Select'){
          let values =''
          console.log(this.productForm.get(item.ActuallName)?.value)
          if( this.productForm.get(item.ActuallName)?.value){
          this.productForm.get(item.ActuallName)?.value?.forEach((ite:any)=>{
            values = (values ? values +',' : '')+ ite.id + ':' + ite.optionName;
          })
           }
          console.log(values);
          ContactFormData.result.push({displayName:values,ActuallName:item.ActuallName});
        }
        else{
          ContactFormData.result.push({displayName:this.productForm.get(item.ActuallName)?.value,ActuallName:item.ActuallName});
        }
      })
    }
    if (isEditTag) {
      let tag = ContactFormData.result.find((item: any) => item.ActuallName === "tag");
          if (tag) {
            let tagArr:any =[];
            this.tagListData.forEach((item:any)=>{
              if(item.isSelected)
              tagArr.push(item.ID);
            })
              tag.displayName = tagArr.join(', ');
    }
  }
    if (!isEditTag) {
      let tagArray = this.productForm.controls.tag.value;
      console.log(tagArray)
      let tagString = tagArray?.map((tag: any) => `${tag.item_id}`).join(', ');
      console.log(tagString)

      let tagField = ContactFormData.result.find((item: any) => item.ActuallName === "tag");
      if (tagField) {
          tagField.displayName = tagString;
  }
       
  };
    return ContactFormData
}

saveContact(addcontact:any,addcontacterror:any,isEditTag:boolean=false) {
  let contactData = this.copyContactFormData(isEditTag)
  this.submitted = true;

  // if(!this.productForm.valid) {
  //   console.log('Please enter valid details');
  //    return ;
  //  }
console.log(this.contactId)
  if(this.contactId) {
    this.apiService.editContact(contactData, this.contactId, this.spid).subscribe(
      (response: any) => {
      if(response) {
        this.productForm.clearValidators();
        this.resetForm();
        this.modalService.dismissAll();
        this.closesidenav(this.items);
        this.closeEditTag();
        this.getContact();
      }
     },
     (error:any) =>{
      if(error) {

        if(error.status == 409)
        this.showToaster('Phone Number already exist !','error');
        else
        this.showToaster(error.message,'error');
      }
     });
  }
  else {
    this.isEditTag = false;
    this.apiService.addContact(contactData).subscribe(
      (response:any) => {
      if (response.status === 200) {
        this.productForm.reset();
        this.productForm.clearValidators();
        this.resetForm();
        this.modalService.open(addcontact);
        this.getContact();
      }
    },

      (error:any) => { 
        if (error.status === 409) {
          this.getContact();
          this.productForm.reset();
          this.resetForm();
          this.productForm.clearValidators();
          this.modalService.open(addcontacterror);
          if(error?.error){
            this.showToaster(error.error.message,'error');
          }
        }
        else if (error) {
          this.showToaster(error.message,'error');
        }
         
   });
  }

}
  // onSelectedTag(value: any) {
  //   this.selectedTag = value;

  // }


  getCheckBoxEvent(isSelected: any, contact: any) {
    console.log("contact");
    console.log(isSelected)
    var obj = {
      data: contact,
      status: isSelected
    }
    if (obj.status === true) {
      console.log("obj.status")
      this.checkedConatct.push(obj.data);
      this.checkedcustomerId.push(contact.customerId)
      console.log(this.checkedcustomerId)
    } else if (obj.status === false) {

      var index = this.checkedConatct.indexOf(obj.data)
      console.log(index)
      this.checkedConatct.splice(index, 1);
      this.checkedcustomerId.splice(index, 1);
      console.log("this.splice(index, 1)")
      console.log(this.checkedcustomerId)
    }

  }


deletContactByID(data: any) {
  this.deleteBloackContactLoader = true;
  console.log("delete")
  console.log(data)
  this.apiService.deletContactById(data).subscribe((response => {
    console.log(response);
    this.getContact();
    this.closesidenav(this.items);
  }));

}

  blockContactByID(data: any) {
    this.deleteBloackContactLoader = true;
    if(data.isBlocked==1) {
      this.isBlocked = 0;
    }
    else {
      this.isBlocked = 1;
    }
   let Body =  {
      customerId:data.customerId,
      isBlocked:this.isBlocked
    }
    var SP_ID = sessionStorage.getItem('SP_ID')
    this.apiService.blockContact(Body, SP_ID).subscribe((response => {
      console.log(response);
      this.getContact();
      this.closesidenav(this.items);
    }));
    
  }

  getContactById(data: any) {
    this.contactsData = data;
    this.contactId = data.customerId;
    sessionStorage.setItem('id', data.customerId)
    var SP_ID = sessionStorage.getItem('SP_ID')
    this.apiService.getContactById(data.customerId, SP_ID).subscribe((data:any) => {
      this.randomNumber = Math.random();
      this.customerData = data;
      console.log(data);
      console.log(data[0]?.Name);
      this.getInitials(data[0]?.Name)
      // this.getContact();
    });    
  }

  getInitials(name:any){
    if(name){
      let words = name.split(' ');
      let inti = words[0][0] + (words[1] ? (words[1].trim())[0] :'');
      this.intials =inti;
    }else{
      this.intials ='';
    }
  }

  closeEditTag() {
    $("#edittag").modal('hide');
    this.isEditTag = false;
  }

  getTagData() {
    this._settingsService.getTagData(this.spid).subscribe(result => {
      if (result) {
          this.tagListData = result.taglist;
          this.tag = this.tagListData.map((tag:any,index:number) => ({
              item_id: tag.ID, 
              item_text: tag.TagName,
              item_color: tag.TagColour
          }));
          console.log(this.tag,'tag list array');
          console.log(this.tagListData);
            }
        });
}

    getUserList(){
      this._settingsService.getUserList(this.spid)
      .subscribe(result =>{
        if(result){
            this.userList =result?.getUser;  
            this.filteredUserList = this.userList
        }

      })
    }

  patchFormValue(){
    const data:any=this.contactsData
    console.log(data);
    this.getFilterTags = data.tag ? data.tag?.split(',').map((tags: string) =>tags.trim().toString()) : [];
    console.log(this.getFilterTags);
    this.checkedTags = this.getFilterTags;
    const selectedTag:string[] = data.tag?.split(',').map((tagName: string) => tagName.trim());
    //set the selectedTag in multiselect-dropdown format
    const selectedTags = this.tagListData.map((tag: any, index: number) => ({ idx: index, ...tag }))
    .filter(tag => selectedTag?.includes((tag.ID).toString()))
    .map((tag: any) => ({
        item_id: tag.ID,
        item_text: tag.TagName,
    }));
    console.log(selectedTags);
    // this.selectedTag = data.tag
    this.tagListData.forEach((item:any)=>{
      if(selectedTag?.includes((item.ID).toString())){
        item['isSelected'] = true;
      }else{
        item['isSelected'] = false;
      }
    })
    for(let prop in data){
      let value = data[prop as keyof typeof data];
      if(this.productForm.get(prop))
      this.productForm.get(prop)?.setValue(value)
      this.productForm.get('tag')?.setValue(selectedTags); 
      let idx = this.filteredCustomFields.findIndex((item:any)=> item.ActuallName == prop);
      if( idx>-1 &&  this.filteredCustomFields[idx] && (this.filteredCustomFields[idx].type == 'Date Time' || this.filteredCustomFields[idx].type == 'Date')){
        this.productForm.get(prop)?.setValue(value);
      }else if(idx>-1 &&  this.filteredCustomFields[idx] && (this.filteredCustomFields[idx].type == 'Select')){
        let val = value ? value.split(':')[0] : '';
        console.log(val);
        this.productForm.get(prop)?.setValue(val);
      }else if(idx>-1 &&  this.filteredCustomFields[idx] && (this.filteredCustomFields[idx].type == 'Multi Select')){
        if(value){
        let val = value.split(':');
        console.log(val);
        console.log(value);

        let selectName =  value?.split(',');
                  let names:any =[];
                  selectName.forEach((it:any)=>{
                    let name = it.split(':');
                    console.log(name);
                    names.push({id: (name[0] ?  name[0] : ''),optionName: (name[1] ?  name[1] : '')});
                  })
                  
        this.productForm.get(prop)?.setValue(names);
                }
      }
    } 
    const countryCodeControl = this.productForm.get('countryCode');
    const phoneNumber = this.productForm.get('displayPhoneNumber');
    if (countryCodeControl && phoneNumber) {
      countryCodeControl.markAsTouched();
      phoneNumber.markAsTouched();
    } 
    this.OptInStatus =data.OptInStatus
    this.isBlocked=data.isBlocked;
  }

  updateTags(tagName: string, isChecked: boolean) {
    this.isEditTag = true;
    console.log(this.checkedTags);
    if (isChecked) {
      this.checkedTags.push(tagName);
    } else {
      const index = this.checkedTags.indexOf(tagName);
      if (index !== -1) {
        this.checkedTags.splice(index, 1);
      }
    }
    console.log(this.checkedTags)
    this.getCheckedTags()
  }

  getCheckedTags() {
    return this.checkedTags.join(', ');
  }

  editTagS(){
    // this.isEditTag =false;
    // setTimeout(()=>{this.isEditTag =true},40);
    this.checkedTags = this.getFilterTags;
    console.log(this.checkedTags);
  }
  
  exportCheckedContact() {
    const defaultFieldNames =["Name", "Phone_number", "emailId", "ContactOwner", "OptInStatus","tag"];
    console.log(this.checkedConatct);
    let fields:any[] =[];
    this.arrHideColumn.forEach((item)=>{
      if(item.hide){
        fields.push(item?.field)
      }
    })

    const fieldToHeaderMap:any = {};
      this.columnDefs.forEach((item:any) => {
        fieldToHeaderMap[item?.field] = item.headerName;
    });

    const exportContact = this.checkedConatct.map(obj => {
      const newObj:any = {};
      fields.forEach(field => {
          const headerName = fieldToHeaderMap[field]; // Get the header name for the field
          if (obj.hasOwnProperty(field) && headerName) {
              newObj[headerName] = obj[field]; // Map field to headerName
          }
      });
      return newObj;
  });
    // console.log(exportContact,'export contact')
    var exContact = {
      data: exportContact,
      loginData: (JSON.parse(sessionStorage.loginDetails)).email_id,
      Name: (JSON.parse(sessionStorage.loginDetails)).name
    }
    this.apiService.exportCheckedContact(exContact).subscribe(response => {
      console.log(response);
      this.getContact();
      this.onRowSelected(null);
  
    });
    this.checkedConatct = [];
    console.log(this.checkedConatct + " checked");

  }

  onFilterTextBoxChange() {
    const searchInput = document.getElementById('Search-Ag') as HTMLInputElement;
    const searchTerm = searchInput.value.trim().toLowerCase();
    this.gridapi.setQuickFilter(searchTerm);
    this.contacts = this.rowData.filter((contact: any) => contact.Name.toLowerCase().includes(searchTerm));
    this.setPaging()
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
  

//  image cropping function for popup

fileChangeEvent(event: any): void {
  $("#pictureCropModal").modal('show');
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    const newImageUrl = event.base64 + '?timestamp=' + new Date().getTime();
    this.croppedImage = newImageUrl;
    
    // Trigger change detection
    this.cdRef.detectChanges();
 }

 
//API call to save the cropped image

saveContactsProfilePicture() {
  let SP_ID = Number(sessionStorage.getItem('SP_ID'))
  this.contactsImageData.SP_ID = SP_ID,
  this.contactsImageData.customerId = this.contactId,
  this.contactsImageData.contact_profile = this.croppedImage


this.apiService.saveContactImage(this.contactsImageData).subscribe(
(response) => {

  if (response.status === 200) {
    $("#pictureCropModal").modal('hide');
    this.closesidenav(this.items);
    this.showToaster('image saved successfully','success');
    this.getContact();
  }
},
(error) => {
  this.showToaster('error saving contact image','error');
})

}
// Function to format the phone number using libphonenumber-js
  formatPhoneNumber() {
    const phoneNumber = this.productForm.get('displayPhoneNumber')?.value;
    const countryCode = this.productForm.get('countryCode')?.value;
    let formattedPhoneNumber = null;
    
    this.productForm.get('displayPhoneNumber')?.setValidators([
      Validators.required,
      this.phoneValidator.phoneNumberValidator(this.productForm.get('countryCode'))
    ]);
    this.productForm.get('displayPhoneNumber')?.updateValueAndValidity();
    console.log(this.productForm);

      if (phoneNumber && countryCode) {
        const phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
        formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);
          this.productForm.patchValue({
             // Set the actual value with country code
            Phone_number: formattedPhoneNumber ? formattedPhoneNumber.formatInternational().replace(/[\s+]/g, '') : '',
          });
    }
  }

  getCustomFieldsData() {
    this._settingsService.getNewCustomField(this.spid).subscribe(response => {
      this.customFieldData = response.getfields;
      console.log(this.customFieldData);  
      this.getfilteredCustomFields();
    })
  }

  getfilteredCustomFields() {
    const defaultFieldNames:any = ["Name", "Phone_number", "emailId", "ContactOwner", "OptInStatus","tag"];
    if(this.customFieldData){
       const filteredFields:any = this.customFieldData?.filter(
          (field:any) => !defaultFieldNames.includes(field.ActuallName) && field.status===1 );
          this.filteredCustomFields = filteredFields;
          console.log(this.filteredCustomFields);
          this.contacts =false;
          this.filteredCustomFields.forEach((item:any)=>{

            let columnDesc:any = {
              field: item.ActuallName,
            headerName: item.displayName,
            flex: 2, 
            hide:false,
           // filter: item.type == 'Number' ? 'agNumberColumnFilter': item.type == 'Date Time' ? 'agDateColumnFilter' :'agTextColumnFilter',
            resizable: true,
            minWidth: 100,
            sortable: true,
            cellStyle: { background: "#FBFAFF", opacity: 0.86 },
            }
            if(item.type == 'Select'){
              columnDesc.valueFormatter= (value:any) => {
                if (value.value) {
                  console.log(value.value);
                  let selectName =  value.value.split(':');
                  return selectName[1] ?  selectName[1] : '';
                }
                else {
                  return null;
                }
              }
              console.log(columnDesc);
            }

            if(item.type == 'Multi Select'){
              columnDesc.valueFormatter= (value:any) => {
                if (value.value) {
                  let selectName =  value.value.split(',');
                  let names ='';
                  selectName.forEach((it:any)=>{
                    let name = it.split(':');
                    console.log(name);
                    names = (names ? names + ',' :'') + (name[1] ?  name[1] : '');
                  })
                  return names;
                }
                else {
                  return null;
                }
              }
              console.log(columnDesc);
            }
            this.columnDefs.push(columnDesc);
            const control = new FormControl('');
            this.productForm.addControl(item.ActuallName,control);
            const controls = this.productForm.get(item.ActuallName);
            if (controls && item.mandatory == 1) {
              controls.setValidators([Validators.required]); 
              controls.updateValueAndValidity();
            }
            const yearValidatorFn: ValidatorFn = (control: AbstractControl |any ): { [key: string]: boolean } | null => {
              return this.yearValidator(control);
            };
            if(controls && item?.type=='Date'){
              controls.setValidators([yearValidatorFn]); 
              controls.updateValueAndValidity();
            }
            if(item?.dataTypeValues && (item?.type=='Select' || item?.type=='Multi Select')){
              item.options = JSON.parse(item?.dataTypeValues);
            }
          })
        }
          this.columnDefs.forEach((item:any)=>{
            if(item?.headerName)
              this.arrHideColumn.push({field:item?.field,headerName:item?.headerName,hide:true});
          })
          console.log(this.productForm);
          setTimeout(()=>{
            if (this.gridOptions?.api) {
              this.gridOptions?.api.sizeColumnsToFit();
            }
            if(this.rowData.length == 0){
              this.contacts =false;
            } else this.contacts =true;
          },50);
  }

  
  yearValidator(control: FormControl) : { [key: string]: boolean }  | null {
    if (control.value) {
      const year = new Date(control.value).getFullYear();
      if (year.toString().length !== 4) {
        return { invalidYear: true };
      }
    }
    return null;
  }

  toggleInfoIcon() {
    this.showInfoIcon = !this.showInfoIcon;
  }

    showHideColumns(fieldName:any, e:any) {
    let value = e.target.checked;
    let obj:any = this.columnDefs.find(o => o.field === fieldName);
    obj.hide = !value;
    let hiddenColumns = this.columnDefs.filter(o => o.hide === false);
    let actionColumn:any = this.columnDefs.find(o => o.headerName === 'Actions');
    // if (hiddenColumns?.length > 11) {
    //   actionColumn.width = 300;
    // } else {
    //   actionColumn.width = 150;
    //   setTimeout(() => {
    //     this.gridOptions.api.sizeColumnsToFit();
    //   }, 10)
    //   console.log('hjghj')
    // }
    console.log(this.columnDefs);
    this.gridapi.setColumnDefs(this.columnDefs);
    this.storeGridConfig();
  }
  checkHideFields() {
    let hiddenColumns = this.columnDefs.filter(item => item.hide == false && item.headerName);
    return hiddenColumns.length > 1 ? false : true;
  }

  clearFilters() {
   // this.changingValue.next(true);
    this.isShowFilter = false;
    this.filterIsApplied = false;
    this.query ='';
    this.getContact();
    this.gridapi!.setFilterModel(null);
    this.clearFilterChild()
  }

  closeImport(){    
    this.isImport =false;
    $("#importmodal").modal('hide');
    setTimeout(()=>{this.isImport =true;},100)
  }

  
  checkTagAvailable(){

  }

  ngOnDestroy(){
    console.log(this.gridapi.getColumnDefs());
    this.storeGridConfig();
  }

  storeGridConfig(){
    localStorage.setItem('gridOption',JSON.stringify(this.gridapi.getColumnDefs()));

  }

  ngAfterViewInit(){
    setTimeout(()=>{
    let options = JSON.parse(localStorage.getItem('gridOption')!);
    if(options){
    let column = options.filter((objB:any) => this.columnDefs.some(objA => objA.field === objB.field));
    this.columnDefs.forEach((objA:any) => {
      if (!column.some((objB:any) => objB.field === objA.field)) {
          column.push(objA);
      }
  });
  column.forEach((item:any)=>{
    let idx = this.arrHideColumn.findIndex((it)=> it.field == item.field);
    if(idx >-1)
      this.arrHideColumn[idx].hide =  !item.hide;
      item['hide'] =  item?.hide ? true :false;
  });
  console.log(column);
  column.forEach((item:any)=>{
    let idx = this.columnDefs.findIndex((it)=> it.field == item.field);
    if(idx >-1)
      item.headerName =  this.columnDefs[idx].headerName;
      // item['hide'] =  this.columnDefs[idx]?.hide;
      if(this.columnDefs[idx]?.valueFormatter)
        item.valueFormatter =  this.columnDefs[idx]?.valueFormatter;

      if(this.columnDefs[idx]?.cellRenderer)
      item['cellRenderer'] =  this.columnDefs[idx]?.cellRenderer;
  });
  console.log(column);
  this.columnDefs = column;
  this.gridapi.setColumnDefs(column);
 // console.log(this.gridapi?.getColumnDefs());
}    
  },2000); 
  console.log(this.columnDefs);
  }

  getSplitItem(val:any){
    if(val){
    let selectName =  val?.split(':');
    return selectName[1] ?  selectName[1] : '';
    } else{
      return '';
    }
  }

  getSplitMultiSelect(val:any){
      let selectName = val?.split(',');
      let names ='';
      if(selectName && selectName?.length>0){
      selectName.forEach((it:any)=>{
                    let name = it.split(':');
                    console.log(name);
                    names = (names ? names + ',' :'') + (name[1] ?  name[1] : '');
  })
}
  return names;
  }

  openFilters(){
    this.isShowFilter = true;
    this.changingValue = true;
  }

  closeFilter(){
    console.log('xyz');
    this.changingValue = false;
   // this.isShowFilter = false;
    }

    filterContactOwners() {
        const searchInput = document.getElementById('contactOwnerValue') as HTMLInputElement;
        const searchTerm = searchInput.value.trim().toLowerCase();
        this.filteredUserList = this.userList.filter((x: any) => x.name.toLowerCase().includes(searchTerm));
    }
    setPaging() {
        this.getGridPageSize();
    }

    getGridPageSize() {
        setTimeout(() => {
            this.GridService.onChangePageSize(this.paginationPageSize, this.gridapi, this.rowData);
            this.paging = this.GridService.paging;
        }, 50)
    }

    onBtNext() {
        this.GridService.onBtNext(this.gridapi, this.rowData);
        this.currPage = this.GridService.currPage;
        this.paging = this.GridService.paging;

    }

    onBtPrevious() {
        this.GridService.onBtPrevious(this.gridapi, this.rowData);
        this.currPage = this.GridService.currPage;
        this.paging = this.GridService.paging;

    }

    gotoPage(page: any) {
        this.GridService.gotoPage(page, this.gridapi, this.rowData)
    }
    filterIsApplied! : boolean;
    filterApplied(){
      this.filterIsApplied = true;
    }
}
