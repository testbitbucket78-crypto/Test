import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { billingDetail, billingDetailResponse,holidayData, companyDetail, companyDetailResponse, localeDetail, localeDetailResponse, workingData, workingDataResponse, workingDataResponsePost, rightsResponse, RolesData, UserData, TeamData, campaignDataResponsePost, campaignAlertUser, TagData, defaultActionData,defaultMessagesData,routingRulesData,newTemplateFormData,addCustomFieldsData } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})

export class SettingsService {
  API_URL:string='https://settings.stacknize.com';
  constructor(private http: HttpClient) { }

  getCompanyDetailData(spId: number): Observable<companyDetailResponse> {
    return this.http.get<companyDetailResponse>(`${this.API_URL}/companyDetail/${spId}`);
  }

  getBillingData(spId: number): Observable<billingDetailResponse> {
    return this.http.get<billingDetailResponse>(`${this.API_URL}/billingDetails/${spId}`)
  }

  getLocaleData(spId: number): Observable<localeDetailResponse> {
    return this.http.get<localeDetailResponse>(`${this.API_URL}/localDetails/${spId}`);
  }

  saveCompanyDetail(companyData:companyDetail): Observable<any> {
    return this.http.post(`${this.API_URL}/companyDetail`, companyData)
  }

  saveBillingDetail(billingData:billingDetail): Observable<any> {
    return this.http.post(`${this.API_URL}/billingDetails`, billingData)
  }

  saveLocaleDetail(localeData:localeDetail): Observable<any> {
    return this.http.post(`${this.API_URL}/localDetails`, localeData)
  }

