export interface agentMessageList{
    Message:string;
    ActionID:Number;
    Value:any;
    ValueUuid: any;
    Media:any;
    MessageVariables: string;
    media_type: string;
    isTemplate:boolean;
	name: string;
	language: string;
	buttons: any;
}

export interface repliesList {
    Channel:string;
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

