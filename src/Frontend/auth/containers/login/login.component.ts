import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Router, RouterLinkActive } from '@angular/router';
import { AuthService } from './../../services';
import { Validators } from '@angular/forms';
@Component({
    selector: 'sb-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

    checked  =true;
   
    loginForm=new FormGroup({
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
        password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        flash:new FormControl(this.checked)
      })
      title = 'formValidation';
      submitted = false;
      
    constructor(private apiService :AuthService ,private router: Router, private formBuilder: FormBuilder) {
       
    }
    ngOnInit() {
        
    }
    onSubmit() {
        this.apiService.login(this.loginForm.value).subscribe((result)=>{
            console.warn("logindone! ",result)
            this.router.navigate (['dashboard'])
        });
    }
    onVerification(){
        console.log(this.loginForm.value)
        this.submitted = true

        if (this.loginForm.invalid){
            return
        }
        
        alert("Success")
    }

    visible:boolean = true;
    changetype:boolean = true;

    viewpass(){
        this.visible = !this.visible;
        this.changetype = !this.changetype;
        
    }
}
