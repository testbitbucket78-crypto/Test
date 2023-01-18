import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Router, RouterLinkActive } from '@angular/router';
import { AuthService } from './../../services';
@Component({
    selector: 'sb-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {
    checked  =true;
   
    loginForm=new FormGroup({
        email_id: new FormControl(''),
        password: new FormControl(''),
        flash:new FormControl(this.checked)
      })
      
    constructor(private apiService :AuthService ,private router: Router) {
       
    }
    ngOnInit() {
        
    }
    onSubmit() {
        this.apiService.login(this.loginForm.value).subscribe((result)=>{
            console.warn("logindone! ",result)
            this.router.navigate (['dashboard'])
        });
    }
    
    
}
