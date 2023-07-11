import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'sb-billinghistory',
    templateUrl: './billinghistory.component.html',
    styleUrls: ['./billinghistory.component.scss'],
})
export class BillinghistoryComponent implements OnInit {
    spId!:number;
    pageSize: number = 10;
    currentPage: number = 1;
    paging: number[] = [];
    searchText = '';
    billingHistoryData:[] = [];

    @Output() selectab = new EventEmitter<string> () ;


    constructor(private apiService: ProfileService) {}

    ngOnInit(): void {
        this.spId = Number(sessionStorage.getItem('SP_ID'));
        this.getBillingHistoryData();
        this.getPaging();
        
    }

    getBillingHistoryData() { 
       this.apiService.billingDetails(this.spId).subscribe(
           response => {
            this.billingHistoryData = response.getbillingDetails;
        });
    }


    getPaging() {
        this.paging = [];
        this.currentPage = 1;
        let totalPages = Math.ceil(this.billingHistoryData.length / this.pageSize);
        for (let i = 1; i <= totalPages; i++) {
            this.paging.push(i);
        }
    }

    previousPage() {
        this.selectab.emit('0');
    }

    generatePDF() {
        let docDefinition = {
          content: [
            "text: 'Sample Invoice Template', fontSize: 16, bold: true, margin: [0, 0, 0, 10] "
            // Add more content here
          ]
        };
      
        pdfMake.createPdf(docDefinition).open();
      }
      
}
