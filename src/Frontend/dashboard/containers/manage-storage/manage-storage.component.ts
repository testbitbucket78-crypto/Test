import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { editAutoDeletionData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';

declare var $: any;
@Component({
  selector: 'sb-manage-storage',
  templateUrl: './manage-storage.component.html',
  styleUrls: ['./manage-storage.component.scss']
})



export class ManageStorageComponent implements OnInit {
  editAutoDeletionForm!: FormGroup;
  spid!:number;
  storageUtilization!:number;
  manageStorage:any=[];
  totalStorage:number = 4;
  percentage!:number;
  autodeletion_message:string ='';
  autodeletion_media:string ='';
  autodeletion_contacts:string ='';
  manually_deletion_days:any;

  message_type:string = '';
  textChecked:string = '';
  mediaChecked:string = '';
  Manually_deletion_days:any;
  showMessages: boolean = false;
  noOfMessages: number = 0;
  sizeOfMessage: string = '';
  message_size:any;
  message_count:any;
  messageData: any = null;

  errorMessage = '';
	successMessage = '';
	warnMessage = '';

  constructor(private apiService:SettingsService,private fb: FormBuilder) { }

  ngOnInit(): void {
    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.getManageStorage();
    this.postmanualDelation();
    this.getmanualDelation();

    this.editAutoDeletionForm = this.fb.group({
      option1: [''],
      option2: [''],
      option3: [''],
      optionradio1: [''],
      optionradio2: [''],
      optionradio3: [''],
      
    });
    this.toggleSelection('option1', 'optionradio1');
    this.toggleSelection('option2', 'optionradio2');
    this.toggleSelection('option3', 'optionradio3');

  }
  

  get formattedDashArray() {
    return this.percentage + ', 100';
  }

  calculatePercentage() {
    this.percentage = (this.storageUtilization/this.totalStorage)*100;
  }

  getManageStorage() {
    this.apiService.getManageStorageData(this.spid).subscribe(response => {
     this.storageUtilization = response.storageUtilizationGB;
     this.manageStorage = response.managestroage[0];
     this.autodeletion_message=this.manageStorage.autodeletion_message;
     this.autodeletion_media=this.manageStorage.autodeletion_media;
     this.autodeletion_contacts = this.manageStorage.autodeletion_contacts;
     console.log(this.manageStorage);
     this.calculatePercentage();
    });
  }

  toggleSelection(optionKey: string, radioKey: string) {
    const optionControl = this.editAutoDeletionForm.get(optionKey);
    const radioControl = this.editAutoDeletionForm.get(radioKey);

    optionControl?.valueChanges.subscribe(value => {
      if (value) {
        radioControl?.setValue(null, { emitEvent: false });
        radioControl?.disable({emitEvent:false});
      }
      else {
        radioControl?.enable({emitEvent:false});
      }
    });

    radioControl?.valueChanges.subscribe(value => {
      if (value) {
        optionControl?.setValue(null, { emitEvent: false });
        optionControl?.disable({emitEvent:false});
      }
      else {
        optionControl?.enable({emitEvent:false});
      }
    });
  }


  editAutoDeletion() {

      let editAutoDeletion:editAutoDeletionData= <editAutoDeletionData>{};

      const formValues = this.editAutoDeletionForm.value;
      editAutoDeletion.spid = this.spid;

      if(formValues.optionradio1) {
        editAutoDeletion.autodeletion_message = formValues.optionradio1;
      }
      else {
        editAutoDeletion.autodeletion_message = formValues.option1;
      }
      if(formValues.optionradio2) {
        editAutoDeletion.autodeletion_media  = "never delete";
      }
      else {
        editAutoDeletion.autodeletion_media = formValues.option2;
      }
      if(formValues.optionradio3) {
        editAutoDeletion.autodeletion_contacts= "never delete";
      }
      else {
        editAutoDeletion.autodeletion_contacts = formValues.option3;
      }
 
    this.apiService.editAutoDeletion(editAutoDeletion)
    .subscribe(response => {
      if(response) {
        $("#edit-auto-deletion").modal('hide');
        this.getManageStorage();
        // this.editAutoDeletionForm.reset();
      }
    });

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


  deletemanually(){
  		$("#Delete-Manually").modal('show');

  }
  deletemodal(){
    if(this.manually_deletion_days && this.textChecked || this.mediaChecked ){
      $("#messagedeleteModal").modal('show');
      $("#Delete-Manually").modal('hide');
    }else{
			this.showToaster("Please fill input and check the checkbox", "error");
    }
  }
  postmanualDelation(){
    let manualdeletedata={
      SPID:this.spid,
      manually_deletion_days:this.manually_deletion_days,
      Text:this.textChecked,
      media:this.mediaChecked,
      message_type:this.message_type,
    }
    this.apiService.postmanualDelation(manualdeletedata).subscribe(response => {
      
      console.log(response);
    })
    $("#messagedeleteModal").modal('hide');
  }
// Show the 
  getmanualDelation(){
    let showdeletedata={
      SPID:this.spid,
      Manually_deletion_days:this.manually_deletion_days,
      message_type:this.message_type,
     }
    this.apiService.getmanualDelation(showdeletedata).subscribe(response => {
      this.showMessages = true; // Show the messages section
      this.messageData = response.messageSize[0];
    })
  }
  updateMessageType() {
    this.message_type = (this.textChecked ? 'Text' : '') || (this.mediaChecked ? 'Media' : '');
  }

}
