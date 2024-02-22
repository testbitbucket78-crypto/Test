import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { billingDetail, companyDetail, localeDetail,profilesettingPicData } from '../../models/settings.model';
// import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { parsePhoneNumberFromString } from 'libphonenumber-js';



declare var $:any;

@Component({
  selector: 'sb-organisational-settings',
  templateUrl: './organisational-settings.component.html',
  styleUrls: ['./organisational-settings.component.scss']
})
export class OrganisationalSettingsComponent implements OnInit {
  uid :any;
  spiId!:number;
  User:any;
  editContact: any;
  newContact: any;
  EditContactForm:any=[];
  profile_img:any;
  profilePicture:any;
  selectedTab:number = 1;
  randomNumber:number = 0;
  companyDetailForm!:FormGroup;
  billingForm!:FormGroup;
  localeForm!:FormGroup;
  successMessage='';
  errorMessage='';
	warningMessage='';
  companyData:companyDetail = <companyDetail>{};
  billingData:billingDetail = <billingDetail>{};
  localeData:localeDetail = <localeDetail>{};
  sp_Id:number;
  noOfEmployees=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10,000','10,001+'];
  industry=['Advertisment & Marketing','Automotive','Foods & Resto','Healthcare & Clinics','Ecommerce','Education','Travel & Tourism','Entertainment & Media','Finiancial Services','Agencies & Digital Marketers','Gaming & Mobile Apps','Government & Politics','NGO & Trust','Oragnization & Assosiations','Professional Service','Retail','Technology','Telecom','Energy & Utilities','Others'];
  country=['Afghanistan','Albania','Algeria','AmericanSamoa','Andorra','Angola','Anguilla','AntiguaAndBarbuda','Argentina','Armenia','Aruba','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bermuda','Bhutan','Bolivia','BosniaAndHerzegovina','Botswana','Brazil','BritishIndianOceanTerritory','BritishVirginIslands','Brunei','Bulgaria','BurkinaFaso','Burundi','Cambodia','Cameroon','Canada','CapeVerde','CaribbeanNetherlands','CaymanIslands','CentralAfricanRepublic','Chad','Chile','China','ChristmasIsland','Cocos','Colombia','Comoros','CongoDRCJamhuriYaKidemokrasiaYaKongo','CongoRepublicCongoBrazzaville','CookIslands','CostaRica','CôteDIvoire','Croatia','Cuba','Curaçao','Cyprus','CzechRepublic','Denmark','Djibouti','Dominica','DominicanRepublic','Ecuador','Egypt','ElSalvador','EquatorialGuinea','Eritrea','Estonia','Ethiopia','FalklandIslands','FaroeIslands','Fiji','Finland','France','FrenchGuiana','FrenchPolynesia','Gabon','Gambia','Georgia','Germany','Ghana','Gibraltar','Greece','Greenland','Grenada','Guadeloupe','Guam','Guatemala','Guernsey','Guinea','GuineaBissau','Guyana','Haiti','Honduras','HongKong','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','IsleOfMan','Israel','Italy','Jamaica','Japan','Jersey','Jordan','Kazakhstan','Kenya','Kiribati','Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Macau','Macedonia','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','MarshallIslands','Martinique','Mauritania','Mauritius','Mayotte','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Montserrat','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','NewCaledonia','NewZealand','Nicaragua','Niger','Nigeria','Niue','NorfolkIsland','NorthKorea','NorthernMarianaIslands','Norway','Oman','Pakistan','Palau','Palestine','Panama','PapuaNewGuinea','Paraguay','Peru','Philippines','Poland','Portugal','PuertoRico','Qatar','Réunion','Romania','Russia','Rwanda','SaintBarthélemy','SaintHelena','SaintKittsAndNevis','SaintLucia','SaintMartin','SaintPierreAndMiquelon','SaintVincentAndTheGrenadines','Samoa','SanMarino','SãoToméAndPríncipe','SaudiArabia','Senegal','Serbia','Seychelles','SierraLeone','Singapore','SintMaarten','Slovakia','Slovenia','SolomonIslands','Somalia','SouthAfrica','SouthKorea','SouthSudan','Spain','SriLanka','Sudan','Suriname','SvalbardAndJanMayen','Swaziland','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','TimorLeste','Togo','Tokelau','Tonga','TrinidadAndTobago','Tunisia','Turkey','Turkmenistan','TurksAndCaicosIslands','Tuvalu','USVirginIslands','Uganda','Ukraine','UnitedArabEmirates','UnitedKingdom','UnitedStates','Uruguay','Uzbekistan','Vanuatu','VaticanCity','Venezuela','Vietnam','WallisAndFutuna','WesternSahara','Yemen','Zambia','Zimbabwe','ÅlandIslands'];
  dateFormates = [
    'MM/DD/YYYY',
    'MM/DD/YY',
    'DD/MM/YYYY',
    'DD/MM/YY',
    'DD-MM-YYYY',
    'DD-MM-YY',
    'MM-DD-YYYY',
    'MM-DD-YY',
    'YYYY-MM-DD',
    'M/D/YYYY',
    'M/D/YY',
    'D/M/YYYY',
    'D/M/YY',
    'M-D-YYYY',
    'M-D-YY',
    'D-M-YYYY',
    'D-M-YY',
    'MTH D, YYYY',
    'MONTH D, YYYY',
    'MTH D, YYYY',
    'MONTH D, YYYY'
  ];
  imageChangedEvent: any = '';
  croppedImage: any = '';
  profilesettingPicData = <profilesettingPicData> {};
  companyimage:any;

