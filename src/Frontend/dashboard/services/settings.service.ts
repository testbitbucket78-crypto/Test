import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { billingDetail, billingDetailResponse, companyDetail, companyDetailResponse, localeDetail, localeDetailResponse, workingData } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})

export class SettingsService {
  API_URL:string='https://settings.sampanatechnologies.com';
  constructor(private http: HttpClient) { }

  getCompanyDetailData(spId: number): Observable<companyDetailResponse> {
    return this.http.get<companyDetailResponse>(`${this.API_URL}/companyDetail/${spId}`);
  }

  getBillingData(spId: number): Observable<billingDetailResponse> {
    return this.http.get<billingDetailResponse>(`${this.API_URL}/billingDetails/${spId}`)
  }

  getLocaleData(spId: number): Observable<localeDetailResponse> {
    return this.http.get<localeDetailResponse>(`${this.API_URL}/localDetails/${spId}`);
  }

  saveCompanyDetail(companyData:companyDetail): Observable<any> {
    return this.http.post(`${this.API_URL}/companyDetail`, companyData)
  }

  saveBillingDetail(billingData:billingDetail): Observable<any> {
    return this.http.post(`${this.API_URL}/billingDetails`, billingData)
  }

  saveLocaleDetail(localeData:localeDetail): Observable<any> {
    return this.http.post(`${this.API_URL}/localDetails`, localeData)
  }

  getWorkingData(spId: number): Observable<workingData> {
    return this.http.get<workingData>(`${this.API_URL}/workingDetails/${spId}`);
  }
}