  getWorkingData(spId: number): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/workingDetails/${spId}`);
  }

  getHolidayData(spId: number,dateFrom:any,dateTo:any): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/holidays/${spId}/${dateFrom}/${dateTo}`);
  }
  //https://settings.sampanatechnologies.com/holidays/:spID/:dateFrom/:dateTo

  saveWorkingData(workingData: workingDataResponsePost): Observable<workingData> {
    return this.http.post<workingData>(`${this.API_URL}/workingDetails`,workingData );
  }

  saveCampaignTiming(campaignData: campaignDataResponsePost): Observable<workingData> {
    return this.http.post<workingData>(`${this.API_URL}/addCampaignTimings`,campaignData );
  }

  saveHolidayData(holidayData: holidayData): Observable<workingData> {
    return this.http.post<workingData>(`${this.API_URL}/holidays`,holidayData );
  }

  getRolesList(spId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/rolesList/${spId}`);
  }

  getRightsList(): Observable<rightsResponse> {
    return this.http.get<rightsResponse>(`${this.API_URL}/rights`);
  }

  getSubRightsList(): Observable<workingDataResponse> {
    return this.http.get<workingDataResponse>(`${this.API_URL}/subrights`);
  }

  deleteRolesData(spId: number,roleId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/deleteRole/${roleId}/${spId}`);
  }

  saveRolesData(rolesData: RolesData): Observable<workingDataResponse> {
    return this.http.post<workingDataResponse>(`${this.API_URL}/addRole`,rolesData);
  }

  saveUserData(userData: UserData): Observable<workingDataResponse> {
    return this.http.post<workingDataResponse>(`${this.API_URL}/addUser`,userData);
  }

  editUserData(data:any):Observable<any>{
    return this.http.post<any>(`${this.API_URL}/editUser/`,data)
  }

  deleteUserData(uid: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/deleteUser`,uid);
  }

  getUserList(spId:number,userType:number =0): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getUser/${spId}`);
  }

  activeUser(activeUserData: any): Observable<workingDataResponse> {
    return this.http.post<workingDataResponse>(`${this.API_URL}/userActiveStatus`,activeUserData);
  }

  getTeamList(spId:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/teamsList/${spId}`);
  }

  getCampaignTimingList(spId:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/selectCampaignTimings/${spId}`);
  }
  
  saveTeamData(teamData: TeamData): Observable<workingDataResponse> {
    return this.http.post<workingDataResponse>(`${this.API_URL}/addTeam`,teamData);
  }

  deleteTeamData(teamid: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/deleteTeam`,teamid);
  }

  getUserListData(spId:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getCampaignAlertUserList/${spId}`);
  }

  updateCampaignData(campaignAlertData:campaignAlertUser): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addAndUpdateCampaign`,campaignAlertData);
  }

  getCampaignData(spId:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/selectCampaignAlerts/${spId}`);
  }

  getTestCampaignData(spId:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/selectCampaignTest/${spId}`);
  }

  updateCampaignTestData(campaignAlertData:campaignAlertUser): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addCampaignTest`,campaignAlertData);
  }

  getTagData(spId:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/selectTag/${spId}`);
  }

  updateTagData(tagData:TagData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addupdateTag`,tagData);
  }

  deleteTagData(tagData:any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/deleteTag`,tagData);
  }

  getDefaultAction(spID:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/generalcontroller/${spID}`);
  }

  saveDefaultAction(defaultActionData: defaultActionData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/defaultaction`,defaultActionData);
}

  getDefaultMessages(spID:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getdefaultmessages/${spID}`);
  }

  addEditDefaultMessages(defaultMessagesData: defaultMessagesData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addAndUpdateDefaultMsg`,defaultMessagesData);
  }

  enableDisableDefaultMessage(data:{}):Observable<any> {
    return this.http.post<any>(`${this.API_URL}/Abledisable`,data)
  }

  deleteDefaultMessage(data:{}): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/deletedefaultactions/`,data);
  }

  getRoutingRulesData(spID:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getroutingrules/${spID}`);
  }


  saveRoutingRulesData(routingRulesData: routingRulesData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/rotingsave`,routingRulesData);
  }

  getTemplateData(spID:any,isTemplate:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getTemplate/${spID}/${isTemplate}`);
  }

  getApprovedTemplate(spid:any,isTemplate:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getApprovedTemplate/${spid}/${isTemplate}`);
  }

  copyTemplateData(uid:any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addTemplate`,uid);
  }

  saveNewTemplateData(newTemplateFormData:newTemplateFormData,Link:any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addTemplate`,newTemplateFormData,Link);
  }

  deleteTemplateData(ID: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/deleteTemplates`,ID);
  }
  
  saveTemplateWithVideo(newTemplateFormData:newTemplateFormData,Link:any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addVedioTemplate`,newTemplateFormData,Link);
  }
  
  getWhatsAppDetails(spId:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getWhatsAppDetails/${spId}`);
  }
  
  addWhatsAppDetails(tagData:any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addWhatsAppDetails`,tagData);
  } 
  
  
  addTemplate(addtempletedata:any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addTemplate`,addtempletedata);
  }
  
  uploadCompanylogo(tagData:any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/uploadCompanylogo`,tagData);
  }

  getNewCustomField(spID:number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getCustomField/${spID}`);
  }

  saveNewCustomField(addCustomFieldData: addCustomFieldsData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/addCustomField`,addCustomFieldData);
  }

  UpdateCustomField(addCustomFieldData: addCustomFieldsData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/editCustomField`,addCustomFieldData);
  }

  enableDisableStatus(activeCustomField: any):Observable<any> {
    return this.http.post<any>(`${this.API_URL}/enableStatus`,activeCustomField);
  }

  enableDisableMandatory(mandatoryCustomField: any):Observable<any> {
    return this.http.post<any>(`${this.API_URL}/enableMandatory`,mandatoryCustomField);
  }

  deleteCustomField(id: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/deleteCustomField/${id}`,null);
  }  

  getManageStorageData(spid:any):Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getautodeletion/${spid}`);
  }

  editAutoDeletion(data:any):Observable<any> {
    return this.http.post<any>(`${this.API_URL}/savemanagestorage/`,data);
  }
   getmanualDelation(data:any):Observable<any> {
    return this.http.post<any>(`${this.API_URL}/getmanualDelation/`,data);
  }
  postmanualDelation(data:any):Observable<any>{
    return this.http.post<any>(`${this.API_URL}/manualDelation/`,data)
  }
  editTeam(data:any):Observable<any>{
    return this.http.post<any>(`${this.API_URL}/editTeam/`,data)
  }
  craeteQRcode(spid:any): Observable<any> {
    return this.http.post<any>('https://waweb.stacknize.com/craeteQRcode',spid);
  }

  clientAuthenticated(spid:any):Observable<any> {
    return this.http.post<any>('https://waweb.stacknize.com/IsClientReady',spid);
  
}
   getSPPhoneNumber(uid:any):Observable<any> {
    return this.http.get<any>(`https://authapi.stacknize.com/users/${uid}`);
   }
   getrolesdata(spid:any,userType:any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getUser/${spid}/${userType}`);
  }

}