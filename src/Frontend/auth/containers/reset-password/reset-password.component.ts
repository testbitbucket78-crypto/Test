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

 
    title = 'formValidation';
    submit = false;

    resetpassword = this.formBuilder.group({
        id:sessionStorage.getItem('SP_ID'),
        password: new FormControl('',Validators.compose([Validators.required, Validators.minLength(8)])),
        confirmPassword: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        
    })
    constructor( private formBuilder: FormBuilder,private router: Router,private apiService :AuthService) {}
    ngOnInit() {
       
    }
    
     
    onSubmit(){
        this.submit = true
        var SP_ID=sessionStorage.getItem('SP_ID')
        
        this.apiService.resetPassword(this.resetpassword.value).subscribe(data => {
            console.log(data)
            this.router.navigate (['login'])
           
        })
        if (this.resetpassword.invalid){
            return
        }
        
        alert("Success")
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