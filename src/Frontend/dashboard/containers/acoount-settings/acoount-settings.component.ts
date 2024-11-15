import { Component, OnInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { repliesaccountList, whatsAppDetails, healthStatusData } from 'Frontend/dashboard/models/settings.model';
import { accountmodel } from 'Frontend/dashboard/models/settings.model';
import { WebsocketService } from '../../services/websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';
import { FacebookService } from 'Frontend/dashboard/services/facebook-embedded.service';
import { environment } from 'environments/environment';

declare var $:any;
declare var FB: any; 

@Component({
  selector: 'sb-acoount-settings',
  templateUrl: './acoount-settings.component.html',
  styleUrls: ['./acoount-settings.component.scss']
})
export class AcoountSettingsComponent implements OnInit {
  
  id!:number;
  spid!:number;
  data:any;
  email!:string;
  getWhatsAppDetails:any;
  whatsAppDetails!: any[];
  whatsAppDetailsDisplay!: any[];
  Quemescou!:number;
  channel!:number;
  connectionn!:number;
  wave!:number;
  AppDetails!:number;
  selectedId!: any;
  connectionIds: number[] = [];
  channel_status!:number;
  selectedWhatsappData: any;
  phone!:any;
  phoneNumber!:number;
  SPPhonenumber!:number;
  repliesaccountData!:repliesaccountList;
  whatAppDetails = <whatsAppDetails> {};
  fetchdata:any;
  QueueLimit:any;
  delay_Time:any;
  DisconnAlertEmail:any;
  showMessage: boolean = false;
  channel_id:string ='';
  accoountsetting=<accountmodel>{};
  numberCount:number = 0;
  qrcode:any;
  link:any;
  isLoading!:boolean;

  errorMessage = '';
	successMessage = '';
	warnMessage = '';
  whatsAppDataUpdated!:boolean;
  
  INGrMessage=[0];
  OutGrMessage=[0];
  online_status=[0];
  InMessageStatus=[0];
  OutMessageStatus=[0];
  serviceMonetringTool=[0];
  syncContact=[0];
  roboot=[0];
  restart=[0];
  reset=[0];
  phoneNo = 0;
	phone_no_id = 0;
	WABA_Id = 0;
  healthStatusData: healthStatusData[] = [];
  addButtonDisabled: boolean = false;
  conversationType!:string;
  phoneType!:string;

  loadingQRCode: boolean = false;

  connection:number[] =[1,3,2,4];
  selectedTab:number = 1;
  public ipAddress:string[] = [''];
  public channelDomain:string = environment.chhanel;
  private sessionInfoListener: any;
Authcode:any='';
phoneId:any='';
wabaId:any='';
uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid;
  constructor( private apiService:SettingsService,
    public facebookService:FacebookService,
    public settingsService:SettingsService,
    private renderer: Renderer2,
    private websocketService: WebsocketService,private changeDetector: ChangeDetectorRef) {}

  private socket$: WebSocketSubject<any> = new WebSocketSubject('wss://notify.stacknize.com');


  ngOnInit(): void {
    this.isLoading = true;
    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.phoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!))?.mobile_number;
    this.email = (JSON.parse(sessionStorage.getItem('loginDetails')!))?.email_id;
    this.SPPhonenumber = (JSON.parse(sessionStorage.getItem('SPPhonenumber')!));
    this.getwhatsapp();
    this.subscribeToNotifications();
    this.loadFacebookSDK();
    this.fetchLastName();
    this.sessionInfoListener = (event: MessageEvent) => {
      if (!event.origin || !event.origin.endsWith("facebook.com")) {
        return;
      }
      
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            this.phoneId = phone_number_id;
            this.wabaId = waba_id;
            
            setTimeout(() => {
              console.log(this.Authcode);
              this.saveWhatsappAPIDetails()
            }, 2500); 
            console.log("Phone number ID ", phone_number_id, " WhatsApp business account ID ", waba_id);
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data;
            console.error("Error: ", error_message);
          } else {
            const { current_step } = data.data;
            console.warn("Cancel at ", current_step);
          }
        }
      } catch {
        console.log('Non JSON Response', event.data);
      }
    };

    this.renderer.listen('window', 'message', this.sessionInfoListener);
  }

  showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}	
		else if(type=='warn'){
			this.warnMessage=message;
		}
		else if(type=='error'){
			this.errorMessage=message;
		}
	
		setTimeout(() => {
			this.hideToaster()
		}, 5000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.warnMessage='';
		this.errorMessage='';
	}
  checkChannel(): boolean {
    if (this.channelDomain == 'web') {
      return true;
    }
    return false;
  }

  // getwhatsappwebdetails
