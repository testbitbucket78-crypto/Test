import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
declare var $:any;

@Component({
    selector: 'sb-walletusage',
    templateUrl: './walletusage.component.html',
    styleUrls: ['./walletusage.component.scss'],
})
export class WalletusageComponent implements OnInit {
    
    spId!:number;
    pageSize: number = 10;
    currentPage!: number;
    paging: number[] = [];
    modalReference: any;
    walletUsageData:any = [];
    walletUsageInsight:any = [];
    approximateCharges:any = [];
    filteredData:any =[];
    marketing: number = 0;
    userinitiated: number = 0;
    startDate!: any;
    endDate!: any;


    @Output() selectab = new EventEmitter<string> () ;

    constructor(config: NgbModalConfig, private modalService: NgbModal,private apiService: ProfileService) {}

    ngOnInit(): void {
        this.spId = Number(sessionStorage.getItem('SP_ID')); 
        this.getWalletUsageData();
        this.filteredData = this.walletUsageData;
        this.getWalletUsageInsight()
        this.getPaging();
       
    }
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
            // console.log(this.walletUsageData);
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
        // console.log(transformedData);
        return transformedData;

    }

        getCountByInteractionType(interactions: any[], interactionType: string) {
            const interaction = interactions.find(i => i.type === interactionType);
            return interaction ? interaction.count : 0;
        }

        
    applyDateFilter() {
        if (!this.startDate || !this.endDate) {
            alert('Please select dates before applying the date filter');
          return;
        }
      
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
      
        const maxDate = this.getMaxDateFromWalletUsageData();
        const today = new Date();
      
        if (end > maxDate || end > today) {
          end.setTime(Math.min(maxDate.getTime(), today.getTime()));
          this.endDate = end.toISOString().substring(0, 10);
        }
      
        this.filteredData = this.walletUsageData.filter((item:any) => {
          const itemDate = new Date(item.interaction_date);
          this.modalReference.close();
          return itemDate >= start && itemDate <= end;
        });
      
        this.currentPage = 1;
      }
      
      getMaxDateFromWalletUsageData(): Date {
        const dates:any = this.walletUsageData.map((item:any) => new Date(item.interaction_date));
        const maxDate = new Date(Math.max.apply(null, dates));
        return maxDate;
      }

    getWalletUsageInsight() {
        this.apiService.walletUsageInsight(this.spId).subscribe(response => {
            this.walletUsageInsight = this.transformData(response.UsageInsightData);
            console.log(this.walletUsageInsight);
        });
    }

    getApproximateCharges() {
        this.apiService.approximateCharges(this.spId).subscribe(response => {
                this.approximateCharges = response;
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
        this.modalReference.close();
      }
      

    getPaging() {
        this.paging = [];
        this.currentPage = 1;
        let totalPages = Math.ceil(this.walletUsageData.length / this.pageSize);
        for (let i = 1; i <= totalPages; i++) {
            this.paging.push(i);
        }
    }

    previousPage() {
        this.selectab.emit('0');
    }
}

