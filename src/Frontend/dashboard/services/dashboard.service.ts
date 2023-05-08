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

  public dashboardSubscribers(sPid: any) {
    const params = new HttpParams().set('sPid', sPid)
    console.log("  dashboardSubscribers : params")
    console.log(params)
    return this.http.get('https://cip-api.sampanatechnologies.com/Subscribers:/sPid', { params: params })
  }
  public dashboardInteractions() {
    return this.http.get('https://cip-api.sampanatechnologies.com/Interactions');

  }
  public dashboardAgents() {

    return this.http.get('https://cip-api.sampanatechnologies.com/Agents');

  }
  public dashboardCampaigns(sPid: any) {
    const params = new HttpParams().set('sPid', sPid)

    console.log(params)
    return this.http.get('https://cip-api.sampanatechnologies.com/Campaigns:/sPid', { params: params });

  }
  public dashboardRecentConversation(spid: any) {
    const params = new HttpParams().set('spid', spid)

    return this.http.get('https://cip-api.sampanatechnologies.com/recentConversation/:spid', { params: params })
  }

  public RuningCampaign() {
    return this.http.get('http://localhost:3003');

  }
  public Automation() {
    return this.http.get('http://localhost:3004');

  }


  //***************Contact API's *********//



  Contact(SP_ID: any) {
    console.log("contact serveice" + SP_ID)
    const params = new HttpParams().set('SP_ID', SP_ID)
    return this.http.get('https://contactapi.sampanatechnologies.com/', { params: params });

  }
  addContact(data: any) {
    return this.http.post('https://contactapi.sampanatechnologies.com/contact', data)
  }
  editContact(data: any, customerId: any, SP_ID: any) {
    console.log(customerId)
    const params = new HttpParams().set('customerId', customerId).set('SP_ID', SP_ID)
    return this.http.put('https://contactapi.sampanatechnologies.com/editContact', data, { params: params })
  }



  exportAllContact() {
    return this.http.get('https://contactapi.sampanatechnologies.com/exportAllContact')
  }

  exportCheckedContact(data: any) {
    return this.http.post('https://contactapi.sampanatechnologies.com/exportCheckedContact', data)
  }


  download() {


    return this.http.get('https://contactapi.sampanatechnologies.com/download', { responseType: 'blob' })
  }
  downloadErrFile() {


    return this.http.get('https://contactapi.sampanatechnologies.com/downloadCSVerror', { responseType: 'blob' })
  }
  update(data: object) {
    console.log("servise update data" + data)
    return this.http.post('https://contactapi.sampanatechnologies.com/updateAndSave', data)
  }



  updatedDataCount(data: any) {
    return this.http.post('https://contactapi.sampanatechnologies.com/verifyData', data)
  }

  blockContact(data: any, SP_ID: any) {
    const params = new HttpParams().set('SP_ID', SP_ID)
    return this.http.post('https://contactapi.sampanatechnologies.com/blockedContact', data, { params: params })
  }

  getContactById(customerId: any, SP_ID: any) {

    const params = new HttpParams().set('customerId', customerId).set('SP_ID', SP_ID)
    return this.http.get('https://contactapi.sampanatechnologies.com/getContactById', { params: params })
  }

  deletContactById(data: any) {
    console.log("del API")

    return this.http.post('https://contactapi.sampanatechnologies.com/deletContact', data)
  }


  //******************Smart replies API's*********************//


   getSmartReply(SP_ID:any) {
    const params = new HttpParams().set('SP_ID', SP_ID)
    return this.http.get('https://smartapi.sampanatechnologies.com/getReplies',{params:params})
  }

  searchSmartReply(ID: any) {
    const params = new HttpParams().set('ID', ID)
    console.log("params  "  + params)
    return this.http.get('https://smartapi.sampanatechnologies.com/search', { params: params })
  }

  sideNav(ID: any) {
    const params = new HttpParams().set('ID', ID)
    return this.http.get('https://smartapi.sampanatechnologies.com/sideNavKeyword', { params: params })
  }

  addNewReply(data: any) {
    return this.http.post('https://smartapi.sampanatechnologies.com/addNewReply', data)
  }



}
