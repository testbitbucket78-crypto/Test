import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sb-funnel',
  templateUrl: './funnel.component.html',
  styleUrls: ['./funnel.component.scss']
})
export class FunnelComponent implements OnInit {
  funnelDetail:boolean=false;
  ShowChannelOption:any=false;
  modalReference:any;
  selectedTemplate:any;
  newCampaignDetail:any;
  getVariables:any;
  segmentsContactList:any
  csvContactList:any;
  funneladd:boolean=false;
  activeStep:any=1;
  channelOption:any=[
    {value:1,label:'WhatsApp Official',checked:false},
    {value:2,label:'WhatsApp Web',checked:false}];
  allTemplatesMain: any;
  allTemplates: any;
  selecetdVariable: any;
  attributesoptionFilters: any;
  attributesoption: any;

  constructor(config: NgbModalConfig,private modalService: NgbModal) { }

  ngOnInit(): void {
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

selectChannel(channel:any){
  // this.newCampaignDetail.get('channel_id').setValue(channel.value);
  // this.newCampaignDetail.get('channel_label').setValue(channel.label);
  // this.ShowChannelOption=false
  // console.log(this.newCampaignDetail)
}

toggleCampaign(){
  this.funnelDetail =!this.funnelDetail 
  }
  toggleChannelOption(){
		this.ShowChannelOption=!this.ShowChannelOption;
	}

  newcampaign(){
    this.funneladd= !this.funneladd
  }

  prevStep(){
		if(this.activeStep >1){
			this.activeStep = this.activeStep-1
		}else{
				
		}
	}
  setStep(newStep:any){
		
		this.activeStep = newStep
		// if(newStep ==3){
		// 	this.getTemplates()
		// }
		
	}

  openAddNew(addNewCampaign:any){
    console.log('function called!')
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}
  closeAllModal(){
		if(this.modalReference){
			this.modalReference.close();
	    }
	}
  stopPropagation(event: Event) {
    event.stopPropagation();
    }
    closeAddActionDialog() {
    this.ShowChannelOption = false;
    }

    selectTemplate(template: any) {
      this.selectedTemplate = template;
      console.log(this.selectedTemplate);
      var str = template.BodyText;
      if (str) {
        const allVariables = this.getVariables(str, "{{", "}}");
        let allVariablesList: any = [];
        console.log(allVariablesList);
      
        allVariables.map((item: any) => {
        allVariablesList.push({ label: item, value: '' });
        });
      
        this.selectedTemplate['allVariables'] = allVariablesList;
        console.log(this.selectedTemplate);
      }
      }

    searchTemplate(event:any){
      let searchKey = event.target.value
      if(searchKey.length>2){
      var allList = this.allTemplatesMain
      let FilteredArray = [];
      for(var i=0;i<allList.length;i++){
        var content = allList[i].TemplateName.toLowerCase()
          if(content.indexOf(searchKey.toLowerCase()) !== -1){
            FilteredArray.push(allList[i])
          }
      }
      this.allTemplates = FilteredArray
        }else{
        this.allTemplates = this.allTemplatesMain
      }
    }
  
    filterTemplate(temType:any){
  
      let allList  =this.allTemplatesMain;
      if(temType.target.checked){
      var type= temType.target.value;
      for(var i=0;i<allList.length;i++){
          if(allList[i]['Category'] == type){
            allList[i]['is_active']=1
          }
      }
       }else{
      var type= temType.target.value;
      for(var i=0;i<allList.length;i++){
          if(allList[i]['Category'] == type){
            allList[i]['is_active']=0
          }
      }
       }
      var newArray=[];
       for(var m=0;m<allList.length;m++){
            if(allList[m]['is_active']==1){
        newArray.push(allList[m])
        }
  
       }
       this.allTemplates= newArray
  
      
    }


	updateButtonsValue(event:any,variable:any){
		this.selectedTemplate[variable]=event.target.value
		console.log(this.selectedTemplate)
	}
	updatedAttributeOption(attribute:any,addNewCampaign:any){
		console.log(attribute)
		this.activeStep=3.1
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	    console.log(this.selectedTemplate)
	}
	closeAttributeOption(status:any,addNewCampaign:any){
		if(status != 'save'){
		}
		this.activeStep=3.1
		this.closeAllModal()
		console.log(this.selectedTemplate)
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	    
	}

  updateAttributeValue(event:any,variable:any){
		variable['value']=event.target.value
		console.log(this.selectedTemplate)
	}
	updateFallbackAttributeValue(event:any){
		this.selecetdVariable['value']=event.target.value
		console.log(this.selectedTemplate)
	}

  openAttributeOption(variable:any,AttributeOption:any){
    this.attributesoptionFilters = this.attributesoption
    this.selecetdVariable = variable
    console.log(variable)
  this.closeAllModal()
  this.modalReference = this.modalService.open(AttributeOption,{size: 'ml', windowClass:'pink-bg'});
}
}