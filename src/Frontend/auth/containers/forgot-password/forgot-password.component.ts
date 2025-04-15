import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { ToastService } from 'assets/toast/toast.service';
declare var $:any;

@Component({
    selector: 'sb-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

    forgetpassword = new FormGroup({
        email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$'), Validators.minLength(1)])])),
    })

    title = 'formValidation';
    submitted = false;
    submittedValue:any;
    isLoading!:boolean;    
    public channelDomain:string = environment?.chhanel;
    constructor(private apiService :AuthService ,private router: Router,  private formBuilder: FormBuilder, private _ToastService: ToastService) { }
    ngOnInit() {
      
     }

     openModal() {
        $("#emailsentinfo").modal('show');
     }

    onSubmit() {
        this.isLoading = true;
        this.submitted = true;
        this.submittedValue = this.forgetpassword.value;
        if (this.forgetpassword.valid) {

            this.apiService.forgotpassword(this.submittedValue).subscribe(
                (result) => {
                    this.isLoading = false;
                   // this._ToastService.success('Email Sent Successfully');
                    this.openModal();
                if (result.status === 200) {
            
                    sessionStorage.setItem('uid', result.id[0].uid);
                  
                }
            },
                (error) => {
                    this.isLoading = false;
                    this._ToastService.error('Something went wrong while sending email');
                    if (error.status === 400) {
                        const errorMessage = "! Email Not Found";
                        const errorDiv = document.getElementById("error-message");
                        if (errorDiv) {
                            errorDiv.innerHTML = errorMessage;
                        }
                    }   
                });
    
    
                this.forgetpassword.reset;
        }
        else  this.isLoading = false;
       
    
      
    }
    
}
