import { Time } from "@angular/common";

export interface companyDetail{
    SP_ID:number;
    //profile_img:raunak.png",
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

export interface workingData{
    days:string[];
    startTime:string;
    endTime:string;
}
