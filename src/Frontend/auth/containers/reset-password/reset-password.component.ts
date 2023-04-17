import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';

@Component({
    selector: 'sb-reset-password',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './reset-password.component.html',
    styleUrls: ['reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
    visible:boolean = true;
    visible1:boolean = true;
    changetype:boolean = true;
    change:boolean = true;
  


    resetpassword = this.formBuilder.group({
        id:sessionStorage.getItem('SP_ID'),
        
        
    })
    constructor( private formBuilder: FormBuilder,private router: Router,private apiService :AuthService) {

        this.resetpassword = this.formBuilder.group({
            password: ['', [Validators.required,Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]],
            confirmPassword: ['', Validators.required]
          }, { validator: this.passwordMatchValidator });

    }
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
      

     
    onSubmit(){
        
        var SP_ID=sessionStorage.getItem('SP_ID')
        
        this.apiService.resetPassword(this.resetpassword.value).subscribe(data => {
            console.log(data)
            this.router.navigate (['login'])
           
        })
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