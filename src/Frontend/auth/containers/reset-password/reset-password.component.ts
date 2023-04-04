import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';


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

    resetpassword!:FormGroup
    title = 'formValidation';
    submit = false;
    constructor( private formBuilder: FormBuilder) {}
    ngOnInit() {
        this.resetpassword = this.formBuilder.group({
            passwords: new FormControl('',Validators.compose([Validators.required, Validators.minLength(8)])),
            confirmpasswords: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8)])),
        })
    }
    

    onSubmit(){
        this.submit = true

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