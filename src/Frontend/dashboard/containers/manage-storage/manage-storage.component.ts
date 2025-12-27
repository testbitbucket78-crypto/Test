import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
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
  autoDeletionData:any=[];
  totalStorage:number = 4;
  percentage:number=0;
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
  messageData:any;
  mediaData:any;
  totalSize:any;
  mediaCount:any;
  combinedCount:any;
  combinedSize:any;
  isLoading!: boolean;
  errorMessage = '';
	successMessage = '';
	warnMessage = '';

  @ViewChild('deleteManually', { static: false }) deleteManuallyForm!: NgForm;

  constructor(private apiService:SettingsService,private fb: FormBuilder) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.getManageStorage();
    //this.postmanualDelation();
    this.getmanualDelation();

    this.editAutoDeletionForm = this.fb.group({
      autodeletion_message: [''],
      autodeletion_media: [''],
      autodeletion_contacts: [''],
      optionradio1: [false],
      optionradio2: [false],
      optionradio3: [false],
      
    });
    this.toggleSelection('autodeletion_message', 'optionradio1');
    this.toggleSelection('autodeletion_media', 'optionradio2');
    this.toggleSelection('autodeletion_contacts', 'optionradio3');

  }

  resetForm() {
    if (this.deleteManuallyForm) {
      this.deleteManuallyForm.resetForm();
      this.message_type = '';
      this.mediaData=null;
      this.messageData=null;
      this.combinedCount=0;
      this.combinedSize=0;
    }
  }

  get formattedDashArray() {
    return this.percentage + ', 100';
  }

  calculatePercentage() {
    this.percentage = (this.storageUtilization/this.totalStorage)*100;
  }

  getManageStorage() {
    this.apiService.getManageStorageData(this.spid).subscribe(response => {

     let storageInBytes = response.storageUtilization + response.managestroage;
     this.storageUtilization = parseFloat((storageInBytes / (1024 * 1024 * 1024)).toFixed(2));

     this.autoDeletionData = response.resultbyspid[0];

     this.autodeletion_message=this.autoDeletionData?.autodeletion_message;
     this.autodeletion_media=this.autoDeletionData?.autodeletion_media;
     this.autodeletion_contacts = this.autoDeletionData?.autodeletion_contacts;
     this.calculatePercentage();
    });
  }

  toggleSelection(optionKey: string, radioKey: string) {
    const optionControl = this.editAutoDeletionForm.get(optionKey);
    const radioControl = this.editAutoDeletionForm.get(radioKey);

    optionControl?.valueChanges.subscribe(value => {
      if (value) {
        
      if(value == 0){
        radioControl?.setValue('1',{emitEvent:false});
        optionControl?.setValue(null, { emitEvent: false });
      }else{
        radioControl?.setValue('', { emitEvent: false });
      
      }
      }
      else {
        radioControl?.setValue('1',{emitEvent:false});
      }
    });

    radioControl?.valueChanges.subscribe(value => {
      if (value) {
        optionControl?.setValue(null, { emitEvent: false });

      }
      else {
        optionControl?.enable({emitEvent:false});
      }
    });
  }


   editAutoDeletion() {
    let editAutoDeletion: editAutoDeletionData = {} as editAutoDeletionData;
  
    const formValues = this.editAutoDeletionForm.value;
    editAutoDeletion.spid = this.spid;
  
    if (formValues?.optionradio1 == '1') {
      editAutoDeletion.autodeletion_message = '-1';
    } else {
      editAutoDeletion.autodeletion_message = formValues?.autodeletion_message;
    }
  
    if (formValues?.optionradio2 == '1') {
      editAutoDeletion.autodeletion_media = '-1';
    } else {
      editAutoDeletion.autodeletion_media = formValues?.autodeletion_media;
    }
  
    if (formValues?.optionradio3 == '1') {
      editAutoDeletion.autodeletion_contacts = '-1'; 
    } else {
      editAutoDeletion.autodeletion_contacts = formValues?.autodeletion_contacts;
    }

    console.log(editAutoDeletion,'AUTO DELETEION')
  
    this.apiService.editAutoDeletion(editAutoDeletion)
      .subscribe(response => {
        if (response) {
          $("#edit-auto-deletion").modal('hide');
          this.showToaster('Auto Deletion Updated Successfully', 'success')
          this.editAutoDeletionForm.reset();
          this.getManageStorage();
        }
      });
  }
  
  patchFormValue() {
    const data = this.autoDeletionData;
    console.log(data);
    for (let prop in data) {
      let value = data[prop as keyof typeof data];
      if (this.editAutoDeletionForm.get(prop)) {
        if (value == "-1") {
          this.editAutoDeletionForm.get(prop)?.setValue('');
        } else {
          this.editAutoDeletionForm.get(prop)?.setValue(value);
        }
      }
    }
    this.editAutoDeletionForm.get('optionradio3')?.setValue(data?.autodeletion_contacts == '-1'? '1' :'');
    this.editAutoDeletionForm.get('optionradio2')?.setValue(data?.autodeletion_media == '-1'? '1' :'');
    this.editAutoDeletionForm.get('optionradio1')?.setValue(data?.autodeletion_message == '-1'? '1' :'');
    console.log(this.editAutoDeletionForm);
    // autodeletion_message: [''],
    //   autodeletion_media: [''],
    //   autodeletion_contacts: [''],
    //   optionradio1: [''],
    //   optionradio2: [''],
    //   optionradio3: [''],
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
		}, 3000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.warnMessage='';
		this.errorMessage='';
	}


  deletemanually(){
  		$("#Delete-Manually").modal('show');

  }
  deletemodal() {
    if (this.manually_deletion_days && this.textChecked) {
      $("#messagedeleteModal").modal('show');
      $("#Delete-Manually").modal('hide');
    } else if (this.manually_deletion_days && this.mediaChecked) {
      $("#messagedeleteModal").modal('show');
      $("#Delete-Manually").modal('hide');
    } 
      else {
      this.showToaster("Please fill input and check the checkbox", "error");
    }
  }
  
  postmanualDelation() {
    let manualdeletedata={
      SPID:this.spid,
      manually_deletion_days:this.manually_deletion_days,
      Text:this.textChecked,
      media:this.mediaChecked,
      message_type:this.message_type,
    }
    this.apiService.postmanualDelation(manualdeletedata).subscribe(response => {
      
      console.log(response);
      this.deleteManuallyForm.resetForm();
      this.message_type = '';
      this.getManageStorage();
    })
    $("#messagedeleteModal").modal('hide');
  }
  resetData(){
    this.message_count = '';
    this.mediaCount = '';
    this.combinedCount = '';
    this.message_size = '';
    this.totalSize = '';
    this.combinedSize = '';
  }

  getmanualDelation(){
    let showdeletedata={
      SPID:this.spid,
      Manually_deletion_days:this.manually_deletion_days,
      message_type:this.message_type,
     }

     if(this.manually_deletion_days==0) {
      this.showToaster('Please enter a valid number of days starting from 1.','error');
      return;
     }
     else {
      this.apiService.getmanualDelation(showdeletedata).subscribe(response => {
        this.showMessages = true;

        if(this.manually_deletion_days && this.textChecked) {
          if(response?.textSize?.length) this.messageData = response.textSize[0];
          this.message_count = this.messageData?.message_count;
          let message_size = this.messageData?.message_size;
          this.message_size = parseFloat((message_size / (1024 * 1024)).toFixed(2));
        };
        
      

        if(this.manually_deletion_days && this.mediaChecked) {
          this.mediaData = response?.mediaSize;
          this.mediaCount = this.mediaData?.mediaCount;
          let totalSize = this.mediaData?.totalSize;
          this.totalSize = parseFloat((totalSize / (1024 * 1024)).toFixed(2));
        };
       

        if(this.message_type == 'Both') {
          this.combinedSize = Number(this.message_size + this.totalSize);
          this.combinedCount = Number(this.message_count + this.mediaCount);
        }
        this.isLoading = false;
      });
     }

  }
 updateMessageType() {
    if (this.textChecked && this.mediaChecked) {
        this.message_type = 'Both';
    } else {
        this.message_type = (this.textChecked ? 'Text' : '') || (this.mediaChecked ? 'Media' : '');
    }
}


// listenToAutoDeletionChanges(): void {
//   this.editAutoDeletionForm.get('autodeletion_message').valueChanges.subscribe(value => {
//     this.handleInputValueChanges(value, 'autodeletion_message', 'autoDeletionMessageChecked');
//   });

//   this.editAutoDeletionForm.get('autodeletion_media').valueChanges.subscribe(value => {
//     this.handleInputValueChanges(value, 'autodeletion_media', 'autoDeletionMediaChecked');
//   });

//   this.editAutoDeletionForm.get('autodeletion_contacts').valueChanges.subscribe(value => {
//     this.handleInputValueChanges(value, 'autodeletion_contacts', 'autoDeletionContactsChecked');
//   });
// }

// handleInputValueChanges(value: string, controlName: string, checkboxVar: string): void {
//   // If the value is empty or 0, clear the input and check the radio button
//   if (!value || value === '0') {
//     this.editAutoDeletionForm.get(controlName).setValue('');
//     this[checkboxVar] = true;
//   } else {
//     this[checkboxVar] = false;
//   }
// }


}

