import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'sb-billinghistory',
    templateUrl: './billinghistory.component.html',
    styleUrls: ['./billinghistory.component.scss'],
})
export class BillinghistoryComponent implements OnInit {
    pageSize: number = 10;
    currentPage: number = 1;
    paging: number[] = [];
    searchText = '';

    billingHistoryData = [
        {
            invoiceno: '#234556',
            date: '09 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234558',
            date: '10 Apr 2023',
            amount: '$67',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234555',
            date: '11 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234559',
            date: '11 Apr 2023',
            amount: '$50',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234554',
            date: '12 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234552',
            date: '14 Apr 2023',
            amount: '$154',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234551',
            date: '15 Apr 2023',
            amount: '$34',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234545',
            date: '15 May 2023',
            amount: '$130',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234552',
            date: '17 May 2023',
            amount: '$30',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234538',
            date: '19 May 2023',
            amount: '$26',
            paymentmode: 'Wallet',
            download: 'PDF',
        },

        {
            invoiceno: '#233456',
            date: '01 June 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234783',
            date: '03 June 2023',
            amount: '$37',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234535',
            date: '04 June 2023',
            amount: '$50',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#244559',
            date: '16 June 2023',
            amount: '$50',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#244554',
            date: '15 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#254552',
            date: '15 Apr 2023',
            amount: '$15',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#254551',
            date: '15 Apr 2023',
            amount: '$341',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264545',
            date: '15 Apr 2023',
            amount: '$13',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264552',
            date: '15 Apr 2023',
            amount: '$36',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264558',
            date: '15 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },

        {
            invoiceno: '#233456',
            date: '01 June 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234783',
            date: '03 June 2023',
            amount: '$37',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234535',
            date: '04 June 2023',
            amount: '$50',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#244559',
            date: '16 June 2023',
            amount: '$50',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#244554',
            date: '15 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#254552',
            date: '15 Apr 2023',
            amount: '$15',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#254551',
            date: '15 Apr 2023',
            amount: '$341',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264545',
            date: '15 Apr 2023',
            amount: '$13',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264552',
            date: '15 Apr 2023',
            amount: '$36',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264558',
            date: '15 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },

        {
            invoiceno: '#233456',
            date: '01 June 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234783',
            date: '03 June 2023',
            amount: '$37',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#234535',
            date: '04 June 2023',
            amount: '$50',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#244559',
            date: '16 June 2023',
            amount: '$50',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#244554',
            date: '15 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#254552',
            date: '15 Apr 2023',
            amount: '$15',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#254551',
            date: '15 Apr 2023',
            amount: '$341',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264545',
            date: '15 Apr 2023',
            amount: '$13',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264552',
            date: '15 Apr 2023',
            amount: '$36',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
        {
            invoiceno: '#264558',
            date: '15 Apr 2023',
            amount: '$20',
            paymentmode: 'Wallet',
            download: 'PDF',
        },
    ];

    constructor() {}

    ngOnInit(): void {
        this.getPaging();
    }
    getPaging() {
        this.paging = [];
        this.currentPage = 1;
        let totalPages = Math.ceil(this.billingHistoryData.length / this.pageSize);
        for (let i = 1; i <= totalPages; i++) {
            this.paging.push(i);
        }
    }
}
