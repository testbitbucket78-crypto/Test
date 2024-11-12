import { Component, OnInit } from '@angular/core';
import { TagData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { SearchfilterPipe } from '../Search/searchfilter.pipe';
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
  istagChanges:boolean=false;
  searchText = '';
  isLoading!:boolean;
  errorMessage='';
	successMessage='';
	warningMessage='';
  private searchFilterPipe = new SearchfilterPipe();
  constructor(private _settingsService:SettingsService,public settingsService:SettingsService) {
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
   }

  ngOnInit(): void {
    this.isLoading = true;
    this.getTagData();
  
  }

  showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}else if(type=='error'){
			this.errorMessage=message;
		}else{
			this.warningMessage=message;
		}
		setTimeout(() => {
			this.hideToaster()
		}, 3000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.errorMessage='';
		this.warningMessage='';
	}

  getTagData(){
    this._settingsService.getTagData(this.sp_Id)
    .subscribe(result =>{
      this.isLoading = false;
      if(result){
       this.tagListData = result?.taglist;
       this.getPaging();
      }
    });
  }

  isSaveButtonDisabled(): boolean {
    if (!this.selectedtagListData) {
      return !(this.tagName && this.tagName.trim() !== '' 
             && this.tagColor && this.tagColor.trim()!== '');
    } else {
      return !(
        this.selectedtagListData?.TagName &&
        this.selectedtagListData?.TagName.trim() !== '' &&
        //&& this.tagName.match(/^[a-zA-Z0-9][a-zA-Z0-9\s]*[a-zA-Z0-9]$/)
       // this.selectedtagListData.TagName.match(/^[a-zA-Z0-9][a-zA-Z0-9\s]*[a-zA-Z0-9]$/) &&
        this.selectedtagListData?.TagColour &&
        this.selectedtagListData?.TagColour.trim() !== '');
    }
  }

  

  addEditTagData() {
    
    let tagData = <TagData>{};
    tagData.SP_ID = this.sp_Id;
    if(this.selectedtagListData?.ID) {
      tagData.ID = this.selectedtagListData?.ID;
      tagData.TagName = this.settingsService.trimText(this.selectedtagListData?.TagName);
      tagData.TagColour = this.selectedtagListData?.TagColour;
    }
    else {
      tagData.ID = 0;
      tagData.TagColour = this.tagColor;
      tagData.TagName = this.settingsService.trimText(this.tagName);
    }

    this._settingsService.updateTagData(tagData)
    .subscribe(result =>{
      if(result.status==200){
        this.closeTagsModal()
      }
    }, (error)=>{
      if(error.status==409) {
        this.showToaster('Tag with this name is already exist, Please choose another name!','error');
      }
    });
  }

  addTag(){
    this.tagName='';
    this.tagColor='';
    this.selectedtagListData = null;
    $("#tagsModal").modal('show');
    this.istagChanges = false;
  }

  editTag() {
    $("#tagsModal").modal('show');
    this.istagChanges = false;
  }

  deleteTagData(){
    let tagData = {
      ID:this.selectedtagListData?.ID
      }
    this._settingsService.deleteTagData(tagData)
    .subscribe(result =>{
      if(result){
        this.getTagData();
        this.showSideBar = false;
        $("#deleteModal").modal('hide');
      }
    });
  }

  closeTagsModal() {
    this.selectedtagListData = null;
    this.getTagData();
    this.showSideBar = false;
    $("#tagsModal").modal('hide');
    this.istagChanges = false;
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
filteredData: any[] = [];
onSearchFieldChange() {
  this.filteredData = this.searchFilterPipe.transform(this.tagListData, this.searchText);
  this.getPagingOfSearch()
}
getPagingOfSearch(){
  this.paging = [];
  this.currentPage = 1;
  let totalPages = Math.ceil(this.filteredData.length / this.pageSize);
  for (let i = 1; i <= totalPages; i++) {
      this.paging.push(i);
  }
}
}
