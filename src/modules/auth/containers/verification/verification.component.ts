import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from './../../services';
import { Router } from '@angular/router';
import { FormGroup ,FormControl} from '@angular/forms';

@Component({
    selector: 'sb-verification',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './verification.component.html',
    styleUrls: ['verification.component.scss'],
})
export class VerificationComponent implements OnInit {

    otpForm = new FormGroup({
        otp: new FormControl('')
    })
    constructor(private apiService: AuthService, private router: Router) { }
    ngOnInit() {
      this.onVerify();
    }

    onVerify() {

        this.apiService.verifyOtp(this.otpForm.value).subscribe(response => {
            console.log(this.otpForm.value)
            console.warn("verification! ", response)


        });


    }

}
