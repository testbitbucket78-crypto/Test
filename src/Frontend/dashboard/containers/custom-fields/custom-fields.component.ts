import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { addCustomFieldsData, customFieldFormData } from 'Frontend/dashboard/models/settings.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
declare var $:any;

@Component({
  selector: 'sb-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss']
})



export class CustomFieldsComponent implements OnInit {
  spId:number = 0;
  isActive: number = 1;
  defaultFields = '#6149CD';
  defaultFieldsChecked= '#EBEBEB'; 
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  currentPage!: number;
  paging: number[] = [];
  showSideBar:boolean=false;
  addCustomField:customFieldFormData [] =[]
  customFieldForm!:FormGroup;
  customFieldData:[] = [];
  defaultFieldsData = [];
  dynamicFieldData = [];


  selectedType:string = 'Text';
  types:string[] =['Text','Multi text','Multi number','Select','Switch','Date','User' ];


  Drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.dynamicFieldData, event.previousIndex, event.currentIndex);
    } 

    ngOnInit(): void {
        this.spId = Number(sessionStorage.getItem('SP_ID'));
        this.getCustomFieldsData();
      
        
    }
  
  

    constructor(private formBuilder:FormBuilder,private settingsService:SettingsService) {
      this.addCustomField = [];

      this.customFieldForm = this.formBuilder.group({
        ColumnName: ['',Validators.required],
        description:[''],
        Type: ['Text',Validators.required],
      });
    };

// toggle active/inactive state of logged in user

toggleActiveState(checked: boolean) {
  this.isActive = checked ? 1 : 0;

 }

 toggleSideBar(){
  this.showSideBar =!this.showSideBar;
  console.log(this.dynamicFieldData);
 }

//  searchData(srchText:string) {
//   const defaultFieldsDataInit = [...this.defaultFieldsData]
//   const searchResult = defaultFieldsDataInit.filter(item => {
//     return item?.ActuallName.toLowerCase().includes(srchText.toLowerCase());
//   });
//   console.log(searchResult);
//  }

addCustomFieldsOption(){
  this.addCustomField.push({
    Option1: '',
    Option2: '',
  })
}

removeCustomFieldsOption(index:any){
  this.addCustomField.splice(index,1);
}


 getPaging() {
  this.paging = [];
  this.currentPage = 1;
  let totalPages = Math.ceil(this.dynamicFieldData.length / this.pageSize);
  for (let i = 1; i <= totalPages; i++) {
      this.paging.push(i);
  }
}



getCustomFieldsData() {
  this.settingsService.getNewCustomField(this.spId).subscribe(response => {
    this.customFieldData = response.getfields;
    this.getDefaulltFieldData();
    this.getDynamicFieldData();
    this.getPaging();
  })
}


getDefaulltFieldData() {
const index = [3, 0, 6, 12, 17];
  for (const i of index) {
    if (i >= 0 && i < this.customFieldData.length) {
      this.defaultFieldsData.push(this.customFieldData[i]);
    }
  }
}


getDynamicFieldData() {
  const index = [3, 0, 6, 12, 17];
   for (let i = 0; i < this.customFieldData.length; i++) {
    if (!index.includes(i)) {
      this.dynamicFieldData.push(this.customFieldData[i]);
    }
  }
}



saveNewCustomField() {
  let addCustomFieldData = this.getCustomFieldFormData();
  if(this.customFieldForm.valid) {
    this.settingsService.saveNewCustomField(addCustomFieldData)
    .subscribe(response=>{
      if(response.status === 200) {
        this.customFieldForm.reset();
        $("#addCustomFieldModal").modal('hide');
        this.getCustomFieldsData();
      }
    })
  }
}

getCustomFieldFormData() {
  
let CustomFieldData:addCustomFieldsData = <addCustomFieldsData>{};
    CustomFieldData.SP_ID = this.spId;
    CustomFieldData.ColumnName = this.customFieldForm.controls.ColumnName.value;
    CustomFieldData.Type = this.customFieldForm.controls.Type.value;
    CustomFieldData.description = this.customFieldForm.controls.description.value;

    return CustomFieldData;
}


patchFormDataValue(){
  const data = this.dynamicFieldData;
  for(let prop in data){
    let value = data[prop as keyof typeof data];
    if(this.customFieldForm.get(prop))
    this.customFieldForm.get(prop)?.setValue(value)
  }  
}

editCustomField() { 
  $("#addCustomFieldModal").modal('show');
  this.showSideBar = false;
  this.patchFormDataValue();
}

toggleDeletePopup() {
  $("#deleteModal").modal('show');
  this.showSideBar = false;
}


// deleteCustomField() {

//   const ID = {
//     ID: this.dynamicFieldData
//   }

//   this.settingsService.deleteCustomField()
  
//   .subscribe(result =>{
//     if(result){
//       $("#deleteModal").modal('hide');
//       this.getCustomFieldsData();
   
      
//     }
//   });
// }






}
