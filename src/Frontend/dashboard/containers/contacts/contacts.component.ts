import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';

interface employee{
  id: number,
  name: string,
  phone: number,
  email: string,
  age: number,
  gender: string,
  tag: string,

}
@Component({
  selector: 'sb-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {


	 contacts:any;
	 name = 'Angular'; 
   checkedConatct: any[] = [];
	 productForm: FormGroup;  
   title = 'result-table';

  // multiselect 
    disabled = false;
    ShowFilter = false;
    limitSelection = false;
    cities: any = [];
    selectedItems: any = [];
    dropdownSettings = {}; 
   
   orderHeader: String = '';
   isDesOrder: boolean = true;
   employees: employee[] = [
    {id: 1, name: 'John Applessed', phone: +919874563210, email: 'john@yahoo.in', age: 23, gender: 'Male', tag: 'New Customer',},
    {id: 2, name: 'John Applessed', phone: +919874563210, email: 'john@yahoo.in', age: 23, gender: 'Male', tag: 'New Customer',},
    {id: 3, name: 'John Applessed', phone: +919874563210, email: 'john@yahoo.in', age: 23, gender: 'Male', tag: 'New Customer',},
    {id: 4, name: 'John Applessed', phone: +919874563210, email: 'john@yahoo.in', age: 23, gender: 'Male', tag: 'New Customer',},
    {id: 5, name: 'John Applessed', phone: +919874563210, email: 'john@yahoo.in', age: 23, gender: 'Male', tag: 'New Customer',},
    {id: 6, name: 'John Applessed', phone: +919874563210, email: 'john@yahoo.in', age: 23, gender: 'Male', tag: 'New Customer',},

   ]
   sort(headerName:String){
    this.isDesOrder = !this.isDesOrder;
    this.orderHeader = headerName;

   }
   
  
constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: DashboardService, private fb:FormBuilder) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
		this.productForm = this.fb.group({  
			name: '',  
			quantities: this.fb.array([]) ,  
		  });
	}
    ngOnInit() {
      this.cities = [
        { item_id: 1, item_text: 'New Delhi' },
        { item_id: 2, item_text: 'Mumbai' },
        { item_id: 3, item_text: 'Bangalore' },
        { item_id: 4, item_text: 'Pune' },
        { item_id: 5, item_text: 'Chennai' },
        { item_id: 6, item_text: 'Navsari' }
    ];
    this.selectedItems = [{ item_id: 4, item_text: 'Pune' }, { item_id: 6, item_text: 'Navsari' }];
    this.dropdownSettings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
        allowSearchFilter: this.ShowFilter
    };

    this.productForm = this.fb.group({
        city: [this.selectedItems]
    });
    
		this.getContact();
   
   
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
	opencollum(collum:any) {
		this.modalService.open(collum);
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
}