import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { billingDetail, billingDetailResponse,holidayData, companyDetail, companyDetailResponse, localeDetail, localeDetailResponse, workingData, workingDataResponse, workingDataResponsePost, rightsResponse, RolesData } from '../models/settings.model';

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

  getWorkingData(spId: number): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/workingDetails/${spId}`);
  }

  getHolidayData(spId: number): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/holidays/${spId}`);
  }

  saveWorkingData(workingData: workingDataResponsePost): Observable<workingData> {
    return this.http.post<workingData>(`${this.API_URL}/workingDetails`,workingData );
  }

  saveHolidayData(holidayData: holidayData): Observable<workingData> {
    return this.http.post<workingData>(`${this.API_URL}/holidays`,holidayData );
  }

  getRolesList(spId: number): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/rolesList/${spId}`);
  }

  getRightsList(): Observable<rightsResponse> {
    return this.http.get<rightsResponse>(`${this.API_URL}/rights`);
  }

  getSubRightsList(): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/subrights`);
  }

  deleteRolesData(spId: number,roleId: number): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/deleteRole/${roleId}/${spId}`);
  }

  saveRolesData(rolesData: RolesData): Observable<workingDataResponse> {
    return this.http.post<workingDataResponse>(`${this.API_URL}/addRole`,rolesData);
  }

}
