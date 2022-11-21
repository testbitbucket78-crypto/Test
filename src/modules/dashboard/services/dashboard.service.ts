import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const API_URL = environment.baseUrl;


@Injectable()
export class DashboardService {
    constructor(private http:HttpClient) {}

    getDashboard$(): Observable<{}> {
        return of({});
    }
    public dashboard() {
  return this.http.get(API_URL + '/dashboard');

}
 public RuningCampaign() {
  return this.http.get(API_URL + '/Campaign');

}
 public Automation() {
  return this.http.get(API_URL + '/automation');

}
 public Contact() {
  return this.http.get(API_URL + '/contact');

}
}
