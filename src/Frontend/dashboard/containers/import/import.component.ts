import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ColumnMapping, importCSVData } from 'Frontend/dashboard/models';
import Stepper from 'bs-stepper';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 
declare var $: any;


@Component({
	selector: 'sb-import',
	changeDetection: ChangeDetectionStrategy.Default,
	templateUrl: './import.component.html',
	styleUrls: ['./import.component.scss']
})

export class ImportComponent implements OnInit {


	showMore = false;
	
	@Output() getContact = new EventEmitter<string> ();
	@Output() closeImportPopup = new EventEmitter<string> ();

	spid!:number;
	user!:any;
	active = 1;
	file: any;                                           
	stepper: any;
	fileName: any;                                    
	numberOfNewContact: any;                           
	public headers: any[] = [];                         
	records: any[] = [];
	selectedIdentifier: any[] = [];
	Identifier ='Phone_number';
	purpose ='Add new contact only';
	fields: any[] = [];                                                       
	countUpdatedData: any;                        
	skipCont: any;
	columnMapping: any;
	importedData: any[] = [];
	csvfieldHeaders:any;
	csvfieldValues:any;
	fileformat = 'csv';
	content:any;
	isOverrideOn!: boolean;
	showTopNav:boolean = true;
	errorMessage='';
	successMessage='';
	warningMessage='';
	currentfileformat:any;
	customFieldData:any[] = [];
	selectedCustomFields:any[] = [];
	importCSVdata = []=[];
	toggleOverride!: boolean[];
	displayNameChecked!: boolean[]
	selectedColumnMapping:any;
	selectedValue: any;
	mappedFields:ColumnMapping[][] = [];
	ContactFormData:any;
	identifierColumn :any;
	dragAreaClass: string='';
	messageOptIn:string = '';
	identifierTooltip: boolean = false;

	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService,private _settingsService:SettingsService,private router:Router) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
	ngOnInit() {
		this.spid = Number(sessionStorage.getItem('SP_ID'));
		this.user =  JSON.parse(sessionStorage.getItem('loginDetails')!);
		console.log(this.user);
		// this.routerGuard();
		this.showTopNav = false;


		setTimeout(() => {
			this.stepper = new Stepper($('.bs-stepper')[0], {
				linear: true,
				animation: true
			});
		});

		this.getCustomFieldsData();
		this.dragAreaClass = "dragarea";
	}

	next() {
		this.stepper.next();
	}

	onShow() {
		this.showMore = !this.showMore;
	}

	openinstruction(instruction: any) {
		this.modalService.open(instruction);
	}

   //******* Router Guard  *********//
	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}
