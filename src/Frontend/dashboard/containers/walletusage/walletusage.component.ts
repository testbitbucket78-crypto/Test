import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'sb-walletusage',
    templateUrl: './walletusage.component.html',
    styleUrls: ['./walletusage.component.scss'],
})
export class WalletusageComponent implements OnInit {
    pageSize: number = 10;
    currentPage: number = 1;
    paging: number[] = [];
    modalReference: any;

    walletUsageData = [
        {
            startdate: '15 Jan, 2023',
            marketing: '155',
            utility: '201',
            auth: '982',
            userinitiated: '312',
        },
        {
            startdate: '16 Jan, 2023',
            marketing: '210',
            utility: '124',
            auth: '548',
            userinitiated: '124',
        },
        {
            startdate: '17 Jan, 2023',
            marketing: '589',
            utility: '312',
            auth: '786',
            userinitiated: '312',
        },
        {
            startdate: '18 Jan, 2023',
            marketing: '216',
            utility: '289',
            auth: '289',
            userinitiated: '289',
        },
        {
            startdate: '19 Jan, 2023',
            marketing: '563',
            utility: '142',
            auth: '142',
            userinitiated: '458',
        },
        {
            startdate: '20 Jan, 2023',
            marketing: '454',
            utility: '234',
            auth: '656',
            userinitiated: '564',
        },
        {
            startdate: '21 Jan, 2023',
            marketing: '454',
            utility: '345',
            auth: '234',
            userinitiated: '442',
        },
        {
            startdate: '22 Jan, 2023',
            marketing: '678',
            utility: '767',
            auth: '423',
            userinitiated: '555',
        },
        {
            startdate: '23 Jan, 2023',
            marketing: '987',
            utility: '456',
            auth: '567',
            userinitiated: '565',
        },

        {
            startdate: '15 Jan, 2023',
            marketing: '155',
            utility: '201',
            auth: '982',
            userinitiated: '312',
        },
        {
            startdate: '16 Jan, 2023',
            marketing: '210',
            utility: '124',
            auth: '548',
            userinitiated: '124',
        },
        {
            startdate: '17 Jan, 2023',
            marketing: '589',
            utility: '312',
            auth: '786',
            userinitiated: '312',
        },
        {
            startdate: '18 Jan, 2023',
            marketing: '216',
            utility: '289',
            auth: '289',
            userinitiated: '289',
        },
        {
            startdate: '19 Jan, 2023',
            marketing: '563',
            utility: '142',
            auth: '142',
            userinitiated: '458',
        },
        {
            startdate: '20 Jan, 2023',
            marketing: '454',
            utility: '234',
            auth: '656',
            userinitiated: '564',
        },
        {
            startdate: '21 Jan, 2023',
            marketing: '454',
            utility: '345',
            auth: '234',
            userinitiated: '442',
        },
        {
            startdate: '22 Jan, 2023',
            marketing: '678',
            utility: '767',
            auth: '423',
            userinitiated: '555',
        },
        {
            startdate: '23 Jan, 2023',
            marketing: '987',
            utility: '456',
            auth: '567',
            userinitiated: '565',
        },

        {
            startdate: '15 Jan, 2023',
            marketing: '155',
            utility: '201',
            auth: '982',
            userinitiated: '312',
        },
        {
            startdate: '16 Jan, 2023',
            marketing: '210',
            utility: '124',
            auth: '548',
            userinitiated: '124',
        },
        {
            startdate: '17 Jan, 2023',
            marketing: '589',
            utility: '312',
            auth: '786',
            userinitiated: '312',
        },
        {
            startdate: '18 Jan, 2023',
            marketing: '216',
            utility: '289',
            auth: '289',
            userinitiated: '289',
        },
        {
            startdate: '19 Jan, 2023',
            marketing: '563',
            utility: '142',
            auth: '142',
            userinitiated: '458',
        },
        {
            startdate: '20 Jan, 2023',
            marketing: '454',
            utility: '234',
            auth: '656',
            userinitiated: '564',
        },
        {
            startdate: '21 Jan, 2023',
            marketing: '454',
            utility: '345',
            auth: '234',
            userinitiated: '442',
        },
        {
            startdate: '22 Jan, 2023',
            marketing: '678',
            utility: '767',
            auth: '423',
            userinitiated: '555',
        },
        {
            startdate: '23 Jan, 2023',
            marketing: '987',
            utility: '456',
            auth: '567',
            userinitiated: '565',
        },

        {
            startdate: '15 Jan, 2023',
            marketing: '155',
            utility: '201',
            auth: '982',
            userinitiated: '312',
        },
        {
            startdate: '16 Jan, 2023',
            marketing: '210',
            utility: '124',
            auth: '548',
            userinitiated: '124',
        },
        {
            startdate: '17 Jan, 2023',
            marketing: '589',
            utility: '312',
            auth: '786',
            userinitiated: '312',
        },
        {
            startdate: '18 Jan, 2023',
            marketing: '216',
            utility: '289',
            auth: '289',
            userinitiated: '289',
        },
        {
            startdate: '19 Jan, 2023',
            marketing: '563',
            utility: '142',
            auth: '142',
            userinitiated: '458',
        },
        {
            startdate: '20 Jan, 2023',
            marketing: '454',
            utility: '234',
            auth: '656',
            userinitiated: '564',
        },
        {
            startdate: '21 Jan, 2023',
            marketing: '454',
            utility: '345',
            auth: '234',
            userinitiated: '442',
        },
        {
            startdate: '22 Jan, 2023',
            marketing: '678',
            utility: '767',
            auth: '423',
            userinitiated: '555',
        },
        {
            startdate: '23 Jan, 2023',
            marketing: '987',
            utility: '456',
            auth: '567',
            userinitiated: '565',
        },
    ];

    constructor(config: NgbModalConfig, private modalService: NgbModal) {}

    ngOnInit(): void {
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

    getPaging() {
        this.paging = [];
        this.currentPage = 1;
        let totalPages = Math.ceil(this.walletUsageData.length / this.pageSize);
        for (let i = 1; i <= totalPages; i++) {
            this.paging.push(i);
        }
    }
}
