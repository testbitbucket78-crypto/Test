import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
@Component({
  selector: 'sb-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  linkActive:number = 6;
  constructor(config: NgbModalConfig, private modalService: NgbModal, private router: Router) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
    ngOnInit() {
      this.routerGuard();

}
	
  //******* Router Guard  *********//
  routerGuard = () => {
    if (sessionStorage.getItem('SP_ID') === null) {
      this.router.navigate(['login']);
    }
  }

}