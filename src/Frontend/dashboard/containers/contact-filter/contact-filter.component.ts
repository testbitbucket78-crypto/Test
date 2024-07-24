import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { TeamboxService } from 'Frontend/dashboard/services/teambox.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'sb-contact-filter',
  templateUrl: './contact-filter.component.html',
  styleUrls: ['./contact-filter.component.scss']
})
export class ContactFilterComponent implements OnInit {
  
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
		{value:'tag',label:'Tag',checked:false,addeFilter:[],
		option:[
		{label:'Is',checked:false,type:'select_opt',options:['Paid','Un-Paid','New Customer']},
		{label:'Is not',checked:false,type:'select_opt',options:['Paid','Un-Paid','New Customer']},
		]},
		
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
	
	newContactListFilters:any=[]
	@Input() ContactListNewFilters:any=[];
	@Input() openPopup!: Subject<boolean>;
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
	SPID:any = sessionStorage.getItem('SP_ID');
	@ViewChild('addNewItemss', { static: true }) modalContent: TemplateRef<any> | undefined;
	@Output() query = new EventEmitter<string> () ;
	@Output() closeFilterPopup = new EventEmitter<string>();
	@Output() contactFilterList = new EventEmitter<any>();

  constructor(private apiService: TeamboxService,private modalService: NgbModal,private _settingsService:SettingsService) {
	
    }
	ngOnInit(): void {
		this.openPopup.subscribe(v => { 
			this.modalReference = this.modalService.open(this.modalContent,{size: 'xl', windowClass:'white-bg'});
		  });
		  this.getTagData();
		this.getCustomFieldsData();
		this.addNewFilters(this.contactFilterBy);
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
		if(this.ContactListNewFilters[0]?.filterOperator) this.ContactListNewFilters[0].filterOperator = '';
		console.log(this.ContactListNewFilters)
	  }
	  removeFilter(itemIndex:any){
		this.ContactListNewFilters.splice(itemIndex, 1);
		if(this.ContactListNewFilters.length != 0) this.ContactListNewFilters[0]['filterOperator']='';
		this.selectedcontactFilterBy['addeFilter']=this.ContactListNewFilters;
		if(this.ContactListNewFilters.length == 0) this.addNewFilter();
	  }
	  addFilter(){
		this.selectedcontactFilterBy['addeFilter']=this.ContactListNewFilters
		//this.ContactListNewFilters=[]
		//console.log(this.selectedcontactFilterBy)
	  }

    
	  createListFromFilters(){
      this.getFilterOnEndCustomer()
      // this.closeAllModal()
      // this.modalReference = this.modalService.open(applyList,{size: 'xl', windowClass:'white-bg'});
         
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
        
        groupArrays.map((filters:any,idx)=>{
			console.log(idx);
          if(filters.items.length>0){
          filters.items[0]['filterOperator']=''	
          
          let colName = filters.filterPrefix
          if(colName =='Phone_number'){
            colName = "REGEXP_REPLACE(Phone_number, '[^0-9]', '')"
          }
  
          contactFilter += idx == 0 ?' and ((' : ' and (';
          filters.items.map((filter:any)=>{
  
          //this.applylistFiltersWidth =parseInt(this.applylistFiltersWidth)+100	
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
		  contactFilter += ' )';
        
        }
        console.log(contactFilter)
        return contactFilter;
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
            filterValue: filter.filterValue?filter.filterValue:''
            })
        })
      })
      let contactFilter = this.getContactFilterQuery(addedNewFilters)
      var bodyData={
        Query:contactFilter
      }
	  this.query.emit(contactFilter);
	  //this.contactFilterList.emit(this.ContactListNewFilters)
	  this.closeFilter();
      console.log(bodyData)
    //   this.apiService.applyFilterOnEndCustomer(bodyData).subscribe(allCustomer =>{
    //     var allCustomerList:any=allCustomer
    //     if(allCustomerList){
    //     allCustomerList.forEach((item:any) => {
    //       item['tags'] = this.getTagsList(item.tag)
  
    //     })
    //   }
          
    //     this.filteredEndCustomer = allCustomerList
    //     this.filteredEndCustomer['sortOrder']=false
    //     this.filteredEndCustomerOrigional =this.filteredEndCustomer
    //   //  this.totalpages = Math.ceil(this.filteredEndCustomer.length/this.pagesize)
        
    // })
  
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
		console.log('abcd');
		this.closeFilterPopup.emit('');
		this.modalReference.close();
	}
}
