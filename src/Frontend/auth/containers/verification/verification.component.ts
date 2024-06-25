import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormControl, FormBuilder} from '@angular/forms';
import { Validators } from '@angular/forms';
declare var $: any;

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
    name: any;
    verifyButton1Clicked = false;
    verifyButton2Clicked = false;
    errorMessage = '';
	successMessage = '';
	warnMessage = '';
    successDiv!: any;
    errorDiv!: any;

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

    // hideMessage() {
    //     this.successDiv.innerHTML='';
    //     this.errorDiv.innerHTML='';
    // }

    ngOnInit() {
        this.email_id = sessionStorage.getItem('otpfieldEmailvalue')
        this.phone = sessionStorage.getItem('otpfieldMobilevalue')
        this.name = sessionStorage.getItem('otpfieldNamevalue')
    }

    // checkSubmitButton() {
    //     if (this.verifyButton1Clicked && this.verifyButton2Clicked == true) {
    //         this.isVerified = true;
    //     }
    // }



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
                let  successMessage = "! Success";
                this.successDiv = document.getElementById("success-message");
                if (this.successDiv) {
                    this.successDiv.innerHTML = successMessage;
                }
                // this.checkSubmitButton();
                this.otpForm.value.clear();
                console.log(this.otpForm.value)
                
                
            }
        },

            (error) => {


                if (error.status === 401) {
                    let errorMessage = "! Invalid Otp.";
                    this.errorDiv = document.getElementById("error-message");
                    if (this.errorDiv) {
                        this.errorDiv.innerHTML = errorMessage;
                    }
                    this.verifyButton1Clicked = false;
                } else if (error.status === 410) {
                    let errorMessage = "! Otp Expired.";
                     this.errorDiv = document.getElementById("error-message");
                    if (this.errorDiv) {
                        this.errorDiv.innerHTML = errorMessage;
                    }
                }
                this.verifyButton1Clicked = false;
                console.log(this.verifyButton1Clicked)
            });

            setTimeout(() => {
                this.successDiv.innerHTML='';
                this.errorDiv.innerHTML='';
            }, 3000);


    }
    onVerifyphoneOtp() {
     
        this.apiService.verifyphoneOtp(this.otpForm.value).subscribe((response: any) => {
            // this.verified = true;
            console.log(this.otpForm.value)

            console.warn("verification! ", response)
    
            if (response.status === 200) {
                this.verifyButton2Clicked = true;
                let successMessage = "! Success.";
                this.successDiv = document.getElementById("success-message1");
                if (this.successDiv) {
                    this.successDiv.innerHTML = successMessage;
                }
                // this.checkSubmitButton();
                this.otpForm.values.clear();
            }
        },

            (error) => {


                if (error.status === 401) {
                    let errorMessage = "! Invalid Otp.";
                     this.errorDiv = document.getElementById("error-message1");
                    if (this.errorDiv) {
                        this.errorDiv.innerHTML = errorMessage;
                    }
                    this.verifyButton2Clicked = false;
                } else if (error.status === 410) {
                    let errorMessage = "! Otp Expired.";
                    this.errorDiv = document.getElementById("error-message1");
                    if (this.errorDiv) {
                        this.errorDiv.innerHTML = errorMessage;
                    }
                    this.verifyButton2Clicked = false;
                    console.log(this.verifyButton2Clicked)
                }
            }
            );
            setTimeout(() => {
                this.successDiv.innerHTML='';
                this.errorDiv.innerHTML='';
            }, 3000);

    }

    resendOtp() {
        let values = {
            "email_id":this.email_id,
            "mobile_number": this.phone,
            "name": this.name
        }
        this.apiService.sendOtp(values).subscribe((response:any) => {
            if(response.status === 200) {
                console.log('response is 200');
                this.showToaster('! OTP Resend Successfully','success');
            }
        });
    }

    // isBothButtonsClicked() {
    //     return this.verifyButton1Clicked && this.verifyButton2Clicked;
    // }


    onSubmitRegisterform() {
        console.log(this.otpForm.value)
        this.submitted = true

        if (this.otpForm.invalid) {
            return
        }

        if (this.verifyButton1Clicked && this.verifyButton2Clicked == true) {
            this.isVerified = true;
        }
        else return;

        if (this.isVerified) {
            // If not verified, show an error message or perform desired action

            this.values = sessionStorage.getItem('formValues')


            this.apiService.register(this.values).subscribe((response: any) => {

                if (response.status === 200) {
                    $("#successRegister").modal('show'); 
                    sessionStorage.removeItem('formValues')
                }
            },
                (error) => {

                    if (error.status === 409) {
                        let errorMessage = "! User Already Exist with this email";
                        this.errorDiv = document.getElementById("error-message");
                        if (this.errorDiv) {
                            this.errorDiv.innerHTML = errorMessage;
                        }
                    }
                    else {
                        let errorMessage = "! Wrong Otp.";
                        this.errorDiv = document.getElementById("success-message");
                        if (this.errorDiv && this.verifyButton1Clicked && this.verifyButton2Clicked) {
                            this.errorDiv.innerHTML = errorMessage;
                        }
                    }
                });
        
        }

        setTimeout(() => {
            this.successDiv.innerHTML='';
            this.errorDiv.innerHTML='';
        }, 3000);

    }

}
