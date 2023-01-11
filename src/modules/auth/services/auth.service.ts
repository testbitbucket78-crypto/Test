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
        let API_URL = 'http://localhost:3000/login';
        return this.http.post(API_URL, data)

    }
    register(data: authRegister): Observable<any> {
        let API_URL = 'http://localhost:3000/register';
        return this.http.post(API_URL, data)
    }
    forgotpassword(data: authForgotPassword): Observable<any> {
        let API_URL = 'http://localhost:3000/forgotPassword';
        return this.http.post(API_URL, data)
    }
    sendOtp(data:authSendOtp){
        let API_URL = 'http://localhost:3000/sendOtp';
        return this.http.post(API_URL, data)
    }
    verifyOtp(data:authVerifyOtp){
        let API_URL = 'http://localhost:3000/verifyOtp';
       
        return this.http.post(API_URL, data)
    }
}
