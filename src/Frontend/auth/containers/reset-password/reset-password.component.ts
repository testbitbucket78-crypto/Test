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
        password: new FormControl('',Validators.compose([Validators.required, Validators.minLength(8), Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')])),
        confirmPassword: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        
        
    })
    constructor( private formBuilder: FormBuilder,private router: Router,private apiService :AuthService) {

        this.resetpassword = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
          }, { validator: this.passwordMatchValidator });

    }
    ngOnInit() {
       
    }
    
    passwordMatchValidator(g: FormGroup) {
        const password = g.get('password').value;
        const confirmPassword = g.get('confirmPassword').value;
      
        if (password !== confirmPassword && confirmPassword !== '') {
          return { 'mismatch': true };
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