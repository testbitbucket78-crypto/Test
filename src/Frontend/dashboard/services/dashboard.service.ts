import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const API_URL = environment.baseUrl;


@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) { }

  getDashboard$(): Observable<{}> {
    return of({});
  }
  public dashboardSubscribers(){
    return this.http.get('http://localhost:3001/Subscribers')
  }
  public dashboardInteractions() {
    return this.http.get('http://localhost:3001/Interactions');

  }
  public dashboardAgents() {
    return this.http.get('http://localhost:3001/Agents');

  }
  public dashboardCampaigns() {
    return this.http.get('http://localhost:3001/Campaigns');

  }
  public RuningCampaign() {
    return this.http.get('http://localhost:3003');

  }
  public Automation() {
    return this.http.get('http://localhost:3004');

  }
  public Contact() {
    console.log("contact serveice")
    return this.http.get('http://localhost:3002');

  }
}
