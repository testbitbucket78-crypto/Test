import { ChangeDetectionStrategy, Component, Input,OnInit } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormGroup ,FormControl,FormBuilder} from '@angular/forms';
import { Validators } from '@angular/forms';


@Component({
    selector: 'sb-verification-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './verification.component.html',
    styleUrls: ['verification.component.scss'],
})
export class VerificationComponent implements OnInit {
    showSecondButton = false;
    showSecondButton1 = false;
    email_id:any;
    isVerified: boolean = false;
    email:any;
    phone:any;
    otpForm = this.formBuilder.group({
        otpfieldvalue: sessionStorage.getItem('otpfieldEmailvalue'),
        otp: new FormControl('')
    })

    title = 'formValidation';
    submitted = false;
    values:any;
    constructor(private apiService: AuthService, private router: Router,private formBuilder:FormBuilder) { }
    ngOnInit() {
        this.email_id=sessionStorage.getItem('otpfieldEmailvalue')
        this.phone=sessionStorage.getItem('otpfieldMobilevalue')

        this.onVerify()
    }


    onVerify() {
        
        this.apiService.verifyOtp(this.otpForm.value).subscribe((response) => {
            // this.verified = true;
            console.log(this.otpForm.value)
            alert("alert1")
            this.showSecondButton=true
            console.warn("verification! ", response)
            
        },
        (error) => {
            this.showSecondButton=true
            alert(error)
            if (error.status === 401) {
                alert("Otp Incorrect")
             
            } else if (error.status === 410) {
              // Show payment required message
            } else if (error.status === 400) {
              // Show forbidden message
            }
          });


    }
  
    onSubmitRegisterform(){
        console.log(this.otpForm.value)
        this.submitted = true

        if (this.otpForm.invalid){
            return
        }
       
         this.values=sessionStorage.getItem('formValues')
        
           
        this.apiService.register(this.values).subscribe(response=>{
            console.warn(" user registered!",response)
            
            this.router.navigate(['login']);
            sessionStorage.removeItem('formValues')
        })
    
    
    }

}
