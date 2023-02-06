import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DashboardService} from './../../services';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'sb-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings:IDropdownSettings = {};

	 contacts:any;
	 name = 'Angular'; 
	 productForm: FormGroup;  
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
		this.getContact();
this.dropdownList = [
  { item_id: 1, item_text: 'Mumbai' },
  { item_id: 2, item_text: 'Bangaluru' },
  { item_id: 3, item_text: 'Pune' },
  { item_id: 4, item_text: 'Navsari' },
  { item_id: 5, item_text: 'New Delhi' }
];
this.selectedItems = [
  { item_id: 3, item_text: 'Pune' },
  { item_id: 4, item_text: 'Navsari' }
];
this.dropdownSettings = {
  singleSelection: false,
  idField: 'item_id',
  textField: 'item_text',
  selectAllText: 'Select All',
  unSelectAllText: 'UnSelect All',
  itemsShowLimit: 3,
  allowSearchFilter: true
};
   
} 
onItemSelect(item: any) {
  console.log('onItemSelect',item);
}
onSelectAll(items: any) {
  console.log('onSelectAll',items);
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

}