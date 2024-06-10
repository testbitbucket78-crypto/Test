import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { contactsImageData, importCSVData } from '../models';
const API_URL ='https://cip-api.stacknize.com/';
const API_URL1 = 'https://contactapi.stacknize.com/';
const API_URL2 = 'https://smartapi.stacknize.com/';


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
    return this.http.get(API_URL+'Subscribers:/sPid', { params: params })
  }
  public dashboardInteractions(sPid: any) {
    const params = new HttpParams().set('sPid', sPid)
    console.log("  dashboardSubscribers : params")
    return this.http.get(API_URL+'Interactions:/sPid', { params: params });

  }
  public dashboardAgents(sPid:any) {
    const params = new HttpParams().set('sPid', sPid)
    
    return this.http.get(API_URL+'Agents:/sPid', { params: params });
   

  }
  public dashboardCampaigns(sPid: any) {
    const params = new HttpParams().set('sPid', sPid)

    console.log(params)
    return this.http.get(API_URL+'Campaigns:/sPid', { params: params });

  }
  public dashboardRecentConversation(spid: any) {
    const params = new HttpParams().set('spid', spid)

    return this.http.get(API_URL+'recentConversation/:spid', { params: params })
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
    return this.http.get(API_URL1, { params: params });

  }
  addContact(data: any) {
    return this.http.post(API_URL1+'addCustomContact', data)
  }
  getFilteredContact(data: any) {
    return this.http.post(API_URL1+'getFilteredList', data)
  }
  editContact(data: any, customerId: any, SP_ID: any) {
    console.log(customerId)
    const params = new HttpParams().set('customerId', customerId).set('SP_ID', SP_ID)
    return this.http.post(API_URL1+'editCustomContact', data, { params: params })
  }

  importContact(data: importCSVData): Observable<any> {
    return this.http.post<any>(API_URL1+'importContact', data)
  }

  exportAllContact() {
    return this.http.get(API_URL1+'exportAllContact')
  }

  exportCheckedContact(data: any) {
    return this.http.post(API_URL1+'exportCheckedContact', data)
  }

  download() {
    return this.http.get(API_URL1+'download', { responseType: 'blob' })
  }

  downloadErrFile() {
    return this.http.get(API_URL1+'downloadCSVerror', { responseType: 'blob' })
  }


  update(data: object) {
    console.log("servise update data" + data)
    return this.http.post(API_URL1+'updateAndSave', data)
  }

  updatedDataCount(data: any) {
    return this.http.post(API_URL1+'verifyData', data)
  }

  blockContact(data: any, SP_ID: any) {
    const params = new HttpParams().set('SP_ID', SP_ID)
    return this.http.post(API_URL1+'blockedContact', data, { params: params })
  }

  getContactById(customerId: any, SP_ID: any) {

    const params = new HttpParams().set('customerId', customerId).set('SP_ID', SP_ID)
    return this.http.get(API_URL1+'getContactById', { params: params })
  }

  getContactImage(customerId: any) {
    return this.http.get(API_URL1+`getProfileImg/${customerId}`);
  }

  saveContactImage(contactsImageData:contactsImageData): Observable<any> {
    return this.http.post(API_URL1+'addProfileImg',contactsImageData);
  }


  deletContactById(data: any) {
    console.log("del API")

    return this.http.post(API_URL1+'deletContact', data)
  }

  getAttributeList(SP_ID: number) {
    return this.http.get(API_URL1+`columns/${SP_ID}`);
}

 
  //******************Smart replies API's*********************//


   getSmartReply(SP_ID:any) {
    const params = new HttpParams().set('SP_ID', SP_ID)
    return this.http.get(API_URL2+'getReplies',{params:params})
  }
  searchSmartReply(ID: any) {
    const params = new HttpParams().set('ID', ID)
    console.log("params  "  + params)
    return this.http.get(API_URL2+'search', { params: params })
  }
   duplicatekeywordSmartReply(data:any) {
    
     return this.http.post(API_URL2+'KeywordMatch',data)
  }

  sideNav(ID: any) {
    const params = new HttpParams().set('ID', ID)
    return this.http.get(API_URL2+'sideNavKeyword', { params: params })
  }

  addNewReply(data: any) {
    return this.http.post(API_URL2+'addNewReply', data)
  }

  updateSmartReply(data:any) {
    return this.http.put(API_URL2+'updateSmartReply', data)
  }

  deletesmartReply(ID: any) {
    return this.http.put(API_URL2+'deletSmartReply', ID)
  
  }
}
