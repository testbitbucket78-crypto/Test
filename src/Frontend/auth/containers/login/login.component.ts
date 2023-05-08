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
    
    checked  = true;
    password: any;
    loginForm=new FormGroup({
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
         password: new FormControl('', Validators.compose([Validators.required,Validators.minLength(8)])),
        flash:new FormControl(this.checked)
      })
      title = 'formValidation';
        submitted = false;
       errorStatusno1 = 401;
        errorStatusno = 400;
        
        errorStatusno3 = 403;
        errorStatusno4 = 502;
      
    constructor(private apiService :AuthService ,private router: Router, private formBuilder: FormBuilder) {
       
    }
    ngOnInit() {
    
    }


    onSubmit() {
        this.apiService.login(this.loginForm.value).subscribe(
            
            (result) => {

                sessionStorage.setItem('loginDetails', JSON.stringify(result.user))
                sessionStorage.setItem('SP_ID', result.user.SP_ID)
                console.log(result.user.UserType)
                if (result.user.UserType == 'Owner') {
                    console.log("Agent ")
                    this.router.navigate(['dashboard'])
                }

            },
            (error) => {
                if (error.status === this.errorStatusno4) {
                    document.getElementById("505-error")!.innerText = '! Internal Server Error, Please Try After Some Time.';
                       
                }
                // else if(error.status === this.)




                //     if (errorDiv) {
                //         errorDiv.innerHTML = ;
                //     }
                // } else if (error.status === 400) {
                //     // Show payment required message
                //     alert("Internal Server Error. Please retry after sometime")
                // }
                // else if (error.status === 500) {
                //     alert("Internal Server Error. Please retry after sometime")
                // }
            })


        // if(result.user.UserType=='Owner'){
        //     console.log("Agent ")
        // }




    }
    onVerification() {
        console.log(this.loginForm.value)
        this.submitted = true


    }

    visible: boolean = true;
    changetype: boolean = true;

    viewpass() {
        this.visible = !this.visible;
        this.changetype = !this.changetype;

    }
}