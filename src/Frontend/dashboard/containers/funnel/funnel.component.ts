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
  funneladd:boolean=false;
  activeStep:any=1;
  channelOption:any=[
    {value:1,label:'WhatsApp Official',checked:false},
    {value:2,label:'WhatsApp Web',checked:false}];

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
}