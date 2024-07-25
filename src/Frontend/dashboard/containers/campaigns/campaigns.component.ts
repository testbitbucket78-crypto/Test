import { Component, OnInit,ViewChild, ElementRef,HostListener  } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { TeamboxService } from './../../services';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx'; 
declare var $: any;

@Component({
  selector: 'sb-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss']
})
export class CampaignsComponent implements OnInit {

	//******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}


	@ViewChild('filterby') filterby: ElementRef |undefined; 
   currDate = new Date();
	SPID:any = sessionStorage.getItem('SP_ID');
	showTopNav: boolean = true;
	TeamLeadId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
	AgentId = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid
	AgentName = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name
	loginAs = (JSON.parse(sessionStorage.getItem('loginDetails')!)).UserType

	errorMessage='';
	successMessage='';
	warningMessage='';
	checkboxChecked: boolean = false;
	profilePicture!:string;



	 showInfo:boolean = false;
	 modalReference: any;
	 modalReference2: any;
	 RuningCampaigns:any;
	 confirmMessage:any;
	 step2Option:any='';
	 showCampaignDetail:any=false;
	 showFilterByOption:any=false;
	 showFilterTagOption:any=false;
	 showvariableoption:any=false;
	 showAdvance:any=false;
	 ShowChannelOption:any=false;
	 activeStep:any=1;
	 isEditCampaign:any=false;
	 newCampaignDetail: any;
	 isNextClicked:boolean = false;
	 TemplateMediaSource:any=0;
	 importantContact:any=false;
	 segmentsContactList:any=[];
	 testNumbers:any=[];
	 lowBalance:any=false;
	 csvContactList:any=[];
	 mappedcsvContactList:any=[];
	 csvContactColmuns:any=[];
	 mapCsvContact:any=false;
	 CsvContactCol:any=''
	 selecetdCSV:any='';
	 CSVDuplicate:any='';
	 CSVPrefix:any=[];
	 dragAreaClass: string='';
	 slectedItem:any;
	 pagesize:any=5;
	 page:any=1;
	 totalpages:any=1;
	 optInStatus:string='';
	 isCampaignAlreadyExist!:boolean;
	selectedAttribute: any;
	selectedAddNewCampaign: any;
	selectedFallback: any;

	 applyListModal:any;
	 applylistFiltersWidth:any='900px';
	 newListName:any=false;
	 newContactListName:any='';
	 importedContacts:any=false;
	 MapOptionFor:any=false;
	 
	 showEditTemplateMedia:any=false;
	 scheduled:any=0;
	 showContactFilter:any=false;
	 
	 showScheduleDateOption:any=false;
	 ScheduleDateList:any=['15 Dec 2022','16 Dec 2022','17 Dec 2022','18 Dec 2022'];
	 selecteScheduleDate:any= '';
	 selScheduleDate!:Date;
	 showScheduleTimeOption:any=false;
	 ScheduleTimeList:any=['12:00 Am','12:15 Am','12:30 Am','12:30 Am'];
	 selecteScheduleTime:any='';
	 selectedScheduleTime:any='';
	 isTimingPast:boolean = false;
	 showTimeZoneOption:any=false;
	 selecteTimeZone:any='GMT +5:30';
	 timeZonesList:any=['GMT-12:00','GMT-11:00','GMT-10:00','GMT-09:00','GMT-08:00','GMT-08:00','GMT-07:00','GMT-07:00','GMT-07:00','GMT-06:00','GMT-06:00','GMT-06:00','GMT-06:00','GMT-05:00','GMT-05:00','GMT-05:00','GMT-04:00','GMT-04:00','GMT-04:00','GMT-04:00','GMT-03:30','GMT-03:00','GMT-03:00','GMT-03:00','GMT-03:00','GMT-02:00','GMT-01:00','GMT-01:00','GMT+00:00','GMT+00:00','GMT+01:00','GMT+01:00','GMT+01:00','GMT+01:00','GMT+01:00','GMT+02:00','GMT+02:00','GMT+02:00','GMT+02:00','GMT+02:00','GMT+02:00','GMT+02:00','GMT+02:00','GMT+02:00','GMT+03:00','GMT+03:00','GMT+03:00','GMT+03:00','GMT+03:30','GMT+04:00','GMT+04:00','GMT+04:00','GMT+04:30','GMT+05:00','GMT+05:00','GMT+05:30','GMT+05:30','GMT+05:45','GMT+06:00','GMT+06:00','GMT+06:30','GMT+07:00','GMT+07:00','GMT+08:00','GMT+08:00','GMT+08:00','GMT+08:00','GMT+08:00','GMT+09:00','GMT+09:00','GMT+09:00','GMT+09:30','GMT+09:30','GMT+10:00','GMT+10:00','GMT+10:00','GMT+10:00','GMT+10:00','GMT+11:00','GMT+12:00','GMT+12:00','GMT+13:00',]
	 mapNameOption:any=['First Name','Last Name', 'Username','Email'];
	 attributesoption:any=[]
	 attributesoptionFilters:any=[]
	 allCampaign:any=[];
	 allCampaignMain:any=[];
	 selectedCampaign:any=[];
	 filteredEndCustomer:any=[];
	 filteredEndCustomerOrigional:any=[];
	 searchKey:any='';
	 CampaignFilterBy:any=[{status:[],channel:[],category:[]}]
	 file: any;                                           


	 allTemplates:any=[];
	 initallTemplates:any=[];
	 allTemplatesMain:any=[];
	 selectedTemplate:any=[];
	 templatesVariable:any=[];
	 selecetdVariable:any=[];
	 fileformat = 'csv';

	 isUtility:boolean = true;
	 isMarketing:boolean = true;
	 isAuthentication:boolean = true;
	 

	 contactTagsOption:any=[
		{value:0,label:'Paid',checked:false},
		{value:1,label:'Unpaid',checked:false},
		{value:2,label:'New',checked:false}
	 ];
	 
	 campaignStatusOption:any=[
		{value:0,label:'Draft',checked:false},
		{value:1,label:'Scheduled',checked:false},
		{value:2,label:'Running',checked:false},
		{value:3,label:'Completed',checked:false}];
	 
	 channelOption:any=[
			{value:1,label:'WhatsApp Official',checked:false},
			{value:2,label:'WhatsApp Web',checked:false}];
	 categoriesOption:any=[
				{value:1,label:'Marketing',checked:false},
				{value:2,label:'Utility',checked:false},
				{value:3,label:'Authentication',checked:false}];
	datesFilter:any=[]

	allContactList:any=[];
	newContactListFilters:any=[]
	ContactListNewFilters:any=[]
	
	contactFilterBy:any=[
		{value:'Phone_number',label:'Phone_number',checked:false,addeFilter:[],
		option:[
		{label:'Contains',checked:false,type:'text'},
		{label:'Does Not Contain',checked:false,type:'text'},
		{label:'Starts with',checked:false,type:'text'},
		{label:'End with',checked:false,type:'text'},
		]},
		{value:'Name',label:'Name',checked:false,addeFilter:[],
		option:[
		{label:'Contains',checked:false,type:'text'},
		{label:'Does Not Contain',checked:false,type:'text'},
		{label:'Starts with',checked:false,type:'text'},
		{label:'End with',checked:false,type:'text'},
		{label:'Is',checked:false,type:'select',options:['Empty']},
		{label:'Is not',checked:false,type:'select',options:['Empty']},
	    ]},
		{value:'emailId',label:'emailId',checked:false,addeFilter:[],
		option:[
		{label:'Contains',checked:false,type:'text'},
		{label:'Does Not Contain',checked:false,type:'text'},
		{label:'Includes domain',checked:false,type:'text'},
		{label:'Exclude domain',checked:false,type:'text'},
		{label:'Is',checked:false,type:'select',options:['Empty']},
		{label:'Is not',checked:false,type:'select',options:['Empty']},
	    ]},
		// {value:'status',label:'status',checked:false,addeFilter:[],
		// option:[
		// {label:'Is',checked:false,type:'select',options:['Premium','Other']},
		// {label:'Is not',checked:false,type:'select',options:['Premium','Other']},
		// ]},
		// {value:'channel',label:'channel',checked:false,addeFilter:[],
		// option:[
		// {label:'Is',checked:false,type:'select',options:['WhatsApp','Other']},
		// {label:'Is not',checked:false,type:'select',options:['WhatsApp','Other']},
		// ]},
		{value:'tag',label:'Tag',checked:false,addeFilter:[],
		option:[
		{label:'Is',checked:false,type:'select_opt',options:['Paid','Un-Paid','New Customer']},
		{label:'Is not',checked:false,type:'select_opt',options:['Paid','Un-Paid','New Customer']},
		]},
		
		// {value:'sex',label:'sex',checked:false,addeFilter:[],
		// option:[
		// {label:'Is',checked:false,type:'select',options:['Male','Female','Transgender']},
		// {label:'Is not',checked:false,type:'select',options:['Male','Female','Transgender']}
	    // ]},
		// {value:'age',label:'age',checked:false,addeFilter:[],
		// option:[
		// {label:'Is',checked:false,type:'number'},
		// {label:'Is not',checked:false,type:'number'},
		// {label:'Less Then',checked:false,type:'number'},
		// {label:'Greater Then',checked:false,type:'number'}
	    // ]},
		// {value:'address',label:'address',checked:false,addeFilter:[],
		// option:[
		// 	{label:'Contains',checked:false,type:'text'},
		// 	{label:'Does Not Contain',checked:false,type:'text'},
		// 	{label:'Starts with',checked:false,type:'text'},
		// 	{label:'End with',checked:false,type:'text'},
		// 	{label:'Is',checked:false,type:'select',options:['Empty']},
		// 	{label:'Is not',checked:false,type:'select',options:['Empty']},
			
	    // ]},
		
		// {value:'city',label:'city',checked:false,addeFilter:[],
		// option:[
		// 	{label:'Contains',checked:false,type:'text'},
		// 	{label:'Does Not Contain',checked:false,type:'text'},
		// 	{label:'Starts with',checked:false,type:'text'},
		// 	{label:'End with',checked:false,type:'text'},
		// 	{label:'Is',checked:false,type:'select',options:['Empty']},
		// 	{label:'Is not',checked:false,type:'select',options:['Empty']},
	    // ]},
		// {value:'state',label:'state',checked:false,addeFilter:[],
		// option:[
		// 	{label:'Contains',checked:false,type:'text'},
		// 	{label:'Does Not Contain',checked:false,type:'text'},
		// 	{label:'Starts with',checked:false,type:'text'},
		// 	{label:'End with',checked:false,type:'text'},
		// 	{label:'Is',checked:false,type:'select',options:['Empty']},
		// 	{label:'Is not',checked:false,type:'select',options:['Empty']},
	    // ]},
		// {value:'pincode',label:'Pincode',checked:false,addeFilter:[],
		// option:[
		// 	{label:'Contains',checked:false,type:'text'},
		// 	{label:'Does Not Contain',checked:false,type:'text'},
		// 	{label:'Starts with',checked:false,type:'text'},
		// 	{label:'End with',checked:false,type:'text'},
		// 	{label:'Is',checked:false,type:'select',options:['Empty']},
		// 	{label:'Is not',checked:false,type:'select',options:['Empty']},
	    // ]},
		// {value:'country',label:'country',checked:false,addeFilter:[],
		// option:[
		// 	{label:'Contains',checked:false,type:'text'},
		// 	{label:'Does Not Contain',checked:false,type:'text'},
		// 	{label:'Starts with',checked:false,type:'text'},
		// 	{label:'End with',checked:false,type:'text'},
		// 	{label:'Is',checked:false,type:'select',options:['Empty']},
		// 	{label:'Is not',checked:false,type:'select',options:['Empty']},
	    // ]},
		{value:'OptInStatus',label:'OptInStatus',checked:false,addeFilter:[],
		option:[
		{label:'Is',checked:false,type:'select',options:['Active Subscribers','Inactive Subscribers','Active Contacts','Inactive Contacts']},
		{label:'Is not',checked:false,type:'select',options:['Active Subscribers','Inactive Subscribers','Active Contacts','Inactive Contacts']}
	    ]},		
		{value:'isBlocked',label:'Blocked',checked:false,addeFilter:[],
		option:[
			{label:'Is',checked:false,type:'select',options:['true','false']},
			{label:'Is not',checked:false,type:'select',options:['true','false']}
	    ]},
		{value:'created_at',label:'Created At',checked:false,addeFilter:[],
		option:[
		{label:'Is',checked:false,type:'datetime'},
		{label:'Is not',checked:false,type:'datetime'},
		{label:'Between',checked:false,type:'d_datetime'},
		{label:'After',checked:false,type:'date'},
		{label:'Before',checked:false,type:'date'}
	    ]},
		
	];
	
