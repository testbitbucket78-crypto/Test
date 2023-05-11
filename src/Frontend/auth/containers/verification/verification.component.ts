import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';


@Component({
    selector: 'sb-verification-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './verification.component.html',
    styleUrls: ['verification.component.scss'],
})
export class VerificationComponent implements OnInit {
    showSecondButton: boolean = false;
    showSecondButton1 = false;
    email_id: any;
    isVerified: boolean = false;
    email: any;
    phone: any;

    otpForm = this.formBuilder.group({
        otpfieldvalue: sessionStorage.getItem('otpfieldEmailvalue'),
        otpfieldMobilevalue: sessionStorage.getItem('otpfieldMobilevalue'),
        otp: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)])),
        otp1: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)])),
    })

    title = 'formValidation';
    submitted = false;
    values: any;
    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder) { }
    ngOnInit() {
        this.email_id = sessionStorage.getItem('otpfieldEmailvalue')
        this.phone = sessionStorage.getItem('otpfieldMobilevalue')

        // this.onVerify()
    }


    onVerify() {
        // alert("alert")
        this.apiService.verifyOtp(this.otpForm.value).subscribe((response: any) => {
            // this.verified = true;
            console.log(this.otpForm.value)

            console.warn("verification! ", response)
            // alert("alert1")
            if (response.status === 200) {
                // Show forbidden message
                alert("sucess")
            }
        },

            (error) => {


                if (error.status === 401) {
                    console.log("Otp invalid")
                } else if (error.status === 410) {
                    alert("Otp expired")
                }
                // else if (error.status === 409) {
                //     alert("User Already Exist with this email")
                // } 
            });


    }
    onVerifyphoneOtp() {
        // alert("alert")
        this.apiService.verifyphoneOtp(this.otpForm.value).subscribe((response: any) => {
            // this.verified = true;
            console.log(this.otpForm.value)

            console.warn("verification! ", response)
            // alert("alert1")
            if (response.status === 200) {
                // Show forbidden message
                alert("sucess")
            }
        },

            (error) => {


                if (error.status === 401) {
                    alert("Otp invalid")
                } else if (error.status === 410) {
                    alert("Otp expired")
                }
            });


    }

    onSubmitRegisterform() {
        console.log(this.otpForm.value)
        this.submitted = true

        if (this.otpForm.invalid) {
            return
        }

        this.values = sessionStorage.getItem('formValues')


        this.apiService.register(this.values).subscribe((response: any) => {
            console.warn(" user registered!", response)

            this.router.navigate(['login']);
            sessionStorage.removeItem('formValues')
            if (response.status === 200) {
                // Show forbidden message
                alert("sucess")
            }
        },
            (error) => {


                if (error.status === 409) {
                    alert("User Already Exist with this email")
                }
            });


    }

}
