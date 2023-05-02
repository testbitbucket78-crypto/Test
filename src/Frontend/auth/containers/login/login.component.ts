import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../../services';
import { Validators } from '@angular/forms';
@Component({
    selector: 'sb-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

    checked = true;
    password: any;
    loginForm = new FormGroup({
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
         password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(8)])),
        flash:new FormControl(this.checked)
      })
      title = 'formValidation';
        submitted = false;
       errorStatusno1 = 401;
        errorStatusno = 400;
        
        errorStatusno3 = 403;
        errorStatusno4 = 404;
      
    constructor(private apiService :AuthService ,private router: Router, private formBuilder: FormBuilder) {
       
    }
    ngOnInit() {
        this.errorStatusno1
        this.errorStatusno

        this.errorStatusno3
        this.errorStatusno4
    }


    onSubmit() {
        this.apiService.login(this.loginForm.value).subscribe(
            
            (result) => {

                sessionStorage.setItem('loginDetails', JSON.stringify(result.user))
                sessionStorage.setItem('SP_ID', result.user.SP_ID)
                console.log(result.user.UserType)
                if (result.user.UserType == 'Owner') {
                    console.log("Agent ")
                    alert('Login Successful');
                    this.router.navigate(['dashboard'])
                }

            },
            (error) => {
                this.errorStatusno = error.status;
                this.errorStatusno1 = error.status;
                this.errorStatusno3 = error.status;
                this.errorStatusno4 = error.status;

                console.log(this.errorStatusno1);
                console.log(this.errorStatusno3);
                console.log(this.errorStatusno4);
                console.log(this.errorStatusno);
                // if (error.status === 401) {
                //     error.staus = 'Forbidden';
                // } else if (error.status === 403) {
                //     alert('Forbidden');
                // } else if (error.status === 404) {
                //     alert('Not Found');
                // } else if (error.status === 400) {
                //     alert('Bad Request')
                // }
            }
        );
    }

    onVerification(){
        // console.log(this.loginForm.value)
        this.submitted = true

        if (this.loginForm.invalid) {
            console.log("invalid password")
        }
    }

    visible: boolean = true;
    changetype: boolean = true;

    viewpass() {
        this.visible = !this.visible;
        this.changetype = !this.changetype;

    }
}
