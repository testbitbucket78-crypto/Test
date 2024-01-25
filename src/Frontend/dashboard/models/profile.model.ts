export interface teamboxNotifications {
    ID:number;
    UID:number,
    notificationId:number,
    PushNotificationValue:number,
    SoundNotificationValue:number,
}
export interface authChangePassword {
    
    uid:number;
    oldPass:string;
    newPass:string;
    confirmPass:string;
}

export interface roleName {
   roleRes:any [];
}

export interface teamName {
    teamRes:any[];
}

export interface userActiveStatus {
    uid:number;
    IsActive:number;
}

export interface savePlan {
    SP_ID: number;
    planType: string;
    planDivision: string;
    discount: string;
    subtotalAmount: string;
    totalAmount: string;
    tax: string;
}

export interface profilePicData {
    spid:number
    uid:number,
    name:string,
    filePath:string,

}

export interface addFundsData {

    sp_id:number;
    amount:number;
    transation_type:string;
    currency:string;
}

export interface UserGuideTitles {
    id:number,
    headings:string;
}

export interface UserGuideSubtopic {
    id: number;
    headings_id: number;
    subheadings_id: number;
    subheadings: string;
  }
  


