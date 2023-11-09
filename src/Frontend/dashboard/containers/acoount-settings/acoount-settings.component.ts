import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { repliesaccountList } from 'Frontend/dashboard/models/settings.model';
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
  
  id!: number;
  spid!:number;
  data:any;
  getWhatsAppDetails:any;
  whatsAppDetails!: any[];
  Quemescou!:number;
  channel!:number;
  connectionn!:number;
  wave!:number;
  AppDetails!:number;
  selectedId!: number;
  connectionIds: number[] = [];
  // dataaa = <dataaa>{};
  selectedWhatsappData: any;
  phone!:any;
  phoneNumber!:number;
  repliesaccountData!:repliesaccountList;
  fetchdata:any;
  QueueLimit:any;
  delay_Time:any;
  DisconnAlertEmail:any;
  showMessage: boolean = false;
  channel_id!:number;
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

  loadingQRCode: boolean = false;

  connection:number[] =[1,3,2,4];
  selectedTab:number = 1;
  public ipAddress:string[] = [''];

  constructor( private apiService:SettingsService,private websocketService: WebsocketService,private changeDetector: ChangeDetectorRef) {}

  private socket$: WebSocketSubject<any> = new WebSocketSubject('ws://localhost:3010/');


  ngOnInit(): void {
    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.phoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
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






  // getwhatsapp
getwhatsapp() { 
  this.apiService.getWhatsAppDetails(this.spid).subscribe(response => {
    this.whatsAppDetails=response.whatsAppDetails;
    this.numberCount = response.channelCounts[0].count_of_channel_id;
    // this.whatsAppDetails.forEach(detail => {
    //   this.id.push(detail.id);
    // });
    // console.log(this.id);
    

    this.channel=this.whatsAppDetails[0].channel_status;
    this.connectionn=this.whatsAppDetails[0].connection_date;
    this.wave=this.whatsAppDetails[0].WAVersion;

   
    console.log(this.whatsAppDetails);
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

// savedata() { 
 
//   this.dataaa.spid = this.spid;
//   this.dataaa.channel_id = this.channel_id;
//   this.dataaa.channel_status = this.channel_status;
//   this.dataaa.connected_id = this.connection_id;


//   this.apiService.addWhatsAppDetails(this.dataaa).subscribe
//   ((resopnse :any) => {
//     if(resopnse.status === 200) {
//      this.showToaster('Your settings saved sucessfully','success');
//     }

//   });
//   ((error: any) => {
//     if(error) {
//       this.showToaster('An error occurred please contact adminintrator', 'error');
//     }
//   })


// }

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


  generateQR() {
    $("#connectWhatsappModal").modal('hide');
    $("#qrWhatsappModal").modal('show');

    this.loadingQRCode = true; // Show the loader

   let data = {
      spid: this.spid,
      phoneNo: this.phoneNumber
    }
    this.apiService.craeteQRcode(data).subscribe(
      (response) => {
        if(response.status === 200) {
          this.qrcode = response.QRcode;
        }
        this.loadingQRCode = false;
        if(response.status === 410) {
          this.showToaster('This user is already in use','error');
          $("#qrWhatsappModal").modal('hide');
       
        }
     },
      (error) => {
        if(error) {
          this.showToaster('Internal Server Error, Please Contact System Administrator!','error');
          this.loadingQRCode = false;
          $("#qrWhatsappModal").modal('hide');
          
        }
      }
     );
  }

  removeIP(index:number){
    this.ipAddress.splice(index,1); 
  }

  addIP(){
    this.ipAddress.push('');
  }

  async subscribeToNotifications() {
		let notificationIdentifier = {
			"UniqueSPPhonenumber" : (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number
		}
		this.websocketService.connect(notificationIdentifier);
			this.websocketService.getMessage().subscribe(message => {
        
        console.log(message)
				if(message != undefined )
				{
					console.log("Seems like some message update from webhook");
          console.log(message)
					
					try{
						let msgjson = JSON.parse(message);
						if(msgjson.displayPhoneNumber)
						{
              this.qrcode = msgjson.message;
              this.changeDetector.detectChanges(); 
              
              if(msgjson.message == 'Client is ready!')
              {
                this.showToaster('Your Device Linked Successfully !','success');
                $("#qrWhatsappModal").modal('hide');
              }

              
						}
					}
					catch(e)
					{
						console.log(e);
					}
				}
			});
	}



}