getwhatsapp() { 
  this.apiService.getWhatsAppDetails(this.spid).subscribe(response => {
    this.isLoading = false
    this.whatsAppDetails=response?.whatsAppDetails;
    this.numberCount = response?.channelCounts[0]?.count_of_channel_id;
    this.selectedId = [];
    this.whatsAppDetails.forEach(detail => {
    this.selectedId.push(detail.id);
    });
    if(this.whatsAppDetails.length > 0){
      this.channel=this.whatsAppDetails[0]?.channel_status;
      this.connectionn=this.whatsAppDetails[0]?.connection_date;
      this.wave=this.whatsAppDetails[0]?.WAVersion;
  
      this.phoneNo =  this.whatsAppDetails[0]?.connected_id;
      this.phone_no_id = this.whatsAppDetails[0]?.phone_number_id;
      this.WABA_Id = this.whatsAppDetails[0]?.WABA_ID;
      this.getQualityRating();
    }
    this.mapHealthStatus({});
    if(this.whatsAppDataUpdated){
      if(this.whatsAppDetails[0]?.channel_id) this.setChannelId(this.whatsAppDetails[0]?.channel_id);
    }
  });
}

getQualityRating() {
  this.isLoading = true;
  this.apiService.getQualityRating(this.phoneNo, this.phone_no_id, this.WABA_Id, this.spid).subscribe(
    data => {
      let res: any = data
      if (res?.status === 200) {
        if (res?.response) {
         this.mapHealthStatus(res?.response);
         this.addButtonDisabled = true;
        }
      }
      else {
        console.log("Error Code : " +res?.status);
        this.isLoading = false;
      }
    },
    error => {
      this.isLoading = false;
      console.error('Error fetching quality rating:', error);
    }
  );
}

mapHealthStatus(qualityStatus: any){
  this.healthStatusData = [];
  this.whatsAppDetails.forEach(data => {
    const healthStatus: healthStatusData = {
       phone_no: data?.connected_id,
       channel_id: qualityStatus?.channel_id,
       Quality_Rating: this.settingsService.getQualityRatingClass(qualityStatus?.quality_rating),
       Status: data?.channel_status,
       WABA_Id: data?.WABA_ID,
       Message_Limit: qualityStatus?.balance_limit_today,
       Fb_Verification: qualityStatus?.fb_verification,
       channel_type: data?.channel_id
     }
     this.healthStatusData.push(healthStatus);
   });
   this.isLoading = false;
}

getaccountByID(data:any) {
  this.repliesaccountData=data;
  const fetchdata=data;
  this.QueueLimit=fetchdata?.QueueLimit;
  this.delay_Time=fetchdata?.delay_Time;
  this.DisconnAlertEmail=fetchdata?.DisconnAlertEmail;
}

populateModal() {
  this.selectedWhatsappData = this.whatsAppDetails;
}


getDetailById(id: number) {
  return this.whatsAppDetails.find(detail => detail?.id === id);
}

setChannelId(id: string) {
  const matchingDetail = this.whatsAppDetails.filter(detail => detail?.channel_id === id);
  if (matchingDetail) {
    this.whatsAppDetailsDisplay = matchingDetail;
  } else {
    this.whatsAppDetailsDisplay = [];
  }
  this.channel_id = id;
}

