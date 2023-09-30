import { Component, OnInit } from '@angular/core';
import { TagData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
declare var $:any;

@Component({
  selector: 'sb-contact-settings',
  templateUrl: './contact-settings.component.html',
  styleUrls: ['./contact-settings.component.scss']
})
export class ContactSettingsComponent implements OnInit {
  
  sp_Id:number;
  selectedTab:number=2;
  tagId:number=0;
  tagColor:string='';
  tagName:string='';
  tagListData = [];
  pageSize:number = 10;
  currentPage:number = 1;
  paging: number [] = [];
  searchText = '';
  constructor(private _settingsService:SettingsService) {
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
   }

  ngOnInit(): void {
    this.getTagData();
  
  }

  getTagData(){
    this._settingsService.getTagData(this.sp_Id)
    .subscribe(result =>{
      if(result){
       this.tagListData = result.taglist;
       console.log(this.tagListData);
       this.getPaging();
        
      }
  
    })
  }

  deleteTagData(){
    let tagData = {
      ID:this.tagId
      }
    this._settingsService.deletTagData(tagData)
    .subscribe(result =>{
      if(result){
        console.log(result);
        
      }
  
    })
  }

  
  updateTagData(){
    let tagData = <TagData>{};
    tagData.SP_ID = this.sp_Id;
    tagData.ID = this.tagId;
    tagData.TagColour = this.tagColor;
    tagData.TagName = this.tagName;
    this._settingsService.updateTagData(tagData)
    .subscribe(result =>{
      if(result){
        console.log(result);
        this.getTagData();
        $("#tagsModal").modal('hide');
      }
  
    })
  }

  addTag(){
    this.tagId = 0;
    this.tagName='';
    this.tagColor='';
  }

  editTag(){
    this.tagId = 0;
    this.tagName='';
    this.tagColor='';
  }


  getPaging() {
    this.paging = [];
    this.currentPage = 1;
    let totalPages = Math.ceil( this.tagListData.length/this.pageSize);
    for (let i = 1; i <= totalPages; i++) {
       this.paging.push(i);
  }
}
}
