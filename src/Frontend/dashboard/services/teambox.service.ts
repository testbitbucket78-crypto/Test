import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const API_URL = environment.baseUrl;


@Injectable()
export class TeamboxService {
  constructor(private http: HttpClient) { }

  public uploadfile(FileData:any) {
      return this.http.post('http://authapi.sampanatechnologies.com/uploadfile/',FileData);
  }

  public getAgents(SPID:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/agents/'+SPID);
  }

  
  public getCustomers(SPID:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/customers/'+SPID);
  }

  public createCustomer(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com/addcustomers/',data);
  }

  public searchCustomer(channel:any,SPID:any,key:any) {
      return this.http.get('http://authapi.sampanatechnologies.com/'+channel+'/'+SPID+'/'+key);
  }
  public blockCustomer(data:any) {
    return this.http.post('https://authapi.sampanatechnologies.com/blockcustomer/',data);
  }

  

  public createInteraction(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com/interaction/',data);
  }
  
  public getAllInteraction() {
    return this.http.get('https://authapi.sampanatechnologies.com/interaction');
  }
  
  public getInteractionById(InteractionId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/interaction/'+InteractionId);
  }
  public getFilteredInteraction(InteractionStatus:any,AgentId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/filterinteraction/'+InteractionStatus+'/'+AgentId);
  }
  public getSearchInteraction(SearchKey:any,AgentId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/searchinteraction/'+SearchKey+'/'+AgentId);
  }
  public updateInteraction(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com/updateinteraction/',data);
  }
  
  public checkInteractionPinned(InteractionId:any,AgentId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/interactionpinned/'+InteractionId+'/'+AgentId);
  }

  public getAllMessageByInteractionId(InteractionId:any,Type:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/messages/'+InteractionId+'/'+Type);
  }
  public sendNewMessage(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com/newmessage/',data);
  }
  public deleteMessage(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com/deletemessage/',data);
  }
  public updateMessageRead(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com/updatemessageread/',data);
  }
  



  public updateInteractionMapping(data: any) {
    return this.http.post('https://authapi.sampanatechnologies.com/interactionmapping/',data);
  }
  public getInteractionMapping(InteractionId:any) {
    return this.http.get('https://authapi.sampanatechnologies.com/interactionmapping/'+InteractionId);
  }

  
}
 
