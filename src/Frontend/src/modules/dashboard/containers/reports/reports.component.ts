import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
@Component({
  selector: 'sb-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
		new Chart("myChart", {
			type: 'bar',
			data: {
			  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
			  datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2, 3],
				borderWidth: 1
			  }]
			},
			options: {
			  scales: {
			  }
			}
		  });

}
	opens(contents:any) {
		this.modalService.open(contents);
	}
	opend(detail:any) {
		this.modalService.open(detail);
	}


}