//********remove csv file*********
	removeFile() {
		this.file = null;
		this.importedData =[];
		this.selectedCustomFields =[];
		this.selectedIdentifier =[];
		this.importCSVdata =[];
		this.csvfieldHeaders =[];
		this.csvfieldValues =[];
		this.getCustomFieldsData();
		this.mappedFields =[];
	}


	//********csv file upload  *********
	onChange(event: any) {

		this.file = event.target.files[0];

	}

    //********open error dialog boxes *********/
	open(any: any) {
		this.updatedDataCount();
		if(!this.importedData) {
			this.next();
		}
		else {
			$("#importmodal").modal('hide'); 
			this.modalService.open(any);
		}
	}

	closeErrorModal(){
		$("#importmodal").modal('show'); 
		this.modalService.dismissAll()
	}
	showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}else if(type=='error'){
			this.errorMessage=message;
		}else if(type='warning'){
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


	isIdentifierColumn(content:any){
		if(this.identifierColumn) {
			let error = true;
			for(let i=0;i<this.displayNameChecked.length;i++){
				if((this.displayNameChecked[i] && this.selectedCustomFields[i]=='')){
					error = false;
				}
			}
			if(error){
			this.stepper.next();
			this.verifyImportedData();
			}else{
				this.showToaster('please map checked fields !','error');
			}
		}
		else {
			$("#importmodal").modal('hide');
			this.modalService.open(content);
		}
	}

	 //**** incorrect file format popup ****//
	incorrectFile = (content:any) => {	
		const currentfileformat = this.file?.name.split(".").pop();
		if(currentfileformat) {
			if(this.messageOptIn != ''){
			if(currentfileformat !== this.fileformat && currentfileformat!=='CSV' && currentfileformat!=='xlsx') {
				$("#importmodal").modal('hide');
				this.modalService.open(content);
			}
			else {
				this.stepper.next();
			}
		}
		else{
			this.showToaster('Please select Message Opt-In before proceeding', 'error');
		}
		}
		else{
			this.showToaster('Please upload a CSV file before proceeding', 'error');
		}
	
	}

	/***** import started in background popup and function ****/

	importStrated = (imports:any ,importfailed:any) => {
		if (this.numberOfNewContact !== 0 && this.countUpdatedData === 0) {
			this.updateAndSave();
			this.modalService.open(imports);
			$("#importmodal").modal('hide'); 
			this.getContact.emit('');
		}
		else {
			$("#importmodal").modal('hide'); 
			this.modalService.open(importfailed);
		}
	}

//*********After upload read file *********/
	onUpload(event: any) {
		this.file = event.target.files[0];
		this.fileName = this.truncateFileName(this.file.name, 25);
		const fileExtension = this.getFileExtension(this.file.name);
		if(fileExtension == "xlsx"){
			const fileReader = new FileReader();
			fileReader.onload = (e: any) => {
			  const data = new Uint8Array(e.target.result);
			  const workbook = XLSX.read(data, { type: 'array' });
			  const sheetName = workbook.SheetNames[0];
			  const worksheet = workbook.Sheets[sheetName];
			  this.importedData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
			  console.log('importedData', this.importedData);
			  // Processing the extracted Excel Data
			  this.importedData.forEach((data,idx) => {
				this.csvfieldHeaders = Object.keys(data);
				if(idx==0)
					this.csvfieldValues = Object.values(data);
				this.toggleOverride = Array(this.csvfieldHeaders.length).fill(false);
				this.displayNameChecked= Array(this.csvfieldHeaders.length).fill(false);
			});
			this.csvfieldHeaders.forEach((x: any) => {
				this.selectedCustomFields.push('');
			});
			};
			fileReader.readAsArrayBuffer(this.file);
		}
		else{
			let reader: FileReader = new FileReader();
			reader.readAsText(this.file);
			reader.onload = () => {
				let csvData = reader.result;
				let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
				let headersRow = this.getHeaderArray(csvRecordsArray);
				this.headers = headersRow;
				this.importedData = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow);
				console.log('importedData',this.importedData);
				this.importedData.forEach((data,idx) => {
					this.csvfieldHeaders = Object.keys(data);
					if(idx==0)
						this.csvfieldValues = Object.values(data);
					this.toggleOverride = Array(this.csvfieldHeaders.length).fill(false);
					this.displayNameChecked= Array(this.csvfieldHeaders.length).fill(false);
					console.log(this.csvfieldHeaders);
					console.log(this.csvfieldValues);
				});
				this.csvfieldHeaders.forEach((x: any) => {
					this.selectedCustomFields.push('');
				});
			}
		}
		
	}
	getFileExtension(filename: string): string {
		return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
	  }
	/****Written by Rishabh Singh  *****/

   /******************* Method to capture mapping selections********************/

	onSelectMapping(selectedField: string, index: number) {
		this.selectedCustomFields[index] =selectedField;
		if(selectedField == 'Phone_number')
			this.toggleOverride[index] = false;
		this.customFieldData.forEach((item)=>{
			if(this.selectedCustomFields.findIndex((items:any)=> items == item.ActuallName) > -1)
				item.isSelected =  true;
			else
				item.isSelected =  false;
		})
		for (let i = 0; i < this.importedData.length; i++) {
		  const mappedField:ColumnMapping = {
			displayName: this.importedData[i][this.csvfieldHeaders[index]], 
			ActuallName: selectedField // Selected field from dropdown
		  };
		  if (!this.mappedFields[i]) {
			this.mappedFields[i] = []; // initialised the mappingFields
		  }
		  this.mappedFields[i][index] = mappedField;
		}
		console.log(this.mappedFields);
		if(selectedField == "Phone_number") {
			this.identifierColumn = selectedField; // set phone number as a identifier column 
		}

	  }

	removeUncheck(e: any, ith: any) {
		if(!e.target.checked){
		this.mappedFields.forEach((item:any)=>{
			for(let i=0;i<item.length;i++){
			if(item[i]?.ActuallName == this.selectedCustomFields[ith]){
				item.splice(i,1);
			}
		}			
		console.log(item)
		});
		console.log(this.mappedFields)
		this.toggleOverride[ith] = false;
		let idx = this.customFieldData.findIndex((ite:any)=>ite.ActuallName == this.selectedCustomFields[ith]);
		this.customFieldData[idx].isSelected=false;
		this.selectedCustomFields[ith]='';
	} 
	  }
	
	  constructContactFormData() {
		this.ContactFormData = {
		  result: []
		};
	  
		// Iterate over each row of mappedFields
		console.log(this.mappedFields);
		for (let i = 0; i < this.mappedFields.length; i++) {
		  const row = this.mappedFields[i];
		  const rowData = [];

		  // Add SPID to each rowData
		const SPID = {
			displayName: this.spid,
			ActuallName: "SP_ID"
		  };
		  rowData.push(SPID);
	  
		  // Iterate over each field in the row
		  for (let j = 0; j < row.length; j++) {
			const mapping = row[j];
			if (mapping?.ActuallName !== undefined) {
			const formData = {
			  displayName: mapping?.displayName,
			  ActuallName: mapping?.ActuallName
			};
			rowData.push(formData);
			if(mapping?.ActuallName== 'Phone_number'){
				const formDatas = {
					displayName: mapping?.displayName,
					ActuallName: 'displayPhoneNumber'
				  };
				rowData.push(formDatas);
			}
		  }
		}

		  // Check if rowData has any valid fields before pushing
		  if (rowData.length > 1) {
			this.ContactFormData.result.push(rowData);
		  }
		}
		//this.ContactFormData.result.push({displayName: ,ActuallName: });	  
		return this.ContactFormData;
	  }
	  
	  
	//******************Add Imported Contacts******************** /

	onImportContacts(modal:any) {

		const bodyData:importCSVData = {
			field: [], //override fields
			identifier: this.Identifier,
			purpose: this.purpose,
			SP_ID: this.spid,
			messageOptIn: this.messageOptIn,
			importedData: this.importCSVdata,
			user:this.user.name,
			emailId:this.user.email_id
		}
		console.log(this.importCSVdata,'filtered csv data', this.skipCont)
		// api call to add contacts in a bulk manner

		if(this.numberOfNewContact !== 0 || this.countUpdatedData !==0) {
			this.apiService.importContact(bodyData).subscribe(
				(response:any) => {
				if (response.status === 200) {
					this.modalService.open(modal);
					$("#importmodal").modal('hide'); 
					this.file=null;
					this.displayNameChecked = [];
					this.stepper.reset()
					this.getContact.emit('');
				}
			},
				(error)=> {
					if(error) {
						this.showToaster('Error importing contacts from CSV file.','error');
					}
				});
		}

		else {
			this.showToaster('Errors in your CSV File, Please Resolve them first than try again!','error')
		}


}


	verifyImportedData() {
		const importedData = this.constructContactFormData();
		const csvData = {
			importedData: importedData.result,
		    identifier: this.identifierColumn,
			purpose: this.purpose,
			SP_ID: this.spid
		}
		console.log(csvData, ': VERIFY DATA');

		this.apiService.updatedDataCount(csvData).subscribe(
		   (data: any)=> {
			if(data) {
				this.countUpdatedData = data.upCont
				this.numberOfNewContact = data.newCon
				this.skipCont = data.skipCont
				this.importCSVdata = data.importData
			}
	
		}, (error)=> {
			if(error) {
				this.showToaster('Error while verifying Data.','error');
			}
		});

	}

	/****Written by Rishabh Singh  *****/

