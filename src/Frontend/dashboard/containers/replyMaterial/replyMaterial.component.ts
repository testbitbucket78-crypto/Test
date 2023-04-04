import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'sb-replyMaterial',
  templateUrl: './replyMaterial.component.html',
  styleUrls: ['./replyMaterial.component.scss']
})
export class ReplyMaterialComponent implements OnInit {
	active = 1;

constructor(config: NgbModalConfig, private modalService: NgbModal) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {

}
	

	opentext(textcontent:any) {
		this.modalService.open(textcontent);
	}
}