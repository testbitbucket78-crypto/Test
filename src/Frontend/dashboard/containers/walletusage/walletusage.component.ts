import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';

@Component({
    selector: 'sb-walletusage',
    templateUrl: './walletusage.component.html',
    styleUrls: ['./walletusage.component.scss'],
})
export class WalletusageComponent implements OnInit {
    
    spId!:number;
    pageSize: number = 10;
    pageSizeOptions: number[] = [10, 15, 20, 25, 30, 35, 40, 45, 50];
    currentPage!: number;
    paging: number[] = [];
    modalReference: any;
    walletUsageData  = [];
    walletUsageInsight = [];
    approximateCharges = [];
    allConversationCount = [];
    totalCharges:any = 0;
    filteredData =[];
    marketing: number = 0;
    userinitiated: number = 0;
    startDate!: any;
    endDate!: any;

    errorMessage='';
	successMessage='';


    @Output() selectab = new EventEmitter<string> () ;

    constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: ProfileService) {}

    ngOnInit(): void {
        this.spId = Number(sessionStorage.getItem('SP_ID'))
        this.getWalletUsageInsight()
        this.getApproximateCharges()
        this.getWalletUsageData()
  
       
    }

    showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}else if(type=='error'){
			this.errorMessage=message;
        }
		setTimeout(() => {
			this.hideToaster()
		}, 5000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.errorMessage='';
	}


    rowHeaders: string[] = [
        'Start Date',
        'Marketing',
        'Utility',
        'Authentication',
        'User Initiated'
      ];

    filterChannels(filterchannels: any) {
        if (this.modalReference) {
            this.modalReference.close();
        }
        this.modalReference = this.modalService.open(filterchannels, {
            size: 'sm',
            windowClass: 'white-pink',
        });
    }

      
    getWalletUsageData() {
        this.apiService.walletUsageDetails(this.spId).subscribe(data => {
            this.walletUsageData = data.useData;
            this.walletUsageData = this.transformData(this.walletUsageData);
            this.filteredData = this.walletUsageData;
            this.getPaging();
            console.log(this.walletUsageData);
        });

    }

        // transform the walletUsageData arrry according to table structure

    transformData(walletUsageData:any) {
        const transformedData:any = [];
        walletUsageData.forEach((item:any) => {
        const existingDateItem = transformedData.find((d:any) => d.date === item.interaction_date);
        if (existingDateItem) {
            existingDateItem.interactions.push({
            type: item.interaction_type,
            count: item.count
            });
        } else {
            transformedData.push({
            date: item.interaction_date,
            interactions: [{
                type: item.interaction_type,
                count: item.count
            }]
            });
        }
        });
        return transformedData;

    }

        getCountByInteractionType(interactions: any[], interactionType: string) {
            const interaction = interactions.find(i => i.type === interactionType);
            return interaction ? interaction.count : 0;
        }

        
        applyDateFilter() {

        if (!this.startDate || !this.endDate) {
        this.showToaster('Please select dates before applying the date filter','error');
        return;
        }
      
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const maxDate = this.getMaxDate();
        const today = new Date();
      
        if (end > maxDate || end > today) {
          end.setTime(Math.min(maxDate.getTime(), today.getTime()));
          this.endDate = end.toISOString().substring(0, 10);
        }
      
        this.filteredData = this.walletUsageData.filter((item:any) => {
          const itemDate = new Date(item.date);
          this.modalReference.close();
          return itemDate >= start && itemDate <= end;
        });
        this.getPaging();
        this.currentPage = 1;
      }
      
      getMaxDate(): Date {
        const dates:any = this.walletUsageData.map((item:any) => new Date(item.date));
        const maxDate = new Date(Math.max.apply(null, dates));
        console.log(maxDate);
        return maxDate;
      }

    getWalletUsageInsight() {
        this.apiService.walletUsageInsight(this.spId).subscribe(response => {
            this.walletUsageInsight = this.transformData(response.UsageInsightData);
            this.allConversationCount = response.allUsageInsightCount[0].count;
            console.log(this.allConversationCount);
            console.log(this.walletUsageInsight);
        });
    }

    getApproximateCharges() {
        this.apiService.approximateCharges(this.spId).subscribe(response => {
                this.approximateCharges = response.ApproxCharges;
                let charges = Object.values(this.approximateCharges);
                this.totalCharges = charges.reduce((sum:any, charge:any) => sum + charge, 0);
                console.log(this.approximateCharges);
                console.log(this.totalCharges);
         });
    }

    openFilterDateRange(filterdaterange: any){
        this.modalReference = this.modalService.open(filterdaterange);
    }

    clearFilter() {
        this.startDate = null;
        this.endDate = null;
        this.filteredData = this.walletUsageData;
        this.currentPage = 1;
        this.showToaster('Filter Cleared','success');
        this.modalReference.close();
      }

    getPaging() {
        this.paging = [];
        this.currentPage = 1;
        let totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        for (let i = 1; i <= totalPages; i++) {
            this.paging.push(i);
        }
    }

    previousPage() {
        this.selectab.emit('0');
    }
}

