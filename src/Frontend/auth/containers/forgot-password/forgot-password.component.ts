import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
@Component({
    selector: 'sb-forgot-password',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './forgot-password.component.html',
    styleUrls: ['forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

    
    forgotPasswordForm = new FormGroup({
        email_id: new FormControl('')
    })
    constructor(private apiService :AuthService ,private router: Router) { }
    ngOnInit() { }
    onSubmit(){
        this.apiService.forgotpassword(this.forgotPasswordForm.value).subscribe((result)=>{
            console.warn("forgotpassword Done! ",result)
            this.router.navigate (['reset-password'])
        });
    }
    
}
