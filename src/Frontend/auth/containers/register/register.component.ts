import { ChangeDetectionStrategy, Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { PhoneValidationService } from 'Frontend/dashboard/services/phone-validation.service';

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
    registerForm:any;
    title = 'formValidation';
    submitted = false;
    forbiddenChars = ['!', '@', '#', '$', '&', '%'];
    isVerifiedPhone!: boolean;
    isVerifiedEmail!: boolean;
    emailVerified!: boolean;
    countryCodes = [
        'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
        'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
        'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
        'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
        'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
        'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1767', 'DO +1809', 'DZ +213',
        'EC +593', 'EE +372', 'EG +20', 'EH +212', 'ER +291', 'ES +34', 'ET +251', 'FI +358', 'FJ +679', 'FK +500',
        'FM +691', 'FO +298', 'FR +33', 'GA +241', 'GB +44', 'GD +1473', 'GE +995', 'GF +594', 'GG +44', 'GH +233',
        'GI +350', 'GL +299', 'GM +220', 'GN +224', 'GP +590', 'GQ +240', 'GR +30', 'GS +500', 'GT +502', 'GU +1671',
        'GW +245', 'GY +592', 'HK +852', 'HN +504', 'HR +385', 'HT +509', 'HU +36', 'ID +62', 'IE +353', 'IL +972',
        'IM +44', 'IN +91', 'IO +246', 'IQ +964', 'IR +98', 'IS +354', 'IT +39', 'JE +44', 'JM +1876', 'JO +962',
        'JP +81', 'KE +254', 'KG +996', 'KH +855', 'KI +686', 'KM +269', 'KN +1869', 'KP +850', 'KR +82', 'KW +965',
        'KY +1345', 'KZ +7', 'LA +856', 'LB +961', 'LC +1758', 'LI +423', 'LK +94', 'LR +231', 'LS +266', 'LT +370',
        'LU +352', 'LV +371', 'LY +218', 'MA +212', 'MC +377', 'MD +373', 'ME +382', 'MF +590', 'MG +261', 'MH +692',
        'MK +389', 'ML +223', 'MM +95', 'MN +976', 'MO +853', 'MP +1 670', 'MQ +596', 'MR +222', 'MS +1 664', 'MT +356',
        'MU +230', 'MV +960', 'MW +265', 'MX +52', 'MY +60', 'MZ +258', 'NA +264', 'NC +687', 'NE +227', 'NF +672',
        'NG +234', 'NI +505', 'NL +31', 'NO +47', 'NP +977', 'NR +674', 'NU +683', 'NZ +64', 'OM +968', 'PA +507',
        'PE +51', 'PF +689', 'PG +675', 'PH +63', 'PK +92', 'PL +48', 'PM +508', 'PN +872', 'PR +1 787', 'PS +970',
        'PT +351', 'PW +680', 'PY +595', 'QA +974', 'RE +262', 'RO +40', 'RS +381', 'RU +7', 'RW +250', 'SA +966',
        'SB +677', 'SC +248', 'SD +249', 'SE +46', 'SG +65', 'SH +290', 'SI +386', 'SJ +47', 'SK +421', 'SL +232',
        'SM +378', 'SN +221', 'SO +252', 'SR +597', 'SS +211', 'ST +239', 'SV +503', 'SX +1721', 'SY +963', 'SZ +268',
        'TC +1649', 'TD +235', 'TF +262', 'TG +228', 'TH +66', 'TJ +992', 'TK +690', 'TL +670', 'TM +993', 'TN +216',
        'TO +676', 'TR +90', 'TT +1868', 'TV +688', 'TW +886', 'TZ +255', 'UA +380', 'UG +256', 'US +1', 'UY +598',
        'UZ +998', 'VA +39', 'VC +1784', 'VE +58', 'VG +1284', 'VI +1340', 'VN +84', 'VU +678', 'WF +681', 'WS +685',
        'YE +967', 'YT +262', 'ZA +27', 'ZM +260', 'ZW +263'
      ];


    constructor(private apiService: AuthService, private router: Router, private formBuilder: FormBuilder, public phoneValidator:PhoneValidationService, private cdr: ChangeDetectorRef) {
        this.registerForm = this.formBuilder.group({
            name: new FormControl('', [Validators.required,Validators.maxLength(30),Validators.pattern(/^[a-zA-Z0-9 ]*$/),this.validateName]),
            mobile_number: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6),Validators.maxLength(15)])),
            country_code: ['IN +91'],
            display_mobile_number:new FormControl('', Validators.compose([Validators.required, Validators.minLength(6),Validators.maxLength(15)])),
            email_id: new FormControl('', Validators.compose([Validators.compose([Validators.required, Validators.pattern('^[^\\s@]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,}$'), Validators.minLength(1),Validators.maxLength(50)])])),
            password: ['', [Validators.required, Validators.pattern('(?=\\D*\\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=.*[$@$!%*?&]).{8,30}')]],
            confirmPassword: ['', Validators.required]}, { validator: this.passwordMatchValidator });
            
     }
    ngOnInit() {
        this.getFormValues();
        this.getVerificationData();
    }
    getFormValues(){
        let value = sessionStorage.getItem('formValues');
            if (value) {
                const formValues = JSON.parse(value);
                this.registerForm.patchValue({
                  name: formValues.name,
                  mobile_number: formValues.mobile_number,
                  display_mobile_number: formValues.display_mobile_number,
                  country_code: formValues.country_code,
                  email_id: formValues.email_id,
                  password: formValues.password,
                  confirmPassword: formValues.confirmPassword
                });
              }
              let checkboxValue = sessionStorage.getItem('checkbox');
              if(checkboxValue) {
                const checkboxvalue = JSON.parse(checkboxValue);
                this.checkboxChecked = checkboxvalue.checkboxChecked;
                this.checkbox2Checked = checkboxvalue.checkbox2Checked;
              }
        sessionStorage.removeItem('checkbox');
        sessionStorage.removeItem('formValues');
    }
    VerificationData = [
        { type: 'email', isverfyEmailOtp: false, otp: 0, email_id : '' },
        { type: 'phone', isverifyphoneOtp: false, otp: 0, mobile_number: 0 }
    ];
    getVerificationData(){
        let valueForEmail = sessionStorage.getItem('verificationDataEmail');
        let valueForPhone = sessionStorage.getItem('verificationDataPhone');
        if (valueForEmail) {
            const verificationData = JSON.parse(valueForEmail);
            if(verificationData.isverfyEmailOtp && verificationData.otp > 0){
               this.VerificationData[0] = verificationData;
               this.isVerifiedEmail = verificationData.isverfyEmailOtp
            }
        } if (valueForPhone) {
            const verificationData = JSON.parse(valueForPhone);
            if(verificationData.isverifyphoneOtp && verificationData.otp > 0){
               this.VerificationData[1] = verificationData;
               this.isVerifiedPhone = verificationData.isverifyphoneOtp
            }
        }
        let email_id = this.registerForm.controls['email_id'].value;
        let mobile_number = this.registerForm.controls['mobile_number'].value;
        if(email_id) this.VerificationData[0].email_id = email_id;
        if(mobile_number) this.VerificationData[1].mobile_number = mobile_number;
        sessionStorage.removeItem('verificationDataEmail');
        sessionStorage.removeItem('verificationDataPhone');
    }
    validateName(control: { value: any; }) {
        const name = control.value;
    
        // Check if the length is less than 3 and not a single digit
        if (name.trim().length < 3 && !/^\d$/.test(name)) {
          return { invalidName: true };
        }
    
        return null;
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

// Function to format the phone number using libphonenumber-js
formatPhoneNumber() {
  let phoneNumber = this.registerForm.get('display_mobile_number')?.value;
  let countryCode = this.registerForm.get('country_code')?.value;

  this.registerForm.get('display_mobile_number')?.setValidators([
    Validators.required,
    this.phoneValidator.phoneNumberValidator(this.registerForm.get('country_code'))
  ]);
  this.registerForm.get('display_mobile_number')?.updateValueAndValidity();
  console.log(this.registerForm);

  if (phoneNumber && countryCode) {
    let phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
    let formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);

    if (formattedPhoneNumber) {
      this.registerForm.get('mobile_number')?.setValue(formattedPhoneNumber.formatInternational().replace(/[\s+]/g, ''));
    }
  }
  }
  checkbox2Checked!: boolean;
    onCheckboxChange(checked: boolean) {
        
        this.checkboxChecked = checked;
        this.buttonColor = checked ? '' : '';
      }
      onCheckbox2Change(checked: boolean){
        
        this.checkbox2Checked = checked;
      }
      errorDiv: string = '';
      otpFor: string = '';
      checkOtpFor(emailVerified: boolean, phoneVerified: boolean){
        if(!phoneVerified && !emailVerified){
          this.otpFor = 'both';
        } else if (!phoneVerified) {
          this.otpFor = 'phone';
        } else{
          this.otpFor = 'email';
        }
      }
      onSubmit(){
        let registerData = {
            name:this.registerForm.get('name')?.value, 
            mobile_number:this.registerForm.get('mobile_number')?.value, 
            display_mobile_number:this.registerForm.get('display_mobile_number')?.value,
            country_code:this.registerForm.get('country_code')?.value, 
            email_id:this.registerForm.get('email_id')?.value, 
            password:this.registerForm.get('password')?.value, 
            confirmPassword:this.registerForm.get('confirmPassword')?.value 
        }
       let checkBox = {
        checkbox2Checked: this.checkbox2Checked,
        checkboxChecked: this.checkboxChecked
       }
        console.log(this.registerForm.value);
        this.submitted = true;
        if(this.registerForm.invalid) return;
        this.ifCredAlreadyExist(registerData).then((exists: boolean) => {
            this.cdr.detectChanges();
            if (exists) {
              console.log("User already exists. Hence Breaking the process");
              return;
            } else {
              console.log("Proceed with the registration");
           
        if (this.registerForm.valid) {
            sessionStorage.setItem('formValues', JSON.stringify(registerData));
            sessionStorage.setItem('otpfieldEmailvalue',registerData.email_id);
            sessionStorage.setItem('otpfieldMobilevalue', registerData.mobile_number);
            sessionStorage.setItem('otpfieldNamevalue', registerData.name);
            sessionStorage.setItem('checkbox', JSON.stringify(checkBox));
            this.checkOtpFor(this.isVerifiedEmail, this.isVerifiedPhone);
            var idfs={
                "email_id":registerData.email_id,
                "mobile_number":registerData.mobile_number,
                "name": registerData.name,
                "otpFor" : this.otpFor
            }
            if(this.VerificationData[0].email_id == registerData.email_id && this.VerificationData[1].mobile_number == registerData.mobile_number){
              sessionStorage.setItem('verificationDataEmail', JSON.stringify(this.VerificationData[0]));
              sessionStorage.setItem('verificationDataPhone', JSON.stringify(this.VerificationData[1]));
              this.router.navigate(['verification'])
            }else{
              if(this.VerificationData[0].email_id == registerData.email_id) sessionStorage.setItem('verificationDataEmail', JSON.stringify(this.VerificationData[0]));
              if(this.VerificationData[1].mobile_number == registerData.mobile_number) sessionStorage.setItem('verificationDataPhone', JSON.stringify(this.VerificationData[1]));
              this.apiService.sendOtp(idfs).subscribe
              (response => {
                  if(response) {
                      console.log(response);
                      this.router.navigate(['verification'])
                  }
              },
              (error) => {
                  if(error) {
                      alert('! Internal Server Error, Please Try After Sometime');
                  }
              });
            }
        }
       
        if (this.registerForm.invalid){
            return
        }
    }
        }).catch((error) => {
        console.error("An error occurred while checking for the credentials:", error);
        });
    }
    ifCredAlreadyExist(registerData: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
          if (registerData) {
            this.apiService.isSpAlreadyExist(registerData).subscribe(
              (response: any) => {
                if (response.status === 200) {
                  resolve(false);
                }
              },
              (error) => {
                if (error.status === 409) {
                    this.errorDiv = ''
                    let errorMessage;
                    if(error?.error?.msg) {
                        errorMessage = error.error.msg;
                    }
                  if (errorMessage) {
                    this.errorDiv = errorMessage;
                  }
                    setTimeout(() => {
                      this.errorDiv = '';
                    }, 3000);
                  resolve(true);
                } else {
                  reject(error);
                }
              }
            );
          } else {
            resolve(false);
          }
        });
      }
     
      ValidateEmail(){
        const email = this.registerForm.get("email_id").value;
        const PreviousEmail = this.VerificationData[0].email_id
        if(!email && !PreviousEmail) return;
        if(this.VerificationData[0].isverfyEmailOtp == true){
          if(email != PreviousEmail){
            this.isVerifiedEmail = false;
          }else this.isVerifiedEmail = true;
        }
        
      }
      ValidatePhone(){
        const countryCode = this.registerForm.get("country_code").value;
        const displayMobileNumber = this.registerForm.get("display_mobile_number").value;
        const extractedCode = countryCode.match(/\d+/g)?.join('') || '';

  const phone = `${extractedCode}${displayMobileNumber}`;
        const previousPhone = this.VerificationData[1].mobile_number || '';
        if(!phone && !previousPhone) return;
        if(this.VerificationData[1].isverifyphoneOtp == true){
          if(phone != previousPhone){
            this.isVerifiedPhone = false;
          }else this.isVerifiedPhone = true;
        }
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
