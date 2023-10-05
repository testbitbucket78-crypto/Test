import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl,FormGroup,Validators } from '@angular/forms';
import { newTemplateFormData, quickReplyButtons, templateMessageData } from 'Frontend/dashboard/models/settings.model';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
declare var $:any;
@Component({
  selector: 'sb-template-message',
  templateUrl: './template-message.component.html',
  styleUrls: ['./template-message.component.scss']
})


export class TemplateMessageComponent implements OnInit {
  selectedCountryCode: any = ''; // Initialize with an empty string
  selectedTab:number = 0;
  spid!:number;
  id = 0;
  currentUser!:string;
  profilePicture!:string;
  searchText!:string;
  searchTextGallery!:string;
  selectedType: string = 'text';
  selectedPreview:string = '';
  showCampaignDetail:boolean = false;
  showGalleryDetail:boolean = false;
  templatesData =[];
  galleryData = [];
  filteredGalleryData = [];
  filteredTemplatesData:templateMessageData[] = [];
  templatesMessageData:templateMessageData = <templateMessageData>{};
  characterCounts: { [key: number]: number } = {};
  filterCategory = ['Topic','Industry','Category','Language']; 
  filterListTopic = [
  { value: 0, label: 'Lead Gen', checked: false },
  { value: 1, label: 'Order Confirm', checked: false },
  { value: 2, label: 'Feedback', checked: false },
  { value: 3, label: 'Booking', checked: false },
  { value: 4, label: 'New Order', checked: false }
  ];
  filterListIndustry = [ 
  { value: 0, label: 'Transport', checked: false },
  { value: 1, label: 'Automobile', checked: false },
  { value: 2, label: 'Healthcare', checked: false },
  { value: 3, label: 'Education', checked: false },
  { value: 4, label: 'Ecommerce', checked: false },
  { value: 5, label: 'Agriculture', checked: false },
  { value: 6, label: 'Construction', checked: false },
  { value: 7, label: 'Health Services', checked: false },
  { value: 8, label: 'Financial', checked: false }];
  filterListCategory = [
    {value:0, label:'Authentication', checked:false},
    {value:1,label:'Marketing', checked:false},
    {value:2,label:'Utility', checked:false}];
  filterListChannel = [ 
    {value:1,label:'WhatsApp Official',checked:false},
    {value:2,label:'WhatsApp Web',checked:false}];
  filterListLanguage = [
    {value:0,label:'English',checked:false},
    {value:1,label:'Other',checked:false}];
  selectedCategory = 1;
  selectedCategories: string[] = [];
  quickReplyButtons: quickReplyButtons[]=[ { quickreply1: 'Reply 1', quickreply2: 'Reply 2', quickreply3: 'Reply 3' }];

  statusColors:any = {
    Draft: '#E4DFF5',
    Approved: '#E2F4EC',
    Pending: '#EBEDF1',
    Rejected: '#FFD0D0',
    Available: '#E2F4EC',
  };

