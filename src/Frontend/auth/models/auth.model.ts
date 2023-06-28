export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
export interface Auth{
    email_id:string;
    password:string;
}
export interface authRegister{
    name: string; 
    mobile_number: string;
    email_id: string;
    password: string;
    confirmPassword: string;
}
export interface authForgotPassword{
    email_id:string;
}
export interface authSendOtp{
    email_id:string;
}
export interface authVerifyOtp{
    otp:string;
}

export interface authChangePassword {
    
    uid:number;
    oldPass:string;
    newPass:string;
    confirmPass:string;
     
}
