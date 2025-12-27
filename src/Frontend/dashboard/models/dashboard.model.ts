export {};
export class CSVRecord {  
	public Name: any;  
	public emailId: any;  
	public Phone_number: any;  
	public sex: any;  
	public tag: any;  
	public status: any; 
    public Country: any;  
	public state: any;
	public uid:any;
	public sp_account_id :any;
	public age:any;
	public address: any;  
	public pincode: any;
	public city:any;
	public OptInStatus :any;
	public facebookId:any;
	public InstagramId:any;    
} 


export class Cards {
	constructor(public ID: number) {

	}

}

export interface contactsImageData {
    SP_ID:number
    customerId:number,
    contact_profile:string,

}

export interface ColumnMapping {
	displayName: any;
	ActuallName: any;
  }

export interface importCSVData {
	field: [],  //override fields
	identifier: string,
	purpose: string,
	SP_ID:number,
	messageOptIn:string,
	user:string,
	emailId:string,
	importedData: []
}
  