  countryCodes = [
    'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
    'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
    'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
    'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
    'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
    'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1 767', 'DO +1 809', 'DZ +213',
    'EC +593', 'EE +372', 'EG +20', 'EH +212', 'ER +291', 'ES +34', 'ET +251', 'FI +358', 'FJ +679', 'FK +500',
    'FM +691', 'FO +298', 'FR +33', 'GA +241', 'GB +44', 'GD +1473', 'GE +995', 'GF +594', 'GG +44', 'GH +233',
    'GI +350', 'GL +299', 'GM +220', 'GN +224', 'GP +590', 'GQ +240', 'GR +30', 'GS +500', 'GT +502', 'GU +1671',
    'GW +245', 'GY +592', 'HK +852', 'HN +504', 'HR +385', 'HT +509', 'HU +36', 'ID +62', 'IE +353', 'IL +972',
    'IM +44', 'IN +91', 'IO +246', 'IQ +964', 'IR +98', 'IS +354', 'IT +39', 'JE +44', 'JM +1876', 'JO +962',
    'JP +81', 'KE +254', 'KG +996', 'KH +855', 'KI +686', 'KM +269', 'KN +1869', 'KP +850', 'KR +82', 'KW +965',
    'KY +1345', 'KZ +7', 'LA +856', 'LB +961', 'LC +1758', 'LI +423', 'LK +94', 'LR +231', 'LS +266', 'LT +370',
    'LU +352', 'LV +371', 'LY +218', 'MA +212', 'MC +377', 'MD +373', 'ME +382', 'MF +590', 'MG +261', 'MH +692',
    'MK +389', 'ML +223', 'MM +95', 'MN +976', 'MO +853', 'MP +1 670', 'MQ +596', 'MR +222', 'MS +1 664', 'MT +356',
    'MU +230', 'MV +960', 'MW +265', 'MX +52', 'MY +60', 'MZ +258', 'NA +264', 'NC +687', 'NE +227', 'NF +672',
    'NG +234', 'NI +505', 'NL +31', 'NO +47', 'NP +977', 'NR +674', 'NU +683', 'NZ +64', 'OM +968', 'PA +507',
    'PE +51', 'PF +689', 'PG +675', 'PH +63', 'PK +92', 'PL +48', 'PM +508', 'PN +872', 'PR +1 787', 'PS +970',
    'PT +351', 'PW +680', 'PY +595', 'QA +974', 'RE +262', 'RO +40', 'RS +381', 'RU +7', 'RW +250', 'SA +966',
    'SB +677', 'SC +248', 'SD +249', 'SE +46', 'SG +65', 'SH +290', 'SI +386', 'SJ +47', 'SK +421', 'SL +232',
    'SM +378', 'SN +221', 'SO +252', 'SR +597', 'SS +211', 'ST +239', 'SV +503', 'SX +1721', 'SY +963', 'SZ +268',
    'TC +1649', 'TD +235', 'TF +262', 'TG +228', 'TH +66', 'TJ +992', 'TK +690', 'TL +670', 'TM +993', 'TN +216',
    'TO +676', 'TR +90', 'TT +1868', 'TV +688', 'TW +886', 'TZ +255', 'UA +380', 'UG +256', 'US +1', 'UY +598',
    'UZ +998', 'VA +39', 'VC +1784', 'VE +58', 'VG +1284', 'VI +1340', 'VN +84', 'VU +678', 'WF +681', 'WS +685',
    'YE +967', 'YT +262', 'ZA +27', 'ZM +260', 'ZW +263'
  ];
  newTemplateForm!:FormGroup;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef;

  constructor(private apiService:SettingsService) { }

  errorMessage='';
	successMessage='';
	warningMessage='';

  showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}else if(type=='error'){
			this.errorMessage=message;
		}else{
			this.warningMessage=message;
		}
		setTimeout(() => {
			this.hideToaster()
		}, 3000);
		
	}
	hideToaster(){
		this.successMessage='';
		this.errorMessage='';
		this.warningMessage='';
	}

  ngOnInit(): void {

    this.spid = Number(sessionStorage.getItem('SP_ID'));
    this.profilePicture = (JSON.parse(sessionStorage.getItem('loginDetails')!)).profile_img;
    this.currentUser = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
    this.newTemplateForm = this.prepareUserForm();
    this.filteredTemplatesData = [...this.templatesData];
    this.getTemplatesData();

  }

  prepareUserForm(){
    return new FormGroup({
      TemplateName:new FormControl(null,[Validators.required]),
      Channel:new FormControl(null,[Validators.required]),
      Category:new FormControl(null,[Validators.required]),
      Language:new FormControl(null,[Validators.required]),
      media_type:new FormControl(null),
      Header:new FormControl(null),
      Links:new FormControl(null),
      BodyText:new FormControl(null,[Validators.required]),
      FooterText:new FormControl(null),
      buttonType: new FormControl(''),
      country_code: new FormControl(''),
      phone_number:new FormControl('')
    });
  }

  selectTab(tabNumber: number) {
    this.selectedTab = tabNumber;
  }

 // selected category for filterTemplate

  setSelectedCategory(index: number) {
    this.selectedCategory = index;
  }

  // selected Message for New Template Message Form
  showMessageType(type: string) {
    this.selectedType = type;
  }


  applyTemplateFilter() {

    this.filteredGalleryData = this.galleryData.filter((template:any) => {

      const isTopicMatch = this.filterListTopic.some(topic => topic.checked && topic.label === template.status);
      const isIndustryMatch = this.filterListIndustry.some(industry => industry.checked && industry.label === template.industry);
      const isCategoryMatch = this.filterListCategory.some(category => category.checked && category.label === template.Category);
      const isLanguageMatch = this.filterListLanguage.some(language => language.checked && language.label === template.Language);
      $("#filterTemplateModal").modal('hide');
      return isTopicMatch || isIndustryMatch || isCategoryMatch || isLanguageMatch;
    });
  }

  clearFilters() {

    this.filterListTopic.forEach(topic => (topic.checked = false));
    this.filterListIndustry.forEach(industry => (industry.checked = false));
    this.filterListCategory.forEach(category => (category.checked = false));
    this.filterListLanguage.forEach(language => (language.checked = false));

    this.applyTemplateFilter();
    this.getTemplatesData();
    $("#filterTemplateModal").modal('hide');
  }
  
