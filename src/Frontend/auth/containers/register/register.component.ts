import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
    selector: 'sb-register',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './register.component.html',
    styleUrls: ['register.component.scss'],
})


export class RegisterComponent implements OnInit {
    checkboxChecked = false;


    buttonColor = 'grey';
    visible:boolean = true;
    visible1:boolean = true;
    changetype:boolean = true;
    change:boolean = true;
    separateDialCode = false;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
    PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates, CountryISO.UnitedKingdom];
    
  
    registerForm = this.formBuilder.group({
        name: new FormControl('', [
            Validators.required,
            Validators.pattern('[a-zA-Z ]*')
          ]),
        mobile_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(10)])),
        
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
        password: ['', [Validators.required, Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=.*[$@$!%*?&]).{8,30}')]],
        confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
    changePreferredCountries() {
		this.preferredCountries = [CountryISO.India, CountryISO.Canada];
	}
    title = 'formValidation';
        submitted = false;

    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder) { }
    ngOnInit() {
     
    }

    passwordMatchValidator(g: FormGroup) {
        const passwordControl = g.get('password');
        const confirmPasswordControl = g.get('confirmPassword');

        if (passwordControl && confirmPasswordControl) {
            const password = passwordControl.value;
            const confirmPassword = confirmPasswordControl.value;

            if (password !== confirmPassword && confirmPassword !== '') {
                return { 'mismatch': true };
            }
        }

        return null;
    }



    onCheckboxChange(checked: boolean) {
        this.checkboxChecked = checked;
        this.buttonColor = checked ? '' : '';
      }
  

      onSubmit(){
        console.log(this.registerForm.value)
        this.submitted = true
        if (this.registerForm.valid) {
            sessionStorage.setItem('formValues', JSON.stringify(this.registerForm.value));
            sessionStorage.setItem('otpfieldEmailvalue',this.registerForm.value.email_id);
            sessionStorage.setItem('otpfieldMobilevalue',this.registerForm.value.mobile_number.internationalNumber);
            
            var idfs={
                "email_id":this.registerForm.value.email_id,
                "mobile_number":this.registerForm.value.mobile_number
            }
            this.apiService.sendOtp(idfs).subscribe(response => {
                console.warn("registerdone! ", response)
                console.log(response);
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
