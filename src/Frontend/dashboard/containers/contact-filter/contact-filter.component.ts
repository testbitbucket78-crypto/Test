import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';

@Component({
  selector: 'sb-contact-filter',
  templateUrl: './contact-filter.component.html',
  styleUrls: ['./contact-filter.component.scss']
})
export class ContactFilterComponent implements OnInit {
  
	contactFilterBy:any=[];
	
	newContactListFilters:any=[]
	@Input() ContactListNewFilters:any=[];
	//@Input() openPopup!: Subject<boolean>;
	@Input() set openPopup(value: boolean) {
		if (value) {
			this.modalReference = this.modalService.open(this.modalContent,{size: 'xl', windowClass:'white-bg'});
		} 
		this.getTagData();
		this.getCustomFieldsData();
		this.getUserList();
		this.addNewFilters(this.contactFilterBy);
	  }
  selectedcontactFilterBy:any='';
  showContactFilter:any=false;
  showFilterByOption:any=false;
  showFilterTagOption:any=false;
  filteredEndCustomer:any=[];
  filteredEndCustomerOrigional:any=[];
  modalReference: any;
  customFieldData:[] = [];
  showContact! : boolean;
  tag:any;
  userList:any;
	SPID:any = sessionStorage.getItem('SP_ID');
	@ViewChild('addNewItemss', { static: true }) modalContent: TemplateRef<any> | undefined;
	@Output() query = new EventEmitter<string> () ;
	@Output() closeFilterPopup = new EventEmitter<string>();
	@Output() contactFilterList = new EventEmitter<any>();
	
  constructor(private modalService: NgbModal,private _settingsService:SettingsService,
	private datePipe:DatePipe) {
	
    }
	ngOnInit(): void {
		// this.openPopup.subscribe(v => { 
		// 	this.modalReference = this.modalService.open(this.modalContent,{size: 'xl', windowClass:'white-bg'});
		//   });
		//   this.getTagData();
		// this.getCustomFieldsData();
		// this.addNewFilters(this.contactFilterBy);
	}

	getContactFilterBy(){
		this.contactFilterBy=[
			{value:'Phone_number',label:'Phone Number',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
						{label:'Is not empty',checked:false,type:'none'},
					   {label:'Contains',checked:false,type:'text'},
					   {label:'Does Not Contain',checked:false,type:'text'},
					   {label:'Less than',checked:false,type:'text'},
					   {label:'Greater than',checked:false,type:'text'},
					   {label:'Starts with',checked:false,type:'text'},
					   {label:'End with',checked:false,type:'text'},
					   {label:'Is equal to',checked:false,type:'text'},
					   {label:'Is not equal to',checked:false,type:'text'},
			]},
			{value:'Name',label:'Name',checked:false,addeFilter:[],
			option:[
			{label:'Contains',checked:false,type:'text'},
			{label:'Does Not Contain',checked:false,type:'text'},
			{label:'Starts with',checked:false,type:'text'},
			{label:'End with',checked:false,type:'text'},
			{label:'Is empty',checked:false,type:'none'},
			{label:'Is not empty',checked:false,type:'none'},
			{label:'Is equal to',checked:false,type:'text'},
			{label:'Is not equal to',checked:false,type:'text'},
			]},
			{value:'emailId',label:'Email',checked:false,addeFilter:[],
			option:[
				{label:'Contains',checked:false,type:'text'},
				{label:'Does Not Contain',checked:false,type:'text'},
				{label:'Starts with',checked:false,type:'text'},
				{label:'End with',checked:false,type:'text'},
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
				{label:'Is equal to',checked:false,type:'text'},
				{label:'Is not equal to',checked:false,type:'text'},
			]},
			{value:'tag',label:'Tag',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
			{label:'Is equal to',checked:false,type:'select_opt',options:['Paid','Un-Paid','New Customer']},
			{label:'Is not equal to',checked:false,type:'select_opt',options:['Paid','Un-Paid','New Customer']},
			]},
			
