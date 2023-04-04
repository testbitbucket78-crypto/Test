import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormGroup ,FormControl} from '@angular/forms';


@Component({
    selector: 'sb-verification',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './verification.component.html',
    styleUrls: ['verification.component.scss'],
})
export class VerificationComponent implements OnInit {
    isVerified: boolean = false;
    otpForm = new FormGroup({
        otp: new FormControl('')
    })
    values:any;
    constructor(private apiService: AuthService, private router: Router) { }
    ngOnInit() {
     
      
    }

    onVerify() {
      
        this.apiService.verifyOtp(this.otpForm.value).subscribe(response => {
            console.log(response)
            console.log(this.otpForm.value)
            console.warn("verification! ", response)
          
           

        });


    }
  
    onSubmitRegisterform(){
       
         this.values=sessionStorage.getItem('formValues')
          console.log("onSubmitRegisterform")
          console.log(this.values) 
           
        this.apiService.register(this.values).subscribe(response=>{
            console.warn(" user registered!",response)
          
             console.log(response)
            this.router.navigate(['login']);
            sessionStorage.removeItem('formValues')
           
        })
    
    
    }

}
