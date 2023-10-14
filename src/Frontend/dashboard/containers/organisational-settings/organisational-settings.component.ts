import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { billingDetail, companyDetail, localeDetail,profilesettingPicData } from '../../models/settings.model';
// import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { ImageCroppedEvent } from 'ngx-image-cropper';



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
  profile_img:any;
  profilePicture:any;
  selectedTab:number = 1;
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

},
(error) => {
this.showToaster('Error saving image ','error' + error.message);
})

}



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

  preparebillingForm(){
    return new FormGroup({
      billing_email: new FormControl(),
      Address1:new FormControl(),
      InvoiceId:new FormControl(),
      Address2:new FormControl(),
    Country:new FormControl(),
    State:new FormControl(),
    City:new FormControl(),
    zip_code: new  FormControl( ['', [Validators.required, Validators.pattern(this.zipCodePattern)]])
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

  saveBillingDetails(){
    this.copyBillingFormData();
    this._settingsService.saveBillingDetail(this.billingData)
    .subscribe(result =>{
      if(result){
        if(result?.status == 200)
        $("#billingDetailModal").modal('hide');
      }

    })
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

}