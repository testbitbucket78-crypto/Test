export interface agentMessageList{
    Message:string;
    ActionID:Number;
    Value:any;
    Media:any;
    
}

export interface repliesList {
    Description:string;
    Title:string;
    ID:number;
    CreatedDate:string;
    ModifiedDate:string;
    Keyword:string [];
    MatchingCriteria:String;
    ActionList:actionData [];
    Media:any;
    
  
}

export interface actionData {
    Message:string;
    Name:string;
    Value:any;
    Media:any;
}

