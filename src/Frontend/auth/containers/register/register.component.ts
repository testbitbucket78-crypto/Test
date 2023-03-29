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

    visible:boolean = true;
    visible1:boolean = true;
    changetype:boolean = true;
    change:boolean = true;
    
  
        registerForm = new FormGroup({
        name: new FormControl('', Validators.required),
        mobile_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
        Email: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
        password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        confirmPassword: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        
    })
    title = 'formValidation';
        submitted = false;

    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder) { }
    ngOnInit() {


     
    }

  

    onSubmit(){
        console.log(this.registerForm.value)
        this.submitted = true

        if (this.registerForm.invalid){
            return
        }
        
        alert("Success")
    }

    onVerification() {
       
        if (this.registerForm.valid) {
            sessionStorage.setItem('formValues', JSON.stringify(this.registerForm.value));

            this.apiService.sendOtp(this.registerForm.value).subscribe(response => {
                console.warn("registerdone! ", response)
                this.router.navigate(['verification'])
            });

        }
        
    }
    viewpass(){
        this.visible = !this.visible;
        this.changetype = !this.changetype;
        
    }
    viewpassword(){
        this.visible1 = !this.visible1;
        this.change = !this.change;
        
    }

}
