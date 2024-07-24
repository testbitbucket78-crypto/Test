

export interface companyDetail {
    SP_ID: number;
    profile_img:string;
    Company_Name: string;
    Company_Website: string;
    Country: string;
    Phone_Number: number;
    Industry: string;
    country_code: string;
    Employees_count: number;
    created_By: string;
}

export interface billingDetail {
    SP_ID: number;
    InvoiceId: number;
    billing_email: string;
    Country: string;
    State: string;
    City: string;
    Address1: string;
    Address2: string;
    zip_code: number;
    created_By: string;
}

export interface localeDetail {
    SP_ID: number;
    Date_Format: string;
    Time_Format: string;
    Time_Zone: string;
    Currency: string;
    created_By: string;
}

export interface billingDetailResponse {
    billingDetails: billingDetail[];
}

export interface companyDetailResponse {
    companyDetail: companyDetail[];
}

export interface localeDetailResponse {
    localDetails: localeDetail[];
}

export interface workingFormData {
    selectedPeriod: string;
    day: string[];
    startTime: string;
    endTime: string;
}

export interface campaignFormData {
    day: string[];
    start_time: string;
    end_time: string;
}

export interface workingDataPost {
    day: string;
    startTime: string;
    endTime: string;
}

export interface workingData {
    selectedPeriod: string;
    working_days: string;
    start_time: string;
    end_time: string;
    
}

export interface monthData {
    monthName: string;
    values: any[];
    
}

export interface workingDataResponsePost {
    days: workingDataPost[]
    SP_ID: number;
    created_By: string;
}


export interface campaignDataResponsePost {
    days: campaignFormData[]
    sp_id: number;
    created_By: string;
}

export interface workingDataResponse {
    subRightRes: any;
    result: workingData[]

}

export interface holidayData {
    holiday_date: string[];
    SP_ID: number;
    created_By: string;
}

export interface rights {
    id: number;
    rightsName: string;
}

export interface rightsResponse {
    Rights: rights[];
}

export interface RolesData {
    roleID: number;
    RoleName: string;
    Privileges: string;
    subPrivileges: string;
    SP_ID: number;
}

export interface UserData {
    name: string;
    mobile_number: number;
    display_mobile_number: number;
    uid: number;
    country_code:string;
    UserType: number;
    email_id: string;
    role: string;
    SP_ID: number;
}

export interface TeamData {
    team_name: string;
    userIDs: number[];
    SP_ID: number;
    id:number;
}

export interface userTeamDropDown {
    uid: number;
    isSelected: boolean;
    name: string;
    profile_img: string;
}

export interface campaignAlertUser {
    SP_ID: number;
    uid: number[];
}

export interface TagData {
    SP_ID: number;
    ID: number;
    TagName: string;
    TagColour: string;
}

export interface defaultActionData {
    SP_ID: number;
    isAgentActive: number;
    agentActiveTime:string;
    isAutoReply:number;
    autoReplyTime:string;
    isAutoReplyDisable:number;
    isContactAdd:number;
    pausedTill:string;
    pauseAgentActiveTime: number;
    pauseAutoReplyTime: number;
    defaultAdminUid: number;
}

export interface defaultMessagesData {
    uid:number;
    Created_at:string;
    updated_at:string;
    spid:number;
    title:string;
    description:string;
    message_type:string;
    value:string
    link:string;
    override:number;
    Is_disable:number;
    autoreply:number;

}


export interface routingRulesData {
    SP_ID:number;
    contactowner:number;
    assignagent:number;
    broadcast :number;
    roundrobin:number,
    conversationallowed:string;
    manualassign:number;
    enableAdmin:number;
    assignuser:string;
    timeoutperiod:string;
    isMissChatAssigContactOwner:number;
    isadmin:number;
    assignspecificuser:number;
    selectuser:string;
    SpecificUserUid: number;
    manualAssignUid: number;
}

export interface templateMessageData {
    ID:number;
    TemplateName:string;
    status:string;
    created_at:string;
    updated_at:string;
    created_By:string;
    Header:string;
    Channel:string;
    Category:string;
    Language:string;
    Links:string;
    BodyText:string;
    media_type:string;
    industry:string;
    topic:string;
    FooterText:string;

}

export interface repliestemplateList{
    ID:number;
    spid:number;
    Channel:string;
    Header:string;
    media_type:string;
    created_at:number;
    updated_at:string;
    created_By:string;
    BodyText:string;
    Links:string;
    TemplateName:string;
}

export interface templateList{
    ID:number;
    spid:number;
    Channel:string;
    Header:string;
    BodyText:string;
    Links:string;
    TemplateName:string;
    media_type:string;
    isTemplate:number;
    created_By:string;
    updated_at:number;
}

export interface repliesaccountList{
    id:number;
    connected_id:string;
    QueueMessageCount:number;
    channel_status:number;
    connection_date:number;
    WAVersion:string;
    channel_id:string;
    QueueLimit:string;
    DisconnAlertEmail:string;
    delay_Time:string;
}


export interface accountmodel{
    id:number;
    INGrMessage:number;
    OutGrMessage:number;
    QueueLimit:string;
    delay_Time:string;
    online_status:number;
    InMessageStatus:number;
    OutMessageStatus:number;
    serviceMonetringTool:number;
    syncContact:number;
    DisconnAlertEmail:string;
    phone_type:string;
    import_conversation:number;
    roboot:number;
    restart:number;
    reset:number;
}

export interface whatsAppDetails {
    id:number,
    channel_id:string,
    connected_id:any,
    channel_status:number,
    spid:number,
    phone_type:string,
    import_conversation:number,
    QueueMessageCount:number,
    WAVersion:string,
    InMessageStatus:number,
    OutMessageStatus:number,
    QueueLimit:string,
    delay_Time:string,
    INGrMessage:number,
    OutGrMessage:number ,
    online_status:number,
    serviceMonetringTool:number,
    syncContact:number,
    disconnalertemail:string,
    roboot:number,
    restart:number,
    reset:number
}


export interface quickReplyButtons {
    quickreply1:string;
    quickreply2:string;
    quickreply3:string;
}

export interface newTemplateFormData {
    ID:number;
    TemplateName:string;
    Channel: string;
    Category: string;
    category_id:number;
    Language: string;
    media_type: string;
    Header: string;
    BodyText:string;
    Links:string;
    FooterText:string;
    status:string;
    spid:number;
    created_By:string;
    template_id:number;
    template_json:any[];
    isTemplate:number;
}
export interface profilesettingPicData{
    spid: number;
    uid :number;
    user :string;
    filePath:string;
}

export interface customFieldFormData {
    id:string;
    Option:string;
}

export interface addCustomFieldsData {
    id:number;
    SP_ID:number;
    ColumnName:string;
    Type:string;
    description:string;
    values:any;
}

export interface editAutoDeletionData {
    spid:number;
    autodeletion_message:string;
    autodeletion_media:string;
    autodeletion_contacts:string;
}





