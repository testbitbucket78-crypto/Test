import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { ColDef} from 'ag-grid-community';


@Component({
  selector: 'sb-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {


  columnDefs: ColDef[] = [
  
    {field: '', headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true
     
     },
    { field: 'id', filter: true, sortable: true,  },
    { field: 'name', filter: true, sortable: true,},
    { field: 'phone', filter: true, sortable: true },
    { field: 'email', filter: true, sortable: true },
    { field: 'age', filter: true, sortable: true },
    { field: 'gender', filter: true, sortable: true },
    { field: 'tag', filter: true, sortable: true 
  }];

  rowData = [
    { id: 1, name: 'Ravi', phone: 23232232323, email:'sdsdfhsd@gmail.com', age:21, gender:'male', tag:'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },
    { id: 1, name: 'Ravi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 21, gender: 'male', tag: 'New Customer' },
    { id: 2, name: 'Vipin', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 1, gender: 'male', tag: 'newcustomer' },
    { id: 3, name: 'Rishi', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 2, gender: 'male', tag: 'newcustomer' },
    { id: 4, name: 'Gaurav', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 3, gender: 'male', tag: 'newcustomer' },
    { id: 5, name: 'Rishabh Verma', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 4, gender: 'male', tag: 'newcustomer' },
    { id: 6, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 5, gender: 'male', tag: 'newcustomer' },
    { id: 7, name: 'Rishabh', phone: 23232232323, email: 'sdsdfhsd@gmail.com', age: 6, gender: 'male', tag: 'newcustomer' },


  ];
  
  searchText= "";

	 contacts:any;
	 name = 'Angular'; 
   checkedConatct: any[] = [];
	 productForm: FormGroup;  
   title = 'result-table';
   newContact:FormGroup;
   editContact: FormGroup;
   checkedcustomerId: any = [];
   editForm: any = [];
   pageOfItems: any;
 

  // multiselect 
    disabled = false;
    ShowFilter = false;
    limitSelection = false;
    cities: any = [];
    tag: any = [];
    status: any = [];
    selectedItems: any = [];
    dropdownSettings = {}; 
    items: any;
    customerData: any;
	filterForm=new FormGroup({
		Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)]))
	})
   orderHeader: String = '';
   isDesOrder: boolean = true;

   searchForm=new FormGroup({
	Phone_number: new FormControl(''),
	Name:new FormControl(''),
	emailId:new FormControl('')
})

   sort(headerName:String){
    this.isDesOrder = !this.isDesOrder;
    this.orderHeader = headerName;

   }

  // onGridReady(event: GridReadyEvent) {
  //   this.gridApi = event.api;
  // }
  // onSelectionChanged(events: SelectionChangedEvent) {
  //   const rows = this.gridApi?.getSelectedNodes();
  //   console.log(rows);
  // }

  // onRowClicked(event:any) {
  //   this.getContactById(event.data);
  //   this.opensidenav(event.contact);
  //   console.log(event);
  // }

  
  
 constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService, private fb: FormBuilder) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
		this.productForm = this.fb.group({  
			name: '',  
			quantities: this.fb.array([]) ,  
		  });
      this.newContact=this.fb.group({
        Name: new FormControl('', Validators.required),
        Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
        emailId: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
        age: new FormControl(''),
        tag: new FormControl(''),
        status: new FormControl(''),
        facebookId: new FormControl(''),
        InstagramId: new FormControl('')
      });
	
      this.editContact = this.fb.group({
        Name: new FormControl(''),
        Phone_number: new FormControl(''),
        emailId: new FormControl(''),
        age: new FormControl(''),
        tag: new FormControl(''),
        status: new FormControl(''),
        facebookId: new FormControl(''),
        InstagramId: new FormControl('')
      });



}


 
  // public onGridReady(params:any) {
  //   this.gridApi = params.api;
  //   this.columnApi = params.columnApi;
  // }

  // public onCheckboxChange(event:any) {
  //   if (event.target.checked) {
  //     this.columnApi.setColumnVisible('Name', false);
  //   } else {
  //     this.columnApi.setColumnVisible('Name', true);
  //   }
  // }



    ngOnInit() {

      this.items = Array(150).fill(0).map((x, i) => ({ id: (i + 1), name: `Item ${i + 1}`}));
      
      this.cities = [
        { item_id: 1, item_text: 'Name' },
        { item_id: 2, item_text: 'Email' },
        { item_id: 3, item_text: 'Phone Number' },
        { item_id: 4, item_text: 'Tags' },
        { item_id: 5, item_text: 'Contact Created' },
        { item_id: 6, item_text: 'Last Conversation with' },
        { item_id: 4, item_text: 'Conversation resolved' },
        { item_id: 5, item_text: 'Last Message with' },
    ];
    this.tag = [
      { item_id: 1, item_text: 'Paid' },
      { item_id: 2, item_text: 'Unpaid' },
      { item_id: 3, item_text: 'Return' },
      { item_id: 4, item_text: 'New Customer' },
      { item_id: 5, item_text: 'Order Complete' },
      { item_id: 6, item_text: 'New Order' },
      { item_id: 4, item_text: 'Unavailable' },
      
  ];
  this.status = [
    { item_id: 1, item_text: 'Premium' },
    { item_id: 2, item_text: 'Customer' },
    { item_id: 3, item_text: 'New Customer' },
    { item_id: 5, item_text: 'Order Complete' },
    { item_id: 6, item_text: 'New Order' },
    { item_id: 4, item_text: 'Unavailable' },
    
];
    // this.selectedItems = [{ item_id: 4, item_text: 'Pune' }, { item_id: 6, item_text: 'Navsari' }];
    this.dropdownSettings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: this.ShowFilter
    };

    // this.productForm = this.fb.group({
    //     city: [this.selectedItems]
    // });

    
		this.getContact();
    this.hideDeleteBtn(event)
   
} 
checks=false
bulk(e: any) {
  if (e.target.checked == true) {
    console.log(this.contacts[0].customerId)
    for (var i = 0; i < this.contacts.length; i++) {
      this.checkedcustomerId.push(this.contacts[i].customerId)
    }
    this.checks = true;
  }
  else {
    this.checks = false;
    this.checkedcustomerId.length = 0
  }
  console.log("this.customerId")
  console.log(this.checkedcustomerId)
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
  } 



	open(content:any) {
		this.modalService.open(content);
	}

