import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { Validators } from '@angular/forms';
@Component({
    selector: 'sb-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

    checked = true;
    loginformValue: any;
    password: any;
    loginForm = new FormGroup({
         email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
         password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(8)])),
         flash: new FormControl(this.checked)
    })
    title = 'formValidation';
    submitted = false;

    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder, private settingsService:SettingsService) {

    }
    ngOnInit() {

    }

    onSubmit() {
        this.loginformValue = this.loginForm.value;
        this.apiService.login(this.loginformValue).subscribe(
            (result) => {

                if (result.status === 200) {
                    sessionStorage.setItem('loginDetails', JSON.stringify(result.user));
                    sessionStorage.setItem('SP_ID', result.user.SP_ID);
                    this.router.navigate(['dashboard']);

                    var spid = Number(sessionStorage.getItem('SP_ID'));
                    var phoneNo = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number
                    let item = {
                        spid: spid,
                        phoneNo: phoneNo,
                      }
            
                    this.settingsService.craeteQRcode(item).subscribe((response) => {
                          if (response.status === 200) {
                            console.log(response.data);
                          }
                        });
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
