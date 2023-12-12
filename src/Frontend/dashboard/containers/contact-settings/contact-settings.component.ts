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
  selectedTab:number=1;
  tagId:number=0;
  tagColor:string='';
  tagName:string='';
  tagListData:any = []
  selectedtagListData:any = [];
  pageSize:number = 10;
  currentPage:number = 1;
  paging: number [] = [];
  showSideBar:boolean=false;
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
      ID:this.selectedtagListData?.ID
      }
    this._settingsService.deletTagData(tagData)
    .subscribe(result =>{
      if(result){
        this.getTagData();
        this.showSideBar = false;
        $("#deleteModal").modal('hide');
      }
    });
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
        this.showSideBar = false;
        $("#tagsModal").modal('hide');
      }
  
    })
  }

  editTagData() {
    let tagData = <TagData>{};
    tagData.SP_ID = this.sp_Id;
    tagData.ID = this.selectedtagListData?.ID;
    tagData.TagColour = this.tagColor;
    tagData.TagName = this.tagName;
    this._settingsService.updateTagData(tagData)
    .subscribe(result =>{
      if(result){
        console.log(result);
        this.getTagData();
        this.showSideBar = false;
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

  closeTagsModal() {
    this.selectedtagListData = null;
    this.getTagData();
    this.showSideBar = false;
  $("#tagsModal").modal('hide');
}

  toggleSideBar(data:any){
    this.showSideBar =!this.showSideBar;
    this.selectedtagListData = data;
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