// calculate the character count in input fields

  updateCharacterCount(event: Event, idx: number) {
    const inputElement = event.target as HTMLInputElement;
    this.characterCounts[idx] = inputElement.value.length;
  }

  getCharacterCount(idx: number) {
    return this.characterCounts[idx] || 0;
  }


  previewImageAndVideo(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      const file = inputElement.files[0];
      const reader = new FileReader();
  
      reader.onload = (e: any) => {

        const fileType = file.type;
        if(fileType.startsWith("image")) {
          this.selectedPreview = e.target.result as string;
        }
        if(fileType.startsWith("video")) {
          this.selectedPreview = e.target.result as string;
          this.videoPlayer.nativeElement.src = this.selectedPreview;
        }

        if(fileType === 'application/pdf' || fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          this.selectedPreview = e.target.result as string;
        }
     
       else {
        console.warn("Unknown file type: " + fileType);
       }
       
       
        console.log(this.selectedPreview);
      };

      reader.readAsDataURL(file);
    }
  }


// remove form preview value 
removeValue() {
  this.newTemplateForm.get('Links')!.setValue(null);
  this.selectedPreview = '';
  this.videoPlayer.nativeElement.src = null;

}
  
  addQuickReplyButtons() {
    if (this.quickReplyButtons.length < 3) {
      this.quickReplyButtons.push({ quickreply1: '', quickreply2: '', quickreply3: '' });
    }
  }
  

  removeQuickReplyButtons(index:any){
    this.quickReplyButtons.splice(index,1);
  }
  

  toggleGalleryData(data:any) {
    this.showGalleryDetail = !this.showGalleryDetail;
    this.templatesMessageData = data;
  }

  toggleTemplatesData(data:any){

    this.showCampaignDetail =!this.showCampaignDetail;
    this.templatesMessageData = data;
    }

    getTemplatesData() {
      // get templates data
      this.apiService.getTemplateData(this.spid,1).subscribe(response => {
        this.templatesData = response.templates;
        this.filteredTemplatesData = this.templatesData;
      });   
      
      //get gallery data
      this.apiService.getTemplateData(this.spid,2).subscribe(response => {
        this.galleryData = response.templates;
        this.filteredGalleryData = this.galleryData;
      });
    }

  
    updateFilter(event:any,filter:any){
		
      if(event.target.checked){
        filter['checked']=true
        console.log(filter.label+' :: '+event.target.value)
      }else{
        filter['checked']=false
        console.log(filter.label+' :: '+event.target.value)
      }
      
      
    }


    saveNewTemplate() {
      let newTemplateFormData = this.copyNewTemplateFormData(); 

      if(this.newTemplateForm.valid && this.selectedType != 'video') {
        this.apiService.saveNewTemplateData(newTemplateFormData,this.selectedPreview).subscribe(response => {
        
          if(response) {
            this.newTemplateForm.reset();
            $("#newTemplateMessage").modal('hide');
            $("#confirmationModal").modal('hide');
            this.getTemplatesData();
          }
      });
      }
      if(this.newTemplateForm.valid && this.selectedType =='video') {
          this.apiService.saveTemplateWithVideo(newTemplateFormData,this.selectedPreview).subscribe(response => {
            if(response) {
              this.newTemplateForm.reset();
              $("#newTemplateMessage").modal('hide');
              $("#confirmationModal").modal('hide');
              this.getTemplatesData();
            }
          });
      }
      else {
        alert('!Please fill the required details in the form First');
      }
  
  
    }

    confirmsave() {
      if(this.newTemplateForm.valid) {
        $("#newTemplateMessage").modal('hide');
        $("#confirmationModal").modal('show');
      }

      else{
        this.showToaster('!Please fill the required details in the form','warning');
      }
      
    }

    copyNewTemplateFormData() {
      let newTemplateForm:newTemplateFormData = <newTemplateFormData>{};
  
      newTemplateForm.spid = this.spid;
      newTemplateForm.created_By = this.currentUser;
      newTemplateForm.ID = this.id;
      newTemplateForm.isTemplate = 1;
      newTemplateForm.media_type = '';
      newTemplateForm.Header = this.newTemplateForm.controls.Header.value;
      newTemplateForm.Links = this.newTemplateForm.controls.Links.value;
      newTemplateForm.Links = this.selectedPreview;
      newTemplateForm.BodyText = this.newTemplateForm.controls.BodyText.value;
      newTemplateForm.FooterText = this.newTemplateForm.controls.FooterText.value;
      newTemplateForm.TemplateName = this.newTemplateForm.controls.TemplateName.value;
      newTemplateForm.Channel = this.newTemplateForm.controls.Channel.value;
      newTemplateForm.Category = this.newTemplateForm.controls.Category.value;
      newTemplateForm.Language = this.newTemplateForm.controls.Language.value;
      newTemplateForm.status = 'Pending';
      newTemplateForm.template_id = 0;
      newTemplateForm.template_json =[];
      // newTemplateForm.template_json.push({
      //   name:this.newTemplateForm.controls.TemplateName.value,
      //   category:this.newTemplateForm.controls.Category.value,
      //   language:this.newTemplateForm.controls.Language.value,
      //   components:[
      //     {
      //       text:this.newTemplateForm.controls.BodyText.value,
      //       type:'Body',
      //       example:{
      //         body_text:[
      //           [
      //             'Pablo','860198-230332'
      //           ]
      //         ]
      //       }
      //     },
      //     {
      //       type:'BUTTONS',
      //       buttons:[
      //         {
      //           text:this.newTemplateForm.controls.buttonText.value,
      //           type:'PHONE_NUMBER',
      //           phone_number:this.newTemplateForm.controls.phone_number.value
      //         },
      //         {
      //            url: this.newTemplateForm.controls.url.value,
      //            text: this.newTemplateForm.controls.url.value,
      //            type : "url"
      //         }
      //       ]
      //     }
      //   ]
      // });
  
  
      return newTemplateForm;
  
    }


    patchFormValue(){
      const data = this.templatesMessageData;
      for(let prop in data){
        let value = data[prop as keyof typeof data];
        if(this.newTemplateForm.get(prop))
        this.newTemplateForm.get(prop)?.setValue(value)
      }  
    }


    copyTemplatesData() {
      $("#newTemplateMessageFirst").modal('show');
      this.showGalleryDetail = false;
      this.showCampaignDetail = false;
      this.patchFormValue();
      
 
      // const TemplateID = {
      //   ID: this.templatesMessageData?.ID
      // }
      //   this.apiService.copyTemplateData(TemplateID).subscribe(response =>{
      //     if(response) {
      //       this.getTemplatesData();
      //       this.showCampaignDetail=false;
      //     }
        
      //   });
      }


    deleteTemplate() {

      const TemplateID = {
        ID: this.templatesMessageData?.ID
      }

      this.apiService.deleteTemplateData(TemplateID)
      
      .subscribe(result =>{
        if(result){
          $("#deleteModal").modal('hide');
          this.showCampaignDetail = false;
          this.getTemplatesData();
       
          
        }
      });
    }

  // Function to format the phone number using libphonenumber-js
  formatPhoneNumber() {
    const phoneNumber = this.newTemplateForm.get('phone_number')?.value;
    const countryCode = this.newTemplateForm.get('country_code')?.value;

    if (phoneNumber && countryCode) {
      const phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
      const formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);

      if (formattedPhoneNumber) {
        this.newTemplateForm.get('phone_number')?.setValue(formattedPhoneNumber.formatInternational().replace(/[\s+]/g, ''));
        const phoneNumberValue = this.newTemplateForm.get('phone_number')?.value;
        console.log(phoneNumberValue);
        
      }
    }
    }

  

//   const s3 = new AWS.S3();

// const params = {
//   Bucket: 'cip-engage',
//   Key: 'video_file.mp4', 
//   Body: 'path/to/your/local-video-file.mp4', // Local path to your video file
// };

// s3.upload(params, (err, data) => {
//   if (err) {
//     console.error('Error uploading video:', err);
//   } else {
//     const videoUrl = data.Location; // Store the URL in a variable
//     console.log('Video uploaded successfully:', videoUrl);
//   }
// });

  }

  

  



	

