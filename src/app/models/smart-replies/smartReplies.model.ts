export interface agentMessageList{
    Message:string;
    ActionID:Number;
    Value:any;
    
}

export interface repliesList {
    Description:string;
    Title:string;
    ID:number;
    Keyword:string [];
    MatchingCriteria:String;
    ActionList:actionData [];
  
}

export interface actionData {
    Message:string;
    Name:string;
    Value:any;
}