opens(contents:any) {
		this.modalService.open(contents);
	}

	openadd(contactadd:any) {
		this.modalService.open(contactadd);
	}

  openedit(contactedit: any) {
    console.log(sessionStorage.getItem('id'))
    this.apiService.getContactById(sessionStorage.getItem('id')).subscribe((result:any)=>{
      //console.log(result[0].Name)
      this.editContact=this.fb.group({
        Name: new FormControl(result[0].Name),
        Phone_number: new FormControl(result[0].Phone_number),
        emailId: new FormControl(result[0].emailId),
        age: new FormControl(result[0].age),
        tag: new FormControl(result[0].tag),
        status: new FormControl(result[0].status),
        facebookId: new FormControl(result[0].facebookId),
        InstagramId: new FormControl(result[0].InstagramId)
      })
    })
    this.modalService.open(contactedit);
  }
  
	opencolumn(column:any) {
		this.modalService.open(column);
	}
	
      getContact() {
    this.apiService.Contact().subscribe(data => {this.contacts = data;
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
  
  opensidenav(contact: any){
    document.getElementById("sidebar")!.style.width = "494px";
   }

   closesidenav(items: any){
    document.getElementById ("sidebar")!.style.width = "0";
   }

  deleteRow(arr: ["id"]) {
    console.log("delete")
    console.log(this.checkedcustomerId)
    var delBtn = confirm(" Do you want to delete ?");
    if (delBtn == true) {
      //this.contacts.splice(arr, 1);
      var data = {
        customerId: this.checkedcustomerId
      }
      this.apiService.deletContactById(data).subscribe(response => {
        console.log(response)
      })
    }
  }


  onRowSelected(item: any) {
   
    

  };

  rowClicked (event: any) {
    
    document.getElementById("sidebar")!.style.width = "494px";
   
  }
  

  gridOptions = {

    rowSelection: 'multiple',
    rowHeight: 48,
    headerHeight: 50,
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
    onRowClicked: this.rowClicked,
    onRowSelected: this.onRowSelected

  };

    selCheckBox(event: any) {
        var id = document.getElementsByClassName('btn  btn-block float-right');
        if (event.target.checked === true) {
            for (let i = 0; i < id.length; i++) {
                id[i].classList.add('tabCol');
            }

            //  alert("checked")
        } else {
            for (let i = 0; i < id.length; i++) {
                id[i].classList.remove('tabCol');
            }
            // console.log(column)
        }
    }

   
    hideDeleteBtn(event: any) {
      var id = document.getElementsByClassName('btn row-delete-btn');
      if (event.target.checked === true) {
          for (let i = 0; i < id.length; i++) {
              id[i].classList.remove('tabCol');
          }
      } else {
          for (let i = 0; i < id.length; i++) {
              id[i].classList.add('tabCol');
          }
      }
  }
  addContact() {
	
		this.apiService.addContact(this.newContact.value).subscribe(response => {
			console.log(response)
		})
}

editContactData() {
  var customerId = sessionStorage.getItem('id')

  console.log("editdata" + customerId)

  this.apiService.editContact(this.editContact.value, customerId).subscribe(response => {
   
  })


}



getCheckBoxEvent(isSelected: any, contact: any) {
  console.log("contact" );
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
     console.log("this.splice(index, 1)" )
     console.log(this.checkedcustomerId)
  }

}


deletContactByID(data: any) {
  console.log("delete")
  console.log(data)
  this.apiService.deletContactById(data).subscribe((responce => {
  }))

}

blockContactByID(data: any) {

  this.apiService.blockContact(data).subscribe((responce => {
    console.log(responce)

  }))
}

getContactById(data: any) {
  console.log("data")
  sessionStorage.setItem('id', data.customerId)
  this.apiService.getContactById(data.customerId).subscribe((data) => {
   // console.log(data)
    this.customerData = data
   
  })
  this.customerData.length = 0;
}

exportCheckedContact() {
	console.log(this.checkedConatct)
	this.apiService.exportCheckedContact(this.checkedConatct).subscribe(response => {
		console.log(response);

	})
	this.sendExportContact()
	this.checkedConatct.length = 0;
	console.log(this.checkedConatct)
}

sendExportContact() {
	this.apiService.sendExportContact().subscribe(data => {
		console.log(data)
	})
}

filterContact(){
	var data=this.filterForm.value.Phone_number
	console.log(data)

	this.apiService.filter(this.filterForm.value.Phone_number).subscribe(data=>{
		this.contacts=data
	 console.log(data)
	})

}
search(){
  console.log(this.searchForm.value)
      this.apiService.search(this.searchForm.value.Phone_number,this.searchForm.value.emailId,this.searchForm.value.Name).subscribe(data=>{
          this.contacts=data
    console.log(data)
  
  })
}
}

