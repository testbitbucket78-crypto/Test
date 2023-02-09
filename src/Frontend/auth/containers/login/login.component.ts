import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sb-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {
    
    constructor() {}
    ngOnInit() {
    }
    visible:boolean = true;
    changetype:boolean = true;

    viewpass(){
        this.visible = !this.visible;
        this.changetype = !this.changetype;
        
    }

}