  form: FormGroup;
  zipCodePattern = '^[0-9]{1,6}$';
  // SearchCountryField = SearchCountryField;
	// CountryISO = CountryISO;
  // PhoneNumberFormat = PhoneNumberFormat;
	// preferredCountries: CountryISO[] =[];
  
countryCodes = [
  'AD +376', 'AE +971', 'AF +93', 'AG +1268', 'AI +1264', 'AL +355', 'AM +374', 'AO +244', 'AR +54', 'AS +1684',
  'AT +43', 'AU +61', 'AW +297', 'AX +358', 'AZ +994', 'BA +387', 'BB +1 246', 'BD +880', 'BE +32', 'BF +226',
  'BG +359', 'BH +973', 'BI +257', 'BJ +229', 'BL +590', 'BM +1 441', 'BN +673', 'BO +591', 'BQ +599', 'BR +55',
  'BS +1242', 'BT +975', 'BW +267', 'BY +375', 'BZ +501', 'CA +1', 'CC +61', 'CD +243', 'CF +236', 'CG +242',
  'CH +41', 'CI +225', 'CK +682', 'CL +56', 'CM +237', 'CN +86', 'CO +57', 'CR +506', 'CU +53', 'CV +238',
  'CW +599', 'CX +61', 'CY +357', 'CZ +420', 'DE +49', 'DJ +253', 'DK +45', 'DM +1767', 'DO +1809', 'DZ +213',
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















  
  constructor(private _settingsService:SettingsService,private fb: FormBuilder,private apiService: SettingsService) {     
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
    this.form = this.fb.group({
      zip_code: ['', [Validators.required, Validators.pattern(this.zipCodePattern)]],
    });
  }


  ngOnInit(): void {
    this.User = (JSON.parse(sessionStorage.getItem('loginDetails')!)).user ;
    this.profilePicture = (JSON.parse(sessionStorage.getItem('loginDetails')!)).profile_img;
    console.log(JSON.stringify(this.profilePicture));
    this.companyDetailForm = this.prepareCompanyForm();
    this.billingForm = this.preparebillingForm();
    this.localeForm = this.preparelocaleForm();
    this.getBillingDetails();
    this.getCompanyDetails();
    this.getLocaleDetails();
    this.getCountryList();
    let uid: string  = sessionStorage.getItem('loginDetails')?.toString() ?? '';
    let userid =JSON.parse(uid);
    this.uid = userid.uid;
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
  }



  //  image cropping function for popup

 fileChangeEvent(event: any): void {
  $("#pictureCropModal").modal('show');
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64;
   
 }


 //API call to save the cropped image

 savesettingprofileimage() {
  this.profilesettingPicData.spid = this.sp_Id,
  this.profilesettingPicData.uid = this.uid,
  this.profilesettingPicData.user = this.User,
  this.profilesettingPicData.filePath = this.croppedImage

this.apiService.uploadCompanylogo(this.profilesettingPicData).subscribe(
(response) => {

this.showToaster('Image saved successfully','success' + response);
$("#pictureCropModal").modal('hide');
this.profilePicture;
this.randomNumber = Math.random();
},
(error) => {
this.showToaster('Error saving image ','error' + error.message);
})

}

// fileChangeEvent(event: any): void {
//   $("#pictureCropModal").modal('show');
//     this.imageChangedEvent = event;
//   }
//   imageCropped(event: ImageCroppedEvent) {
//     const newImageUrl = event.base64 + '?timestamp=' + new Date().getTime();
//     this.croppedImage = newImageUrl;
    
//     // Trigger change detection
//     this.cdRef.detectChanges();
//  }

 
// //API call to save the cropped image

// saveContactsProfilePicture() {
//   let SP_ID = Number(sessionStorage.getItem('SP_ID'))
//   this.contactsImageData.SP_ID = SP_ID,
//   this.contactsImageData.customerId = this.contactId,
//   this.contactsImageData.contact_profile = this.croppedImage


// this.apiService.saveContactImage(this.contactsImageData).subscribe(
// (response) => {

//   if (response.status === 200) {
//     $("#pictureCropModal").modal('hide');
//     this.closesidenav(this.items);
//     console.log(response+ 'image saved successfully');
//     setTimeout(() => {
//       this.getContact();
//       this.profilePicture;
//    }, 300); 
//   }
// },
// (error) => {
//   console.log(error+ 'error saving contact image');
// })

// }


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
  }, 5000);
  
}
hideToaster(){
  this.successMessage='';
  this.errorMessage='';
  this.warningMessage='';
}

