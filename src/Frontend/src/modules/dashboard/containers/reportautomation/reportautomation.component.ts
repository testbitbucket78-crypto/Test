import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
@Component({
  selector: 'sb-reportautomation',
  templateUrl: './reportautomation.component.html',
  styleUrls: ['./reportautomation.component.scss']
})
export class ReportautomationComponent implements OnInit {
constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
        new Chart("myChart", {
			type: 'line',
			data: {
			  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
			  datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2, 3],
                borderColor: ["black"],
				borderWidth: 1
			  }]
			},
			options: {
			  scales: {
			  }
			}
		  });
}



}