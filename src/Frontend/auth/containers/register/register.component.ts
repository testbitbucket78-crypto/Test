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
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
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
        if (this.registerForm.valid) {
            sessionStorage.setItem('formValues', JSON.stringify(this.registerForm.value));
            sessionStorage.setItem('otpfieldEmailvalue',this.registerForm.value.email_id) ;
            sessionStorage.setItem('otpfieldMobilevalue',this.registerForm.value.mobile_number);
            
            var idfs={
                "email_id":this.registerForm.value.email_id,
                "mobile_number":this.registerForm.value.mobile_number
            }
            this.apiService.sendOtp(idfs).subscribe(response => {
                console.warn("registerdone! ", response)
                this.router.navigate(['verification'])
            });

        }
       
        if (this.registerForm.invalid){
            return
        }
        
        // alert("Success")
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
