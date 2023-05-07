import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const API_URL = environment.baseUrl;


@Injectable()
export class TeamboxService {
  constructor(private http: HttpClient) { }

  public uploadfile(FileData:any) {
      return this.http.post(API_URL+'/uploadfile/',FileData);
  }

  public getAgents(SPID:any) {
    return this.http.get(API_URL+'/agents/'+SPID);
  }

  
  public getCustomers(SPID:any) {
    return this.http.get(API_URL+'/customers/'+SPID);
  }

  public createCustomer(data: any) {
    return this.http.post(API_URL+'/addcustomers/',data);
  }

  public searchCustomer(channel:any,SPID:any,key:any) {
      return this.http.get(API_URL+'/'+channel+'/'+SPID+'/'+key);
  }
  public blockCustomer(data:any) {
    return this.http.post(API_URL+'/blockcustomer/',data);
  }

  

  public createInteraction(data: any) {
    return this.http.post(API_URL+'/interaction/',data);
  }
  
  public getAllInteraction() {
    return this.http.get(API_URL+'/interaction');
  }
  
  public getInteractionById(InteractionId:any) {
    return this.http.get(API_URL+'/interaction/'+InteractionId);
  }
  public getFilteredInteraction(InteractionStatus:any,AgentId:any) {
    return this.http.get(API_URL+'/filterinteraction/'+InteractionStatus+'/'+AgentId);
  }
  public getSearchInteraction(SearchKey:any,AgentId:any) {
    return this.http.get(API_URL+'/searchinteraction/'+SearchKey+'/'+AgentId);
  }
  public updateInteraction(data: any) {
    return this.http.post(API_URL+'/updateinteraction/',data);
  }
  
  public checkInteractionPinned(InteractionId:any,AgentId:any) {
    return this.http.get(API_URL+'/interactionpinned/'+InteractionId+'/'+AgentId);
  }

  public getAllMessageByInteractionId(InteractionId:any,Type:any) {
    return this.http.get(API_URL+'/messages/'+InteractionId+'/'+Type);
  }
  public sendNewMessage(data: any) {
    return this.http.post(API_URL+'/newmessage/',data);
  }
  public deleteMessage(data: any) {
    return this.http.post(API_URL+'/deletemessage/',data);
  }
  public updateMessageRead(data: any) {
    return this.http.post(API_URL+'/updatemessageread/',data);
  }
  



  public updateInteractionMapping(data: any) {
    return this.http.post(API_URL+'/interactionmapping/',data);
  }
  public getInteractionMapping(InteractionId:any) {
    return this.http.get(API_URL+'/interactionmapping/'+InteractionId);
  }

  
}
 
