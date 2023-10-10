import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDrag,CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { customFieldFormData } from 'Frontend/dashboard/models/settings.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'sb-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss']
})



export class CustomFieldsComponent implements OnInit {
  isActive: number = 1;
  defaultFields = '#6149CD';
  defaultFieldsChecked= '#EBEBEB'; 
  pageSize: number = 5;
  pageSizeOptions: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  currentPage!: number;
  paging: number[] = [];
  showSideBar:boolean=false;
  addCustomField:customFieldFormData [] =[]
  customFieldForm!:FormGroup;
  defaultFieldsData = [
    {
      FieldId: 'name',
      FieldName: 'Name',
      Type: 'Text',
      Mandatory: true,
      Status: 'Active',
    },
    {
      FieldId: 'phone_number',
      FieldName: 'Phone No.',
      Type: 'Multi Number',
      Mandatory: true,
      Status: 'Active',
    },
    {
      FieldId: 'email',
      FieldName: 'Email',
      Type: 'Multi text',
      Mandatory: true,
      Status: 'Active',
    },
    {
      FieldId: 'Message-opt-in',
      FieldName: 'Message-opt-in',
      Type: 'Switch',
      Mandatory: true,
      Status: 'Active',
    },
    {
      FieldId: 'contact_owner',
      FieldName: 'Contact Owner',
      Type: 'User',
      Mandatory: true,
      Status: 'Active',
    },

  ];

  dynamicFieldData = [
    {
      FieldId: 'tags',
      FieldName: 'Tags',
      Type: 'Multi text',
      Mandatory: false,
      Status: 'Inactive',
    },
    {
      FieldId: 'country',
      FieldName: 'Country',
      Type: 'text',
      Mandatory: true,
      Status: 'active',
    },
    {
      FieldId: 'gender',
      FieldName: 'Gender',
      Type: 'text',
      Mandatory: false,
      Status: 'Inactive',
    },
    {
      FieldId: 'status',
      FieldName: 'Status',
      Type: 'Select',
      Mandatory: true,
      Status: 'active',
    },
    {
      FieldId: 'age',
      FieldName: 'Age',
      Type: 'Date',
      Mandatory: false,
      Status: 'Inactive',
    },

    {
      FieldId: 'tags',
      FieldName: 'Tags',
      Type: 'Multi text',
      Mandatory: false,
      Status: 'Inactive',
    },
    {
      FieldId: 'country',
      FieldName: 'Country',
      Type: 'text',
      Mandatory: true,
      Status: 'active',
    },
    {
      FieldId: 'gender',
      FieldName: 'Gender',
      Type: 'text',
      Mandatory: false,
      Status: 'Inactive',
    },
    {
      FieldId: 'status',
      FieldName: 'Status',
      Type: 'Select',
      Mandatory: true,
      Status: 'active',
    },
    {
      FieldId: 'age',
      FieldName: 'Age',
      Type: 'Date',
      Mandatory: false,
      Status: 'Inactive',
    },

  ];



  types:string[] =['Text','Multi text','Multi number','Select','Switch','Date','User' ]


  Drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.dynamicFieldData, event.previousIndex, event.currentIndex);
    } 

    ngOnInit(): void {
        this.getPaging();
        
    }
  
// toggle active/inactive state of logged in user

toggleActiveState(checked: boolean) {
  this.isActive = checked ? 1 : 0;

 }

 toggleSideBar(){
  this.showSideBar =!this.showSideBar;
 }

 searchData(srchText:string) {
  const defaultFieldsDataInit = [...this.defaultFieldsData]
  const searchResult = defaultFieldsDataInit.filter(item => {
    return item?.FieldName.toLowerCase().includes(srchText.toLowerCase());
  });
  console.log(searchResult);
 }

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

}
