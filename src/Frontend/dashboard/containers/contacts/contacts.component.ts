import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
declare var $: any; // declare the jQuery variable

@Component({
  selector: 'sb-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  searchText= "";
  separateDialCode = false;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  phoneForm = new FormGroup({
		phone: new FormControl(undefined, [Validators.required])
	});

	changePreferredCountries() {
		this.preferredCountries = [CountryISO.India, CountryISO.Canada];
	}

  selectedCountry: any;
  data: any;
	code: any;
	 contacts:any;
	 name = 'Angular'; 
   checkedConatct: any[] = [];
	 productForm: FormGroup;  
  //  title = 'result-table';
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
    Name: new FormControl('', Validators.required),
    Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
    emailId: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
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

   title = 'formValidation';
   submitted = false;
 
  
constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService, private fb:FormBuilder) {
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
  })
}
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
    document.getElementById("sidebar")!.style.width = "300px";
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
    console.log("******")
    console.log(this.newContact.value)
    console.log(this.selectedCountry)
    console.log(this.code);
    this.submitted = true
    return;

    // if (this.newContact.invalid){
    //     return
    // }

		this.apiService.addContact(this.newContact.value).subscribe(response => {
			console.log(response)
		})
    if (this.newContact.invalid){
      return
  }
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