//  image cropping function for popup


  prepareCompanyForm(){
    return new FormGroup({
    Company_Name:new FormControl(),
    Company_Website:new FormControl(),
    Country:new FormControl(),
    Phone_Number:new FormControl(),
    Employees_count:new FormControl(),
    Industry:new FormControl(),
    });
  }
  preparebillingForm() {
    return this.fb.group({
      billing_email: ['', [Validators.required, Validators.email]],
      Address1: new FormControl(),
      InvoiceId: new FormControl('',[Validators.required, Validators.minLength(15),]),
      Address2: new FormControl(),
      Country: new FormControl(),
      State: new FormControl(),
      City: new FormControl(),
      zip_code: new FormControl('', [Validators.required, Validators.pattern(this.zipCodePattern)])
    });
  }
  preparelocaleForm(){
    return new FormGroup({
      Date_Format: new FormControl(),
      Time_Format: new FormControl(),
      Currency: new FormControl(),
      Time_Zone: new FormControl()
    });
  }

  patchCompanyForm(){
    const data = this.companyData;
    for(let prop in data){
      let value = data[prop as keyof typeof data];
      if(this.companyDetailForm.get(prop))
      this.companyDetailForm.get(prop)?.setValue(value)
    }  
  }

  
  patchBillingForm(){
    const data = this.billingData;
    for(let prop in data){
      let value = data[prop as keyof typeof data];
      if(this.billingForm.get(prop))
      this.billingForm.get(prop)?.setValue(value)
    }  
  }

  
  patchLocaleForm(){
    const data = this.localeData;
    for(let prop in data){
      let value = data[prop as keyof typeof data];
      if(this.localeForm.get(prop))
      this.localeForm.get(prop)?.setValue(value)
    }  
  }

  copyCompanyFormData(){
    if(!this.companyData)
      this.companyData =<companyDetail>{};
    this.companyData.SP_ID = this.sp_Id;
    this.companyData.Company_Name = this.companyDetailForm.controls.Company_Name.value;
    this.companyData.Company_Website = this.companyDetailForm.controls.Company_Website.value;
    this.companyData.Country = this.companyDetailForm.controls.Country.value;
    this.companyData.Employees_count = this.companyDetailForm.controls.Employees_count.value;
    this.companyData.Industry = this.companyDetailForm.controls.Industry.value;
    this.companyData.Phone_Number = this.companyDetailForm.controls.Phone_Number.value;
  }  

  copyBillingFormData(){
    if(!this.billingData)
      this.billingData =<billingDetail>{};
    this.billingData.SP_ID = this.sp_Id;
    this.billingData.InvoiceId = this.billingForm.controls.InvoiceId.value;
    this.billingData.billing_email = this.billingForm.controls.billing_email.value;
    this.billingData.Country = this.billingForm.controls.Country.value;
    this.billingData.State = this.billingForm.controls.State.value;
    this.billingData.City = this.billingForm.controls.City.value;
    this.billingData.zip_code = this.billingForm.controls.zip_code.value;
    this.billingData.Address1 = this.billingForm.controls.Address1.value;
    this.billingData.Address2 = this.billingForm.controls.Address2.value;
  }

  copyLocaleFormData(){
    if(!this.localeData)
      this.localeData =<localeDetail>{};
    this.localeData.SP_ID = this.sp_Id;
    this.localeData.Currency = this.localeForm.controls.Currency.value;
    this.localeData.Date_Format = this.localeForm.controls.Date_Format.value;
    this.localeData.Time_Format = this.localeForm.controls.Time_Format.value;
    this.localeData.Time_Zone = this.localeForm.controls.Time_Zone.value;
  }

  getCompanyDetails(){
    this._settingsService.getCompanyDetailData(this.sp_Id)
    .subscribe(result =>{
      if(result){
        this.companyData = result?.companyDetail[0];
        this.companyimage=result?.companyDetail[0].profile_img;
      }
      console.log(this.companyimage);
      console.log(this.companyData);

    })
  }

  getBillingDetails(){
    this._settingsService.getBillingData(this.sp_Id)
    .subscribe(result =>{
      if(result){
        this.billingData = result?.billingDetails[0];
      }

    })
  }

  getCountryList(){
    this._settingsService.getCountry()
    .subscribe(result =>{
      if(result){
        console.log(result)
      }

    })
  }

  getStateList(countryCode:any){
    this._settingsService.getState(countryCode)
    .subscribe(result =>{
      if(result){
        this.billingData = result?.billingDetails[0];
      }

    })
  }

  getLocaleDetails(){
    this._settingsService.getLocaleData(this.sp_Id)
    .subscribe(result =>{
      if(result){
        this.localeData = result?.localDetails[0];
      }
    })
  }  

  saveCompanyDetails(){
    this.copyCompanyFormData();
    this._settingsService.saveCompanyDetail(this.companyData)
    .subscribe(result =>{
      if(result){
        if(result?.status == 200)
        $("#companyDetailModal").modal('hide');
      }

    })
  }

  saveBillingDetails() {
    const emailControl = this.billingForm.get('billing_email'); 
  
    if (this.billingForm.valid) {
      this.copyBillingFormData();
      this._settingsService.saveBillingDetail(this.billingData)
        .subscribe(result => {
          if (result && result.status === 200) {
            $("#billingDetailModal").modal('hide');
            this.showToaster('Billing details saved successfully!', 'Success');
          }
        });
    } else {
      if (emailControl && emailControl.invalid) {
        this.showToaster('Please enter a valid email address.', 'Error');
      }
    }
  }

  saveLocaleDetails(){
    this.copyLocaleFormData();
    this._settingsService.saveLocaleDetail(this.localeData)
    .subscribe(result =>{
      if(result){
        if(result?.status == 200)
        $("#localeDetailModal").modal('hide');
      }
    })
  }
  hangeEditContactInuts(item:any){
    //console.log(item.target.name)
    this.companyDetailForm.controls.Phone_Number.setValue(item.target.value)
    if(item.target.name =='OptInStatus'){
      this.EditContactForm['OptInStatus'] = item.target.value
      this.EditContactForm['OptInStatusChecked'] = item.target.value?true:false
    }else{
      this.EditContactForm[item.target.name] = item.target.value
    }
    this.formatPhoneNumber();
    //this.ShowChannelOption=false
  
  }
  // Function to format the phone number using libphonenumber-js
formatPhoneNumber() {
  const phoneNumber = this.newContact.get('Phone_number')?.value;
  const countryCode = this.newContact.get('country_code')?.value;
  
  if (phoneNumber && countryCode) {
    const phoneNumberWithCountryCode = `${countryCode} ${phoneNumber}`;
    const formattedPhoneNumber = parsePhoneNumberFromString(phoneNumberWithCountryCode);
  
    if (formattedPhoneNumber) {
    this.newContact.get('Phone_number')?.setValue(formattedPhoneNumber.formatInternational().replace(/[\s+]/g, ''));
    const phoneNumberValue = this.newContact.get('Phone_number')?.value;
    console.log(phoneNumberValue);
  
    }
  }
  }

}