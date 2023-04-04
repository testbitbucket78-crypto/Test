import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
@Component({
    selector: 'sb-forgot-password',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './forgot-password.component.html',
    styleUrls: ['forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

   
    forgetpassword = new FormGroup({
        Email: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
    })
    
    // registerForm = new FormGroup({
    //     Email: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
        
        
    // })
    title = 'formValidation';
    submitted = false;
    constructor(private apiService :AuthService ,private router: Router,  private formBuilder: FormBuilder) { }
    ngOnInit() {
        this.forgetpassword = this.formBuilder.group({
            Email: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
            
        })
     }
    onVerification(){
        this.apiService.forgotpassword(this.forgetpassword.value).subscribe((result)=>{
            console.warn("forgotpassword Done! ",result)
            this.router.navigate (['reset-password'])
        });
    }
    onSubmit(){
        console.log(this.forgetpassword.value)
        this.submitted = true

        if (this.forgetpassword.invalid){
            return
        }
        
        alert("Success")
    }
    
}
