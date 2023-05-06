import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpBackend, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
const API_URL = environment.baseUrl;


@Injectable()
export class TeamboxService {
  constructor(private http: HttpClient) { }

  public uploadfile(FileData:any) {
    return this.http.post('http://localhost:3003/uploadfile/',FileData);
  }

  public getAgents(SPID:any) {
    return this.http.get('http://localhost:3003/agents/'+SPID);
  }

  
  public getCustomers(SPID:any) {
    return this.http.get('http://localhost:3003/customers/'+SPID);
  }

  public createCustomer(data: any) {
    return this.http.post('http://localhost:3003/addcustomers/',data);
  }

  public searchCustomer(channel:any,SPID:any,key:any) {
    return this.http.get('http://localhost:3003/searchcustomers/'+channel+'/'+SPID+'/'+key);
  }
  public blockCustomer(data:any) {
    return this.http.post('http://localhost:3003/blockcustomer/',data);
  }

  

  public createInteraction(data: any) {
    return this.http.post('http://localhost:3003/interaction/',data);
  }
  
  public getAllInteraction() {
    return this.http.get('http://localhost:3003/interaction');
  }
  
  public getInteractionById(InteractionId:any) {
    return this.http.get('http://localhost:3003/interaction/'+InteractionId);
  }
  public getFilteredInteraction(InteractionStatus:any,AgentId:any) {
    return this.http.get('http://localhost:3003/filterinteraction/'+InteractionStatus+'/'+AgentId);
  }
  public getSearchInteraction(SearchKey:any,AgentId:any) {
    return this.http.get('http://localhost:3003/searchinteraction/'+SearchKey+'/'+AgentId);
  }
  public updateInteraction(data: any) {
    return this.http.post('http://localhost:3003/updateinteraction/',data);
  }
  
  public checkInteractionPinned(InteractionId:any,AgentId:any) {
    return this.http.get('http://localhost:3003/interactionpinned/'+InteractionId+'/'+AgentId);
  }

  public getAllMessageByInteractionId(InteractionId:any,Type:any) {
    return this.http.get('http://localhost:3003/messages/'+InteractionId+'/'+Type);
  }
  public sendNewMessage(data: any) {
    return this.http.post('http://localhost:3003/newmessage/',data);
  }
  public deleteMessage(data: any) {
    return this.http.post('http://localhost:3003/deletemessage/',data);
  }
  public updateMessageRead(data: any) {
    return this.http.post('http://localhost:3003/updatemessageread/',data);
  }
  



  public updateInteractionMapping(data: any) {
    return this.http.post('http://localhost:3003/interactionmapping/',data);
  }
  public getInteractionMapping(InteractionId:any) {
    return this.http.get('http://localhost:3003/interactionmapping/'+InteractionId);
  }

  
}
 
