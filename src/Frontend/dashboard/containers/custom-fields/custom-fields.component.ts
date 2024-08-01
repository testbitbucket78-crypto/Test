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
  pageSize: number = 10;
  pageSizeOptions: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  currentPage!: number;
  paging: number[] = [];
  showSideBar:boolean=false;
  searchCustomField = '';
  addCustomField:customFieldFormData [] =[]
  customFieldForm!:FormGroup;
  customFieldData:[] = [];
  defaultFieldsData = [];
  dynamicFieldData = [];
  selectedCustomField:any = [];
  isLoading!:boolean;

  selectedType:string = 'Text';
  types:string[] =['Text','Number','Select','Switch','Date','Time','Multi Select' ];
  isFormChanged:boolean = false;
  isEdit:boolean = false;
  errorMessage = '';



  // Drop(event: CdkDragDrop<string[]>) {
  //     moveItemInArray(this.dynamicFieldData, event.previousIndex, event.currentIndex);
  //   } 

    ngOnInit(): void {
        this.isLoading = true;
        this.spId = Number(sessionStorage.getItem('SP_ID'));
        this.getCustomFieldsData();
        this.addCustomFieldsOption();
        //setTimeout(()=>{this.getPaging()},2000);
    }
    constructor(private formBuilder:FormBuilder,private settingsService:SettingsService) {
      this.addCustomField = [];

      this.customFieldForm = this.formBuilder.group({
        displayName: ['',Validators.required],
        description:[''],
        type: ['Text',Validators.required],
      });
    };
    

toggleActiveState(checked: boolean, ID:number) {
   let isStatus = checked ? 1 : 0;
   console.log(isStatus,'Checked!')
   let statusData = <any>{};
   let id = ID;
   console.log(id ,'ID')
   statusData.id = id;
   statusData.Status = isStatus;
   if(!checked)
   this.toggleMandatoryState(checked, ID)
    this.settingsService.enableDisableStatus(statusData)
    .subscribe(result =>{
      if(result){
       this.getCustomFieldsData()
      }
    });
 }

 toggleMandatoryState(checked: boolean, ID:number) {
    let isMandatory = checked ? 1 : 0;
    let mandatoryData = <any>{};
    let id = ID;
    mandatoryData.id = id;
    mandatoryData.Mandatory = isMandatory;
    this.settingsService.enableDisableMandatory(mandatoryData)
    .subscribe(result =>{
      if(result){
        this.getCustomFieldsData()
      }
    });

}

 toggleSideBar(data:any){
  this.selectedCustomField = data
  this.showSideBar =!this.showSideBar;
  // let id = data?.id
  //   if(id!=0){
  //     this.showSideBar =!this.showSideBar;
  //   }
 }

// searchCustomField(event:any){
//   let searchKey = event.target.value
//   if(searchKey.length>2){
//   let allList:any = this.customFieldData
//   let FilteredArray:any = [];
//   for(let i=0;i<allList.length;i++){
//     let content = allList[i].displayName.toLowerCase()
//       if(content.indexOf(searchKey.toLowerCase()) !== -1){
//         FilteredArray.push(allList[i])
//       }
//   }    this.dynamicFieldData = FilteredArray
//     } 
//       else {
//         this.dynamicFieldData = this.customFieldData
//       }
// }

addCustomFieldsOption(){
  this.addCustomField.push({
    id: '',
    Option: '',
  })
  this.isEdit = false;
  this.customFieldForm.get('type')?.enable();
}

removeCustomFieldsOption(index:any){
  this.addCustomField.splice(index,1);
}


 getPaging() {
  this.paging = [];
  this.currentPage = 1;
  let totalPages = Math.ceil(this.customFieldData.length / this.pageSize);
  for (let i = 1; i <= totalPages; i++) {
      this.paging.push(i);
  }
}



