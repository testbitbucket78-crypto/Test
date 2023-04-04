import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Auth, authRegister, authForgotPassword ,authSendOtp,authVerifyOtp} from '../models';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) { }

    getAuth$(): Observable<{}> {
        return of({});
    }

    login(data: Auth): Observable<any> {
        let API_URL = 'https://authapi.sampanatechnologies.com/login';
        return this.http.post(API_URL, data)

    }
    register(data: authRegister): Observable<any> {

        let API_URL = 'https://authapi.sampanatechnologies.com/register';
        return this.http.post(API_URL, data,{headers:{'Content-Type':'application/json'}})
    }
    forgotpassword(data: authForgotPassword): Observable<any> {
        let API_URL = 'https://authapi.sampanatechnologies.com/forgotPassword';
        return this.http.post(API_URL, data)
    }
    sendOtp(data:authSendOtp){
        let API_URL = 'https://authapi.sampanatechnologies.com/sendOtp';
        return this.http.post(API_URL, data)
    }
    verifyOtp(data:authVerifyOtp){
        let API_URL = 'https://authapi.sampanatechnologies.com/verifyOtp';

        return this.http.post(API_URL, data)
    }
   
}
