import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormControl, FormBuilder,FormGroup} from '@angular/forms';
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
    verifyButton1Clicked = false;
    verifyButton2Clicked = false;
    errorMessage = '';
	successMessage = '';
	warnMessage = '';

    otpFormValue:any;
    otpForm:any;
    title = 'formValidation';
    submitted = false;
    values: any;
    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder) { 
        
        this.otpForm = this.formBuilder.group({
            otpfieldvalue: sessionStorage.getItem('otpfieldEmailvalue'),
            otpfieldMobilevalue: sessionStorage.getItem('otpfieldMobilevalue'),
            otp: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)])),
            otp1: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)])),
        })
    
    }

    showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}	
		else if(type=='warn'){
			this.warnMessage=message;
		}
		else if(type=='error'){
			this.errorMessage=message;
		}
	
		setTimeout(() => {
			this.hideToaster()
		}, 5000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.warnMessage='';
		this.errorMessage='';
	}

    ngOnInit() {
        this.email_id = sessionStorage.getItem('otpfieldEmailvalue')
        this.phone = sessionStorage.getItem('otpfieldMobilevalue')
       
    }

    checkSubmitButton() {
        if (this.verifyButton1Clicked && this.verifyButton2Clicked) {
            this.isVerified = true;
        }
    }



    callApi() {
        this.otpFormValue = this.otpForm.value;
        this.apiService.verifyOtp(this.otpFormValue).subscribe((response: any) => {})

    }



    onVerify() {
        this.otpFormValue = this.otpForm.value;
        this.apiService.verifyOtp(this.otpFormValue).subscribe((response: any) => {

            console.log(this.otpForm.value)

            console.warn("verification! ", response)

            if (response.status === 200) {
                this.verifyButton1Clicked = true;
                const errorMessage = "! Success";
                const errorDiv = document.getElementById("success-message");
                if (errorDiv) {
                    errorDiv.innerHTML = errorMessage;
                }
                this.checkSubmitButton();
            }
        },

            (error) => {


                if (error.status === 401) {
                    const errorMessage = "! Invalid Otp.";
                    const errorDiv = document.getElementById("error-message");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                } else if (error.status === 410) {
                    const errorMessage = "! Otp Expired.";
                    const errorDiv = document.getElementById("error-message");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                }
            });


    }
    onVerifyphoneOtp() {
     
        this.apiService.verifyphoneOtp(this.otpForm.value).subscribe((response: any) => {
            // this.verified = true;
            console.log(this.otpForm.value)

            console.warn("verification! ", response)
    
            if (response.status === 200) {
                this.verifyButton2Clicked = true;
                const successMessage = "! Success.";
                const successDiv = document.getElementById("success-message1");
                if (successDiv) {
                    successDiv.innerHTML = successMessage;
                }
                this.checkSubmitButton();
            }
        },

            (error) => {


                if (error.status === 401) {
                    const errorMessage = "! Invalid Otp.";
                    const errorDiv = document.getElementById("error-message1");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                } else if (error.status === 410) {
                    const errorMessage = "! Otp Expired.";
                    const errorDiv = document.getElementById("error-message1");
                    if (errorDiv) {
                        errorDiv.innerHTML = errorMessage;
                    }
                }
            });


    }

    resendOtp() {
        let values = {
            "email_id":this.email_id,
            "mobile_number":this.phone
        }
        this.apiService.sendOtp(values).subscribe((response:any) => {
            if(response.status === 200){
                this.showToaster('! OTP Resend Successfully','success');
            }
        });
    }

    isBothButtonsClicked() {
        return this.verifyButton1Clicked && this.verifyButton2Clicked;
    }


    onSubmitRegisterform() {
        console.log(this.otpForm.value)
        this.submitted = true

        if (this.otpForm.invalid) {
            return
        }

        if (this.isVerified) {
            // If not verified, show an error message or perform desired action

            this.values = sessionStorage.getItem('formValues')


            this.apiService.register(this.values).subscribe((response: any) => {



                if (response.status === 200) {
                    const successMessage = "! Success.";
                    const successDiv = document.getElementById("success-message");
                    if (successDiv) {
                        successDiv.innerHTML = successMessage;
                    }
                    this.showToaster('! User Registered Successfully','success');
                    this.router.navigate(['login']);
                    sessionStorage.removeItem('formValues')
                }
            },
                (error) => {

                    if (error.status === 409) {
                        const errorMessage = "! User Already Exist with this email";
                        const errorDiv = document.getElementById("error-message");
                        if (errorDiv) {
                            errorDiv.innerHTML = errorMessage;
                        }
                    }
                    else {
                        const errorMessage = "! Wrong Otp.";
                        const errorDiv = document.getElementById("success-message");
                        if (errorDiv) {
                            errorDiv.innerHTML = errorMessage;
                        }
                    }
                });
        
        }



    }

}
