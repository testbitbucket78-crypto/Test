export interface InteractiveMessagePayload {
  to: string;
  quoted?: string;
  ephemeral?: number;
  edit?: string;
  header?: any;
  body?: any;
  footer?: any;
  type?: string; // Add this for 'list' type
  action: InteractiveAction;
}

export interface InteractiveAction {
  list?: any;  
  buttons?: InteractiveButtonPayload[]; 
}

export interface InteractiveButtonPayload {
  type: string; 
  title: string; 
  id: string;  
  copy_code?: string;
  phone_number?: string;
  url?: string;
  merchant_url?: string;
  rows?: string
}