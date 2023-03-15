import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';

@Component({
	selector: 'sb-contacts',
	templateUrl: './contacts.component.html',
	styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {

	contacts: any;
	checkedConatct: any[] = [];
	name = 'Angular';
	productForm: FormGroup;
	newContact:FormGroup;
	orderHeader: String = '';
	isDesOrder: boolean = true;
	filterForm=new FormGroup({
		Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)]))
	})
    
	searchForm=new FormGroup({
		Phone_number: new FormControl(''),
		Name:new FormControl(''),
		emailId:new FormControl('')
	})

	// newContact = new FormGroup({
	// 	Name: new FormControl('', Validators.required),
	// 	Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
	// 	emailId: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
	// 	age: new FormControl(''),
	// 	tag: new FormControl(''),
	// 	status: new FormControl(''),
	// 	facebookId: new FormControl(''),
	// 	InstagramId: new FormControl('')
	// });

	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService, private fb: FormBuilder) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;

		this.productForm = this.fb.group({
			name: '',
			quantities: this.fb.array([]),
		});

		this.newContact=this.fb.group({
		Name: new FormControl('', Validators.required),
		Phone_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
		emailId: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
		age: new FormControl(''),
		tag: this.fb.array([]),
		status:this.fb.array([]),
		facebookId: new FormControl(''),
		InstagramId: new FormControl('')
			
		});
		
	}
	ngOnInit() {
		this.getContact();
        
	}
	 tag():FormArray{
		return this.newContact.get("tag") as FormArray
	 }
	 status():FormArray{
		return this.newContact.get("status") as FormArray
	 }
	quantities(): FormArray {
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

	removeQuantity(i: number) {
		this.quantities().removeAt(i);
	}

	onSubmit() {
		console.log(this.productForm.value);
	}
	sort(headerName:String){
		this.isDesOrder = !this.isDesOrder;
		this.orderHeader = headerName;
	
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

	open(content: any) {
		this.modalService.open(content);
	}

	opens(contents: any) {
		this.modalService.open(contents);
	}

	openadd(contactadd: any) {
		this.modalService.open(contactadd);
	}
	opencollum(collum: any) {
		this.modalService.open(collum);
	}

	getContact() {
		this.apiService.Contact().subscribe(data => {
			this.contacts = data;
			console.log(this.contacts);
		});
	}
	addContact() {

		if (this.newContact.valid) {
			const data=this.newContact.value;
			console.log(this.newContact.value)
			this.apiService.addContact(data).subscribe((response: any) => {
				console.log(response)
			})
		}
	}




	getCheckBoxEvent(isSelected: any, contact: any) {
		console.log( isSelected,contact);
		var obj = {
			data: contact,
			status: isSelected
		}
		if (obj.status === true) {
			
			this.checkedConatct.push(obj.data);
		
		} else if (obj.status === false) {
			
			var index = this.checkedConatct.indexOf(obj.data)
			console.log(index)
			this.checkedConatct.splice(index, 1);
			
		}

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