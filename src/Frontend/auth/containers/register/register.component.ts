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
           // sessionStorage.setItem('registerFormData',this.registerForm.value)
            // sessionStorage.setItem('registerName',this.registerForm.value.name)
            // sessionStorage.setItem('registerPhoneNo',this.registerForm.value.mobile_number)
            // sessionStorage.setItem('registerEmail',this.registerForm.value.email_id)
            // sessionStorage.setItem('registerPassword',this.registerForm.value.password)
            // sessionStorage.setItem('registerConformPass',this.registerForm.value.confirmPassword)
            sessionStorage.setItem('formValues', JSON.stringify(this.registerForm.value));

            this.apiService.sendOtp(this.registerForm.value).subscribe(response => {
                console.warn("registerdone! ", response)
                this.router.navigate(['verification'])
            });

        }
        
    }
   

}
