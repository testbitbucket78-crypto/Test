import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormGroup ,FormControl} from '@angular/forms';
import { Validators } from '@angular/forms';


@Component({
    selector: 'sb-verification',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './verification.component.html',
    styleUrls: ['verification.component.scss'],
})
export class VerificationComponent implements OnInit {
    text= '9927875494'
    otpForm = new FormGroup({
        otp: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6),])),
    })

    title = 'formValidation';
    submitted = false;
    values:any;
    constructor(private apiService: AuthService, private router: Router) { }
    ngOnInit() {
      
    }


    onVerify() {
       
        this.apiService.verifyOtp(this.otpForm.value).subscribe(response => {
            console.log(this.otpForm.value)
            console.warn("verification! ", response)

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