saveWhatsappWebDetails(id:number) { 
  this.whatAppDetails.id = id;
  this.whatAppDetails.spid = this.spid;
  this.whatAppDetails.channel_id= this.channel_id;
  this.whatAppDetails.channel_status = this.channel_status;
  this.whatAppDetails.connected_id = this.SPPhonenumber;
  this.whatAppDetails.phone_type=this.phoneType;
  this.whatAppDetails.import_conversation = 0;
  this.whatAppDetails.QueueMessageCount = 0;
  this.whatAppDetails.WAVersion = '2.23.24.82';
  this.whatAppDetails.InMessageStatus = 0;
  this.whatAppDetails.OutMessageStatus = 0;
  this.whatAppDetails.QueueLimit = '';
  this.whatAppDetails.delay_Time = '';
  this.whatAppDetails.INGrMessage = 0;
  this.whatAppDetails.OutGrMessage = 0;
  this.whatAppDetails.online_status = 0;
  this.whatAppDetails.serviceMonetringTool = 0;
  this.whatAppDetails.syncContact  = 0;
  this.whatAppDetails.disconnalertemail = this.email;
  this.whatAppDetails.roboot = 0;
  this.whatAppDetails.restart = 0;
  this.whatAppDetails.reset = 0;

  this.apiService.addWhatsAppDetails(this.whatAppDetails).subscribe
  ((resopnse :any) => {
    if(resopnse.status === 200) {
      console.log(this.whatAppDetails)
      console.log(resopnse)
     // this.showToaster('Your Session Details Updated Succesfully','success');
      this.whatsAppDataUpdated = true;
      this.getwhatsapp();
    }

  });
  ((error: any) => {
    if(error) {
      this.showToaster('An error occurred please contact adminintrator', 'error');
    }
  })
}

 saveaccountsettingState() {
  this.accoountsetting.id = this.id;
  this.accoountsetting.INGrMessage = this.INGrMessage[this.id - 1] ? 1 : 0;
  this.accoountsetting.online_status = this.online_status[this.id - 1] ? 1 : 0;
  this.accoountsetting.InMessageStatus = this.InMessageStatus[this.id - 1] ? 1 : 0;
  this.accoountsetting.OutMessageStatus = this.OutMessageStatus[this.id - 1] ? 1 : 0;
  this.accoountsetting.serviceMonetringTool = this.serviceMonetringTool[this.id - 1] ? 1 : 0;
  this.accoountsetting.syncContact = this.syncContact[this.id - 1] ? 1 : 0;


  this.apiService.addWhatsAppDetails(this.accoountsetting).subscribe((response) => {
      console.log(response + JSON.stringify(this.accoountsetting));
  });
 }


 updateNotificationId(id: number) {
  this.id = id;
  this.saveaccountsettingState();
 }

openDiv() {
    $("#qrWhatsappModal").modal('show');
    this.generateQR();
  
}

  generateQR() {
    $("#connectWhatsappModal").modal('hide');
    this.loadingQRCode = true; // Show the loadeßr
    let data = {
      spid: this.spid,
      phoneNo: this.SPPhonenumber
    }
    var id =0;
    if (this.selectedId?.length > 0) {
      id= this.selectedId[this.selectedId?.length - 1] ? this.selectedId[this.selectedId?.length - 1] :0;
   }
    try {
      this.apiService.craeteQRcode(data).subscribe(

        (response) => {
          if (response.status === 200) {
            this.qrcode = response.QRcode;
            if(this.qrcode) {
              //this.channel_status = 1;  
            //   setTimeout(()=> {
            //   this.saveWhatsappWebDetails(id);
            // },15000); 
            }
          }
          if(response.status === 404) $("#qrWhatsappModal").modal('hide');
          this.loadingQRCode = false;
          if (response.QRcode === 'Client is ready!') {    
            this.channel_status = 1;      
            $("#qrWhatsappModal").modal('hide');
            this.showToaster('! User is already authenticated', 'success');   
            this.hideModal();
            setTimeout(()=> {
              this.saveWhatsappWebDetails(id);
            },2000); 
          }
          this.getwhatsapp();
        },
        (error) => {
          if(error.status === 409){
            this.showToaster(error?.error?.value, 'error');
            this.hideModal();
            return;
          }
          if(error.status === 400) {
            this.showToaster('Bad Request!', 'error');
            this.channel_status = 0;
            this.saveWhatsappWebDetails(id);
          }
          if (error) {
            this.showToaster('Something Went Wrong!', 'error');
            this.loadingQRCode = false;
            $("#qrWhatsappModal").modal('hide');
            this.channel_status = 0;
            this.saveWhatsappWebDetails(id);
          }
          this.getwhatsapp();
        }
      );
    } catch (error) {
      console.error('An error occurred:', error);
    }
    
  }
   hideModal(){
    setTimeout(() => {
      $("#qrWhatsappModal").modal('hide');
  }, 500);
   }
  removeIP(index:number){
    this.ipAddress.splice(index,1); 
  }

  addIP(){
    this.ipAddress.push('');
  }