	selectedcontactFilterBy:any='';
	modalRef: any;
	selectedId: any;
	ShowContactOwner!: boolean;
	vartip: any;
	prefixInfo!: boolean;
	Marketing!: boolean;
	Utility!: boolean;
	Authentication!: boolean;
	campagininfo!: boolean;
	showErrorMessage: boolean = false;
	isCampaignTiming: boolean = false;
	workingData:any =[];
	csvText:string ='';
	isLoading!:boolean;
	customFieldData:[] = [];
	tag:[] =[];
	 
constructor(config: NgbModalConfig, private modalService: NgbModal,private datepipe: DatePipe,
	private apiService: TeamboxService,public settingsService:SettingsService,private _settingsService:SettingsService,
	private fb: FormBuilder,private router: Router,private el: ElementRef) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
		this.newCampaignDetail= this.prepareCampaingForm();

		  

	}

	@HostListener('document:scroll', ['$event'])
	onDocumentScroll(event: Event): void {
	  const sidePanel = document.getElementById('sidePanel');
	  const target = event.target as HTMLElement;
  
	  // Check if the scroll event originated from the side panel
	  if (!target.contains(sidePanel)) {
		event.preventDefault(); // Prevent default scrolling behavior
	  }
	}

	prepareCampaingForm(){
		return this.fb.group({
			title: new FormControl('', Validators.required),
			channel_id: new FormControl('1', Validators.required),
			channel_label: new FormControl('Select Channel', Validators.required),
			start_datetime: new FormControl('', Validators.required),
			end_datetime: new FormControl('', Validators.required),
			category_id: new FormControl('', Validators.required),
			category_label: new FormControl('', Validators.required),
			status: new FormControl('', Validators.required),
			contact_list_id: new FormControl('', Validators.required),
			contact_list_label: new FormControl('', Validators.required),
			message_template_id: new FormControl('', Validators.required),
			message_template_label: new FormControl('', Validators.required),
		});
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

	ngOnInit() {
		this.isLoading = true;
		this.getCampaignTimingList();
		switch(this.loginAs) {
			case 1:
				this.loginAs='Admin'
				break;
			case 2:
				this.loginAs='Manager'
				break;
			case 3:
				this.loginAs='Agent'
				break;
			case 4:
				this.loginAs='Helper'
				break;
			default:
				this.loginAs='Agent'
		}
		this.profilePicture = (JSON.parse(sessionStorage.getItem('loginDetails')!)).profile_img;
		this.routerGuard()
		this.getAllCampaigns()
		this.getContactList('')
		this.getAttributeList()
		//this.getAdditiionalAttributes();
		this.processData();
		this.getCustomFieldsData();
		this.getTagData()
		
	}

	
    getCustomFieldsData() {
		this._settingsService.getNewCustomField(this.SPID).subscribe(response => {
		  this.customFieldData = response.getfields;
		  console.log(this.customFieldData);  
		  const defaultFieldNames:any = ["Name", "Phone_number", "emailId", "ContactOwner", "OptInStatus","tag"];
		  if(this.customFieldData){
			 const filteredFields:any = this.customFieldData?.filter(
				(field:any) => !defaultFieldNames.includes(field.ActuallName) && field.status ==1 );
				console.log(filteredFields);  
		filteredFields.forEach((item:any)=>{
			let options:any;
			switch(item?.type){
				case 'Date':{
					 options =[
						{label:'Is',checked:false,type:'datetime'},
						{label:'Is not',checked:false,type:'datetime'},
						{label:'Between',checked:false,type:'d_datetime'},
						{label:'After',checked:false,type:'date'},
						{label:'Before',checked:false,type:'date'}
						];
				}
				case 'Switch':{
					options =[
						{label:'Is',checked:false,type:'select',options:['Yes','No']},
						{label:'Is not',checked:false,type:'select',options:['Yes','No']}
					];
				}
				case 'text':{
					 options =[
						{label:'Contains',checked:false,type:'text'},
						{label:'Does Not Contain',checked:false,type:'text'},
						{label:'Starts with',checked:false,type:'text'},
						{label:'End with',checked:false,type:'text'},
						{label:'Is',checked:false,type:'select',options:['Empty']},
						{label:'Is not',checked:false,type:'select',options:['Empty']},
						]
				}
				case 'Number':{
					options =[
					   {label:'Contains',checked:false,type:'text'},
					   {label:'Does Not Contain',checked:false,type:'text'},
					   {label:'Starts with',checked:false,type:'text'},
					   {label:'End with',checked:false,type:'text'},
					   {label:'Is',checked:false,type:'select',options:['Empty']},
					   {label:'Is not',checked:false,type:'select',options:['Empty']},
					   ]
			   }
				case 'Select':{
					let selectOptions = JSON.parse(item?.dataTypeValues);
					options =[
						{label:'Is',checked:false,type:'select_opt',options:selectOptions},
						{label:'Is not',checked:false,type:'select_opt',options:selectOptions}
					];
				}
				case 'Multi Select':{
					let selectOptions = JSON.parse(item?.dataTypeValues);
					options =[
						{label:'Is',checked:false,type:'select_opt',options:selectOptions},
						{label:'Is not',checked:false,type:'select_opt',options:selectOptions}
					];
				}
			}			
			this.contactFilterBy.push({value:item?.ActuallName,label:item?.displayName,checked:false,addeFilter:[],option:options});
			console.log(this.contactFilterBy);
		  })
		}
		})
	  }

	  getTagData() {
		this._settingsService.getTagData(this.SPID).subscribe(result => {
		  if (result) {
			  let tagListData = result.taglist;
			  this.tag = tagListData.map((tag:any,index:number) => ({
				  id: tag.ID, 
				  optionName: tag.TagName
			  }));
			  let idx = this.contactFilterBy.findIndex((item:any)=> item.value =='tag');
			  if(idx !=-1){
				this.contactFilterBy[idx].option.forEach((item:any)=>{
					item.options= this.tag;
				})
			  }
			}
			});
	}
	getAdditiionalAttributes(){
		this.apiService.getAdditiionalAttributes(this.SPID).subscribe(allAttributes =>{
			var allAttributesList:any=allAttributes
			let attributes:any=[]
			allAttributesList.map((attribute:any)=>{
				attributes.push('{{'+attribute.attribute_name+'}}')
			})
			this.attributesoption=attributes;
			this.attributesoptionFilters=attributes;
		})
	}

	getAttributeList() {
		this.apiService.getAttributeList(this.SPID)
		.subscribe((response:any) =>{
		 if(response){
			 let attributeListData = response?.result;
			 this.attributesoption = attributeListData.map((attrList:any) => attrList.displayName);
			 console.log(this.attributesoption);
		 }
	   })
	}

	SearchCampaign(event:any){
		if(event.target.value.length>2){
		this.searchKey =event.target.value
		}else{
			this.searchKey='';
		}
		this.applyFilterOnCampaign()
	}
    updateFilter(event:any,filter:any){
		
		if(event.target.checked){
			filter['checked']=true
		}else{
			filter['checked']=true
				
		}
		
	
		
	}
	updateFilterDates(event:any){
		console.log(event.target.name+'::'+event.target.value)
		this.datesFilter[event.target.name]=event.target.value
		console.log(this.datesFilter)
	}

	applyFilterOnCampaign(){
		if(this.modalReference){
			this.modalReference.close();
		}
		let channelIn=[]
		let statusIn=[]
		let categoryIn=[]
		for(var i=0;i<this.campaignStatusOption.length;i++){
			if(this.campaignStatusOption[i]['checked']){
				statusIn.push(this.campaignStatusOption[i]['value'])
			}
		}
		for(var i=0;i<this.categoriesOption.length;i++){
			if(this.categoriesOption[i]['checked']){
				categoryIn.push(this.categoriesOption[i]['value'])
			}
		}
		for(var i=0;i<this.channelOption.length;i++){
			if(this.channelOption[i]['checked']){
				channelIn.push(this.channelOption[i]['value'])
			}
		}

		let BodyData={
			SPID:this.SPID,
			start_date: this.datesFilter.start_date?this.datesFilter.start_date:'',
			end_date: this.datesFilter.end_date?this.datesFilter.end_date:'',
			channelIn:channelIn,
			categoryIn:categoryIn,
			statusIn:statusIn,
			key:this.searchKey
		}

		console.log(BodyData)
		this.apiService.getFilteredCampaign(BodyData).subscribe(allCampaign =>{
			var allCampaignList:any=allCampaign
			this.mapCampaignData(allCampaignList)
		})
	}

	toggleCampaign(campaign:any){
		this.selectedCampaign=[]
		this.showCampaignDetail =!this.showCampaignDetail 
		if(this.showCampaignDetail && campaign.Id){
		  this.getCampaignDetail(campaign.Id)
		}
	}

    async getCampaignDetail(CampaignID:any){
        await this.apiService.getCampaignDetail(CampaignID).subscribe(campaign =>{
			console.log(campaign)
			let campaigns:any=campaign
				let item = campaigns[0]
				if(item.status==0){
					item['status_label'] ='draft'
				}else
				if(item.status==1){
					item['status_label'] ='scheduled'
				}else
				if(item.status==2){
					item['status_label'] ='running'
				}else
				if(item.status==3){
					item['status_label'] ='completed'
				}
				else{
					item['status_label'] ='draft'
				}
				item['start_datetime_formated']=this.formateDate(item.start_datetime)
				item['created_datetime_formated']=this.formattedDate(item.created_at)

				if(item.channel_id==1){
					item['channel_label'] ='WhatsApp Official'
				}else{
					item['channel_label'] ='WhatsApp Web'
				}


				if(item.category_id==1){
					item['category_label'] ='Marketing'
				}else
				if(item.category_id==2){
					item['category_label'] ='Utility'
				}else
				if(item.category_id==3){
					item['category_label'] ='Authentication'
				}else{
					item['category_label'] =item.category
				}

				
				if(item.segments_contacts){
				item['AllContactsLength'] =item.segments_contacts?JSON.parse(item.segments_contacts).length:JSON.parse(item.csv_contacts).length
				item['AudienceType']='Segment Audience'
			    }else if(item.csv_contacts){
					item['AllContactsLength'] =item.csv_contacts?JSON.parse(item.csv_contacts).length:0
					item['AudienceType']='CSV Imported'
					
				}else{
					item['AudienceType']=''
					item['AllContactsLength'] =0	
				}
				item.report_sent = item.report_sent + item.report_delivered + item.report_seen + item.report_replied;
				item.report_delivered = item.report_delivered + item.report_seen + item.report_replied;
				item.report_seen = item.report_seen + item.report_replied;
				item['allVariables']=item.message_variables?JSON.parse(item.message_variables):[]
				item['reportSentLength'] =item.report_sent?JSON.parse(item.report_sent).length:0
				item['reportFailedLength'] =item.report_failed?JSON.parse(item.report_failed).length:0
				item['reportDeliveredLength'] =item.report_delivered?JSON.parse(item.report_delivered).length:0
				item['reportSeenLength'] =item.report_seen?JSON.parse(item.report_seen).length:0
				item['reportRepliedLength'] =item.report_replied?JSON.parse(item.report_replied).length:0
				console.log(item)
                this.statusUpdate(CampaignID, item.status_label);
				this.selectedCampaign = item
				console.log("item**")
				if(item.status>1){
					this.getCampaignMessages(item.Id)
				}
			
		})


	}
	statusUpdate(id:number,status:string){
		const campaign = this.allCampaign.find((x: any) => x.Id === id);
		if (campaign) {
			campaign.status_label = status;
		} else {
			console.error(`Campaign with id ${id} not found.`);
		}
		
	}
	async getCampaignMessages(CampaignId:any){
		await this.apiService.getCampaignMessages(CampaignId).subscribe((responseData:any )=>{
			let allMessage:any= responseData
			let Sent:any=0
			let Failed:any=0
			let Delivered:any=0
			let Seen:any=0
			let Replied:any=0
			// allMessage.map((item:any)=>{
			// 	if(item.status==0){
			// 		Failed=Failed+1
			// 	}
			// 	if(item.status==1){
			// 		Sent=Sent+1
			// 	}
			// 	if(item.status==2){
			// 		Delivered=Delivered+1
			// 	}
			// 	if(item.status==3){
			// 		Seen=Seen+1
			// 	}
			// 	if(item.status==4){
			// 		Replied=Replied+1
			// 	}
				
			// })
			responseData?.report.forEach((item:any)=>{
				if(item.status==0){
					Failed=item?.status_count;
				}
				if(item.status==1){
					Sent=item?.status_count;
				}
				if(item.status==2){
					Delivered=item?.status_count;
				}
				if(item.status==3){
					Seen=item?.status_count;
				}
				if(item.status==4){
					Replied=item?.status_count;
				}
			})
			this.selectedCampaign['Replied'] =Replied;
			this.selectedCampaign['Seen'] =Seen;
			this.selectedCampaign['Delivered'] =Delivered;
			this.selectedCampaign['Sent'] =Sent;
			this.selectedCampaign['Failed'] =Failed;
			console.log(this.selectedCampaign)
		})

	}
	deleteCampaignConfirmed(){
		this.closeAllModal()
		let CampaignID = this.selectedCampaign.Id
		this.apiService.deleteCampaignDetail(CampaignID).subscribe(campaignDelete =>{
			this.getAllCampaigns()
			this.selectedCampaign=[]
			this.showCampaignDetail=false
		})
	}
    async mapCampaignData(allCampaignList:any){
		console.log(allCampaignList);

		try {
			allCampaignList.forEach((item:any) => {
				
				if(item.status==0){
					item['status_label'] ='draft'
				}else
				if(item.status==1){
					item['status_label'] ='scheduled'
				}else
				if(item.status==2){
					item['status_label'] ='running'
				}else
				if(item.status==3){
					item['status_label'] ='completed'
				}else{
					item['status_label'] ='draft'
				}
				item['start_datetime_formated']=this.formateDate(item.start_datetime)
				item['created_datetime_formated']=this.formateDate(item.created_at)

				if(item.channel_id==1){
					item['channel_label'] ='WhatsApp Official'
				}else{
					item['channel_label'] ='WhatsApp Web'
				}


				if(item.category_id==1){
					item['category_label'] ='Marketing'
				}else
				if(item.category_id==2){
					item['category_label'] ='Utility'
				}else
				if(item.category_id==3){
					item['category_label'] ='Authentication'
				}else{
					item['category_label'] =item.Category
				}
				if(item.segments_contacts){
					item['AllContactsLength'] = item.segments_contacts ? (() => {
						try {
							return JSON.parse(item.segments_contacts).length;
						} catch (error) {
							console.error(error);
							return 0;
						}
					})() : 0;
					
				}else if(item.csv_contacts){
					item['AllContactsLength'] = item.csv_contacts ? (() => {
						try {
							return JSON.parse(item.csv_contacts).length;
						} catch (error) {
							console.error(error);
							return 0;
						}
					})() : 0;
					
				}else{
					item['AllContactsLength'] =0	
				
				}
			});

			this.allCampaignMain = allCampaignList
			this.allCampaign = allCampaignList
		}
		 catch(error:any){
		 	console.log(error)
		}
	}
	
	
	async getAllCampaigns(){
		var bodyData={
			SPID:this.SPID,
			key:this.searchKey
		}
		console.log(bodyData)
		this.apiService.getCampaign(bodyData).subscribe(allCampaign =>{
			var allCampaignList:any=allCampaign
			console.log(allCampaignList)
			if(allCampaignList){
			this.mapCampaignData(allCampaignList)
			}
			this.isLoading = false;
		})
		
	}

formateDate(dateTime:string){
	let date = dateTime.split('Z').join('').trim();
	if(new Date(date) && new Date(date).toString() != 'Invalid Date'){
	return this.datepipe.transform(new Date(date), 'dd MMMM YY, hh:mm a') ;
	}else{
		return 'N/A';
	}
}

	formattedDate(dateTime:any){
		var date = dateTime
		var messCreated:any = new Date(date)
		
		const monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	  ];
		var hours = messCreated.getHours() > 12 ? messCreated.getHours() - 12 : messCreated.getHours();
		var am_pm = messCreated.getHours() >= 12 ? "PM" : "AM";
		var hoursBH = hours < 10 ? "0" + hours : hours;
		var minutes = messCreated.getMinutes() < 10 ? "0" + messCreated.getMinutes() : messCreated.getMinutes();
		var time = messCreated.getDate()+' '+monthNames[messCreated.getMonth()]+' '+messCreated.getFullYear().toString().substr(-2)+', '+hoursBH + ":" + minutes  + " " + am_pm;
		return time
	}


	  toggleContactFilter(){
		this.showContactFilter=!this.showContactFilter
	  }
	  selectContactFilter(index:any,filter:any){
		// this.ContactListNewFilters=[]
		// let addeFilter = filter.addeFilter
		this.selectedcontactFilterBy = filter;
		this.showContactFilter=false;
		// if(addeFilter.length>0){
		// for(var i=0;i<addeFilter.length;i++){
		// 	this.ContactListNewFilters.push(addeFilter[i])
		// }
		// }
		this.ContactListNewFilters[index]['filterPrefix'] = filter.label;
		// let newFilter:any=[];
		this.ContactListNewFilters[index]['filterBy'] = filter['option']['0'].label
		this.ContactListNewFilters[index]['filterType'] = filter['option']['0'].type
		this.ContactListNewFilters[index]['selectedOptions'] = filter['option']['0'].options
		this.ContactListNewFilters[index]['filterPrefix'] = filter.label
		this.ContactListNewFilters[index]['filterValue']='';
		// if(addeFilter.length>0){
		// newFilter['filterOperator']='AND';
		// }
		// this.ContactListNewFilters.push(newFilter)
		console.log(this.ContactListNewFilters)


	  }

	addNewFilters(filter:any){
		console.log(filter);
		this.ContactListNewFilters=[];
		this.selectedcontactFilterBy = filter[0];
		filter.forEach((item:any)=>{
		let addeFilter = item.addeFilter;
		this.showContactFilter=false;
		if(addeFilter.length>0){
		for(var i=0;i<addeFilter.length;i++){
			this.selectedcontactFilterBy = item;
			this.ContactListNewFilters.push(addeFilter[i])
		}
		}
	})
		this.addNewFilter();
	}

	  toggleFilterByOption(){
		this.showFilterByOption=!this.showFilterByOption
	  }

	  toggleFilterTagOption(){
		this.showFilterTagOption=!this.showFilterTagOption
	  }
	  selectFilterBy(index:any,selectedcontactFilterBy:any,filter:any){
		this.showFilterByOption=false
		this.ContactListNewFilters[index]['filterBy'] = filter.label
		this.ContactListNewFilters[index]['filterType'] = filter.type
		this.ContactListNewFilters[index]['selectedOptions'] = filter.options
		this.ContactListNewFilters[index]['filterPrefix'] = selectedcontactFilterBy.label
		this.ContactListNewFilters[index]['filterValue']='';
		console.log(this.ContactListNewFilters)
		
	  }
	  selectFilterValue(index:any,event:any){
		this.ContactListNewFilters[index]['filterValue'] = event.target.value
	  }
	  selectFilterOption(index:any,value:any){
		this.ContactListNewFilters[index]['filterValue'] = value
		this.showFilterTagOption=false;
	  }

	  selectFilterDates(index:any,event:any){
		if(event.target.name =='start_date'){
			this.ContactListNewFilters[index]['filterValue'] =event.target.value
		}else{
			this.ContactListNewFilters[index]['filterValue'] =this.ContactListNewFilters[index]['filterValue']+' / '+event.target.value
		}
	  }

	  selectFilterOperator(index:any,Operator:any){
		this.ContactListNewFilters[index]['filterOperator'] = Operator
	  }
      addNewFilter(){
		let newFilter:any=[];
		newFilter['filterBy'] = this.selectedcontactFilterBy['option']['0'].label
		newFilter['filterType'] = this.selectedcontactFilterBy['option']['0'].type
		newFilter['selectedOptions'] = this.selectedcontactFilterBy['option']['0'].options
		newFilter['filterPrefix'] = this.selectedcontactFilterBy.label
		newFilter['filterValue']='';
		newFilter['filterOperator']='AND';
		this.ContactListNewFilters.push(newFilter)
		console.log(this.ContactListNewFilters)
	  }
	  removeFilter(itemIndex:any){
		this.ContactListNewFilters.splice(itemIndex, 1);
		this.ContactListNewFilters[0]['filterOperator']='';
		this.selectedcontactFilterBy['addeFilter']=this.ContactListNewFilters
	  }
	  addFilter(){
		this.selectedcontactFilterBy['addeFilter']=this.ContactListNewFilters
		//this.ContactListNewFilters=[]
		//console.log(this.selectedcontactFilterBy)
	  }
	  

	  createListFromFilters(applyList:any){
		this.getFilterOnEndCustomer()
		this.closeAllModal()
		this.modalReference = this.modalService.open(applyList,{size: 'xl', windowClass:'white-bg'});
     	
	}
	getContactFilterQuery(addeFilter:any){
		console.log('///////////getContactFilterQuery',addeFilter)
		const groups = addeFilter.reduce((groups:any, filter:any) => {
			
			if (!groups[filter.filterPrefix]) {
				groups[filter.filterPrefix] = [];
			}

			groups[filter.filterPrefix].push(filter);
			return groups;
		}, {});

		const groupArrays = Object.keys(groups).map((filterPrefix) => {
		return {
			filterPrefix,
			items: groups[filterPrefix]
		};
		});
		console.log('/////groupArrays/////')
		console.log(groupArrays)


		let contactFilter ='SELECT * FROM `EndCustomer` where SP_ID='+this.SPID;
		if(groupArrays.length>0){
			
			groupArrays.map((filters:any)=>{
				if(filters.items.length>0){
				filters.items[0]['filterOperator']=''	
				
				let colName = filters.filterPrefix
				if(colName =='Phone_number'){
					colName = "REGEXP_REPLACE(Phone_number, '[^0-9]', '')"
				}

				contactFilter += ' and (';
				filters.items.map((filter:any)=>{

				this.applylistFiltersWidth =parseInt(this.applylistFiltersWidth)+100	
				let filterOper = "='"+filter.filterValue+"'";
		        let QueryOperator ='';
				QueryOperator = filter.filterOperator?filter.filterOperator:''
				if(filter.filterBy=="End with"){
					filterOper = "LIKE '%"+filter.filterValue+"'";
				}
				if(filter.filterBy=="Starts with"){
					filterOper = "LIKE '"+filter.filterValue+"%'";
				}
				if(filter.filterBy=="Is"){
					filterOper = '=='+filter.filterValue;
					filterOper = "LIKE '%"+filter.filterValue+"%'";
				}
				if(filter.filterBy=="Is not"){
					filterOper = '!='+filter.filterValue;
					filterOper = "NOT LIKE '"+filter.filterValue+"'";
				}

				if(filter.filterBy=="Contains"){
					filterOper = "LIKE '%"+filter.filterValue+"%'";
				}
				if(filter.filterBy=="Does Not Contain"){
					filterOper = "NOT LIKE '"+filter.filterValue+"'";
				}
				if(filter.filterBy=="After" || filter.filterBy =="Greater than"){
					filterOper = "> '"+filter.filterValue+"'";
				}
				if(filter.filterBy=="Before" || filter.filterBy =="Less than"){
					filterOper = "< '"+filter.filterValue+"'";
				}
				
				if(filter.filterBy=="Between"){
					let valueArray = filter.filterValue.split('/')
					filterOper = "Between '"+valueArray[0]+"' AND '"+valueArray[1]+"'" 
				}

				if(filter.filterBy=="Includes domain"){
					filterOper = "LIKE '%"+filter.filterValue+"%'";
				}
				if(filter.filterBy=="Exclude domain"){
					filterOper = "NOT LIKE '%"+filter.filterValue+"%'";
					
				}

				if(filter.filterBy=="Includes extension"){
					filterOper = "LIKE '%."+filter.filterValue+"'";
				}
				if(filter.filterBy=="Exclude extension"){
					filterOper = "NOT LIKE '."+filter.filterValue+"'";
				}
				
				contactFilter += ' '+QueryOperator +' '+colName+' '+filterOper
			    })
				contactFilter += ' )';
				}
		    })
			
		  }
		  console.log(contactFilter)
		  return contactFilter;
	}



    getFilterOnEndCustomer(){
		this.applylistFiltersWidth=400;
		let addedNewFilters:any=[];
		this.contactFilterBy.map((item:any)=>{
			item.addeFilter.map((filter:any)=>{
				addedNewFilters.push({
					filterBy: filter.filterBy?filter.filterBy:'', 
					filterType: filter.filterType?filter.filterType:'', 
					filterOperator:filter.filterOperator?filter.filterOperator:'', 
					filterPrefix: filter.filterPrefix?filter.filterPrefix:'', 
					filterValue: filter.filterValue?filter.filterValue:''
					})
			})
		})
		let contactFilter = this.getContactFilterQuery(addedNewFilters)
		var bodyData={
			Query:contactFilter
		}
		console.log(bodyData)
		this.apiService.applyFilterOnEndCustomer(bodyData).subscribe(allCustomer =>{
			var allCustomerList:any=allCustomer
			if(allCustomerList){
			allCustomerList.forEach((item:any) => {
				item['tags'] = this.getTagsList(item.tag)

			})
		}
		    
			this.filteredEndCustomer = allCustomerList
			this.filteredEndCustomer['sortOrder']=false
			this.filteredEndCustomerOrigional =this.filteredEndCustomer
			this.totalpages = Math.ceil(this.filteredEndCustomer.length/this.pagesize);
			this.page =1;
			
	})

	}

	removeAllAddedFilter(){
		this.filteredEndCustomer=[]
		this.contactFilterBy.map((item:any)=>{
			item.addeFilter=[]
		})
		this.getFilterOnEndCustomer()
	}
	removeAddedFilter(mainIndex:any,filterIndex:any){
		this.contactFilterBy[mainIndex]['addeFilter'].splice(filterIndex, 1)
		if(this.contactFilterBy[mainIndex]['addeFilter'].length>0){
			this.contactFilterBy[mainIndex]['addeFilter'][0]['filterOperator']='';
		}
		this.getFilterOnEndCustomer()
	}
	PaginatePre(){
		this.page=this.page>1?this.page-1:1
	}
	PaginateTo(page:any){
		this.page=page
	}
	PaginateNext(){
		this.page=this.page < this.totalpages?this.page+1:this.totalpages
	}
	counterPre(cpage: number){
		let newArray =[];
		for(var i=cpage-1;i>0;i--){
			newArray.push(i)
		}
		newArray = newArray.slice(0, 3);
		newArray = newArray.reverse()
		return newArray;
    }
	counterNext(cpage: number) {
		let newArray =[];
		for(var i=cpage+1;i<=this.totalpages;i++){
			newArray.push(i)
		}
		newArray = newArray.slice(0, 3);
		return newArray;
		
	}
	resortTableData(key:any,string:any){
		console.log(key)
		let sortedArray=[];
		let desc:any =false
		
		if(this.filteredEndCustomer['sortOrder']){
			desc=false
		}else{
			desc=true
		}
			sortedArray = this.filteredEndCustomer.sort((a:any, b:any) => {
				
				if(string){
					a =  a[key]?a[key].toLowerCase():'None'
				    b =  b[key]?b[key].toLowerCase():'None'
					return desc ? b.localeCompare(a) : a.localeCompare(b);

				}else{
					a =  a[key]
				    b =  b[key]
					return desc ? b - a : a - b;
				}

			})
				
		
		this.filteredEndCustomer['sortOrder']= desc
        this.filteredEndCustomer = sortedArray

	}

	searchInTable(key:any){
		let searchData:any=[];
		if(key.target.value.length>2){
			let searchKey= key.target.value
			console.log(searchKey)
			this.filteredEndCustomer.map((item:any)=>{

				if(item.Name && (item.Name.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1)){
					searchData.push(item)
				}else if(item.phoneNumber && (item.phoneNumber.indexOf(searchKey)!== -1)){
					console.log('found phoneNumber '+item.customerId)
					searchData.push(item)
					
				}else if(item.customerId && (item.customerId.toString().indexOf(searchKey)!== -1)){
					console.log('found customerId '+item.customerId)
					searchData.push(item)
					
				}else if(item.emailId && (item.emailId.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1)){
					console.log('found emailId '+item.customerId)
					searchData.push(item)
					
				}else if(item.age && (item.age.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1)){
					console.log('found age '+item.customerId)
					searchData.push(item)
					
				}else if(item.sex && (item.sex.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1)){
					console.log('found sex '+item.customerId)
					searchData.push(item)
					
				}else if(item.tag && (item.tag.toLowerCase().indexOf(searchKey.toLowerCase()) !== -1)){
					console.log('found tag '+item.customerId)
					searchData.push(item)
				}else{
					console.log('found nothing ')
				}
			})
			console.log(searchData)
			this.filteredEndCustomer =searchData; 
		}else{
			this.filteredEndCustomer = this.filteredEndCustomerOrigional
		}
		
		//this.filteredEndCustomerOrigional
	}
	getTagsList(tags:any){
		if(tags){
			const tagsArray = tags.split(',');
			return tagsArray
		}else{
			return [];
		}
	}
	
	

	  selectScheduled(schedule:any){
		this.scheduled=schedule
	  }

	  toggleTimeZone(){
		this.showTimeZoneOption=!this.showTimeZoneOption
	  }

	  selectTimeZone(timeZone:any){
			this.selecteTimeZone =timeZone
			this.showTimeZoneOption=false
	  }

	  
	  selectScheduleDate(event: any) {
	// 	const selectedDate = new Date(event.target.value);
	// 	const currentDate = new Date();
	  
	// 	// if (selectedDate < currentDate) {
	// 	//   this.showErrorMessage = true;
	  
	// 	//   this.selecteScheduleDate = currentDate.toISOString().split('T')[0];
	// 	// } else {
	// 	//   this.showErrorMessage = false;
	  
		   this.selecteScheduleDate = event.target.value;
		   this.selScheduleDate = new Date(new Date(this.selecteScheduleDate).toDateString());
		   this.currDate = new Date(new Date().toDateString());
		   console.log(this.selecteScheduleDate)
		 }
	//   }
	  

	selectScheduleTime(event: any) {
		this.selecteScheduleTime= event;
		//this.selectedScheduleTime= new Date(event.target.valueAsDate).toLocaleTimeString()
		this.selectedScheduleTime = new Date(new Date(new Date().setHours(event.split(':')[0],event.split(':')[1])).setSeconds(0)).toLocaleTimeString();
		this.checkScheduleTiming(event);
	  }

	checkScheduleTiming(e:any){
		console.log(this.selectedScheduleTime);
		let hr =  new Date().getHours();
		let min =  new Date().getMinutes();
		if(Number(e.split(':')[0])<hr ||(Number(e.split(':')[0])==hr && Number(e.split(':')[1]) < min)){
			this.isTimingPast = true;
		}else{
			this.isTimingPast = false
		}
		console.log(this.selScheduleDate)
		console.log(this.currDate)
	}

    

	counter(i: number) {
		return new Array(i);
	}
	selectItem(itemId:any){
		this.slectedItem =this.slectedItem !=itemId?itemId:null
	}
	open(content:any) {
		this.modalService.open(content);
	}
	toggleChannelOption(){
		this.ShowChannelOption=!this.ShowChannelOption;
	}
	toggleshowAdvance(){
		this.showAdvance =!this.showAdvance;
    }
	selectChannel(channel:any){
		this.newCampaignDetail.get('channel_id').setValue(channel.value);
		this.newCampaignDetail.get('channel_label').setValue(channel.label);
		this.ShowChannelOption=false
		console.log(this.allTemplates)
		this.allTemplates = this.allTemplatesMain.filter((item:any) => item.Channel == channel.label);
		this.initallTemplates =JSON.parse(JSON.stringify(this.allTemplatesMain.filter((item:any) => item.Channel == channel.label)));
	}

	
	openImportContact(option:any,modalname:any,openImportContact:any){
		this.closeAllModal()
			this.openImportantContact(modalname)
			$("#dagdropmodal").modal('show');
	}

	openAudience(option:any,modalname:any,step2Option:any){
		this.closeAllModal()
			this.openSegmentAudience(modalname)
			$("#addsegmentaudience").modal('show');
	}
	
	removecontact(addNewCampaign: any) {
		this.mapCsvContact = false;
		this.checkboxChecked = false;
		$("#dagdropmodal").modal('hide');
		this.importedContacts = false;
		this.selecetdCSV = '';
		this.CsvContactCol = '';

	  }

	selectStep2Option(option:any,modalname:any,step2Option:any){
		this.step2Option = option;
		this.selectedcontactFilterBy['addeFilter'] = '';
		if(step2Option ==option && this.step2Option ==='ImportContacts'){
			this.closeAllModal()
			this.openImportantContact(modalname)
			
	
		}
		if(step2Option ==option && this.step2Option ==='AddSegmentAudience'){
			this.closeAllModal()
			this.openSegmentAudience(modalname)
		}
	}

	closeAllModal(){
		if(this.modalReference){
			this.modalReference.close();
	    }
	}

	resetSelectedContactList() {
		this.newCampaignDetail = this.prepareCampaingForm();
		if (this.allContactList.length !== 0) {
			this.allContactList.forEach((x: any) => {
				x.selected = false;
			});
		}
		
	}

	openAddNew(addNewCampaign:any){
		this.isEditCampaign = false;
		this.activeStep=1;
		//this.newCampaignDetail= this.prepareCampaingForm();
		this.step2Option='';
		this.selectedTemplate =[];
		this.segmentsContactList =[];
		this.newListName = false;
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}
	editCampaign(addNewCampaign:any,step:any){
		this.newCampaignDetail.Id = this.selectedCampaign.Id;
		this.isEditCampaign = true;
		console.log(this.selectedCampaign)
		this.activeStep=step
		this.newCampaignDetail.get('channel_id').setValue(this.selectedCampaign.channel_id);
		this.newCampaignDetail.get('channel_label').setValue(this.selectedCampaign.channel_label);
		this.newCampaignDetail.get('title').setValue(this.selectedCampaign.title);
		
		if(this.selectedCampaign.segments_contacts.length>0){
		this.segmentsContactList = 	JSON.parse(this.selectedCampaign.segments_contacts)
		this.step2Option='AddSegmentAudience'
		this.newListName=JSON.parse(this.selectedCampaign.segments_contacts).length+' unique contacts selected';
		}else if(this.selectedCampaign.csv_contacts.length>0){
			this.step2Option='ImportContacts'
			this.csvContactList = 	JSON.parse(this.selectedCampaign.csv_contacts)
			this.newListName=JSON.parse(this.selectedCampaign.csv_contacts).length+' unique contacts selected';
		}
		this.selectedTemplate = this.selectedCampaign
		this.selectedTemplate['Header']=this.selectedCampaign.message_heading
		this.selectedTemplate['BodyText']=this.selectedCampaign.message_content
		this.selectedTemplate['Links']=this.selectedCampaign.message_media

		this.selectedTemplate['allVariables'] =this.selectedCampaign.allVariables
		console.log(this.selectedTemplate)
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}
	TestCampaign(TestCampaignModal:any){
		let BodyData:any={
			Id:this.newCampaignDetail.Id?this.newCampaignDetail.Id:'',
			sp_id:this.SPID,
			optInStatus:this.optInStatus,
			title:this.newCampaignDetail.value.title,
			channel_id:this.newCampaignDetail.value.channel_id,
			message_heading:this.selectedTemplate.Header,
			message_content:this.selectedTemplate.BodyText,
			message_media:this.selectedTemplate.Links,
			message_variables:this.selectedTemplate.allVariables.length>0?JSON.stringify(this.selectedTemplate.allVariables):[],
			button_yes:this.selectedTemplate.button_yes,
			button_no:this.selectedTemplate.button_no,
			button_exp:this.selectedTemplate.button_exp,
			category:this.selectedTemplate.Category,
			category_id:this.selectedTemplate.category_id,
			time_zone:this.selecteTimeZone,
			end_datetime:'',
			csv_contacts:this.csvContactList.length>0?JSON.stringify(this.csvContactList):[],
			segments_contacts:this.segmentsContactList.length>0?JSON.stringify(this.segmentsContactList):[]
		}
		this.apiService.testCampaign(BodyData).subscribe(responseData =>{
			console.log(responseData);
			//this.closeAllModal()
			this.testNumbers=[];
			this.showToaster('Test campaign Sent','success')
			//this.modalReference = this.modalService.open(TestCampaignModal,{size: 'sm', windowClass:'pink-bg-sm'});
		})
	
	}

	ConfirmTest(addNewCampaign:any){
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}
	ConfirmClose(addNewCampaign:any){
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}
	ConfirmCampaignSchedule(ConfirmCampaign:any){
		if(this.scheduled ==1 && this.selecteScheduleDate==''){
			this.showToaster('Please select schedule date...','error')
		}else{
		this.lowBalance=false;
		//this.closeAllModal()		
		this.checkCampignTiming();
			this.modalReference2 = this.modalService.open(ConfirmCampaign, { size: 'sm', windowClass: 'pink-bg-sm background-blur' });
		}
	}

	resetFormState() {
		this.resetSchedule();
		this.resetSelectedContactList();
	}
	resetSchedule() {
		this.scheduled = 0;
		this.selecteScheduleTime = '';
		this.selectedScheduleTime = '';
		this.selecteScheduleDate = '';
		this.selScheduleDate = new Date();
	}
	closeConfirmModal(){
		this.modalReference2.close();
	}
	async ConfirmScheduleClose (action:any){	
		this.closeAllModal();
		this.modalReference2.close();
		//this.modalReference.close('addNewCampaign');
		let sratdatetime:any='';
		if(this.scheduled==1){
		let start_datetime =this.selecteScheduleDate+' '+this.selecteScheduleTime;
		 sratdatetime = (new Date ((new Date((new Date(new Date(start_datetime))).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
		}else{
			sratdatetime = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
		}		
		let daysList=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		let day =  daysList[new Date(sratdatetime).getDay()];
		console.log(this.selectedTemplate.allVariables)
		console.log(this.csvContactList)
		let start_Time = '';
		let end_Time = '';
			this.workingData.forEach((item:any)=>{
				if(item.day.includes(day)){
					start_Time = item.start_time;
					end_Time = item.end_time;
				}
			});
		let BodyData:any={
			Id:this.newCampaignDetail.Id?this.newCampaignDetail.Id:'',
			SP_ID:this.SPID,
			optInStatus:this.optInStatus,
			title:this.newCampaignDetail.value.title,
			channel_id:this.newCampaignDetail.value.channel_id,
			message_heading:this.selectedTemplate.Header,
			message_content:this.selectedTemplate.BodyText,
			message_footer: this.selectedTemplate.FooterText,
			message_media:this.selectedTemplate.Links,
			media_type:this.selectedTemplate.media_type,
			message_variables:this.selectedTemplate.allVariables.length>0?JSON.stringify(this.selectedTemplate.allVariables):[],
			button_yes:this.selectedTemplate.button_yes,
			button_no:this.selectedTemplate.button_no,
			button_exp:this.selectedTemplate.button_exp,
			category:this.selectedTemplate.Category,
			category_id:this.selectedTemplate.category_id,
			time_zone:this.selecteTimeZone,
			start_datetime:sratdatetime,
			end_datetime:'',
			start_time: start_Time,
			end_time: end_Time,
			day: day,
			csv_contacts:this.csvContactList.length>0?JSON.stringify(this.csvContactList):[],
			segments_contacts:this.segmentsContactList.length>0?JSON.stringify(this.segmentsContactList):[]
		}
		if(action=='save'){
			BodyData['status']=0
			this.getAllCampaigns()
		}
		else if(action=='updateWallet'){

		}else{
			if(this.scheduled ==1){
				BodyData['status']=1;
			}else{
				BodyData['status']=-1;
			}
			this.getAllCampaigns()
		}
		let CampaignId:any=this.newCampaignDetail.Id?this.newCampaignDetail.Id:'';
		await this.apiService.addCampaign(BodyData).subscribe((responseData:any) =>{
			let newCampaign:any = responseData?.addcampaign;
			console.log(newCampaign)
			if(newCampaign.insertId > 0){
				CampaignId= newCampaign.insertId;
			}
			if(this.scheduled !=1){
				this.runCampaign(CampaignId,BodyData)
			}
			
		})
		this.resetFormState();
		this.getAllCampaigns()
	}
	
	async runCampaign(CampaignId:any,BodyData:any){

		if(this.csvContactList.length>0){
			let ix =0;
			console.log(this.csvContactList,'---csvContactList');
			//await this.csvContactList.map(async (item:any)=>{
				for (const item of this.csvContactList) {
				if(item.Contacts_Column && item.Contacts_Column.length > 9){
				console.log(item)
				ix = ix+1;
				let MessageBodyData:any={
					SP_ID:this.SPID,
					optInStatus:this.optInStatus,
					customerId:this.AgentId,
					//contactId
					//phone Number
					phone_number:item.Contacts_Column,
					button_yes:this.selectedTemplate.button_yes,
					button_no:this.selectedTemplate.button_no,
					button_exp:this.selectedTemplate.button_exp,
					message_media:this.selectedTemplate.Links,
					media_type:this.selectedTemplate.media_type,
					message_content:this.selectedTemplate.BodyText,
					message_variables:this.selectedTemplate.allVariables.length>0?JSON.stringify(this.selectedTemplate.allVariables):[],
					CampaignId:CampaignId,
					isFinished:ix == this.csvContactList.length ? true :false,
					category_id:this.selectedTemplate.category_id,
					channel_id:this.newCampaignDetail.value.channel_id,
					channel_label:this.newCampaignDetail.value.channel_label,
					category:this.selectedTemplate.Category,
					title:this.newCampaignDetail.value.title,
					schedule_datetime:BodyData.start_datetime,
					status:ix == this.csvContactList.length ? 3 :this.scheduled,
					csv_contacts:this.csvContactList.length>0?JSON.stringify(this.csvContactList):[],
					segments_contacts:this.segmentsContactList.length>0?JSON.stringify(this.segmentsContactList):[]
					}
				let allVariables:any = this.selectedTemplate.allVariables
				console.log(allVariables)
				let message_heading =this.selectedTemplate.Header
				let message_content= this.selectedTemplate.BodyText
				await allVariables.map(async (variable:any)=>{
					let varValue = variable.value
					varValue = item[varValue]?item[varValue]:varValue;
					message_heading = message_heading.replaceAll(variable.label,varValue)
					message_content = message_content.replaceAll(variable.label,varValue)
					MessageBodyData['message_heading']=message_heading;
					MessageBodyData['message_content']=message_content;					
				})
				await this.apiService.sendCampinMessage(MessageBodyData).subscribe(async(responseData) =>{
					let messageStatus:any = responseData;
					console.log(responseData);
					if(messageStatus?.status == 401 || messageStatus?.error){
						MessageBodyData['status_message']=messageStatus?.error ? messageStatus?.error?.error_data.details: '';
					MessageBodyData['status']=0;
					}else{
					MessageBodyData['status_message']='Message Sent';
					MessageBodyData['status']=1;
					}

					await this.apiService.saveCampaignMessages(MessageBodyData).subscribe(responseData =>{
						this.closeAllModal()
						this.getAllCampaigns()
					})
					
				})
				
				await this.delay(2000);
			}

			//})
		}

		}
		if(this.segmentsContactList.length>0){
			
			let idx =0;
			for (const customerId of this.segmentsContactList) {
			//await this.segmentsContactList.map(async (customerId:any)=>{
				let SIPattribute:any=[]
				await this.apiService.getContactAttributesByCustomer(customerId).subscribe(response =>{
					let attributes:any = response;
					SIPattribute=attributes[0];
				})
				idx = idx+1;
				await this.apiService.getEndCustomerDetail(customerId).subscribe(async (customerResponse) =>{
					let customerResponseList:any=customerResponse
					let customerDetail = customerResponseList[0]
					if(customerDetail && customerDetail.Phone_number){
						let MessageBodyData:any={
							SP_ID:this.SPID,
							optInStatus:this.optInStatus,
							customerId:customerDetail.customerId,
							phone_number:customerDetail.Phone_number,
							button_yes:this.selectedTemplate.button_yes,
							button_no:this.selectedTemplate.button_no,
							button_exp:this.selectedTemplate.button_exp,
							message_media:this.selectedTemplate.Links,
							message_content:this.selectedTemplate.BodyText,
							message_variables:this.selectedTemplate.allVariables.length>0?JSON.stringify(this.selectedTemplate.allVariables):[],
							category_id:this.selectedTemplate.category_id,
							media_type:this.selectedTemplate.media_type,
							CampaignId:CampaignId,
							isFinished:idx == this.segmentsContactList.length ? true :false,
							channel_id:this.newCampaignDetail.value.channel_id,
							channel_label:this.newCampaignDetail.value.channel_label,
							category:this.selectedTemplate.Category,
							title:this.newCampaignDetail.value.title,
							schedule_datetime:BodyData.start_datetime,
							status:idx == this.segmentsContactList.length ? 3 :this.scheduled,
							csv_contacts:this.csvContactList.length>0?JSON.stringify(this.csvContactList):[],
							segments_contacts:this.segmentsContactList.length>0?JSON.stringify(this.segmentsContactList):[]
						}
						

						let allVariables:any = this.selectedTemplate.allVariables
						let message_heading =this.selectedTemplate.Header
						let message_content= this.selectedTemplate.BodyText

						await allVariables.map(async (item:any)=>{
							let varValue = item.value
							// if(varValue.indexOf('{{') !== -1){
							// 	let attributeName = varValue.replaceAll('{{','')
							// 	attributeName = attributeName.replaceAll('}}','')
							// 	varValue = SIPattribute && SIPattribute[attributeName]?SIPattribute[attributeName]:'NULL';
							// }
							message_heading = message_heading.replaceAll(item.label,varValue)
							message_content = message_content.replaceAll(item.label,varValue)
							MessageBodyData['message_heading']=message_heading
							MessageBodyData['message_content']=message_content
							
						})
						await this.apiService.sendCampinMessage(MessageBodyData).subscribe(async(responseData) =>{
							let messageStatus:any = responseData
							console.log(responseData);
							if(messageStatus?.status == 401  || messageStatus?.error){
							MessageBodyData['status_message']=messageStatus?.error ? messageStatus?.error?.error_data.details: '';
							MessageBodyData['status']=0
							}else{
							MessageBodyData['status_message']='Message Sent';
							MessageBodyData['status']=1
							}

							await this.apiService.saveCampaignMessages(MessageBodyData).subscribe(responseData =>{
								this.closeAllModal()
								this.getAllCampaigns();
							})
							
						})

					}
					
				})
				await this.delay(2000);
				console.log('100000');
			//})
			}
		}
	}

	async  processData() {
		const data = [1, 2, 3, 4, 5]; // Example data array
	
		for (const item of data) {
			console.log(item); // Process each item
	
			await this.delay(10000); // 1 second delay
		}
	}

	delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	openSegmentAudience(importantContact:any){
		this.closeAllModal()
		this.modalReference = this.modalService.open(importantContact,{size: 'xl', windowClass:'white-bg addsegmentaudience-modal'});
		this.step2Option=true;
	}
	openAddNewItem(addNewItem:any){
		this.closeAllModal();
		console.log(this.contactFilterBy)
		this.addNewFilters(this.contactFilterBy);
		this.modalReference = this.modalService.open(addNewItem,{size: 'xl', windowClass:'white-bg'});
	}
	openImportantContact(mpcampaign:any){
		this.closeAllModal()
		this.importantContact=true;
	}
	selectAttribute(attribute: any, addNewCampaign: any) {
		this.closeAllModal()
		this.activeStep=3.2
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	    
	}

	onCheckboxChange(event: any,mpcampaign:any) {
		if (event.target.checked) {
			if(!this.selecetdCSV) {
				this.showToaster('Please Scheck the box..', 'error');
				return;
			}
			this.closeAllModal()
				this.importantContact=false;
				this.modalReference = this.modalService.open(mpcampaign,{size: 'ml', windowClass:'pink-bg'});
	
		}
	  }

	closeMediaAttribute(status:any,addNewCampaign:any){
		this.closeAllModal()
		this.activeStep=3.2
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	    
	}
	
	saveList(saveListModal:any){
		this.closeAllModal()
		this.modalReference = this.modalService.open(saveListModal,{size: 'sm', windowClass:'white-bg'});
	}
	
	toggleMapCsvContact(){
		this.mapCsvContact= !this.mapCsvContact
	}
	async selectCsvContactCol(item:any){
		if(this.validateCsv(item)){
		this.csvContactList.forEach((obj:any) => {
				obj.Contacts_Column = obj[item];
				//delete obj[item];
		});

	   this.CsvContactCol = item  
	   this.mapCsvContact= false
	}else{
		this.showToaster('Column should only have numeric values','error');
	}
			
	}
	validateCsv(e:string): boolean {
		// Split the text into lines
		const lines = this.csvText.split('\n');
		console.log(lines);
		console.log(this.csvText);
		let val = lines[0].split(',');
		let columnIndex = val.findIndex((id)=>id == e);
		let i =0;
		for (const line of lines) {
		  if(i!=0){
		  const columns = line.split(',');
		  if(columns[columnIndex]){
		  if (isNaN(Number(columns[columnIndex]))) {
			return false; // Non-numeric value found
		  }
		}
		}
		i++;
		}
		return true; // All values in Column A are numbers
	  }

	ImportMapping(addNewCampaign:any){
		this.selecetdCSV =''
		if(this.CSVDuplicate =='yes'){
			this.csvContactList=this.csvContactList.filter((value:any, index:any, self:any) =>
				index === self.findIndex((t:any) => (
					t['Contacts_Column'] === value['Contacts_Column']
				))
			)
		}
		if(this.CSVPrefix['label'] && this.CSVPrefix['value']!=''){
			this.csvContactList.map((item:any)=>{
				let prefix = this.CSVPrefix['value']
				if(this.CSVPrefix['label']=='prefix_add'){

					let str = item['Contacts_Column']
					if (str.startsWith(prefix)) {
						str= str.slice(prefix.length)
					} 
					item['Contacts_Column'] =str;
					item['Contacts_Column'] = prefix+item['Contacts_Column']
				}
				if(this.CSVPrefix['label']=='prefix_remove'){
					let str = item['Contacts_Column']
					
					if (str.startsWith(prefix)) {
						str= str.slice(prefix.length)
					} 
					item['Contacts_Column'] =str;
				}
			})
		
	   }
		this.newListName=false;
		this.importedContacts=this.csvContactList.length+' unique contacts selected';
		this.closeAllModal()
		this.activeStep=2
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	    
	}
	closeImportantContact(addNewCampaign:any){
		$("#dagdropmodal").modal('hide');
		this.closeAllModal();
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
		
	}
	editTemplateMedia(){
		this.showEditTemplateMedia=!this.showEditTemplateMedia;
		$("#attachmentbox").modal('show');
	}
	selectMediaSource(source:any){
		this.TemplateMediaSource =source
	}
	updateMediaSource(event:any){
			this.selectedTemplate['tempimageurl'] =event.target.value
	}

	closeTemplateMedia(action:any){
		
		console.log(action +'::'+this.TemplateMediaSource)
		console.log(this.selectedTemplate)
		
		if(action=='done'){
			
			if(this.TemplateMediaSource==0){
				if(this.selectedTemplate.tempimage && this.selectedTemplate.tempimage !=''){
					this.selectedTemplate.image =this.selectedTemplate.tempimage
					this.selectedTemplate['tempimage']='';
					this.showEditTemplateMedia=false
				}else{
					this.showToaster('Please Uplaod Image file...','error')
				}
			}else if(this.TemplateMediaSource==1){
				if(this.selectedTemplate.tempimageurl && this.selectedTemplate.tempimageurl !=''){
					this.selectedTemplate.image =this.selectedTemplate.tempimageurl
					this.selectedTemplate['tempimageurl']='';
					this.showEditTemplateMedia=false
				}else{
					this.showToaster('Please Uplaod Image file...','error')
				}
			}else if(this.TemplateMediaSource==2){
				if(this.selectedTemplate.tempimageurl && this.selectedTemplate.tempimageurl !=''){
					this.selectedTemplate.image =this.selectedTemplate.tempimageurl
					this.selectedTemplate['tempimageurl']='';
					this.showEditTemplateMedia=false
				}else{
					this.showToaster('Please Uplaod Image file...','error')
				}
			}
		}else{
			this.showEditTemplateMedia=false
		}
		
	}
closeUtility(){
	this.Utility=false;
	this.Marketing=false;
	this.Authentication=false;
	this.vartip = false;
}
testinfo(){
	this.campagininfo=!this.campagininfo;
}
	

	deleteCampaign(openalertmessage:any){
		this.confirmMessage= 'Do you really want to delete this campaign'
		this.modalReference = this.modalService.open(openalertmessage,{ size:'sm', windowClass:'white-bg'});
	}

	copyCampaign() {
		let CampaignID = this.selectedCampaign.Id
		this.apiService.copyCampaign(CampaignID).subscribe(campaignDelete =>{
			this.getAllCampaigns();
			this.showToaster('Campaign Copied', 'success');
			this.selectedCampaign=[];
			this.showCampaignDetail=false;
		})

	}

	prevStep(){
		if(this.activeStep >1){
			if(this.activeStep ==3.1){
				this.activeStep = 3;
				this.setStep(3);
			}else{
				this.activeStep = this.activeStep-1
			}			
		}else{
			this.activeStep
		}
	}
	
	
	nextStep(){

		this.CampaignNameAlreadyExist();

		if(this.activeStep < 3){
			this.selectedTemplate=''
		}
		if(this.activeStep ==2){
			this.getTemplates()
		}
		if(this.activeStep == 1){
			if (this.newCampaignDetail.value.title !== '') {
				if(this.newCampaignDetail.value.channel_label != 'Select Channel'){
				setTimeout(() => {
				if (!this.isCampaignAlreadyExist) {
					this.activeStep = this.activeStep + 1;
				} }, 500);
			}else{
				this.newCampaignDetail.controls.channel_label.markAsTouched();
				this.isNextClicked = true;
			}
			} else {
				this.showToaster('Please enter Campaign Name', 'error');
			}
		
		
		}else if(this.activeStep == 2){
			if(this.segmentsContactList.length>0 || this.csvContactList.length>0){
				this.activeStep = this.activeStep+1
			}else{
				this.showToaster('Please Add Audience','error')
			}
		}else if(this.activeStep ==3){
			
			if(this.selectedTemplate && this.selectedTemplate.TemplateName!=''){
			let content_heading_preview:any=this.selectedTemplate.Header
			let content_preview:any=this.selectedTemplate.BodyText;

			this.selectedTemplate['content_heading_preview']=content_heading_preview
			this.selectedTemplate['content_preview']=content_preview
			this.activeStep=3.1
			}else{
				this.showToaster('Please Select Message Template...','error')
			}
		}
		//  else if(this.activeStep ==3.1){
		// 	 let content_heading_preview:any=this.selectedTemplate.Header
		// 	 let content_preview:any=this.selectedTemplate.BodyText;
			 

		// 	let allVariables:any = this.selectedTemplate.message_variables
		// 	let errorCount =0;
		// 	allVariables.map((item:any)=>{
		// 		if(item.value==''){
		// 			errorCount++
		// 		}
		// 		content_heading_preview = content_heading_preview.replaceAll(item.label,item.value)
		// 		content_preview = content_preview.replaceAll(item.label,item.value)
		// 	})
			
			//  this.selectedTemplate['content_heading_preview']=content_heading_preview
			//  this.selectedTemplate['content_preview']=content_preview
		// 	if(errorCount==0){
		// 	this.activeStep=3.2
		// 	}else{
		// 		this.showToaster('Please Enter all Variable value...','error')	
		// 	}
		//}
		else if(this.activeStep ==3.1){
			console.log(this.selectedTemplate)
			console.log(this.newCampaignDetail)
			console.log('checkVariableValue',this.checkVariableValue())
			if(this.checkVariableValue()){
				this.activeStep=4;
				console.log('if run')
			}else{
				console.log('else run')
				this.showToaster('Variable value should not be empty','error')
			}

		}else{
		
		console.log(this.selectedTemplate)
		console.log(this.newCampaignDetail)
		console.log(this.selecteTimeZone)
		console.log(this.selecteScheduleDate)
		console.log(this.selecteScheduleTime)
			
			
		
	    }
	}
	setStep(newStep:any){
		
		this.activeStep = newStep
		if(newStep ==3){
			this.getTemplates()
		}
		
	}
	filterCampaign(filtercampaign: any) {
		this.closeAllModal()
		this.modalReference = this.modalService.open(filtercampaign,{size: 'sm', windowClass:'white-pink'});
	}
	mapImportantContact(mpcampaign:any){
		if(!this.selecetdCSV || !this.checkboxChecked) {
			this.showToaster('Please Select csv file and check the checkbox...', 'error');
			return;
		}
		

		this.closeAllModal()
			this.importantContact=false;
			this.modalReference = this.modalService.open(mpcampaign,{size: 'ml', windowClass:'pink-bg'});
	
	}

	incorrectfile(mpcampaign:any){
		const currentfileformat = this.file.name.split(".").pop();
		if(currentfileformat == this.fileformat){
			this.showToaster('Please upload correct csv file...', 'error');
			return;
			
		}
		
		this.closeAllModal()
			this.importantContact=false;
			this.modalReference = this.modalService.open(mpcampaign,{size: 'ml', windowClass:'pink-bg'});
	}

	


   opens(contents:any) {
	    this.closeAllModal()
		this.modalService.open(contents);
	}
    searchAttribute(event:any){

		let searchKey = event.target.value
		if(searchKey.length>2){
		var allList = this.attributesoption;
		let FilteredArray = [];
		for(var i=0;i<allList.length;i++){
			var content = allList[i].toLowerCase()
				if(content.indexOf(searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allList[i])
				}
		}
		this.attributesoptionFilters = FilteredArray;
	    }else{
			this.attributesoptionFilters = this.attributesoption;
		}


	}
	openAttributeOption(variable:any,AttributeOption:any){
		    this.attributesoptionFilters = this.attributesoption;
		    this.selecetdVariable = variable
		    console.log(variable)
			this.closeAllModal()
			this.modalReference = this.modalService.open(AttributeOption,{size: 'ml', windowClass:'pink-bg'});
	}
	updateAttributeValue(event:any,variable:any){
		let currentValue = event.target.value;
		const forbiddenKeys = ['{', '}'];

		if (forbiddenKeys.some(key => currentValue.includes(key))) {
			currentValue = currentValue.replace(/[{}]/g, '');
			event.target.value = currentValue;
		}

		if( variable['isAttribute'] == true) {
			event.target.value = ''
            currentValue = '';
			variable['value'] = "";
			variable['fallback'] = "";
		}
		
        variable['isAttribute'] = this.isCustomValue(currentValue);
        variable['value']=event.target.value
		console.log(this.selectedTemplate)
	}

	isCustomValue(value: string): boolean {
		const allVariables = this.selectedTemplate.allVariables;
		const isVariableMatched = allVariables.some((x:any) => x.label == value);
		return isVariableMatched;
	  }

	checkVariableValue(){
		console.log(this.selectedTemplate.allVariables);
		let flag = true;
		this.selectedTemplate.allVariables.forEach((item:any)=>{
		if(item.value=='' || item.value==null)	{
			console.log('false');
			flag = false;
		}
		});
		return flag;
	}
	updateFallbackAttributeValue(event:any){
		this.selectedFallback = event.target.value
		console.log(this.selectedTemplate)
	}

	updateButtonsValue(event:any,variable:any){
		this.selectedTemplate[variable]=event.target.value
		console.log(this.selectedTemplate)
	}



	updatedAttributeOption(attribute: any, addNewCampaign: any) {
		console.log(attribute)
		this.selectedAttribute = attribute;
		this.selectedAddNewCampaign = addNewCampaign;
	}
	closeAttributeOption(status: any, addNewCampaign: any) {	
		if (status != 'save') {
			this.selecetdVariable['value'] = '';
		}
		else {
			this.selecetdVariable['value'] = '{{'+this.selectedAttribute +'}}';
			this.selecetdVariable['fallback'] = this.selectedFallback;
			this.selecetdVariable['isAttribute'] = this.isCustomValue(this.selecetdVariable.value);
		}
		this.resetAttributeSelection();
		this.activeStep=3.1
		this.closeAllModal()
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	    
	}

	resetAttributeSelection() {
		this.selectedAttribute = "";
		this.selectedFallback = "";
	}
	
	openMapOption(variable:any){
		this.selecetdVariable = variable
		this.selecetdVariable['selected']=true
		console.log(this.selecetdVariable)
	}
	updatedCSVAttributeOption(attribute:any,){
		this.selecetdVariable['value']=attribute
		this.selecetdVariable['selected']=false
	}

	openVariableOption() {
		this.TemplateMediaSource=0
		this.showvariableoption=!this.showvariableoption
	}
	SaveVariableOption(){
		this.showvariableoption=false
	}


	openadd(contactadd:any) {
		this.closeAllModal()
		this.modalService.open(contactadd);
	}
	opencampaignTime(campaignTime:any) {
		this.closeAllModal()
		this.modalService.open(campaignTime);
	}
	backToSteps(openModall:any){
		this.closeAllModal()
		this.modalService.open(openModall);
	}
	uplaodTemplateImage(event: any) {
		let files: FileList = event.target.files;
		this.uploadTemplateMedia(files)
	}
    uploadTemplateMedia(files: FileList){
		if(files[0]){
		    let imageFile = files[0]
			let spid = this.SPID
			const data = new FormData();
			data.append('dataFile',imageFile ,imageFile.name);
			let name='campaign'
			this.apiService.uploadfile(data,spid,name).subscribe(uploadStatus =>{
				let responseData:any = uploadStatus
				if(responseData.filename){
					this.selectedTemplate['tempimage'] = responseData.filename
				}
			})
		  }
	}
    onFileChange(event: any) {
		this.selecetdCSV ='';
		let files: FileList = event.target.files;
		this.saveFiles(files);
	}


	updateCSVDuplicate(option:any){
		this.CSVDuplicate =option
	}
	updateCSVPrefix(option:any){
		this.CSVPrefix['value'] ='';
		this.CSVPrefix['label'] = option
	}
	updateCSVPRefix(event:any){
		this.CSVPrefix['value'] =event.target.value
	}
	
	saveFiles(files: FileList) {
		this.segmentsContactList=[]
	    this.csvContactList=[]
		if (files.length > 1){
			console.log("Only one file at time allow");
		}
		else {
		  //console.log(files[0].size,files[0].name,files[0].type);
            
			let fileName:any = files[0].name
			
			var FileExt:any = fileName.substring(fileName.lastIndexOf('.') + 1);

		if(FileExt =="csv") {
				let file =files[0];
				let reader: FileReader = new FileReader();
				reader.readAsText(file);
				let tabalHeader:any=[]
				let tabalRows:any=[]
				reader.onload = (e) => {
					let csv: string = reader.result as string;
					this.csvText = csv;
					const results = csv.split("\n");
					let i=0;
					results.map((row:any)=>{
						if(row){
						const rowCol = row.split(",");
						if(i==0){
							tabalHeader= rowCol
						}else{
							tabalRows.push(rowCol)
						}
						i++
						}
					})
					this.csvContactColmuns = tabalHeader
					let contactsData:any=[]
					tabalRows.map((rowbh:any)=>{
						let row:any={}
						for(var k=0;k<tabalHeader.length;k++){
						let keyName:any = tabalHeader[k].replace('\r','');
						keyName=keyName.replaceAll(' ','')
						let value:any= rowbh[k];
						console.log(keyName)
						row[keyName]=value!='\r'?value:'null'	
						}
						contactsData.push(row)
					})
					console.log(contactsData)
					this.csvContactList = contactsData
					this.selecetdCSV = fileName
       			}
	    } else if(FileExt == "xlsx"){
			let file =files[0];
			const fileReader = new FileReader();
			fileReader.onload = (e: any) => {
				const data = new Uint8Array(e.target.result);
				const workbook = XLSX.read(data, { type: 'array' });
				const sheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[sheetName];
				
				const csvData = XLSX.utils.sheet_to_csv(worksheet);
				const results = csvData.split("\n");
				let tableHeader: any[] = [];
				let tableRows: any[] = [];
				let i = 0;
				results.map((row: any) => {
					if (row) {
						const rowCol = row.split(",");
						if (i == 0) {
							tableHeader = rowCol;
						} else {
							tableRows.push(rowCol);
						}
						i++;
					}
				});
				this.csvContactColmuns = tableHeader;
				let contactsData: any[] = [];
				tableRows.map((rowbh: any) => {
					let row: any = {};
					for (var k = 0; k < tableHeader.length; k++) {
						let keyName: any = tableHeader[k].replace('\r', '');
						keyName = keyName.replaceAll(' ', '');
						let value: any = rowbh[k];
						row[keyName] = value != '\r' ? value : 'null';
					}
					contactsData.push(row);
				});
				console.log(contactsData);
				this.csvContactList = contactsData;
				this.selecetdCSV = file.name;
			};
			fileReader.readAsArrayBuffer(file);

				fileReader.readAsArrayBuffer(this.file);
			}
		else {
			this.showToaster('Please Upload csv file only...','error')
		}
		}
	  }
	
	  toggleContactOption(){
		this.ShowContactOwner =!this.ShowContactOwner;
	  }
	  getContactList(event:any){
		console.log('getContactList')
		let searchKey ='';
		if(event && event.target.value.length>2){
			searchKey = event.target.value
		}
		let BodyData={
			SPID:this.SPID,
			key:searchKey
		}
		this.apiService.getContactList(BodyData).subscribe(responseData =>{
			var dataArray:any=responseData
			console.log(dataArray)
			dataArray.forEach((item:any) => {
				item['AllContactsLength'] =item.contact_id_list?JSON.parse(item.contact_id_list).length:0
				item['updated_formated']=this.formattedDate(item.updated_at)
				item['addedfilters'] = item.filters?JSON.parse(item.filters):''
				item['selected']=false
			})
			this.allContactList=dataArray
		})
	}

	deleteContactList(contactId:any) {
		console.log(contactId)
		let id = {
			id: contactId
		}
		this.apiService.deleteContactList(id).subscribe(
		 result =>{
			console.log(result)
		  });
		  this.getContactList('');
	}

	selectContactList(event: any, listItem: any) {
		if (event.target.checked) {
			listItem['selected'] = true;
			this.selectedId = listItem.Id;
		} else {
			listItem['selected'] = false;
		}
	}

	async updatedContactList(list:any,itemIndex:any){
		let filterlist =list.addedfilters
		filterlist.splice(itemIndex, 1);
		
		
		let contactFilter = this.getContactFilterQuery(filterlist)
		var bodyData={
			Query:contactFilter
		}
		console.log(bodyData)
		let contactId:any =[];
		this.apiService.applyFilterOnEndCustomer(bodyData).subscribe(responseDate =>{
		let allCustomer:any = responseDate
		if(allCustomer.length>0){
		allCustomer.map((user:any)=>{
			contactId.push(user.customerId)
		})
	    }

		let BodyUpdatedData={
			Id:list.Id,
			filters:JSON.stringify(filterlist),
			contact_id_list:JSON.stringify(contactId),
			updated_at:new Date().toISOString().slice(0, 19).replace('T', ' ')
		}
		list.AllContactsLength =contactId.length
		list.updated_at =BodyUpdatedData.updated_at

		

		console.log(BodyUpdatedData)
		this.apiService.updatedContactList(BodyUpdatedData).subscribe(responseData =>{
			console.log(responseData)
			//this.getContactList('')
			list['AllContactsLength'] =BodyUpdatedData.contact_id_list?JSON.parse(BodyUpdatedData.contact_id_list).length:0
		list['updated_formated']=this.formattedDate(BodyUpdatedData.updated_at)
		list['addedfilters'] = BodyUpdatedData.filters?JSON.parse(BodyUpdatedData.filters):''

		})
		

		})
	}
    
	closecampaigninfo(){
		this.campagininfo=false;
	}
	updateListName(event:any){
		this.newContactListName = event.target.value
	}
	
	CreateNewList(addNewCampaign:any){
        if(this.filteredEndCustomer.length>0 && this.newContactListName){
		this.closeAllModal()
		let contactId:any =[];
		this.filteredEndCustomer.map((user:any)=>{
			contactId.push(user.customerId)
		})
		let addedNewFilters:any=[];
		this.contactFilterBy.map((item:any)=>{
			item.addeFilter.map((filter:any)=>{
				addedNewFilters.push({
					filterBy: filter.filterBy?filter.filterBy:'', 
					filterType: filter.filterType?filter.filterType:'', 
					filterOperator:filter.filterOperator?filter.filterOperator:'', 
					filterPrefix: filter.filterPrefix?filter.filterPrefix:'', 
					filterValue: filter.filterValue?filter.filterValue:''
					})
			})
		})
		let BodyData={
			SP_id:this.SPID,
			created_by:this.AgentId,
			filters:JSON.stringify(addedNewFilters),
			contact_id_list:JSON.stringify(contactId),
			list_name:this.newContactListName,
			desc:''
		}
		this.apiService.addNewContactList(BodyData).subscribe(responseData =>{
			console.log('addNewContactList')
			console.log(responseData)
			this.getContactList('')
		})

		let SelectedContacts=this.filteredEndCustomer.length
		
		this.newListName=SelectedContacts+' unique contacts selected';
		this.segmentsContactList= contactId;
		this.importedContacts=false;
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
	}else{
		this.showToaster('Opps No Contacts selected... or Entered','error')
	}
		
	
	}
	SaveListName(addNewCampaign:any){
		this.segmentsContactList=[]
		this.csvContactList=[]
		
		
		let SelectedContacts=0;
		for(var i=0;i<this.allContactList.length;i++){
			if(this.allContactList[i]['selected']){
				var contact_id_list = this.allContactList[i].contact_id_list?JSON.parse(this.allContactList[i].contact_id_list):[]
				this.segmentsContactList= contact_id_list;
				SelectedContacts +=parseInt(this.allContactList[i]['AllContactsLength'])
			}
		}
        if(SelectedContacts>0){
		this.closeAllModal()
		this.newListName=SelectedContacts+' unique contacts selected';
		this.importedContacts=false;
		this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
		}else{
			this.showToaster('Opps No Contacts selected...','error')
		}
	}

	async getTemplates(){
		let spid = Number(this.SPID)
		this.settingsService.getApprovedTemplate(spid,1).subscribe(allTemplates =>{
			this.allTemplatesMain = allTemplates.templates;
			this.allTemplates = allTemplates.templates;
			this.allTemplates = this.allTemplatesMain.filter((item:any) => item.Channel == this.newCampaignDetail.get('channel_label').value);
			this.initallTemplates =JSON.parse(JSON.stringify(this.allTemplatesMain.filter((item:any) => item.Channel == this.newCampaignDetail.get('channel_label').value)));
			this.isAuthentication = true;
			this.isMarketing = true;
			this.isUtility = true;
		})
		
	}
 	searchTemplate(event:any){
		let searchKey = event.target.value
		if(searchKey.length>2){
		var allList = this.allTemplatesMain
		let FilteredArray = [];
		for(var i=0;i<allList.length;i++){
			var content = allList[i].TemplateName.toLowerCase()
				if(content.indexOf(searchKey.toLowerCase()) !== -1){
					FilteredArray.push(allList[i])
				}
		}
		this.allTemplates = FilteredArray
	    }else{
			this.allTemplates = this.allTemplatesMain
		}
	}

	filterTemplate(value:any,type:string){
console.log(this.allTemplatesMain);
		let allList  =JSON.parse(JSON.stringify(this.initallTemplates));
		let val = value.target.checked;
		type =='Marketing' ? this.isMarketing = val : type =='Utility' ? this.isUtility = val: this.isAuthentication = val;
		 	var newArray=[];
		// isUtility:boolean = true;
		// isMarketing:boolean = true;
		// isAuthentication:boolean = true;
	// 	if(temType.target.checked){
	// 	var type= temType.target.value;
	// 	for(var i=0;i<allList.length;i++){
	// 			if(allList[i]['Category'] == type){
	// 				allList[i]['is_active']=1
	// 			}
	// 	}
	//    }else{
	// 	var type= temType.target.value;
	// 	for(var i=0;i<allList.length;i++){
	// 			if(allList[i]['Category'] == type){
	// 				allList[i]['is_active']=0
	// 			}
	// 	}
	//    }
	// 	var newArray=[];
	//    for(var m=0;m<allList.length;m++){
    //       if(allList[m]['is_active']==1){
	// 		newArray.push(allList[m])
	// 	  }

	//    }
	console.log(this.isMarketing, 'Marketing')
	console.log(this.isUtility, 'Utility')
	console.log(this.isAuthentication, 'Authentication')
	   newArray = allList.filter((item:any)=>{
		if(item.Category == 'Marketing' && this.isMarketing)
		return true;
		else if(item.Category == 'Utility' && this.isUtility)
		return true;
		else if(item.Category == 'Authentication' && this.isAuthentication)
		return true;
		else
		return false
	   })
	   this.allTemplates= newArray

		
	}
	getVariables(sentence: string, first: string, last: string): string[] {
		let goodParts: string[] = [];

		if (!sentence || sentence.trim() === '') {
		  return goodParts;
		}
	  
		const allParts = sentence.split(first);
	  
		allParts.forEach((part: string) => {
		  if (part.indexOf(last) > -1) {
			const goodOne = part.split(last)[0];
			goodParts = goodParts.concat("{{" + goodOne + "}}");
		  }
		});
		return goodParts;
	  }
	  
	  selectTemplate(template: any) {
		this.selectedTemplate = template;
		console.log(template, '----template');
		let header = template?.Header ? template?.Header : '';
		var str = header + template.BodyText;
		if (str) {
		  const allVariables = this.getVariables(str, "{{", "}}");
		  let allVariablesList: any = [];
		  console.log(allVariablesList);
	  
		  allVariables.map((item: any) => {
			if(item){
			allVariablesList.push({ label: item, value: '' });
			}
		  });
		  console.log(JSON.parse(this.selectedTemplate?.template_json), '-----selectedTemplatexddsfg');
		  let template_json = JSON.parse(this.selectedTemplate?.template_json)[0];
		  let buttons = [];
		  //template.components[1]?.button.forEach((item)=>{
			if(template_json && template_json?.components){
				if(template_json?.components[1]?.button){
			for(let item of template_json?.components[1]?.button){
			if(item){
				buttons.push({name:item,value:''});
			}
		}
	}
		 // })
		}
		this.selectedTemplate['buttons'] = buttons;	  
		  this.selectedTemplate['allVariables'] = allVariablesList;
		  console.log(this.selectedTemplate, '-----selectedTemplate');
		  console.log(JSON.parse(this.selectedTemplate?.template_json), '-----selectedTemplatexddsfg');
		}
	  }
	  



	  @HostListener("dragover", ["$event"]) onDragOver(event: any) {
			this.dragAreaClass = "droparea";
			event.preventDefault();
	  }
	  @HostListener("dragenter", ["$event"]) onDragEnter(event: any) {
		this.dragAreaClass = "droparea";
		event.preventDefault();
	  }
	  @HostListener("dragend", ["$event"]) onDragEnd(event: any) {
		this.dragAreaClass = "dragarea";
		event.preventDefault();
	  }
	  @HostListener("dragleave", ["$event"]) onDragLeave(event: any) {
		this.dragAreaClass = "dragarea";
		event.preventDefault();
	  }
	  @HostListener("drop", ["$event"]) onDrop(event: any) {
		this.dragAreaClass = "dragarea";
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer.files) {
		  let files: FileList = event.dataTransfer.files;
		  if(this.showEditTemplateMedia){
			this.uploadTemplateMedia(files);
		  }else{
			this.saveFiles(files);
		  }
		  
		}
	  }
	  directToSettings() {
		this.closeAllModal();
		this.router.navigate(['dashboard/setting']);
	  }

	  removeSegmentedAudienceList() {
		this.newListName=false;
		this.checkboxChecked = false;
		for (const listItem of this.allContactList) {
            listItem['selected'] = false;
			this.modalRef.dismiss();

        }
	  }


	  showToolTip(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('fallback-tooltip')) {
			this.showInfo = true;
		}
	}
	tip(){
		this.vartip=!this.vartip;
	}
	prefix(){
		this.prefixInfo=!this.prefixInfo;
	}
	Marketinginfo(){
		this.Marketing=!this.Marketing;
	}
	Utilityinfo(){
		this.Utility=!this.Utility;
	}
	Authenticationinfo(){
		this.Authentication=!this.Authentication;
	}

    
		//*********Download Sample file****************/

		download() {
			this.apiService.download(this.SPID).subscribe((data: any) => {
				const blob = new Blob([data], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				const fileName = document.createElement('a');
				fileName.href = url;
				fileName.download = 'Sample_Import_Audience_File'; 
				document.body.appendChild(fileName);
				fileName.click();
				document.body.removeChild(fileName);
				window.URL.revokeObjectURL(url);
			})
		}
	
		downloadERRfile() {
			this.apiService.downloadErrFile().subscribe((data: any) => {
				const blob = new Blob([data], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				window.open(url);
			})
		}

		stopPropagation(event: Event) {
			event.stopPropagation();
		  }
		  closeAddActionDialog() {
			this.ShowChannelOption = false;
		  }
		
		messageOptIn(event:any) {
		this.optInStatus = event.target.checked ? 'Yes' : 'No'
		  console.log(this.optInStatus)
		  }
		
		  CampaignNameAlreadyExist() {
			let spid = this.SPID;
			let title = this.newCampaignDetail.get('title')?.value;
			  this.apiService.isCampaignExists(title, spid, this.selectedCampaign.Id).subscribe(
				(response: any) => {
					if (response.status === 409) {
						this.isCampaignAlreadyExist = true;
						this.showToaster('Campaign Already Exist with this name !', 'error');
					} else {
						this.isCampaignAlreadyExist = false;
					}
				}
			);
		}
	
		getCampaignTimingList(){
			this._settingsService.getCampaignTimingList(Number(this.SPID))
			.subscribe((result:any) =>{
				if(result){
				this.workingData = [];
				let timingData =result?.seletedCampaignTimings;  
				timingData.forEach((data:any)=>{
				  let flag = false;
				  this.workingData.forEach((item:any)=>{
					if(data.start_time ==item.start_time && data.end_time ==item.end_time){
					  item.day.push(data.day);
					  flag =  true;
					}
				  })
				  if(flag == false){
					let dayArr:string[] =[];
					dayArr.push(data.day);
					this.workingData.push({day:dayArr,start_time:data.start_time,end_time:data.end_time});
				  }
				});
				console.log(this.workingData);
			  }
		  
			})
		  }

	checkCampignTiming(){
		let daysList=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		console.log(this.selecteScheduleTime);
		let sratdatetime:any;
		if(this.scheduled==1){
			let start_datetime =this.selecteScheduleDate+' '+this.selecteScheduleTime;
			 sratdatetime = (new Date ((new Date((new Date(new Date(start_datetime))).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
			}else{
				sratdatetime = (new Date ((new Date((new Date(new Date())).toISOString() )).getTime() - ((new Date()).getTimezoneOffset()*60000))).toISOString().slice(0, 19).replace('T', ' ');
			}
			let day =  daysList[new Date(sratdatetime).getDay()];
			let flag:boolean = false;
			this.workingData.forEach((item:any)=>{
				if(item.day.includes(day)){
					if((item.start_time.split(':')[0] < new Date(sratdatetime).getHours()) && (item.end_time.split(':')[0] > new Date(sratdatetime).getHours())){
						flag = true;
					}else if((item.end_time.split(':')[0] == new Date(sratdatetime).getHours()) && (item.end_time.split(':')[1] > new Date(sratdatetime).getMinutes())){
						flag = true;
					}else if((item.start_time.split(':')[0] == new Date(sratdatetime).getHours()) && (item.start_time.split(':')[1] < new Date(sratdatetime).getMinutes())){
						flag = true;
					}
				}
			})
			this.isCampaignTiming = !flag;
	}


	getUpdatedContactList(addNewCampaign:any){
		console.log(this.allContactList);
		let list =[];
		for(var i=0;i<this.allContactList.length;i++){
			if(this.allContactList[i]['selected']){
				list.push(this.getContactFilterQuery(JSON.parse(this.allContactList[i].filters)));
			}
		}
		let bodyData ={Query:list};
		console.log(list);
		this.segmentsContactList =[];
		this.apiService.processQuery(bodyData).subscribe((result:any) =>{
			if(result){
				let contactList = result?.uniqueResults;
				contactList.forEach((item:any)=>{
					this.segmentsContactList.push(item?.customerId)
				})
				
			}
			if(this.segmentsContactList.length>0){
				this.closeAllModal()
				this.newListName=this.segmentsContactList.length+' unique contacts selected';
				this.importedContacts=false;
				this.modalReference = this.modalService.open(addNewCampaign,{size: 'xl', windowClass:'white-bg'});
				}else{
					this.showToaster('Opps No Contacts selected...','error')
				}
		})
	}

	onReplaceFileChange(e:any){
		console.log(e);
		let files: FileList = e.target.files;
		this.saveReplaceFiles(files)
		if(false){
			
			if(this.TemplateMediaSource==0){
				if(this.selectedTemplate.tempimage && this.selectedTemplate.tempimage !=''){
					this.selectedTemplate.image =this.selectedTemplate.tempimage
					this.selectedTemplate['tempimage']='';
					this.showEditTemplateMedia=false
				}else{
					this.showToaster('Please Uplaod Image file...','error')
				}
			}else if(this.TemplateMediaSource==1){
				if(this.selectedTemplate.tempimageurl && this.selectedTemplate.tempimageurl !=''){
					this.selectedTemplate.image =this.selectedTemplate.tempimageurl
					this.selectedTemplate['tempimageurl']='';
					this.showEditTemplateMedia=false
				}else{
					this.showToaster('Please Uplaod Image file...','error')
				}
			}else if(this.TemplateMediaSource==2){
				if(this.selectedTemplate.tempimageurl && this.selectedTemplate.tempimageurl !=''){
					this.selectedTemplate.image =this.selectedTemplate.tempimageurl
					this.selectedTemplate['tempimageurl']='';
					this.showEditTemplateMedia=false
				}else{
					this.showToaster('Please Uplaod Image file...','error')
				}
			}
		}else{
			this.showEditTemplateMedia=false
		}
	}

	saveReplaceFiles(files: FileList) {
		if (files.length > 0) {
		  let fileName: any = files[0].name;
		  let fileExt: string = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
		  let spid = this.SPID
		  if (['pdf', 'jpg', 'jpeg', 'png', 'mp4'].includes(fileExt)) {
			let mediaType = files[0].type;
			let fileSize = files[0].size;

			const fileSizeInMB: number = parseFloat((fileSize / (1024 * 1024)).toFixed(2));
			const imageSizeInMB: number = parseFloat((5 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
			const docVideoSizeInMB: number = parseFloat((10 * 1024 * 1024 / (1024 * 1024)).toFixed(2));
	  
			const data = new FormData();
			data.append('dataFile', files[0], fileName);
			data.append('mediaType', mediaType);
	  
			if((mediaType == 'video/mp4' || mediaType == 'application/pdf') && fileSizeInMB > docVideoSizeInMB) {
				this.showToaster('Video / Document File size exceeds 10MB limit','error');
			}

			else if ((mediaType == 'image/jpg' || mediaType == 'image/jpeg' || mediaType == 'image/png' || mediaType == 'image/webp') && fileSizeInMB > imageSizeInMB) {
				this.showToaster('Image File size exceeds 5MB limit','error');
			}

			else {
				let name='smartReply'
				this.apiService.uploadfile(data,spid,name).subscribe(uploadStatus => {
				  let responseData: any = uploadStatus;
				  console.log(uploadStatus);
				  if (responseData.filename) {
					//this.mediaType = mediaType;
					// this.fileName = fileName;
					// this.fileSize = fileSizeInMB;
					// this.showAttachmenOption = false;
						let mediaCategory;
						if (mediaType.startsWith('image/')) {
							mediaCategory = 'image';
						} else if (mediaType.startsWith('video/')) {
							mediaCategory = 'video';
						} else if (mediaType === 'application/') {
							mediaCategory = 'document';
						}
				
						if (this.selectedTemplate.media_type === mediaCategory) {
							this.selectedTemplate.Links = responseData.filename;
							$("#attachmentbox").modal('hide');
							$("#editTemplate").modal('show');
							//this.messageMeidaFile='';
						} else {
							this.showToaster('! Please only upload media that matches selected template', 'error');
							$("#attachmentbox").modal('hide');
							$("#editTemplate").modal('show');
							//this.messageMeidaFile='';
						}
					}
				});
			}
		
	  
			// if (['pdf', 'jpg', 'jpeg', 'png'].includes(fileExt)) {
			//   let reader: FileReader = new FileReader();
			//   reader.readAsText(files[0]);
	  
			//   let tabalHeader: any[] = [];
			//   let tabalRows: any[] = [];
	  
			//   reader.onload = (e) => {
			// 	let content: string = reader.result as string;
			// 	const results = content.split("\n");
			// 	let i = 0;
			// 	results.map((row: any) => {
			// 	  if (row) {
			// 		const rowCol = row.split(",");
			// 		if (i == 0) {
			// 		  tabalHeader = rowCol;
			// 		} else {
			// 		  tabalRows.push(rowCol);
			// 		}
			// 		i++;
			// 	  }
			// 	});
	  
			// 	this.csvContactColmuns = tabalHeader;
			// 	let contactsData: any[] = [];
			// 	tabalRows.map((rowbh: any) => {
			// 	  let row: any = {};
			// 	  for (var k = 0; k < tabalHeader.length; k++) {
			// 		let keyName: any = tabalHeader[k].replace('\r', '');
			// 		keyName = keyName.replaceAll(' ', '');
			// 		let value: any = rowbh[k];
			// 		console.log(keyName);
			// 		row[keyName] = value != '\r' ? value : 'null';
			// 	  }
			// 	  contactsData.push(row);
			// 	});
	  
			// 	console.log('Contacts Data:', contactsData);
			// 	this.csvContactList = contactsData;
			// 	this.selecetdpdf = fileName;
			//   }
			// }
		  } else {
			this.showToaster('Please upload a PDF, image, or video (mp4) file only...', 'error');
		  }
		}
	  }

	  checkNumber(event: any) {
		const inputValue = event.target.value;
		let value = inputValue.replace(/[^0-9]+/g, ''); 
		event.target.value = value;
	}

	//   sendattachfile(){
	// 	if (this.isAttachmentMedia === false) {
	// 		if (this.messageMeidaFile !== '') {
	// 			$("#sendfile").modal('show');
	// 			$("#attachmentbox").modal('hide');
	// 		}
	// 	}
		
	// 	else {
	// 		let mediaCategory;
	// 		if (this.mediaType.startsWith('image/')) {
	// 			mediaCategory = 'image';
	// 		} else if (this.mediaType.startsWith('video/')) {
	// 			mediaCategory = 'video';
	// 		} else if (this.mediaType === 'application/') {
	// 			mediaCategory = 'document';
	// 		}
	
	// 		if (this.selectedTemplate.media_type === mediaCategory) {
	// 			this.selectedTemplate.Links = this.attachmentMedia;
	// 			$("#attachmentbox").modal('hide');
	// 			$("#editTemplate").modal('show');
	// 			this.messageMeidaFile='';
	// 		} else {
	// 			this.showToaster('! Please only upload media that matches selected template', 'error');
	// 			$("#attachmentbox").modal('hide');
	// 			$("#editTemplate").modal('show');
	// 			this.messageMeidaFile='';
	// 		}
	// 	}
	// }
}
