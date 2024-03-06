import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ColDef,GridApi,GridReadyEvent} from 'ag-grid-community';
import { Router } from '@angular/router';
import { contactsImageData } from 'Frontend/dashboard/models/dashboard.model';

declare var $: any;
@Component({
  selector: 'sb-contacts',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  public gridapi!:GridApi;


  onGridReady(params: GridReadyEvent) {
    this.gridapi = params.api;
  }

  //******* Router Guard  *********//
  routerGuard = () => {
    if (sessionStorage.getItem('SP_ID') === null) {
      this.router.navigate(['login']);
    }
  }

columnDefs: ColDef[] = [
  {
    field: '',
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
    flex: 0.5,
    cellStyle: { background: "#FBFAFF" },
  },
  {
    field: 'customerId',
    headerName: 'ID',
    flex: 1,
    resizable: true,
    filter: true,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'Name',
    headerName: 'Name',
    flex: 2,
    filter: true,
    resizable: true,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'displayPhoneNumber',
    headerName: 'Phone Number',
    flex: 2,
    resizable: true,
    filter: true,
    cellRenderer: (params: { data: { countryCode: any; displayPhoneNumber: any; };
     }) =>`${params.data.countryCode} ${params.data.displayPhoneNumber}`,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
    sortable: true,
  },
  {
    field: 'emailId',
    headerName: 'Email',
    flex: 2,
    filter: true,
    resizable: true,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'OptInStatus',
    headerName: 'Message Opt-in',
    flex: 2,
    filter: true,
    resizable: true,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'ContactOwner',
    headerName: 'Contact Owner',
    flex: 2,
    filter: true,
    resizable: true,
    sortable: true,
    cellStyle: { background: "#FBFAFF", opacity: 0.86 },
  },
  {
    field: 'tag',
    headerName: 'Tag',
    flex: 2,
    filter: true,
    resizable: true,
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

  // multiselect 
    disabled = false;
    ShowFilter = false;
    limitSelection = false;
    cities: any = [];
    tag: any = [];
    tagListData:[] = [];
    status: any = [];
    userList!:any;
    selectedItems: any = [];
    // selectedTagItems: any[] = []; 
    selectedStatusItems: any[] = []; 
    dropdownSettings = {};

    items: any;
    customerData:[]=[];
    getFilterTags: [] = [];
    
    orderHeader: String = '';
    isDesOrder: boolean = true;


   sort(headerName:String){
    this.isDesOrder = !this.isDesOrder;
    this.orderHeader = headerName;

   }

   title = 'formValidation';
   submitted = false;
 
  
  
 constructor(config: NgbModalConfig, private modalService: NgbModal,
  public settingsService:SettingsService, private apiService: DashboardService,private _settingsService:SettingsService, private fb: FormBuilder, private router:Router,private cdRef: ChangeDetectorRef)
 
 
 {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;  

    this.productForm = this.contactForm();
 }
    ngOnInit() {
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

    this.routerGuard();
		this.getContact();
    this.getUserList();
    this.getTagData();
    this.getCustomFieldsData();
  
} 

contactForm() {
  return this.fb.group({
    Name: new FormControl('', [Validators.required,Validators.minLength(3),Validators.maxLength(50),Validators.pattern('^(?:[a-zA-Z.0-9]+|(?:a to z))(?: [a-zA-Z0-9]+)*$')]),
    Phone_number: new FormControl(''),
    displayPhoneNumber: new FormControl('',[Validators.pattern('^[0-9]+$'),Validators.required,Validators.minLength(6),Validators.maxLength(15)]),
    countryCode:new FormControl('IN +91'),
    emailId: new FormControl('', [Validators.pattern('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$'),Validators.minLength(5),Validators.maxLength(50)]),
    ContactOwner: new FormControl('',[Validators.required]),
    tag: new FormControl([])
  })
}
 
 onSelectionChanged(event: any) {

     this.isButtonEnabled = this.checkedConatct.length > 0 && event !== null;
    
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

addqty(code: any) {
  this.data = code;

}

onChangePage(pageOfItems: any) {
  // update current page of items
  this.pageOfItems = pageOfItems;
}


  // multiselect settings
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
		this.modalService.open(content);
    this.addContactTitle = 'add';

	} 

  openedit(contactedit: any) {
    this.patchFormValue();
    this.modalService.open(contactedit);
  }

  getContact() {
    var SP_ID = sessionStorage.getItem('SP_ID')
    console.log(SP_ID)
    this.apiService.Contact(SP_ID).subscribe((data) => {
      this.contacts = data;
      this.rowData = this.contacts;
      console.log(this.contacts);
    });
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
    this.productForm.reset();
    this.productForm.get('countryCode')?.setValue('IN +91');
    this.contactId=0;
    this.customerData = [];
    this.OptInStatus='No';
    this.isShowSidebar = false;
   }

  deleteRow(arr:any ["id"]) {

   
      this.contacts.splice(arr, 1);
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
  };
  


  gridOptions = {

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
    overlayNoRowsTemplate: '<span style="padding: 10px; background-color: #FBFAFF; box-shadow: 0px 0px 14px #695F972E;">No rows to show</span>',
    overlayLoadingTemplate:'<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
  
  };

  
  copyContactFormData() {
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
    }
          let tagArray = this.productForm.controls.tag.value;
          console.log(tagArray)
          let tagString = tagArray?.map((tag: any) => `${tag.item_text}`).join(', ');
          console.log(tagString)

          let tagField = ContactFormData.result.find((item: any) => item.ActuallName === "tag");
          if (tagField) {
              tagField.displayName = tagString;
    }
    return ContactFormData
}

saveContact(addcontact:any,addcontacterror:any) {
  let contactData = this.copyContactFormData()
  this.submitted = true;

  // if(!this.productForm.valid) {
  //   console.log('Please enter valid details');
  //    return ;
  //  }

  if(this.contactId) {
    this.apiService.editContact(contactData, this.contactId, this.spid).subscribe(
      (response: any) => {
      if(response.status === 200) {
        this.productForm.reset();
        this.productForm.clearValidators();
        this.resetForm();
        this.modalService.dismissAll();
        this.closesidenav(this.items);
        this.getContact();
      }
     },
     (error:any) =>{
      if(error) {
        console.log(error)
      }
     });
  }
  else {
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
        }
        if (error) {
          console.log(error.message);
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
  console.log("delete")
  console.log(data)
  this.apiService.deletContactById(data).subscribe((response => {
    console.log(response);
    this.getContact();
    this.closesidenav(this.items);
  }));

}

  blockContactByID(data: any) {
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
      this.getContact();
    });    
  }

  getTagData() {
    this._settingsService.getTagData(this.spid).subscribe(result => {
      if (result) {
          this.tagListData = result.taglist;
          this.tag = this.tagListData.map((tag:any) => ({
              item_id: tag.ID, 
              item_text:tag.TagName,
              item_color:tag.TagColour
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
        }

      })
    }

  patchFormValue(){
    const data:any=this.contactsData
    console.log(data);

    // set tags values in edit tag
    this.getFilterTags = data.tag?.split(',').map((tags: string) =>tags.trim());
      console.log(this.customerData);
      console.log(this.getFilterTags);

    const selectedTag = data.tag?.split(',').map((tagName: string) => tagName.trim()) || [];
    //set the selectedTag in multiselect-dropdown format
    const selectedTags = selectedTag.map((tagName: any, index: number) => ({
        item_id: index + 1,
        item_text: tagName
    }));
    // this.selectedTag = data.tag

    for(let prop in data){
      let value = data[prop as keyof typeof data];
      if(this.productForm.get(prop))
      this.productForm.get(prop)?.setValue(value)
      this.productForm.get('tag')?.setValue(selectedTags); 
      this.OptInStatus =data.OptInStatus
      this.isBlocked=data.isBlocked
    }  
  }



  exportCheckedContact() {
    console.log(this.checkedConatct)
    var exContact = {
      data: this.checkedConatct,
      loginData: (JSON.parse(sessionStorage.loginDetails)).email_id
    }
    this.apiService.exportCheckedContact(exContact).subscribe(response => {
      console.log(response);
      this.getContact();
      this.onRowSelected(null);
  
    });
    this.checkedConatct = [];
    console.log(this.checkedConatct + " checked");

  };

  onFilterTextBoxChange() {
    const searchInput = document.getElementById('Search-Ag') as HTMLInputElement;
    const searchTerm = searchInput.value.trim().toLowerCase();
    this.gridapi.setQuickFilter(searchTerm);
    this.contacts = this.rowData.filter((contact: any) => contact.Name.toLowerCase().includes(searchTerm));
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
    console.log(response+ 'image saved successfully');
    this.getContact();
  }
},
(error) => {
  console.log(error+ 'error saving contact image');
})

}

// Function to format the phone number using libphonenumber-js
  formatPhoneNumber() {
    const phoneNumber = this.productForm.get('displayPhoneNumber')?.value;
    const countryCode = this.productForm.get('countryCode')?.value;
    let formattedPhoneNumber = null;

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
       const filteredFields:any = this.customFieldData.filter(
          (field:any) => !defaultFieldNames.includes(field.ActuallName) && field.status===1 );
          this.filteredCustomFields = filteredFields;
          console.log(this.filteredCustomFields);
  }

  toggleInfoIcon() {
    this.showInfoIcon = !this.showInfoIcon;
  }
}