async subscribeToNotifications() {
  let notificationIdentifier = {
    "UniqueSPPhonenumber": (JSON.parse(sessionStorage.getItem('loginDetails')!))?.mobile_number,
    "spPhoneNumber": JSON.parse(sessionStorage.getItem('SPPhonenumber')!)
  };
  this.websocketService.connect(notificationIdentifier);
  this.websocketService.getMessage()?.subscribe(message => {
    if (message != undefined) {
      console.log("Seems like some message update from webhook");
      console.log(message);
      try {
        let msgjson = JSON.parse(message);
        console.log(msgjson);
        if (msgjson.displayPhoneNumber) {
          this.qrcode = msgjson.message;
          this.changeDetector.detectChanges();
          var id =0;
          if (this.selectedId?.length > 0) {
            id= this.selectedId[this.selectedId?.length - 1] ? this.selectedId[this.selectedId?.length - 1] :0;
          }
          if (msgjson.message == 'Client is ready!') {
            this.channel_status = 1; 
            this.showToaster('Your Device Linked Successfully !', 'success');
            this.saveWhatsappWebDetails(id);
            $("#qrWhatsappModal").modal('hide');
            this.hideModal();
          }
         
          if(msgjson.message == 'Wrong Number'){
            this.channel_status = 0; 
            this.saveWhatsappWebDetails(id);
            this.showToaster('Wrong Number, Please use logged in number!', 'error');
            this.hideModal();
          }

          if (msgjson.message == 'QR generation timed out. Plese re-open account settings and generate QR code') {
           
            this.channel_status = 0; 
            this.saveWhatsappWebDetails(id);
            this.showToaster('QR generation timed out. Plese re-open account settings and generate QR code', 'error');
            this.loadingQRCode = false;
            $("#qrWhatsappModal").modal('hide');
            this.hideModal();
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
 }

 close(){
  let notificationIdentifier = {
    "UniqueSPPhonenumber": (JSON.parse(sessionStorage.getItem('loginDetails')!))?.mobile_number,
    "spPhoneNumber": JSON.parse(sessionStorage.getItem('SPPhonenumber')!),
    "isClose":true
  };
  this.websocketService.connect(notificationIdentifier);
 }

 loadFacebookSDK(): void {
  //if (!(window as any).fbAsyncInit) {
    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: '1147412316230943', // Replace with your app id
        cookie: true,
        xfbml: true,
        version: 'v2.4' // Use the latest version
      });
    };
 // }

  // Dynamically load SDK if not already loaded
  const scriptElement = document.createElement('script');
  scriptElement.id = 'facebook-jssdk';
  scriptElement.src = 'https://connect.facebook.net/en_US/sdk.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (document.getElementById('facebook-jssdk')) {
    firstScript.parentNode?.insertBefore(scriptElement, firstScript);
  }
}

fetchLastName(): void {
  this.facebookService.getMyLastName().subscribe({
    next: (response) => {
      let lastName = response.last_name;
      console.log(lastName);
    },
    error: (err) => {
      console.error('Error fetching last name:', err);
    }
  });
}

fbLoginCallback(response: any): void {
  if (response.authResponse) {
    const code = response.authResponse.code;
    this.Authcode = code;
    console.log('Auth Code:', code);
  }
}

launchWhatsAppSignup(): void {
  FB.login((response: any) => this.fbLoginCallback(response), {
    config_id: '523980490418313',
    response_type: 'code', 
    override_default_response_type: true,
    extras: {
      setup: {},
      featureType: '',
      sessionInfoVersion: '2',
    }
  });
}

saveWhatsappAPIDetails() { 
  let data={
    spid : this.spid,
    Code : this.Authcode,  
    user_uid : this.uid,
    phoneNumber_id : this.phoneId,
    waba_id : this.wabaId,
  }
  this.apiService.addWhatsAppAPIDetails(data).subscribe
  ((resopnse :any) => {
    if(resopnse.status === 200) {
      console.log(this.whatAppDetails)
      console.log(resopnse)
    }

  });
  ((error: any) => {
    if(error) {
      this.showToaster('An error occurred please contact adminintrator', 'error');
    }
  })
}

}