			{value:'OptInStatus',label:'Message Opt-in',checked:false,addeFilter:[],
			option:[
				{label:'Yes',checked:false,type:'switch'},
				{label:'No',checked:false,type:'switch'},
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
			]},		
			{value:'isBlocked',label:'Block',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
				{label:'True',checked:false,type:'switch'},
				{label:'False',checked:false,type:'switch'},
			]},
			{value:'created_at',label:'Contact Created At',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Is not empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Between',checked:false,type:'d_date',filterPrefixType:'date'},
						{label:'After',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Before',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is equal to',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is not equal to',checked:false,type:'date',filterPrefixType:'date'},
			]},
			{value:'ContactOwner',label:'Contact Owner',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
				{label:'Is equal to',checked:false,type:'user'},
				{label:'Is not equal to',checked:false,type:'user'}
			]},
			{value:'Last Conversation With',label:'Last Conversation With',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
				{label:'Is equal to',checked:false,type:'user'},
				{label:'Is not equal to',checked:false,type:'user'}
			]},
			{value:'Creator',label:'Creator',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
				{label:'Is equal to',checked:false,type:'user'},
				{label:'Is not equal to',checked:false,type:'user'}
			]},
			{value:'Conversation Resolved',label:'Conversation Resolved',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
			{label:'True',checked:false,type:'none'},
			{label:'False',checked:false,type:'none'}
			]},
			{value:'Conversation Assigned to',label:'Conversation Assigned to',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none'},
				{label:'Is not empty',checked:false,type:'none'},
				{label:'Is equal to',checked:false,type:'user'},
				{label:'Is not equal to',checked:false,type:'user'},
				// {label:'bot',checked:false,type:'none'},
				// {label:'unassigned',checked:false,type:'none'},
				// {label:'user',checked:false,type:'user'},
			]},
			{value:'Last Message Received At',label:'Last Message Received At',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Is not empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Between',checked:false,type:'d_date',filterPrefixType:'date'},
						{label:'After',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Before',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is equal to',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is not equal to',checked:false,type:'date',filterPrefixType:'date'},
			]},
			{value:'Last Message Sent At',label:'Last Message Sent At',checked:false,addeFilter:[],
			option:[
				{label:'Is empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Is not empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Between',checked:false,type:'d_date',filterPrefixType:'date'},
						{label:'After',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Before',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is equal to',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is not equal to',checked:false,type:'date',filterPrefixType:'date'},
			]},
			
		];
	}
    getCustomFieldsData() {
		this.getContactFilterBy();
		this._settingsService.getNewCustomField(this.SPID).subscribe(response => {
		  this.customFieldData = response.getfields;

		  const defaultFieldNames:any = ["Name", "Phone_number", "emailId", "ContactOwner", "OptInStatus","tag"];
		  if(this.customFieldData){
			 const filteredFields:any = this.customFieldData?.filter(
				(field:any) => !defaultFieldNames.includes(field.ActuallName) && field.status ==1 );
 
		filteredFields.forEach((item:any)=>{
			let options:any;
 
			switch(item?.type){
				case 'Date':{
					 options =[
						{label:'Is empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Is not empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Between',checked:false,type:'d_date',filterPrefixType:'date'},
						{label:'After',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Before',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is equal to',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is not equal to',checked:false,type:'date',filterPrefixType:'date'},
						];
						break;
				}
				case 'Switch':{
					options =[
						{label:'Is empty',checked:false,type:'none'},
						{label:'Is not empty',checked:false,type:'none'},
						{label:'Yes',checked:false,type:'switch'},
						{label:'No',checked:false,type:'switch'},
					];
					break;
				}
				case 'Text':{
					 options =[
						{label:'Is empty',checked:false,type:'none'},
						{label:'Is not empty',checked:false,type:'none'},
						{label:'Contains',checked:false,type:'text'},
						{label:'Does Not Contain',checked:false,type:'text'},
						{label:'Starts with',checked:false,type:'text'},
						{label:'End with',checked:false,type:'text'},
						{label:'Is equal to',checked:false,type:'text'},
						{label:'Is not equal to',checked:false,type:'text'},
						];
						break;
				}
				case 'Number':{
					options =[
						{label:'Is empty',checked:false,type:'none'},
						{label:'Is not empty',checked:false,type:'none'},
					   {label:'Contains',checked:false,type:'text'},
					   {label:'Does Not Contain',checked:false,type:'text'},
					   {label:'Less than',checked:false,type:'text'},
					   {label:'Greater than',checked:false,type:'text'},
					   {label:'Starts with',checked:false,type:'text'},
					   {label:'End with',checked:false,type:'text'},
					   {label:'Is equal to',checked:false,type:'text'},
					   {label:'Is not equal to',checked:false,type:'text'},
					   ];
					   break;
			   }
				case 'Select':{
					let selectOptions = JSON.parse(item?.dataTypeValues);
					options =[
						{label:'Is empty',checked:false,type:'none'},
						{label:'Is not empty',checked:false,type:'none'},
						{label:'Is equal to',checked:false,type:'select_opt',options:selectOptions},
						{label:'Is not equal to',checked:false,type:'select_opt',options:selectOptions}
					];
					break;
				}
				case 'Multi Select':{
					let selectOptions = JSON.parse(item?.dataTypeValues);
					options =[
						{label:'Is empty',checked:false,type:'none'},
						{label:'Is not empty',checked:false,type:'none'},
						{label:'Is equal to',checked:false,type:'select_opt',options:selectOptions},
						{label:'Is not equal to',checked:false,type:'select_opt',options:selectOptions}
					];
					break;
				}				
				case 'Time':{
					options =[
						{label:'Is empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Is not empty',checked:false,type:'none',filterPrefixType:'date'},
						{label:'Between',checked:false,type:'d_date',filterPrefixType:'date'},
						{label:'After',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Before',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is equal to',checked:false,type:'date',filterPrefixType:'date'},
						{label:'Is not equal to',checked:false,type:'date',filterPrefixType:'date'},
						];
					break;
				}
			}			
			this.contactFilterBy.push({value:item?.ActuallName,label:item?.displayName,checked:false,addeFilter:[],option:options});

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

	getUserList(){
		this._settingsService.getUserList(this.SPID,1)
		.subscribe(result =>{
		  if(result){
			  this.userList =result?.getUser;  
		  }
  
		})
	  }

  toggleContactFilter(){
		this.showContactFilter=!this.showContactFilter
	  }
	  selectContactFilter(index:any,filter:any){


		this.selectedcontactFilterBy = filter;
		this.showContactFilter=false;
		this.ContactListNewFilters[index]['filterPrefix'] = filter.value;
		this.ContactListNewFilters[index]['filterBy'] = filter['option']['0'].label
		this.ContactListNewFilters[index]['filterType'] = filter['option']['0'].type
		this.ContactListNewFilters[index]['selectedOptions'] = filter['option']['0'].options
		this.ContactListNewFilters[index]['filterPrefix'] = filter.value;
		this.ContactListNewFilters[index]['filterValue']='';
		if(filter['filterPrefixType'])
			this.ContactListNewFilters[index]['filterValue']=filter['filterPrefixType'];



	  }

	addNewFilters(filter:any){

		if(this.ContactListNewFilters.length) return;
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
		this.ContactListNewFilters[index]['filterPrefix'] = selectedcontactFilterBy.value
		this.ContactListNewFilters[index]['filterValue']='';
		if(filter['filterPrefixType'])
			this.ContactListNewFilters[index]['filterValue']=filter['filterPrefixType'];

		
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
	  clearFilter(){
		this.ContactListNewFilters = [];
		if(this.ContactListNewFilters.length != 0) this.ContactListNewFilters[0]['filterOperator']='';
		this.selectedcontactFilterBy['addeFilter']=this.ContactListNewFilters;
		if(this.ContactListNewFilters.length == 0) this.addNewFilter();
	  }
      addNewFilter(){
		let newFilter:any=[];
		newFilter['filterBy'] = this.selectedcontactFilterBy['option']['0'].label
		newFilter['filterType'] = this.selectedcontactFilterBy['option']['0'].type
		newFilter['selectedOptions'] = this.selectedcontactFilterBy['option']['0'].options
		newFilter['filterPrefix'] = this.selectedcontactFilterBy.value
		newFilter['filterValue']='';
		newFilter['filterOperator']='AND';
		if(this.selectedcontactFilterBy['option']['0']['filterPrefixType'])
		newFilter['filterPrefixType']=this.selectedcontactFilterBy['option']['0']['filterPrefixType'];
		this.ContactListNewFilters.push(newFilter)
		if(this.ContactListNewFilters[0]?.filterOperator) this.ContactListNewFilters[0].filterOperator = '';

	  }
	  removeFilter(itemIndex:any){
		this.ContactListNewFilters.splice(itemIndex, 1);
		if(this.ContactListNewFilters.length != 0) this.ContactListNewFilters[0]['filterOperator']='';
		this.selectedcontactFilterBy['addeFilter']=this.ContactListNewFilters;
		if(this.ContactListNewFilters.length == 0) this.addNewFilter();
	  }
	  addFilter(){
		this.selectedcontactFilterBy['addeFilter']=this.ContactListNewFilters

	  }

    
	  createListFromFilters(){
      this.getFilterOnEndCustomer()

         
    }
    getContactFilterQuery(addeFilter:any){

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
  
      let contactFilter ="SELECT EC.*, IFNULL(GROUP_CONCAT(DISTINCT ECTM.TagName ORDER BY FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', ''))), '') AS tag_names,maxInteraction.maxInteractionId,Interaction.interaction_status,Message.*,user.uid,user.name,IM.latestCreatedAt AS lastAssistedAgent,IM.AgentId,IM.* FROM EndCustomer AS EC LEFT JOIN EndCustomerTagMaster AS ECTM ON FIND_IN_SET(ECTM.ID, REPLACE(EC.tag, ' ', '')) > 0 AND ECTM.isDeleted != 1 LEFT JOIN (SELECT customerId,MAX(InteractionId) AS maxInteractionId FROM Interaction WHERE is_deleted != 1 AND IsTemporary != 1 GROUP BY customerId) AS maxInteraction ON maxInteraction.customerId = EC.customerId LEFT JOIN Interaction AS Interaction ON maxInteraction.maxInteractionId = Interaction.InteractionId LEFT JOIN Message AS Message ON Message.interaction_id = Interaction.InteractionId AND Message.is_deleted != 1 LEFT JOIN user AS user ON EC.uid = user.uid LEFT JOIN (SELECT interactionId, MAX(created_at) AS latestCreatedAt,AgentId, lastAssistedAgent FROM InteractionMapping GROUP BY interactionId) AS IM ON IM.InteractionId = Interaction.InteractionId WHERE EC.SP_ID ="+this.SPID +" AND EC.isDeleted != 1 AND EC.IsTemporary != 1";
      if(groupArrays.length>0){
        
        groupArrays.map((filters:any,idx)=>{

          if(filters.items.length>0){
          
			let colName = filters.filterPrefix;
		  if(colName =="Conversation Resolved"){
			if(filters?.items[0].filterBy == 'True')
				contactFilter = contactFilter + " and ((Interaction.interaction_status='Resolved')";
			else
				contactFilter = contactFilter + " and (Interaction.interaction_status !='Resolved')";
		  }else if(colName =="Last Conversation With"){
			let userId = this.userList.filter((item:any)=> item.name ==filters.items[0].filterValue)[0]?.uid ;
			userId = userId ? userId : -1;
			contactFilter = contactFilter + `and  (((  Message.Agent_id LIKE '%${userId}%' ))`;
		  }else if(colName =="Conversation Assigned to"){
			let userId = this.userList.filter((item:any)=> item.name ==filters.items[0].filterValue)[0]?.uid;
			userId = userId ? userId : -1;
			contactFilter = contactFilter + `(and IM.AgentId='${userId}')`;
		  }else if(colName =="Last Message Received At"){
			contactFilter = contactFilter + `and (Message.message_direction ='out' and Message.created_at=?)`;
		  }else if(colName =="Last Message Sent At"){
			contactFilter = contactFilter + `and (Message.message_direction ='IN' and Message.created_at=?) `;
		  }else if(colName =="Creator"){
			contactFilter = contactFilter + `and  ((  user.name LIKE '%${filters.items[0].filterValue}%' ))`;
		  } else{
			let colName = 'EC.'+filters.filterPrefix;
		  
          if(colName =='Phone_number'){
            colName = "REGEXP_REPLACE(Phone_number, '[^0-9]', '')"
          }
  
          contactFilter += idx == 0 ?' and ((' :  filters.items[0]['filterOperator'] == '' ? ' and ('  : filters.items[0]['filterOperator'] + ' (';
          filters.items.map((filter:any,index:any)=>{
  

          let filterOper = "='"+filter.filterValue+"'";
              let QueryOperator ='';
          QueryOperator = index == 0 ? '':filter.filterOperator?filter.filterOperator:''
          if(filter.filterBy=="End with"){
            filterOper = "LIKE '%"+filter.filterValue+"'";
          }
          if(filter.filterBy=="Starts with"){
            filterOper = "LIKE '"+filter.filterValue+"%'";
          }
          if(filter.filterBy=="Is equal to"){
			if(filter.filterType =="date"){
				const currentDate = new Date(filter.filterValue)
				const nextDate = new Date(currentDate)
				nextDate.setDate(currentDate.getDate() + 1)
				console.log(nextDate);
				let update = this.datePipe.transform(nextDate, 'yyyy-MM-dd');
				filterOper = '>= "' + filter.filterValue.toString() + '" AND EC.' + filter.filterPrefix + ' < "' +update?.toString() + '"';				
			}else
            	filterOper = '='+filter.filterValue;
          }
          if(filter.filterBy=="Is not equal to"){
			if(filter.filterType =="date"){
				const currentDate = new Date(filter.filterValue)
				const nextDate = new Date(currentDate)
				nextDate.setDate(currentDate.getDate() + 1)
				console.log(nextDate);
				let update = this.datePipe.transform(nextDate, 'yyyy-MM-dd');
				filterOper = '< "' + filter.filterValue + '" AND EC.' + filter.filterPrefix + ' >= "' +update + '"';				
			}else
            	filterOper = '!='+filter.filterValue;
          }
  
          if(filter.filterBy=="Contains"){
            filterOper = "LIKE '%"+filter.filterValue+"%'";
          }
  
          if(filter.filterBy=="Yes"){
            filterOper = "LIKE '%Yes%'";
          }
  
          if(filter.filterBy=="No"){
            filterOper = "LIKE '%No%'";
          }
		  
          if(filter.filterBy=="True"){
			if(filter.filterPrefix == "isBlocked")
				filterOper = "= '1'";
			else
            	filterOper = "LIKE '%true%'";
          }
  
          if(filter.filterBy=="False"){
			if(filter.filterPrefix == "isBlocked")
				filterOper = "= '0'";
			else
            	filterOper = "LIKE '%false%'";
          }
  
          if(filter.filterBy=="Is empty"){
            filterOper = "LIKE '%No%'";
            filterOper = "='' OR EC."+filter.filterPrefix+" IS NULL";
          }
  
          if(filter.filterBy=="Is not empty"){
            filterOper = "LIKE '%No%'";
            filterOper = "!=''";
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
		  if(filter?.filterPrefixType =="Date"){
			filterOper = this.applyDateCondition(filter);
		  }
          
          contactFilter += ' '+QueryOperator +' '+colName+' '+filterOper
            })
          contactFilter += ' )';
		}
          }
          })
		  contactFilter += ' ) Group by EC.customerId';
        
        } else{
			contactFilter += ' Group by EC.customerId';
		}

        return contactFilter;
    }

	applyDateCondition(filter:any):string{
		let filterOper='';
		if(filter.filterBy=="Before" || filter.filterBy =="Less than"){
			filterOper = `(CASE WHEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') WHEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') WHEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') ELSE NULL END > CAST(${filter.filterValue} AS DATE))`;
		}
		if(filter.filterBy=="After" || filter.filterBy =="Greater than"){
			filterOper = `(CASE WHEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') WHEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') WHEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') ELSE NULL END > CAST(${filter.filterValue} AS DATE))`;
		}
		if(filter.filterBy=="Between"){
			filterOper = `(CASE WHEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') WHEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') WHEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') ELSE NULL END > CAST(${filter.filterValue} AS DATE))`;
		}
		if(filter.filterBy=="Is equal to"){
			filterOper = `(CASE WHEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') WHEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') WHEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') ELSE NULL END = CAST(${filter.filterValue} AS DATE))`;
		}
		if(filter.filterBy=="Is not equal to"){
			filterOper = `(CASE WHEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%Y-%m-%d') WHEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%b %d, %Y') WHEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') IS NOT NULL THEN STR_TO_DATE(${filter.filterPrefix}, '%M %d, %Y') ELSE NULL END != CAST(${filter.filterValue} AS DATE))`;
		}

		  return filterOper;
	}
  
	
  
      getFilterOnEndCustomer(){
      let addedNewFilters:any=[];

      this.contactFilterBy.map((item:any)=>{
        item.addeFilter.map((filter:any)=>{
          addedNewFilters.push({
            filterBy: filter.filterBy?filter.filterBy:'', 
            filterType: filter.filterType?filter.filterType:'', 
            filterOperator:filter.filterOperator?filter.filterOperator:'', 
            filterPrefix: filter.filterPrefix?filter.filterPrefix:'', 
            filterValue: this._settingsService.trimText(filter.filterValue?filter.filterValue:'')
            })
        })
      })

      let contactFilter = this.getContactFilterQuery(addedNewFilters)
      var bodyData={
        Query:contactFilter
      }

	  this.closeFilter();
	  this.query.emit(contactFilter);

  
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

    getTagsList(tags:any){
      if(tags){
        const tagsArray = tags.split(',');
        return tagsArray
      }else{
        return [];
      }
    }

	closeFilter(){
		this.modalReference.close();		
		this.modalService.dismissAll();
		this.closeFilterPopup.emit();
	}

	getActualName(val:any){
		let filt = this.contactFilterBy.filter((item:any)=> item.value == val)
		if(filt.length >0){
			return filt[0]?.label;
		} else
			return val;
	}
}
