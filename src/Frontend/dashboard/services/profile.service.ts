import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { authChangePassword, roleName ,teamName, userActiveStatus ,savePlan, profilePicData, addFundsData, teamboxNotifications} from '../models/profile.model';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  API_URL:string=environment.cipApi;
  private profilePictureSubject: BehaviorSubject<string>;
  public profilePicture$: Observable<string>;

  constructor(private http:HttpClient) {
    this.profilePictureSubject = new BehaviorSubject<string>('');
    this.profilePicture$ = this.profilePictureSubject.asObservable();
   }

  //  update Profile Picture globally

   setProfilePicture(pictureUrl: string): void {
    if(!pictureUrl) return;
    this.profilePictureSubject.next(pictureUrl);
    sessionStorage.setItem('profilePicture', pictureUrl);
  }

    getProfilePicture(): string {
      return this.profilePictureSubject.getValue();
    }

  // profle page

    changePass(data: authChangePassword): Observable<any> {
      return this.http.post(`${this.API_URL}/changePassword`,data);
  }

    teamName(uid: number): Observable<teamName> {
    return this.http.get<teamName>(`${this.API_URL}/teamName/${uid}`);
  }

  roleName(uid: number): Observable<roleName> {
    return this.http.get<roleName>(`${this.API_URL}/roleName/${uid}`);
  }

  saveTeamboxNotificationState(data:any): Observable<any> {
    return this.http.post<teamboxNotifications>(`${this.API_URL}/addNotification`,data);
  }

  getTeamboxNotificationsState(uid:Number): Observable<any>{
    return this.http.get(`${this.API_URL}/getNotification/${uid}`);

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

  walletUsageDetails(spId:number): Observable<any> { 
    return this.http.get(`${this.API_URL}/usesData/spid?spid=${spId}`);
  }

  walletUsageInsight(spId:number): Observable<any> {
    return this.http.get(`${this.API_URL}/usageInsight/${spId}`);
  }

  getManagePlanData(): Observable<any> {
    return this.http.get(`${this.API_URL}/managePlan`);
  }

  approximateCharges(spId:number): Observable<any> {
    return this.http.get(`${this.API_URL}/ApproximateCharges/${spId}`);
  }

  saveUserProfilePic(profilePicData:profilePicData): Observable<any> { 
   return this.http.post(`${this.API_URL}/userProfileImg`,profilePicData);
  }

  addFunds(addfundsData:addFundsData): Observable<any> {
    return this.http.post(`${this.API_URL}/SPTransations`,addfundsData);
  }

  showAvailableAmount(spId:number): Observable<any> {
    return this.http.get(`${this.API_URL}/getAvailableAmout/${spId}`);
  }

  getPDFInvoiceDetails(spid:number): Observable<any> { 
    return this.http.get(`${this.API_URL}/invoiceDetails/${spid}`);
  }

  // notifications page

  getNotifications(spId:number,uid:number): Observable<any> {
    return this.http.get(`${this.API_URL}/getNotifications/${spId}/${uid}`);
  }

  readNotification(spId:number,uid:number): Observable<any> { 
    return this.http.post(`${this.API_URL}/updateNotifications/${spId}/${uid}`,null);
   }

  // support page FAQS

  getFaqsTitles(): Observable<any> { 
    return this.http.get(`${this.API_URL}/FAQs`);
  }

  getSubFaqsData(spId:number): Observable<any> {
   return this.http.get(`${this.API_URL}/subFAQS/${spId}`);
  }

  // support UserGuide API
  
  getUserGuideTitles(): Observable<any> { 
    return this.http.get(`${this.API_URL}/userGuideTopics`);
  }

  getUserGuideSubTopicsData(spId:number): Observable<any> { 
    return this.http.get(`${this.API_URL}/userGuideSubTopics/${spId}`);
  }

  }