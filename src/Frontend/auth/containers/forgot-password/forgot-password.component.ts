import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
@Component({
    selector: 'sb-forgot-password',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './forgot-password.component.html',
    styleUrls: ['forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

    showModal = false;

    forgetpassword = new FormGroup({
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
    })

    title = 'formValidation';
    submitted = false;
    constructor(private apiService :AuthService ,private router: Router,  private formBuilder: FormBuilder) { }
    ngOnInit() {

     }
    // onVerification(){
    //     console.log("onVerification")
    //     console.log(this.forgetpassword.value)
        
    // }
    onSubmit() {
        console.log(this.forgetpassword.value)
        this.submitted = true;


        if (this.forgetpassword.invalid) {
            return
        }

        this.apiService.forgotpassword(this.forgetpassword.value).subscribe(
            (result) => {
            if (result.status === 200 && result.id.lenght > 0) {
                sessionStorage.setItem('uid', result.id[0].uid)
                this.router.navigate(['reset-password'])
            }

        },
            (error) => {


                if (error?.status === 400) {
                    const errorMessage = "! Email Not Found";
                    const errorDiv = document.getElementById("error-message");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                }   
            });


            this.forgetpassword.reset;
            this.showModal = true;
      
    }
    
}
