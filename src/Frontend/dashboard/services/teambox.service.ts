import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const API_URL = environment.baseUrl;


@Injectable()
export class TeamboxService {
  constructor(private http: HttpClient) { }

  public getAgents(SPID:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/agents/:spID'+SPID);
  }

  public getCustomers(SPID:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+SPID);
  }

  public createCustomer(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }

  public searchCustomer(key:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+key);
  }
  public blockCustomer(data:any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }

  

  public createInteraction(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }
  
  public getAllInteraction() {
    return this.http.get('https://authapi.sampanatechnologies.com');
  }
  
  public getInteractionById(InteractionId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+InteractionId);
  }
  public getFilteredInteraction(InteractionStatus:any,AgentId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+InteractionStatus+'/'+AgentId);
  }
  public getSearchInteraction(SearchKey:any,AgentId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+SearchKey+'/'+AgentId);
  }
  public updateInteraction(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }
  
  public checkInteractionPinned(InteractionId:any,AgentId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+InteractionId+'/'+AgentId);
  }

  public getAllMessageByInteractionId(InteractionId:any,Type:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+InteractionId+'/'+Type);
  }
  public sendNewMessage(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }
  public deleteMessage(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }
  public updateMessageRead(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }
  



  public updateInteractionMapping(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com',data);
  }
  public getInteractionMapping(InteractionId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com'+InteractionId);
  }

  
}
 
