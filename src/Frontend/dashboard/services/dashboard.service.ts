import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend ,HttpParams} from '@angular/common/http';
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
    return this.http.get('http://localhost:3002/');

  }
  addContact(data:any){
    return this.http.post('http://localhost:3002/contact',data)
  }
  
  importContact(file:any){
    // Create form data 

    const formData = new FormData();  

        

    // Store form name as "file" with file data 

    formData.append("file", file, file.name); 
    
    return this.http.post('http://localhost:3002/upload',formData)
  }


  exportAllContact(){
    return this.http.get('http://localhost:3002/exportAllContact')
  }
  
  exportCheckedContact(data:any){
    return this.http.post('http://localhost:3002/exportCheckedContact',data)
  }
 
  sendExportContact(){
    return this.http.get('http://localhost:3000/sendExportContact')
  }
  
  filter(Phone_number:any){
    const params = new HttpParams().set('Phone_number',Phone_number)
    return this.http.get('http://localhost:3002/filter',{params:params})
  }
  search(Phone_number:any,emailId:any,Name:any){
    const params = new HttpParams().set('Phone_number',Phone_number).set('emailId',emailId).set('Name',Name)
    return this.http.get('http://localhost:3002/search',{params:params})
  }

  download(){
  
  
    return this.http.get('http://localhost:3002/download',{responseType: 'blob'})
  }
 
}
