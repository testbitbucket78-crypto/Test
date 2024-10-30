import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormControl, FormBuilder} from '@angular/forms';
import { Validators } from '@angular/forms';
import { environment } from 'environments/environment';
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
    
    isverifyphoneOtp!: boolean;
    isverfyEmailOtp!: boolean;
    phoneOtpTimer: number = 0;
    emailotpTimer: number = 0;

    otpFormValue:any;
    otpForm:any;
    title = 'formValidation';
    submitted = false;
    values: any;
    public channelDomain:string = environment?.chhanel;
    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) { 
        
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
        this.validateAndPatch();
    }

    // checkSubmitButton() {
    //     if (this.verifyButton1Clicked && this.verifyButton2Clicked == true) {
    //         this.isVerified = true;
    //     }
    // }
    formValues: any = []
    checkbox: any = []
    validateAndPatch() {
        let valueForEmail = sessionStorage.getItem('verificationDataEmail');
        let valueForPhone = sessionStorage.getItem('verificationDataPhone');
        if (valueForEmail) {
            const verificationData = JSON.parse(valueForEmail);
            if(verificationData.isverfyEmailOtp && verificationData.otp > 0){
                this.otpForm.patchValue({
                    otp1: verificationData.otp,
                });
            }
            this.isverfyEmailOtp = verificationData.isverfyEmailOtp;
            this.verificationDataEmail = verificationData;
        } 
        if (valueForPhone) {
            const verificationData = JSON.parse(valueForPhone);
            if(verificationData.isverifyphoneOtp && verificationData.otp > 0){
                this.otpForm.patchValue({
                    otp: verificationData.otp,
                });
            }
            this.isverifyphoneOtp = verificationData.isverifyphoneOtp;
            this.verificationDataPhone = verificationData;
        }
        const formValues = sessionStorage.getItem('formValues');
        if(formValues) this.formValues = formValues;
        let checkbox = sessionStorage.getItem('checkbox');
        if(checkbox) this.checkbox = checkbox;

        sessionStorage.removeItem('formValues');
        sessionStorage.removeItem('checkbox');
        sessionStorage.removeItem('verificationDataEmail')
        sessionStorage.removeItem('verificationDataPhone');
        this.cdr.detectChanges();
    }

    callApi() {
        this.otpFormValue = this.otpForm.value;
        this.apiService.verifyOtp(this.otpFormValue).subscribe((response: any) => {})

    }

    otp1OnChange(){
        if(this.isverfyEmailOtp){
            this.onVerify();
        }
    }
    otpOnChange(){
        // for phone
        if(this.isverifyphoneOtp){
            this.onVerifyphoneOtp();
        }
    }

    onVerify() {
        this.otpFormValue = this.otpForm.value;
        this.apiService.verifyOtp(this.otpFormValue).subscribe((response: any) => {

            console.log(this.otpForm.value)

            console.warn("verification! ", response)

            if (response.status === 200) {
                this.isverfyEmailOtp = true;
                this.verifyButton1Clicked = true;
                let  successMessage = "! Success";
                this.verfyOtp("email", this.otpForm?.value?.otp1);
                this.cdr.detectChanges();
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


                if (error.status === 403) {
                    this.isverfyEmailOtp = false;
                    this.verfyOtp("email", this.otpForm?.value?.otp1);
                    let errorMessage = "! Invalid Otp.";
                    this.errorDiv = document.getElementById("error-message");
                    if (this.errorDiv) {
                        this.errorDiv.innerHTML = errorMessage;
                    }
                    this.verifyButton1Clicked = false;
                } else if (error.status === 410) {
                    this.isverfyEmailOtp = false
                    this.verfyOtp("email", this.otpForm?.value?.otp1);
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
                this.isverifyphoneOtp = true;
                this.verifyButton2Clicked = true;
                let successMessage = "! Success.";
                this.verfyOtp("phone",this.otpForm?.value?.otp);
                this.cdr.detectChanges();
                this.successDiv = document.getElementById("success-message1");
                if (this.successDiv) {
                    this.successDiv.innerHTML = successMessage;
                }
                // this.checkSubmitButton();
                this.otpForm.values.clear();
            }
        },

            (error) => {


                if (error.status === 403) {
                    this.isverifyphoneOtp = false;
                    this.verfyOtp("phone",this.otpForm?.value?.otp);
                    let errorMessage = "! Invalid Otp.";
                     this.errorDiv = document.getElementById("error-message1");
                    if (this.errorDiv) {
                        this.errorDiv.innerHTML = errorMessage;
                    }
                    this.verifyButton2Clicked = false;
                } else if (error.status === 410) {
                    this.isverifyphoneOtp = false;
                    this.verfyOtp("phone",this.otpForm?.value?.otp);
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
    verificationDataEmail: { type: string; isverfyEmailOtp: boolean; otp: number } | null = null;
    verificationDataPhone: { type: string; isverifyphoneOtp: boolean; otp: number } | null = null;
    verfyOtp(type: 'phone' | 'email', otp: number){
        
        if(type === 'email'){
            
            this.verificationDataEmail = {
                type: type,
                isverfyEmailOtp: this.isverfyEmailOtp,
                otp: otp,
            };
           
        } else if(type === 'phone'){
           
            this.verificationDataPhone = {
                type: type,
                isverifyphoneOtp: this.isverifyphoneOtp,
                otp: otp,
            };
            
        }
        if(this.isverfyEmailOtp && this.isverifyphoneOtp){
            this.onSubmitRegisterform();
        }
        this.cdr.detectChanges()
    }
    startOtpTimer(type: 'phone' | 'email', seconds: number) {
        if (type === 'phone') {
            let phoneOtpIntervalId: any;
          this.phoneOtpTimer = seconds;
          if (phoneOtpIntervalId) {
            clearInterval(phoneOtpIntervalId);
          }
          phoneOtpIntervalId = setInterval(() => {
            this.phoneOtpTimer--;
            if (this.phoneOtpTimer === 0) {
              clearInterval(phoneOtpIntervalId);
            }
            this.cdr.detectChanges(); 
          }, 1000);
        } else if (type === 'email') {
            let otpIntervalId: any;
          this.emailotpTimer = seconds;
          if (otpIntervalId) {
            clearInterval(otpIntervalId);
          }
          otpIntervalId = setInterval(() => {
            this.emailotpTimer--;
            if (this.emailotpTimer === 0) {
              clearInterval(otpIntervalId);
            }
            this.cdr.detectChanges(); 
          }, 1000);
        }
      }
      backBtnClicked(){
        if(this.verificationDataEmail) sessionStorage.setItem('verificationDataEmail', JSON.stringify(this.verificationDataEmail));
        if(this.verificationDataPhone) sessionStorage.setItem('verificationDataPhone', JSON.stringify(this.verificationDataPhone));
        if(this.formValues.length > 0) sessionStorage.setItem('formValues', this.formValues);
        if(this.checkbox.length > 0) sessionStorage.setItem('checkbox', this.checkbox );
      }

    resendOtp(otPFor: string) {
        let values = {
            "email_id":this.email_id,
            "mobile_number": this.phone,
            "name": this.name,
            "otpFor" : otPFor
        }
        this.apiService.sendOtp(values).subscribe(
            (response: any) => {
              if (response.status === 200) {
                console.log('response is 200');
                this.showToaster('! OTP Resend Successfully', 'success');
              } 
            },
            (error: any) => {
              if (error.status == 403) {
                this.showToaster(error?.error?.msg, 'error');
                this.cdr.detectChanges();
              }
            }
          );
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

        if (this.isverfyEmailOtp && this.isverifyphoneOtp == true) {
            this.isVerified = true;
        }
        else return;

        if (this.isVerified) {
            // If not verified, show an error message or perform desired action

            this.values = sessionStorage.getItem('formValues')
            let formValues = JSON.parse(this.formValues);
            formValues.registerPhone = formValues?.mobile_number;
            formValues.Channel = this.channelDomain;
            this.formValues = JSON.stringify(formValues); // adding payload re-Formatting to string
            this.apiService.register(this.formValues).subscribe((response: any) => {

                if (response?.status === 200) {
                    $("#successRegister").modal('show'); 
                    sessionStorage.removeItem('formValues')
                    sessionStorage.removeItem('verificationDataEmail')
                    sessionStorage.removeItem('verificationDataPhone')
                    sessionStorage.removeItem('checkbox');
                }
            },
                (error) => {

                    if (error?.status === 409) {
                        let errorMessage = "! User Already Exist with this email";
                        this.errorDiv = document.getElementById("error-message");
                        if (this.errorDiv) {
                            this.errorDiv.innerHTML = errorMessage;
                        }
                    }
                    else if(error?.status === 500){
                        let errorMessage = "! Internal Server Error";
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
