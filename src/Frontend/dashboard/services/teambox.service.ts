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
  public updatedCustomer(data: any) {
    return this.http.post(API_URL+'/updatedCustomer/',data);
  }
  public updateTags(data: any) {
    return this.http.post(API_URL+'/updateTags/',data);
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
  

  
  
  public getAllInteraction(body:any) {
    return this.http.post(API_URL+'/getAllInteraction/',body);
  }
  
  public getInteractionById(InteractionId:any) {
    return this.http.get(API_URL+'/interaction/'+InteractionId);
  }
  public getFilteredInteraction(InteractionStatus:any,AgentId:any,AgentName:any) {
    
    return this.http.get(API_URL+'/filterinteraction/'+InteractionStatus+'/'+AgentId+'/'+AgentName);
  }
  public getSearchInteraction(SearchKey:any,AgentId:any) {
    return this.http.get(API_URL+'/searchinteraction/'+SearchKey+'/'+AgentId);
  }
  public updateInteraction(data: any) {
    return this.http.post(API_URL+'/updateinteraction/',data);
  }

  public deleteInteraction(data: any) {
    return this.http.post(API_URL+'/deleteInteraction/',data);
  }
  

  public checkInteractionPinned(InteractionId:any,AgentId:any) {
    return this.http.get(API_URL+'/interactionpinned/'+InteractionId+'/'+AgentId);
  }
  public updateInteractionPinned(data: any) {
    return this.http.post(API_URL+'/interactionpinned/',data);
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

  public getsavedMessages(SPID: any) {
    return this.http.get(API_URL+'/getsavedMessages/'+SPID);
  }
  public getquickReply(SPID: any) {
    return this.http.get(API_URL+'/getquickReply/'+SPID);
  }

  public getTemplates(SPID: any) {
    return this.http.get(API_URL+'/getTemplates/'+SPID);
  }

  
  



  public updateInteractionMapping(data: any) {
    return this.http.post(API_URL+'/interactionmapping/',data);
  }
  public resetInteractionMapping(data: any) {
    return this.http.post(API_URL+'/resetInteractionMapping/',data);
  }
  
  public getInteractionMapping(InteractionId:any) {
    return this.http.get(API_URL+'/interactionmapping/'+InteractionId);
  }

  
}
 
