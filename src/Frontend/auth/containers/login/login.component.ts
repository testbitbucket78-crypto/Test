import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../../services';
import { Validators } from '@angular/forms';
@Component({
    selector: 'sb-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

    checked = true;

    password: any;
    loginForm = new FormGroup({
         email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
         password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(8)])),
         flash: new FormControl(this.checked)
    })
    title = 'formValidation';
    submitted = false;

    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder) {

    }
    ngOnInit() {

    }

    onSubmit() {
        this.apiService.login(this.loginForm.value).subscribe(
            (result) => {

                if (result.status === 200) {
                    sessionStorage.setItem('loginDetails', JSON.stringify(result.user));
                    sessionStorage.setItem('SP_ID', result.user.SP_ID);
                    // console.log(result.user.UserType);
                    // console.log("Agent")
                    this.router.navigate(['dashboard']);
                   }
           
                },
            
            (error) => {
                if (error?.status === 401) {
                    const errorMessage = "! Incorrect Email or Password.";
                    const errorDiv = document.getElementById("error-message");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                    }   
                    else if (error?.status === 502) {
                    const errorMessage = "! Invalid Response.";
                    const errorDiv = document.getElementById("error-message");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                }  
                    else if (error?.status === 500) {
                        const errorMessage = "! Internal Server Error, Please Try After Sometime.";
                        const errorDiv = document.getElementById("error-message");
                        if (errorDiv) {
                            errorDiv.innerHTML = errorMessage;
                        }
                    }    
                else  {
                    const errorMessage = "! Internal Server Error,<br /> Please Try After Sometime.";
                    const errorDiv = document.getElementById("error-message");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                } 
                  
                  
            });

        
    }
    onVerification() {
        console.log(this.loginForm.value)
        this.submitted = true

    
    }

    visible: boolean = true;
    changetype: boolean = true;

    viewpass() {
        this.visible = !this.visible;
        this.changetype = !this.changetype;

    }
}
