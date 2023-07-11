import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { authChangePassword, roleName ,teamName, userActiveStatus ,savePlan, profilePicData } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  API_URL:string='https://settings.sampanatechnologies.com';

  constructor(private http:HttpClient) { }

  changePass(data: authChangePassword): Observable<any> {
    return this.http.post(`${this.API_URL}/changePassword`,data);
}

  teamName(uid: number): Observable<teamName> {
  return this.http.get<teamName>(`${this.API_URL}/teamName/${uid}`);
}

  roleName(uid: number): Observable<roleName> {
    return this.http.get<roleName>(`${this.API_URL}/roleName/${uid}`);
  }

  userActiveState(activeStateData:userActiveStatus) : Observable<any> {
    return this.http.post<userActiveStatus>(`${this.API_URL}/userActiveStatus`, activeStateData);
  }

  savePlanData(planData:savePlan): Observable<any> { 
    return this.http.post(`${this.API_URL}/savePlan`,planData);
  }

  billingDetails(spId:number): Observable<any> {
      return this.http.get(`${this.API_URL}/getBillingDetails/${spId}`);
    }

  saveUserProfilePic(profilePicData:profilePicData): Observable<any> { 
   return this.http.post(`${this.API_URL}/userProfileImg`,profilePicData);
  }

}