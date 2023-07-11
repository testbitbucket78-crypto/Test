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
    isActive:number;
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
    spId:number
    uid:number,
    name:string,
    filePath:string,

}
