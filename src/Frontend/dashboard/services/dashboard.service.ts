import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const API_URL = environment.baseUrl;


@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) { }

  getDashboard$(): Observable<{}> {
    return of({});
  }

  public dashboardSubscribers() {
    return this.http.get('https://cip-api.sampanatechnologies.com/Subscribers')
  }
  public dashboardInteractions() {
    return this.http.get('https://cip-api.sampanatechnologies.com/Interactions');

  }
  public dashboardAgents() {
    return this.http.get('https://cip-api.sampanatechnologies.com/Agents');

  }
  public dashboardCampaigns() {
    return this.http.get('https://cip-api.sampanatechnologies.com/Campaigns');

  }
  public dashboardRecentConversation() {
    return this.http.get('https://cip-api.sampanatechnologies.com/recentConversation')
  }
  public RuningCampaign() {
    return this.http.get('http://localhost:3003');

  }
  public Automation() {
    return this.http.get('http://localhost:3004');

  }
  public Contact() {
    console.log("contact serveice")

    return this.http.get('https://contactapi.sampanatechnologies.com/');

  }
  addContact(data: any) {
    return this.http.post('https://contactapi.sampanatechnologies.com/contact', data)
  }

 


  exportAllContact() {
    return this.http.get('https://contactapi.sampanatechnologies.com/exportAllContact')
  }

  exportCheckedContact(data: any) {
    return this.http.post('https://contactapi.sampanatechnologies.com/exportCheckedContact', data)
  }

  sendExportContact() {
    return this.http.get('https://contactapi.sampanatechnologies.com/sendExportContact')
  }

  filter(Phone_number: any) {
    const params = new HttpParams().set('Phone_number', Phone_number)
    return this.http.get('https://contactapi.sampanatechnologies.com/filter', { params: params })
  }
  search(Phone_number: any, emailId: any, Name: any) {
    const params = new HttpParams().set('Phone_number', Phone_number).set('emailId', emailId).set('Name', Name)
    return this.http.get('https://contactapi.sampanatechnologies.com/search', { params: params })
  }

  download() {


    return this.http.get('https://contactapi.sampanatechnologies.com/download', { responseType: 'blob' })
  }

  update(data: object) {
    console.log("servise update data" +data)
    return this.http.post('https://contactapi.sampanatechnologies.com/updateAndSave', data)
  }
  
  updatedDataCount(data:any){
    return this.http.post('https://contactapi.sampanatechnologies.com/verifyData',data)
  }

   //Smart replies API's

   getUser() {
    return this.http.get('https://smartapi.sampanatechnologies.com/getReplies')
  }

  searchSmartReply(ID: any) {
    const params = new HttpParams().set('ID', ID)
    console.log("params  "  + params)
    return this.http.get('https://smartapi.sampanatechnologies.com/search', { params: params })
  }

  sideNav(ID: any){
    const params = new HttpParams().set('ID', ID)
    return this.http.get('https://smartapi.sampanatechnologies.com/sideNavKeyword', { params: params })
  }

  addNewReply(data:any){
    return this.http.post('https://smartapi.sampanatechnologies.com/addNewReply',data)
  }
  blockContact(data: any) {

    return this.http.post('https://contactapi.sampanatechnologies.com/blockedContact', data)
  }
  getContactById(customerId: any) {
    //console.log(customerId)
    const params = new HttpParams().set('customerId', customerId)
    return this.http.get('https://contactapi.sampanatechnologies.com/getContactById', { params: params })
  }

  deletContactById(data: any) {
    console.log("del API")
    return this.http.post('https://contactapi.sampanatechnologies.com/deletContact', data)
  }
  editContact(data: any,customerId:any) {
    console.log(customerId)
    const params = new HttpParams().set('customerId', customerId)
    return this.http.put('https://contactapi.sampanatechnologies.com/editContact',data,{ params: params })
  }
}
