import { Component, OnInit, ViewChild } from '@angular/core';
import {SettingsService} from 'Frontend/dashboard/services/settings.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import{ repliestemplateList } from 'Frontend/dashboard/models/settings.model';
import{ templateList } from 'Frontend/dashboard/models/settings.model';
import { FormControl, FormGroup } from '@angular/forms';
import { TeamboxService } from 'Frontend/dashboard/services/teambox.service';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
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
  searchText:string='';
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

  
  fileName: any; 
  selectedPreview: string = '';
  @ViewChild('chatEditor') chatEditor?: RichTextEditorComponent;

  public tools: object = {
      items: [
          'Bold',
          'Italic',
          'StrikeThrough',
          'EmojiPicker',
          {
              tooltipText: 'Attributes',
              undo: true,
              click: this.ToggleAttributesOption.bind(this),
              template:
                  '<button style="width:28px;height:28px;border-radius: 35%!important;border: 1px solid #e2e2e2!important;background:#fff;" class="e-tbar-btn e-btn" tabindex="-1" id="custom_tbar"  >' +
                  '<div class="e-tbar-btn-text"><img style="width:10px;" src="/assets/img/teambox/attributes.svg"></div></button>',
          },
      ],
  };
  

  constructor(config: NgbModalConfig,private modalService: NgbModal,private apiService:SettingsService, private _teamboxService: TeamboxService) { }

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
  
  ToggleAttributesOption() {
    $('#atrributemodal').modal('show');
    $('#newTemplateMessage').modal('hide');
}

onEditorChange(value: string | null): void {
    this.usertemplateForm.get('BodyText')?.setValue(value);
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
    console.log(this.created_By);
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

copyCampaign() {
  
}

showMessageType(type: string) {
  this.selectedType = type;
}  

removeValue() {
  this.selectedPreview = '';
  this.fileName='';
  this.usertemplateForm.get('Links')?.setValue(null);
}


onFileChange(event: any) {
  let files: FileList = event.target.files;
  this.saveVideoAndDocument(files);
}

 
saveVideoAndDocument(files: FileList) {
  if (files[0]) {
      let File = files[0];
      this.fileName = this.truncateFileName(File.name, 25);
      let spid = this.spid
      let mediaType = files[0].type;
      const data = new FormData();
      data.append('dataFile', File, File.name);
      data.append('mediaType', mediaType);
      let name='template-message'
      this._teamboxService.uploadfile(data,spid,name).subscribe(uploadStatus => {
          let responseData: any = uploadStatus;
          if (responseData.filename) {
              this.selectedPreview = responseData.filename.toString();
              console.log(this.selectedPreview);
          }
      });
  }
}

truncateFileName(fileName: string, maxLength: number): string {
  if (fileName.length > maxLength) {
    return fileName.substring(0, maxLength) + '...';
  }
  return fileName;
}
}