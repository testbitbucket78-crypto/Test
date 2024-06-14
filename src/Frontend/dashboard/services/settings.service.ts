import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { billingDetail, billingDetailResponse,holidayData, companyDetail, companyDetailResponse, localeDetail, localeDetailResponse, workingData, workingDataResponse, workingDataResponsePost, rightsResponse, RolesData, UserData, TeamData, campaignDataResponsePost, campaignAlertUser, TagData, defaultActionData,defaultMessagesData,routingRulesData,newTemplateFormData,addCustomFieldsData } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})

export class SettingsService {
  API_URL:string='http://52.66.106.90:3004';
  token = 'cXlkZE04VzM3MTVaSkNwWlhINVlDNEY3eEJGV1V0S21FMGROaTJFWg==';
  subprivilages!:any;

  countryCodes = [
    'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
    'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
    'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
    'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
    'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
    'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1767', 'DO +1809', 'DZ +213',
    'EC +593', 'EE +372', 'EG +20', 'EH +212', 'ER +291', 'ES +34', 'ET +251', 'FI +358', 'FJ +679', 'FK +500',
    'FM +691', 'FO +298', 'FR +33', 'GA +241', 'GB +44', 'GD +1473', 'GE +995', 'GF +594', 'GG +44', 'GH +233',
    'GI +350', 'GL +299', 'GM +220', 'GN +224', 'GP +590', 'GQ +240', 'GR +30', 'GS +500', 'GT +502', 'GU +1671',
    'GW +245', 'GY +592', 'HK +852', 'HN +504', 'HR +385', 'HT +509', 'HU +36', 'ID +62', 'IE +353', 'IL +972',
    'IM +44', 'IN +91', 'IO +246', 'IQ +964', 'IR +98', 'IS +354', 'IT +39', 'JE +44', 'JM +1876', 'JO +962',
    'JP +81', 'KE +254', 'KG +996', 'KH +855', 'KI +686', 'KM +269', 'KN +1869', 'KP +850', 'KR +82', 'KW +965',
    'KY +1345', 'KZ +7', 'LA +856', 'LB +961', 'LC +1758', 'LI +423', 'LK +94', 'LR +231', 'LS +266', 'LT +370',
    'LU +352', 'LV +371', 'LY +218', 'MA +212', 'MC +377', 'MD +373', 'ME +382', 'MF +590', 'MG +261', 'MH +692',
    'MK +389', 'ML +223', 'MM +95', 'MN +976', 'MO +853', 'MP +1 670', 'MQ +596', 'MR +222', 'MS +1 664', 'MT +356',
    'MU +230', 'MV +960', 'MW +265', 'MX +52', 'MY +60', 'MZ +258', 'NA +264', 'NC +687', 'NE +227', 'NF +672',
    'NG +234', 'NI +505', 'NL +31', 'NO +47', 'NP +977', 'NR +674', 'NU +683', 'NZ +64', 'OM +968', 'PA +507',
    'PE +51', 'PF +689', 'PG +675', 'PH +63', 'PK +92', 'PL +48', 'PM +508', 'PN +872', 'PR +1 787', 'PS +970',
    'PT +351', 'PW +680', 'PY +595', 'QA +974', 'RE +262', 'RO +40', 'RS +381', 'RU +7', 'RW +250', 'SA +966',
    'SB +677', 'SC +248', 'SD +249', 'SE +46', 'SG +65', 'SH +290', 'SI +386', 'SJ +47', 'SK +421', 'SL +232',
    'SM +378', 'SN +221', 'SO +252', 'SR +597', 'SS +211', 'ST +239', 'SV +503', 'SX +1721', 'SY +963', 'SZ +268',
    'TC +1649', 'TD +235', 'TF +262', 'TG +228', 'TH +66', 'TJ +992', 'TK +690', 'TL +670', 'TM +993', 'TN +216',
    'TO +676', 'TR +90', 'TT +1868', 'TV +688', 'TW +886', 'TZ +255', 'UA +380', 'UG +256', 'US +1', 'UY +598',
    'UZ +998', 'VA +39', 'VC +1784', 'VE +58', 'VG +1284', 'VI +1340', 'VN +84', 'VU +678', 'WF +681', 'WS +685',
    'YE +967', 'YT +262', 'ZA +27', 'ZM +260', 'ZW +263'
  ];
  constructor(private http: HttpClient) {

    this.subprivilages = sessionStorage.getItem('subPrivileges')?.split(',');
   }

  checkRoleExist(id:any){
    if(this.subprivilages?.includes(id)){
      return false;
    }else {
      return true;
    }
  }

  getInitials(name:any){
    let intials ='';
    if(name){
      let words = name.split(' ');
      let inti = words[0][0] + (words[1] ? (words[1].trim())[0] :'');
      intials =inti;
    }else{
      intials ='';
    }
    return intials;
  }

  getCompanyDetailData(spId: number): Observable<companyDetailResponse> {
    return this.http.get<companyDetailResponse>(`${this.API_URL}/companyDetail/${spId}`);
  }

  getBillingData(spId: number): Observable<billingDetailResponse> {
    return this.http.get<billingDetailResponse>(`${this.API_URL}/billingDetails/${spId}`)
  }

  getCountry(): Observable<any> {
//     var headers = new Headers();
// headers.append("X-CSCAPI-KEY", this.token);

// var requestOptions = {
//   method: 'GET',
//   headers: headers,
//   redirect: 'follow'
// };
const headers = new HttpHeaders({
  "Accept": "application/json",
  "X-CSCAPI-KEY": this.token
});
    return this.http.get<any>('https://api.countrystatecity.in/v1/countries',{headers})
  }
  
  getState(countryCode:any): Observable<any> {
    const headers = new HttpHeaders({
      "Accept": "application/json",
      "X-CSCAPI-KEY": this.token
    });
    return this.http.get<any>(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`,{headers})
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

  userById(spId:number,userId:number =0): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getUserByuid/${spId}/${userId}`);
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
    return this.http.post<any>('http://52.66.106.90:3009/craeteQRcode',spid);
  }

  clientAuthenticated(spid:any):Observable<any> {
    return this.http.post<any>('http://52.66.106.90:3009/IsClientReady',spid);
  
}
   getSPPhoneNumber(uid:any):Observable<any> {
    return this.http.get<any>(`http://52.66.106.90:3003/users/${uid}`);
   }

   
   getRolesData(spid:any,roleID:any):Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getRoles/${roleID}/${spid}`);
   }

   getrolesdata(spid:any,userType:any): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/getUser/${spid}/${userType}`);
  }

}