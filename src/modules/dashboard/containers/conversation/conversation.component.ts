import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
@Component({
  selector: 'sb-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit {
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
        const data = {
            labels: ['2 Jan', '3 Jan', '4 Jan', '5 Jan', '6 Jan', '7 Jan','8 Jan'],
            datasets: [{
                label: '# of Votes',
                data: [0, 110, 130, 0, 160, 150],
                backgroundColor: ["none" , "black" , "gray" , "none" , "black" , "gray"],
                borderColor: ["black"],
                borderWidth: 1
            }]
        };
        
        const config = {
            type: 'bar',
            data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            },
            options1:{
                responsive: false,
            }
        
        };
        
       
        
        
        const data2 = {
            labels: ['0','May 22', 'Jun 12', 'July 10' ],
            datasets: [{
                label: '# of Votes',
                data: [0, 18000, 16000, 20000],
                borderColor: ["white"],
                borderWidth: 1
            },
            {
                data: [8000, 10000, 20000 , 18000],
                borderColor: ["black"],
                borderWidth: 1
            }]
        };
        
        const config2 = {
            type: 'line',
            data: data2,
            options: {
                aspectRatio: 1,
            },
            options1:{
                responsive: false,
            }
        
        };
        
        
        
        
        
        
        
           const data3 = {
            labels: ['0', 'May 22', 'Jun 12','July 10'],
            datasets: [{
                label: '# of Votes',
                data: [0, 18000, 16000, 20000],
                borderColor: ["white"],
                borderWidth: 1
            },
            {
                data: [8000, 10000, 20000, 18000],
                borderColor: ["black"],
                borderWidth: 1
            }]
        };
        
        const config3 = {
            type: 'line',
            data: data2,
            options: {
                aspectRatio: 1,
            },
            options1:{
                responsive: false,
            }
        
        };
        
       
        
           const data4 = {
            labels: ['2 Jun', '3 Jun', '4 Jun','5 Jun', '6 Jun', '7 Jun', '8 Jun' ],
            datasets: [{
                label: '# of Votes',
                data: [0, 7, 14, 13, 11,14, 18 ],
                borderColor: ["white"],
                borderWidth: 1
            },
            {
                data: [6, 7, 8, 10, 17, 16, 15],
                borderColor: ["black"],
                borderWidth: 1
            }]
        };
        
        const config4 = {
            type: 'line',
            data: data4,
            options: {
                aspectRatio: 1,
            },
            options1:{
                responsive: false,
            }
        
        };
        


}
open(add:any) {
    this.modalService.open(add);
  }





}