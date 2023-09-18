import { Component, OnInit } from '@angular/core';
import {SettingsService} from 'Frontend/dashboard/services/settings.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import{ repliestemplateList } from 'Frontend/dashboard/models/settings.model';
import{ templateList } from 'Frontend/dashboard/models/settings.model';
import { FormControl, FormGroup } from '@angular/forms';
declare var $:any;

@Component({
  selector: 'sb-quick-response',
  templateUrl: './quick-response.component.html',
  styleUrls: ['./quick-response.component.scss']
})
export class QuickResponseComponent implements OnInit {

  showCampaignDetail:boolean=false;
  created_By:any;
  modalReference:any;
  spid!:number;
  getTemplate:any;
  // templates!:any[];
  ID:number=0;
  data: any;
  repliestemplateData!:repliestemplateList;
  templatesquickdata!:templateList;
  usertemplateForm!:FormGroup;
  items: any;
  templates!:any[];
  messagemedia:any;
  selectedType: string = 'text';
  rolesList:any;
  // templatesdata:any;
  Links:any;
  TemplateName:any;
  BodyText:any;
  Channel:any;
  result:any;
  Header:any;
  isTemplate:any;
  // templatesMessageData:any;
  ischannel='';
  base64?: string | null;
  Selectchannel: string | null = null;
  
  
  

  constructor(config: NgbModalConfig,private modalService: NgbModal,private apiService:SettingsService) { }

  ngOnInit(): void {
    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.created_By = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
    this.Template();
    this.usertemplateForm=this.prepareUserForm();
    this.getformvalue();
  }
  

  	toggleCampaign(){
		this.showCampaignDetail =!this.showCampaignDetail 
		}

    filterChannels(filterchannels: any) {
      if (this.modalReference) {
          this.modalReference.close();
      }
      this.modalReference = this.modalService.open(filterchannels, {
          size: 'sm',
          windowClass: 'white-pink',
          backdrop: 'static',
          keyboard: false,
      });
  }

  prepareUserForm(){
    return new FormGroup({
      Links:new FormControl(),
      TemplateName:new FormControl(),
      Header:new FormControl(),
      BodyText:new FormControl(),
      Channel:new FormControl(),
    });
  }
  


  Template(){
    this.apiService.getTemplateData(this.spid,0).subscribe(response => {
      this.templates=response.templates;
      console.log(this.templates);
    });    
  }
  
  getRolesList(){
    this.apiService.getTemplateData(this.spid,0).subscribe(response =>{
      if(response){
       this.rolesList = response?.getRoles;
        
      }
  
    })
  }


  saveTemplate(){
    let userData=this.saveformmtemplate();
    this.apiService.addTemplate(userData).subscribe(response=>{
      if(response){
        this.Template();            
      }
    console.log(this.TemplateName);
    console.log(this.Channel);
    console.log(this.Header);
    console.log(this.Links);
    console.log(response);

    });
  }



  saveformmtemplate(){
    let userData:templateList =<templateList>{};
    userData.isTemplate=0;
    userData.spid=this.spid;
    userData.ID=this.ID;
    userData.created_By=this.created_By;
    userData.Links=this.usertemplateForm.controls.Links.value;
    userData.TemplateName=this.usertemplateForm.controls.TemplateName.value;
    userData.Channel=this.usertemplateForm.controls.Channel.value;
    userData.Header=this.usertemplateForm.controls.Header.value;
    userData.BodyText=this.usertemplateForm.controls.BodyText.value;
    return userData;

  };


 getformvalue(){
  const data=this.usertemplateForm;
  for(let prop in data){
    let value=data[prop as keyof typeof data]
    if(this.usertemplateForm.get(prop))
    this.usertemplateForm.get(prop)?.setValue(value)
  }
 }


  gettemplateByID(data:any) {
    this.repliestemplateData=data;
    console.log(this.repliestemplateData);
    const a= this.repliestemplateData.Links;
    this.messagemedia=a;
    // console.log(templatesdata);
}


deleteTemplate(){

  const TemplateID = {
    ID: this.repliestemplateData?.ID
  }

  this.apiService.deleteTemplateData(TemplateID)
  
  .subscribe(result =>{
    if(result){
      $("#deleteModal").modal('hide');
      this.showCampaignDetail = false;
      this.Template(); 
    }
  });
}



showMessageType(type: string) {
  this.selectedType = type;
}  
}