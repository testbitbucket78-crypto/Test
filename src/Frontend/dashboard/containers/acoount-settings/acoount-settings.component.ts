import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { repliesaccountList, whatsAppDetails } from 'Frontend/dashboard/models/settings.model';
import { accountmodel } from 'Frontend/dashboard/models/settings.model';
import { WebsocketService } from '../../services/websocket.service';
import { WebSocketSubject } from 'rxjs/webSocket';

declare var $:any;

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


  errorMessage = '';
	successMessage = '';
	warnMessage = '';

  
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

  conversationType!:string;
  phoneType!:string;

  loadingQRCode: boolean = false;

  connection:number[] =[1,3,2,4];
  selectedTab:number = 1;
  public ipAddress:string[] = [''];

  constructor( private apiService:SettingsService,public settingsService:SettingsService,private websocketService: WebsocketService,private changeDetector: ChangeDetectorRef) {}

  private socket$: WebSocketSubject<any> = new WebSocketSubject('wss://notify.stacknize.com');


  ngOnInit(): void {

    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.phoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
    this.email = (JSON.parse(sessionStorage.getItem('loginDetails')!)).email_id;
    this.getwhatsapp();
    this.subscribeToNotifications();
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

  // getwhatsappwebdetails
getwhatsapp() { 
  this.apiService.getWhatsAppDetails(this.spid).subscribe(response => {
    this.whatsAppDetails=response.whatsAppDetails;
    this.numberCount = response.channelCounts[0]?.count_of_channel_id;
    console.log(this.numberCount);
    this.selectedId = [];
    this.whatsAppDetails.forEach(detail => {
    this.selectedId.push(detail.id);
    });
    this.channel=this.whatsAppDetails[0]?.channel_status;
    this.connectionn=this.whatsAppDetails[0]?.connection_date;
    this.wave=this.whatsAppDetails[0]?.WAVersion;
  });
}

getaccountByID(data:any) {
  this.repliesaccountData=data;
  const fetchdata=data;
  this.QueueLimit=fetchdata.QueueLimit;
  this.delay_Time=fetchdata.delay_Time;
  this.DisconnAlertEmail=fetchdata.DisconnAlertEmail;
  console.log(fetchdata);
}

populateModal() {
  this.selectedWhatsappData = this.whatsAppDetails;
  console.log(this.selectedWhatsappData);
}


getDetailById(id: number) {
  return this.whatsAppDetails.find(detail => detail.id === id);
}

setChannelId(id: string) {
  this.channel_id = id;
}

saveWhatsappWebDetails(id:number) { 

  this.whatAppDetails.id = id;
  this.whatAppDetails.spid = this.spid;
  this.whatAppDetails.channel_id= this.channel_id;
  this.whatAppDetails.channel_status = this.channel_status;
  this.whatAppDetails.connected_id = this.phoneNumber;
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
      this.showToaster('Your Session Details Updated Succesfully','success');
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
  console.log(this.OutMessageStatus);

  this.apiService.addWhatsAppDetails(this.accoountsetting).subscribe((response) => {
      console.log(response + JSON.stringify(this.accoountsetting));
  });
 }


 updateNotificationId(id: number) {
  this.id = id;
  this.saveaccountsettingState();
 }

openDiv() {

  if(this.phoneType && this.conversationType) {
    $("#qrWhatsappModal").modal('show');
    this.generateQR();
  }
  else {
    this.showToaster('! Please select your phone type and choose whether to import conversations or not.','error');
  }
  
}

  generateQR() {
    $("#connectWhatsappModal").modal('hide');
    this.loadingQRCode = true; // Show the loadeßr
    let data = {
      spid: this.spid,
      phoneNo: this.phoneNumber
    }
    if (this.selectedId?.length > 0) {
      var id= this.selectedId[this.selectedId?.length - 1] ? this.selectedId[this.selectedId?.length - 1] :0;
   }
    try {
      this.apiService.craeteQRcode(data).subscribe(

        (response) => {
          if (response.status === 200) {
            this.qrcode = response.QRcode;
            if(this.qrcode) {
              this.channel_status = 1;  
              setTimeout(()=> {
              this.saveWhatsappWebDetails(id);
            },15000); 
            }
          }
          this.loadingQRCode = false;
          if (response.QRcode === 'Client is ready!') {    
            this.channel_status = 1;      
            $("#qrWhatsappModal").modal('hide');
            this.showToaster('! User is already authenticated', 'success');   
            setTimeout(()=> {
              this.saveWhatsappWebDetails(id);
            },2000); 
          }
          this.getwhatsapp();
        },
        (error) => {
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

  removeIP(index:number){
    this.ipAddress.splice(index,1); 
  }

  addIP(){
    this.ipAddress.push('');
  }


async subscribeToNotifications() {
  let notificationIdentifier = {
    "UniqueSPPhonenumber": (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number,
    "spPhoneNumber": JSON.parse(sessionStorage.getItem('SPPhonenumber')!)
  };

  this.websocketService.connect(notificationIdentifier);
  this.websocketService.getMessage().subscribe(message => {
    if (message != undefined) {
      console.log("Seems like some message update from webhook");
      console.log(message);
      try {
        let msgjson = JSON.parse(message);
        if (msgjson.displayPhoneNumber) {
          this.qrcode = msgjson.message;
          this.changeDetector.detectChanges();

          if (msgjson.message == 'Client is ready!') {
            this.showToaster('Your Device Linked Successfully !', 'success');
            $("#qrWhatsappModal").modal('hide');
          }else{
            this.showToaster('Wrong Number, Please use logged in number!', 'error');
          }

          if (msgjson.message == 'QR generation timed out. Plese re-open account settings and generate QR code') {
            this.showToaster('QR generation timed out. Plese re-open account settings and generate QR code', 'error');
            this.loadingQRCode = false;
            $("#qrWhatsappModal").modal('hide');
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
 }
}