//*********Truncate fileName *********//

	truncateFileName(fileName: string, maxLength: number): string {
		if (fileName.length > maxLength) {
			return fileName.substring(0, maxLength) + '...';
		}
		return fileName;
	}

//*********Download Sample file****************/

	download() {
		this.apiService.download(this.spid).subscribe((data: any) => {
			const blob = new Blob([data], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			const fileName = document.createElement('a');
			fileName.href = url;
			fileName.download = 'Sample_Contacts_Import_File.csv'; 
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


//**********Method to collect header of csv file**********/
	getHeaderArray(csvRecordsArr: any) {
		let headers = (<string>csvRecordsArr[0]).split(',');
		let headerArray = [];
		for (let j = 0; j < headers.length; j++) {
			headerArray.push(headers[j]);
		}
		console.log(headerArray)
		return headerArray;
	}

//***********Collect csv file headers value******** /
	getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
		let csvArr: any = [];
		let errorDataArray: any = [];
		console.log("headerLength*******", headerLength.length)

		for (let i = 1; i < csvRecordsArray.length - 1; i++) {
			let curruntRecord = (<string>csvRecordsArray[i]).split(',');

			let obj: any = new Object();
			for (let index = 0; index < headerLength.length; index++) {
				const propertyName: string = headerLength[index];

				let val: any = curruntRecord[index];
				if (val === '') {
					val = null;
				}
				  // Handle special case for the "tag" column
				  if (propertyName === 'Tag') {
					// Trim whitespace and remove extra double quotes
					val = val.trim().replace(/^"(.*)"$/, '$1');
					// Split by comma and remove surrounding double quotes
					val = val.split(',').map((tag: string) => tag.trim().replace(/^"(.*)"$/, '$1'));
				  }
			
				obj[propertyName] = val;

			}
			csvArr.push(obj)
		}
		console.log(csvArr)

		return csvArr;
	}
	//*********Override field Method ******** */
	getUpdateFields(event: any, data: any) {
		this.fields.push(data);


	}

	// drag and drop csv method //

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
		this.onUpload({ target: { files: files } });
		}
	}

	//********************For move next page************************ */
	previous() {
		this.stepper.previous();
	}


	//******************Update and save csv file data******************** /
	updateAndSave() {
		var Data = {

			"field": this.fields,
			"identifier": this.selectedIdentifier,
			"purpose": this.purpose,
			"mapping": this.ContactFormData,
			"importedData": this.importCSVdata,
			"SP_ID":sessionStorage.getItem('SP_ID')
		}
		this.apiService.update(Data).subscribe((Data: any) => {
           console.log(Data)
		})

		this.selectedIdentifier.length = 0;

		this.fields.length = 0;

	}

	//************************* Select Identifier of imported file ********************************* */

	onSelected(value: any) {
		console.log("onSelected"+value)
		this.Identifier = value
		this.selectedIdentifier.length = 0;

		this.selectedIdentifier.push(value);
		console.log("onSelected" + this.selectedIdentifier)

	}

	//*******************************Select purose of imported file******************************************* */
	onSelectPurpose(value: any) {
		this.purpose = value;
	}

	//*************************Updated and added data count*************************** /
	updatedDataCount() {
		console.log("update count" + this.records.length)
		console.log(this.importedData)
		var csvdata = {
			"field": this.fields,
			"identifier": this.selectedIdentifier,
			"purpose": this.purpose,
			"mapping": this.ContactFormData,
			"importedData": this.importedData,
			"SP_ID": sessionStorage.getItem('SP_ID')

		}
		this.apiService.updatedDataCount(csvdata).subscribe((data: any) => {
			this.countUpdatedData = data.upCont
			this.numberOfNewContact = data.newCon
			this.skipCont = data.skipCont
			this.importCSVdata = data.importData
			console.log(this.numberOfNewContact)
		})

	}

	//*************************Get Custom Fields Data Columns*************************** /
	getCustomFieldsData() {
		this._settingsService.getNewCustomField(this.spid).subscribe((response:any) => {
			
		  let customFieldData = response.getfields
		  this.customFieldData = customFieldData.filter((field:any) => field.status === 1 && field.ActuallName !="OptInStatus");
		  this.customFieldData.forEach((item:any)=>{
			item.isSelected= false;
		  })
		  console.log(this.customFieldData,'custom data');  
		//   for(let i=0;i<this.customFieldData.length;i++){
		// 	this.customFieldData[i][isSelected] = false;
		//   }
		});	  
	  }


	  selectColumnMapping(value:any) {
		this.selectedColumnMapping = value;
	  }

	  closePopup(){
		this.closeImportPopup.emit('');
	  }

}
