

export interface companyDetail{
    SP_ID:number;
    //profile_img:raunak.png,
    Company_Name:string;
    Company_Website:string;
    Country:string;
    Phone_Number:number;
    Industry:string;
    Employees_count:number;
    created_By:string;
}

export interface billingDetail{   
    SP_ID:number;
    InvoiceId:number;
    billing_email:string;
    Country:string;
    State:string;
    City:string;
    Address1:string;
    Address2:string;
    zip_code:number;
    created_By:string;
}

export interface localeDetail{   
    SP_ID:number;
    Date_Format:string;
    Time_Format:string;
    Time_Zone:string;
    Currency:string;
    created_By:string;
}

export interface billingDetailResponse{
    billingDetails:billingDetail[];
}

export interface companyDetailResponse{
    companyDetail:companyDetail[];
}

export interface localeDetailResponse{
    localDetails:localeDetail[];
}

export interface workingFormData{
    day:string[];
    startTime:string;
    endTime:string;
}

export interface workingDataPost{
    day:string;
    startTime:string;
    endTime:string;
}

export interface workingData{
    working_days:string;
    start_time:string;
    end_time:string;
}

export interface workingDataResponsePost {
    days:workingDataPost[] 
    SP_ID:number;
    created_By:string;
}

export interface workingDataResponse {
    result:workingData[] 

}

export interface holidayData {
    holiday_date:string[];
    SP_ID:number;
    created_By:string;
}

export interface rights {
    id:number;
    rightsName:string;
}

export interface rightsResponse {
    Rights:rights[];
}

export interface RolesData{
  roleID:number;
  RoleName:string;
  Privileges:string;
  subPrivileges:string;
  SP_ID:number;
}
