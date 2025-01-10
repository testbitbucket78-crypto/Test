import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'sb-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.component.html',
  styleUrls: ['reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {

  inputText!: string;
  isButtonDisabled: boolean = true;
  visible: boolean = true;
  visible1: boolean = true;
  changetype: boolean = true;
  change: boolean = true;
  uid: any;
  resetpassword:any;
  title = 'formValidation';
  submitted = false;
  public channelDomain:string = environment?.chhanel;
  constructor(private formBuilder: FormBuilder, private router: Router, private apiService: AuthService, private active: ActivatedRoute) {

    this.resetpassword = this.formBuilder.group({
      // id: sessionStorage.getItem('uid'),
      password: ['', [Validators.required, Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=.*[$@$!%*?&]).{8,30}')]],
      confirmPassword: ['', Validators.required]
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

    var SP_ID = sessionStorage.getItem('SP_ID')

    this.apiService.resetPassword(this.resetpassword.value,this.uid).subscribe(data => {
      console.log(data)

      this.router.navigate(['login'])

    })



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