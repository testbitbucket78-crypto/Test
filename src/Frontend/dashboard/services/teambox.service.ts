import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
const API_URL = environment.baseUrl;



@Injectable()
export class TeamboxService {
  Setting_API_URL:string='https://settings.stacknize.com';
  constructor(private http: HttpClient) { }

  public uploadfile(FileData:any, spid:any,name:any) {
    return this.http.post(`${API_URL}/uploadfile/${spid}/${name}`,FileData);
}

  public getAgents(SPID:any) {
    return this.http.get(API_URL+'/agents/'+SPID);
  }

  
  public getCustomers(SPID:any,rangeStart:number=0,rangeEnd:number=10) {
    return this.http.get(API_URL+'/customers/'+SPID + '/'+rangeStart + '/' + rangeEnd);
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
  public getFilteredInteraction(InteractionStatus:any,AgentId:any,AgentName:any,SPID:any) {
    return this.http.get(API_URL+'/filterinteraction/'+InteractionStatus+'/'+AgentId+'/'+AgentName+'/'+SPID);
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


  public getAllMessageByInteractionId(InteractionId:any,Type:any,spid:any,RangeStart:number=0,RangeEnd:number=30) {
    return this.http.get(API_URL+'/messages/'+InteractionId+'/'+Type+'/'+RangeStart+'/'+RangeEnd + '/'+spid);
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

  public getCampaign(bodyData: any) {
    return this.http.post(API_URL+'/getCampaigns/',bodyData);
  }
  public addCampaign(bodyData: any) {
    return this.http.post(API_URL+'/addCampaign/',bodyData);
  }

  public testCampaign(bodyData: any) {
    return this.http.post(this.Setting_API_URL+'/testCampaign',bodyData);
  }

  public getCampaignDetail(CampaignID: any) {
    return this.http.get(API_URL+'/getCampaignDetail/'+CampaignID);
  }
  public deleteCampaignDetail(CampaignID: any) {
    return this.http.get(API_URL+'/deleteCampaign/'+CampaignID);
  }
  public copyCampaign(CampaignID: any) {
    return this.http.get(API_URL+'/copyCampaign/'+CampaignID);
  }
  
  public getFilteredCampaign(bodyData: any) {
    return this.http.post(API_URL+'/getFilteredCampaign/',bodyData);
  }

  public getContactList(bodyData: any) {
    return this.http.post(API_URL+'/getContactList/',bodyData);
  }

  public addNewContactList(bodyData: any) {
    return this.http.post(API_URL+'/addNewContactList/',bodyData);
  }
  public updatedContactList(bodyData: any) {
    return this.http.post(API_URL+'/updatedContactList/',bodyData);
  }

  public deleteContactList(Id:any) {
    return this.http.post(API_URL+'/deleteContactList',Id);
  }

  public applyFilterOnEndCustomer(bodyData: any) {
    return this.http.post(API_URL+'/applyFilterOnEndCustomer/',bodyData);
  }

  public processQuery(bodyData: any) {
    return this.http.post(API_URL+'/processQuery/',bodyData);
  }

  public getAdditiionalAttributes(SPID: any) {
    return this.http.get(API_URL+'/getAdditiionalAttributes/'+SPID);
  }

  public getEndCustomerDetail(customerId: any) {
    return this.http.get(API_URL+'/getEndCustomerDetail/'+customerId);
  }
  public getContactAttributesByCustomer(customerId: any) {
    return this.http.get(API_URL+'/getContactAttributesByCustomer/'+customerId);
  }

  public getCampaignMessages(CampaignId: any) {
    return this.http.get(API_URL+'/getCampaignMessages/'+CampaignId);
  }
  
  public sendCampinMessage(bodyData: any) {
    return this.http.post(API_URL+'/sendCampinMessage/',bodyData);
  }
  public saveCampaignMessages(bodyData: any) {
    return this.http.post(API_URL+'/saveCampaignMessages/',bodyData);
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

  public download() {
    return this.http.get('https://contactapi.stacknize.com/download', { responseType: 'blob' })
  }

  public downloadErrFile() {
    return this.http.get('https://contactapi.stacknize.com/downloadCSVerror', { responseType: 'blob' })
  }
  public getAttributeList(SP_ID: any) {
    return this.http.get(`https://contactapi.stacknize.com/columns/${SP_ID}`);
  } 

  public isCampaignExists(title: any, spid: any, id: any) {
    return this.http.get(`${API_URL}/exitCampaign/${title}/${spid}/${id}`);
  }

}