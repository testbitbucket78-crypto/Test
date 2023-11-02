import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { repliesaccountList } from 'Frontend/dashboard/models/settings.model';
import{ accountmodel } from 'Frontend/dashboard/models/settings.model';

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



  connection:number[] =[1,3,2,4];
  selectedTab:number = 1;
  public ipAddress:string[] = [''];

  constructor( private apiService:SettingsService) {}

  ngOnInit(): void {
    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.phoneNumber = (JSON.parse(sessionStorage.getItem('loginDetails')!)).mobile_number;
    this.getwhatsapp();
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

   let data = {
      spid: this.spid,
      phoneNo: this.phoneNumber
    }
    this.apiService.craeteQRcode(data).subscribe(
      (response) => {
        if(response.status===200) {
          this.qrcode = response.QRcode;
          // this.savedata(); 
        }

        if (response.status === 201) {
          this.showToaster('! QR Code is Generated','success');
          $("#qrWhatsappModal").modal('hide');
        }

        if(response.status === 410) {
          $("#qrWhatsappModal").modal('hide');
          this.showToaster('This user is already in use','error');
       
        }
     },
      (error) => {


        if(error) {
          $("#qrWhatsappModal").modal('hide');
          this.showToaster('Error Generating QR Code as Connection Timed Out, Please try again!','error');
          
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



}