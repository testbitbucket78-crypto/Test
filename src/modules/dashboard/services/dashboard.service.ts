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
  return this.http.get('http://localhost:3001');

}
 public RuningCampaign() {
  return this.http.get('http://localhost:3003');

}
 public Automation() {
  return this.http.get('http://localhost:3004');

}
 public Contact() {
  return this.http.get('http://localhost:3002');

}

}
