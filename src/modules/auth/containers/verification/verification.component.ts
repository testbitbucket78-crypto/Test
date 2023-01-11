import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
@Component({
    selector: 'sb-verification',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './verification.component.html',
    styleUrls: ['verification.component.scss'],
})
export class VerificationComponent implements OnInit {
    otpForm= new FormControl({
        otp: new FormControl('')
    })
    constructor(private apiService: AuthService, private router: Router) {}
    ngOnInit() {
       
    }
    
    onVerify() {
        
            this.apiService.verifyOtp(this.otpForm.value).subscribe(response => {
                console.warn("verification! ", response)
                this.router.navigate(['login'])
        
            });

        
    }
}
