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
  ID!:number;
  isActive: number = 1;
  defaultFields = '#6149CD';
  defaultFieldsChecked= '#EBEBEB'; 
  pageSize: number = 50;
  pageSizeOptions: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  currentPage!: number;
  paging: number[] = [];
  showSideBar:boolean=false;
  addCustomField:customFieldFormData [] =[]
  customFieldForm!:FormGroup;
  customFieldData:[] = [];
  defaultFieldsData = [];
  dynamicFieldData = [];
  selectedCustomField:any = [];


  selectedType:string = 'Text';
  types:string[] =['Text','Multi text','Multi number','Select','Switch','Date Time','User' ];


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
        displayName: ['',Validators.required],
        description:[''],
        Type: ['Text',Validators.required],
      });
    };

// toggle active/inactive state of logged in user

toggleActiveState(checked: boolean) {
  this.isActive = checked ? 1 : 0;

 }

 toggleSideBar(data:any){
  this.showSideBar =!this.showSideBar;
  this.selectedCustomField = data
  console.log(this.selectedCustomField);
 }

//  searchData(srchText:string) {
//   const defaultFieldsDataInit = [...this.dynamicFieldData]
//   const searchResult = defaultFieldsDataInit.filter((item:any) => {
//     return item?.ActuallName.toLowerCase().includes(srchText.toLowerCase())
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
    console.log(this.customFieldData);  
    this.getDefaulltFieldData();
    this.getDynamicFieldData();
    this.getPaging();
  })
}

resetSelectedCustomField() {
  this.selectedCustomField = null;
  this.customFieldForm.reset();
  this.showSideBar = false;
}

getDefaulltFieldData() {
const index = [13, 15, 9, 14, 5, 20];
  for (const i of index) {
    if (i >= 0 && i < this.customFieldData.length) {
      this.defaultFieldsData.push(this.customFieldData[i]);
    }
  }
  console.log(this.defaultFieldsData);
  console.log('default field data')
}


getDynamicFieldData() {
  const index = [13, 15, 9, 14, 5, 20];
   for (let i = 0; i < this.customFieldData.length; i++) {
    if (!index.includes(i)) {
      this.dynamicFieldData.push(this.customFieldData[i]);
    }
  }
     console.log(this.dynamicFieldData);
  console.log('dynamic field data')
}



saveNewCustomField() {
  let addCustomFieldData = this.getCustomFieldFormData();
  if(this.selectedCustomField==null) {
    this.settingsService.saveNewCustomField(addCustomFieldData)
    .subscribe(response=>{
      if(response.status === 200) {
        this.customFieldForm.reset();
        $("#addCustomFieldModal").modal('hide');
        this.getCustomFieldsData();
      }
    })
  }
  else {
    this.settingsService.UpdateCustomField(addCustomFieldData)
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
    CustomFieldData.id = this.ID;
    CustomFieldData.SP_ID = this.spId;
    CustomFieldData.ColumnName = this.customFieldForm.controls.displayName.value;
    CustomFieldData.Type = this.customFieldForm.controls.Type.value;
    CustomFieldData.description = this.customFieldForm.controls.description.value;

    return CustomFieldData;
}



patchFormDataValue() {
  const data = this.selectedCustomField;
  console.log(data);
  let id = data.id;
  for(let prop in data){
    let value = data[prop as keyof typeof data];
    if(this.customFieldForm.get(prop))
    this.customFieldForm.get(prop)?.setValue(value);
    this.ID=id;
    console.log(this.ID);
  }  
}

addCustomFields() {
  this.selectedCustomField = null;
  $("#addCustomFieldModal").modal('show');
}

editCustomField() { 
  $("#addCustomFieldModal").modal('show');
  this.patchFormDataValue();
}

toggleDeletePopup() {
  $("#deleteModal").modal('show');
}

deleteCustomField() {

  let id = this.selectedCustomField?.id;
  console.log(id);
  this.settingsService.deleteCustomField(id)
  
  .subscribe(result =>{
    if(result){
      $("#deleteModal").modal('hide');
      this.getCustomFieldsData();
      this.getDefaulltFieldData();
      this.getDynamicFieldData();
    }
  });
}

}
