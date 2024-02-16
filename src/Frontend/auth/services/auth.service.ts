import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Auth, authRegister, authForgotPassword ,authSendOtp,authVerifyOtp} from '../models';
import { environment } from 'environments/environment.prod';
const API_URL = environment.baseUrl;

@Injectable()
export class AuthService {
    constructor(private http: HttpClient) { }

    getAuth$(): Observable<{}> {
        return of({});
    }
    login(data: Auth): Observable<any> {
        return this.http.post( API_URL+'/login', data);
    }
    ip(): Observable<any> {
        return this.http.get( 'https://geolocation-db.com/json/');
    }
    register(data: authRegister): Observable<any> {
        return this.http.post(API_URL+'/register', data,{headers:{'Content-Type':'application/json'}});
    }
    forgotpassword(data: authForgotPassword): Observable<any> {
        return this.http.post(API_URL+'/forgotPassword', data)
    }
    resetPassword(value: any, uid: any) {
        const params = new HttpParams().set('uid', uid)
        return this.http.post(API_URL+'/resetPassword/:uid', value, { params: params })
    }
    sendOtp(data: authSendOtp) {
        return this.http.post(API_URL+'/sendOtp', data)
    }
    verifyOtp(data:authVerifyOtp){
        return this.http.post(API_URL+'/verifyOtp', data)
    }

    verifyphoneOtp(data: any) {
        return this.http.post(API_URL+'/verifyPhoneOtp', data)
    }
    logout(): void {
        sessionStorage.clear();
    }
   
}