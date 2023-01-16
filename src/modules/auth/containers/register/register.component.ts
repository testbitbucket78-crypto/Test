import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';


@Component({
    selector: 'sb-register',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './register.component.html',
    styleUrls: ['register.component.scss'],
})
export class RegisterComponent implements OnInit {
  
   


    registerForm = new FormGroup({
        name: new FormControl('', Validators.required),
        mobile_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
        password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        confirmPassword: new FormControl('', Validators.required),

    })

    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder) { }
    ngOnInit() {
     
    }

    onVerification() {
        if (this.registerForm.valid) {
            console.log(this.registerForm.value)
            this.apiService.sendOtp(this.registerForm.value).subscribe(response => {
                console.warn("registerdone! ", response)
                this.router.navigate(['verification'])
            });

        }
    }
    onSubmitRegisterform(){
        if (this.registerForm.valid) {
        this.apiService.register(this.registerForm.value).subscribe(response=>{
            console.warn(" user registered!",response)
            this.router.navigate(['login']);
        })
    }
    }

}
