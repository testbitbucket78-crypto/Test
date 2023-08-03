import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { savePlan } from 'Frontend/dashboard/models/profile.model';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';

@Component({
    selector: 'sb-manageplan',
    templateUrl: './manageplan.component.html',
    styleUrls: ['./manageplan.component.scss'],
})
export class ManageplanComponent implements OnInit {

  spId!: number;
  modalReference: any;
  planData!:savePlan;
  planDivision:string = 'monthly';
  discount: string = '0';
  AllChoices = [];
  PlanCharges = [];
  plans = ['Basic', 'Standard','Premium+'] 

  @Output() selectab = new EventEmitter<string> () ;

  
    constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: ProfileService) {}

    ngOnInit(): void {
      this.spId = Number(sessionStorage.getItem('SP_ID'));
      this.getManagePlanData();
    }


    PlanSummary = [
      'Review and confirm your change',
      'Your text location determines the taxes that are <br /> applied to your bill.',
      'Plan Summary',
      'Build Your Team, Inbox, Contact, Funnel up to 10 Message 25000 Free Message, 15 Free Bot, Subscribe up to 100K APIs & Webhooks, Integrations',
      'Cancelation Info',
      'Fees may apply if you cancel after Apr 20, 2023',
      'Payment Info',
      'Payment will automatic deduct from the wallet'
    ];

    selectPlans(selectplan: any) {
      if (this.modalReference) {
          this.modalReference.close();
      }
      this.modalReference = this.modalService.open(selectplan, {
          size: 'lg',
          windowClass: 'white-pink',
          backdrop: 'static',
          keyboard: false
          
      });
  }

// choose plan yearly or monthly

  toggleSlider(checked: boolean): void {
    this.planDivision = checked ? 'monthly' : 'yearly';
    this.discount = checked ? '0%' : '12%';
    console.log('Toggle state:', this.planDivision); 
    console.log('Discount:', this.discount); 
  }

  confirmPlan(confirmplan:any) {
    this.modalService.open(confirmplan,{
      backdrop: 'static',
      keyboard: false
    });
    this.modalReference.close(this.selectPlans);
  }
  previousPage() {
    this.selectab.emit('0');
}

  nextPage() { 
    this.selectab.emit('2');
  }

  getManagePlanData() {
    this.apiService.getManagePlanData().subscribe((response => {
        this.AllChoices = response.plans;
        this.PlanCharges = response.plansCharges;
        console.log('All Choices:', this.AllChoices);
        console.log('Charge:', this.PlanCharges);
    }));
  }

  onSavePlanData() {
    this.planData = <savePlan> {};

      this.planData.SP_ID = this.spId,
      this.planData.planType= 'Standard',
      this.planData.planDivision = this.planDivision,
      this.planData.discount = this.discount,
      this.planData.subtotalAmount ='$23.6',
      this.planData.totalAmount = '$30.8',
      this.planData.tax = '$7.2'
    

    this.apiService.savePlanData(this.planData).subscribe(
      (response) => {
      
        console.log('API Response: ' + JSON.stringify(response));
      },
      (error) => {
    
        console.error(error);
        console.log('API Response: ' + JSON.stringify(error));
      }
    );  

}

}