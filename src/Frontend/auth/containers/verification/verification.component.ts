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


    otpForm = new FormGroup({
        otp: new FormControl('')
    })
    values:any;
    constructor(private apiService: AuthService, private router: Router) { }
    ngOnInit() {
     
      
    }

    onVerify() {
        // this.registerForm.push(sessionStorage.getItem('registerName'));
        // this.registerForm.push(sessionStorage.getItem('registerPhoneNo'))
        // this.registerForm.push(sessionStorage.getItem('registerEmail'))
        // this.registerForm.push(sessionStorage.getItem('registerPassword'))
        // this.registerForm.push(sessionStorage.getItem('registerConformPass'))
       
        this.apiService.verifyOtp(this.otpForm.value).subscribe(response => {
            console.log(this.otpForm.value)
            console.warn("verification! ", response)
            //  this.values= JSON.p((sessionStorage.getItem('formValues')))

        });


    }
  
    onSubmitRegisterform(){
       
         this.values=sessionStorage.getItem('formValues')
        
           
        this.apiService.register(this.values).subscribe(response=>{
            console.warn(" user registered!",response)
            
            this.router.navigate(['login']);
            sessionStorage.removeItem('formValues')
        })
    
    
    }

}
