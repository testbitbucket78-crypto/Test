import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sb-funnel',
  templateUrl: './funnel.component.html',
  styleUrls: ['./funnel.component.scss']
})
export class FunnelComponent implements OnInit {
  funnelDetail:boolean=false;
  modalReference:any;
  funneladd:boolean=false;
  activeStep:any=1;

  constructor(private modalService: NgbModal) { }

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
toggleCampaign(){
  this.funnelDetail =!this.funnelDetail 
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
		/*
		this.activeStep = newStep
		if(newStep ==3){
			this.getTemplates()
		}
		*/
	}

  openAddNew(addNewCampaign:any){
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}

  closeAllModal(){
		if(this.modalReference){
			this.modalReference.close();
	    }
	}
 
}