getCustomFieldsData() {
  this.settingsService.getNewCustomField(this.spId).subscribe(response => {
    this.isLoading = false;
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
  const defaultFieldNames:any = ["Name", "Phone_number", "emailId", "ContactOwner", "OptInStatus","tag"];
     const filteredFields:any = this.customFieldData.filter(
        (field:any) => defaultFieldNames.includes(field.ActuallName));
        this.defaultFieldsData = filteredFields;
        console.log(this.defaultFieldsData)
}


getDynamicFieldData() {
  const defaultFieldNames =["Name", "Phone_number", "emailId", "ContactOwner", "OptInStatus","tag"];
       this.dynamicFieldData = this.customFieldData.filter(
       (field:any) => !defaultFieldNames.includes(field.ActuallName));
       console.log(this.dynamicFieldData)
}

saveNewCustomField() {
  
  if(this.customFieldForm.valid) {
    let addCustomFieldData = this.getCustomFieldFormData();
    if(this.selectedCustomField==null) {
      this.settingsService.saveNewCustomField(addCustomFieldData)
      .subscribe(response=>{
        if(response.status === 200) {
          this.customFieldForm.reset();
          $("#addCustomFieldModal").modal('hide');
          this.showSideBar = false;
          this.getCustomFieldsData();
        } 
      },
      (error:any) =>{
       if(error) { 
         if(error.status == 409){
          console.log('Custom name already exist');
         this.showToaster('Custom name already exist !','error');
         }else
         this.showToaster(error.message,'error');
       }
      });
    }
    else {
      this.settingsService.UpdateCustomField(addCustomFieldData)
      .subscribe(response=>{
        if(response.status === 200) {
          this.customFieldForm.reset();
          $("#addCustomFieldModal").modal('hide');
          this.showSideBar = false;
          this.getCustomFieldsData();
        } 
      },
      (error:any) =>{
       if(error) { 
         if(error.status == 409)
         this.showToaster('Custom name already exist !','error');
         else
         this.showToaster(error.message,'error');
       }
      });
    }
  }
}

getCustomFieldFormData() {
  
let CustomFieldData:addCustomFieldsData = <addCustomFieldsData>{};
    CustomFieldData.id = this.ID;
    CustomFieldData.SP_ID = this.spId;
    CustomFieldData.ColumnName = this.customFieldForm.controls.displayName.value;
    CustomFieldData.Type = this.customFieldForm.controls.type.value;
    CustomFieldData.description = this.customFieldForm.controls.description.value;
    CustomFieldData.values = [];
    this.addCustomField.forEach((item:any,idx)=>{
      CustomFieldData.values.push({id:idx,optionName:item?.Option});
    })
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
    console.log(this.customFieldForm.get('type')?.value)
    this.ID=id;
    console.log(this.ID);
  }  
  let options= JSON.parse(data?.dataTypeValues);
  this.addCustomField = [];
  options.forEach((item:any)=>{
    this.addCustomField.push({id:item.id,Option:item.optionName});
  })
}

addCustomFields() {
  this.selectedCustomField = null;
  this.addCustomField =[{
    id: '',
    Option: '',
  }];
  this.isFormChanged = false;
  $("#addCustomFieldModal").modal('show');
  this.customFieldForm.get('type')?.enable();
}

editCustomField() { 
  $("#addCustomFieldModal").modal('show');
  this.isFormChanged = false;
  this.isEdit = true;
  this.customFieldForm.get('type')?.disable();
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
      this.showSideBar =false;
      this.getCustomFieldsData();
    }
  });
}

onInputChange(){
  this.isFormChanged = true;
}
previousFieldType: string = "";
fieldTypeChanged(){
  const currentFieldType = this.customFieldForm.controls['type'].value;
  if(currentFieldType && this.previousFieldType){
    if(this.previousFieldType != this.customFieldForm.controls['type'].value){
      this.addCustomField = [];
      this.addCustomField = [
        { id: '', Option: '' },
      ];
    }
  }
   this.previousFieldType = currentFieldType;
}
showToaster(message:any,type:any){
  if(type=='error'){
    this.errorMessage=message;
  }
  setTimeout(() => {
    this.hideToaster()
  }, 5000);
  
}
hideToaster(){
  this.errorMessage='';
}
}
