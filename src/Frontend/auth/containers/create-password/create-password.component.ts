import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';


@Component({
  selector: 'sb-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss']
})
export class CreatePasswordComponent {


  inputText!: string;
  isButtonDisabled: boolean = true;
  visible: boolean = true;
  visible1: boolean = true;
  changetype: boolean = true;
  change: boolean = true;
  uid: any;
  createpassword:any;
  title = 'formValidation';
  submitted = false;
  successMessage = '';
  errorMessage = '';
  warningMessage = '';
  public channelDomain:string = environment?.chhanel;
  constructor(private formBuilder: FormBuilder, private router: Router, private apiService: AuthService, private active: ActivatedRoute) {

    this.createpassword = this.formBuilder.group({
      // id: sessionStorage.getItem('uid'),
      password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#$@!%*?&])[A-Za-z\\d#$@!%*?&]{8,30}$')]],
      confirmPassword: ['', Validators.required],
      agree:[false, Validators.required]
    }, { validator: this.passwordMatchValidator });
  }
  
  ngOnInit() {
    this.active.queryParams
      .subscribe(params => {
        var updateduid = params.uid;
        if (params.uid.includes(' ')) {
          var url = params.uid.split(' ');
          updateduid = '';
          url.forEach((item: any) => {
            updateduid = updateduid + (updateduid ? '+' : '') + item;
          })

        }
        console.log("a to z  " + updateduid)
        this.uid = updateduid

        console.log("_ENCODE UID_  " + encodeURIComponent(params.uid))
        console.log("__ DECODE ENCODE UID_ " + decodeURIComponent(encodeURIComponent(params.uid)))
        console.log("___DECODE__ " + decodeURIComponent(params.uid)); // { uid: }

      }
      );

  }

  onInputChange() {
    this.isButtonDisabled = this.inputText.length === 0;
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



  onSubmit() {
    if (!this.createpassword.value.agree) {
      this.showToaster('error','Please Select terms and condition')
      return
    }

    if (this.createpassword.invalid) {
      this.createpassword.markAllAsTouched(); // highlights errors on the UI
      // this.showToaster('error', 'Please fill in all required fields');
      return;
    }

    this.createpassword.value.userDateAndTime = new Date().getTimezoneOffset()

    this.apiService.createpassword(this.createpassword.value,this.uid).subscribe((data:any) => {

      if (data.status == 200) { 
        this.showToaster('success',data.msg)
        setTimeout(() => {
          this.router.navigate(['login'])
        }, 1000);
      }else if (data.status == 402){
        this.showToaster('error',data.msg)
      }


    })

  }

  hideToaster(){
    this.successMessage='';
    this.errorMessage='';
    this.warningMessage='';
    }

  showToaster(type:any,message:any){
    console.log(type,message)
    if(type=='success'){
      this.successMessage=message;
    }else if(type=='error'){
      this.errorMessage=message;
    }else{
      this.warningMessage=message;
    }

  }

  viewpass() {
    this.visible = !this.visible;
    this.changetype = !this.changetype;

  }
  viewpassword() {
    this.visible1 = !this.visible1;
    this.change = !this.change;

  }

}
