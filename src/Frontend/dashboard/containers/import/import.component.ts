import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import { ColumnMapping, importCSVData } from 'Frontend/dashboard/models';
import Stepper from 'bs-stepper';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx'; 
import { convertCsvToXlsx } from '../common/Utils/file-utils';
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
    userList!:any;

	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService,private _settingsService:SettingsService,private router:Router) {

		config.backdrop = 'static';
		config.keyboard = false;
	}
	ngOnInit() {
		this.spid = Number(sessionStorage.getItem('SP_ID'));
		this.user =  JSON.parse(sessionStorage.getItem('loginDetails')!);


		this.showTopNav = false;


		setTimeout(() => {
			this.stepper = new Stepper($('.bs-stepper')[0], {
				linear: true,
				animation: true
			});
		});

		this.getCustomFieldsData();
		this.getUserList();
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


	routerGuard = () => {
		if (sessionStorage.getItem('SP_ID') === null) {
			this.router.navigate(['login']);
		}
	}

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



	onChange(event: any) {

		this.file = event.target.files[0];

	}


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

	getUserList(){
		this._settingsService.getUserList(this.spid,1)
		.subscribe(result =>{
		  if(result){
			  this.userList =result?.getUser;  
		  }
		})
	  }
//*********After upload read file *********/
	onUpload(event: any) {
		this.selectedCustomFields = [];
		this.displayNameChecked = [];

		this.file = event.target.files[0];
		this.fileName = this.truncateFileName(this.file.name, 25);
		const fileExtension = this.getFileExtension(this.file.name);
		if(!(fileExtension == "xlsx" || fileExtension == "csv")){
            this.showToaster("Please attach only .xlsx or .csv file and try again.", "error")
			this.removeFile();
			return;
		}
		if(fileExtension == "xlsx"){
			const fileReader = new FileReader();
			fileReader.onload = (e: any) => {
			  const data = new Uint8Array(e.target.result);
			  const workbook = XLSX.read(data, { type: 'array' });
			  const sheetName = workbook.SheetNames[0];
			  const worksheet = workbook.Sheets[sheetName];

			  Object.keys(worksheet).forEach((cell) => {
				if (cell[0] === "!") return;
				const cellValue = worksheet[cell].v;
				if (typeof cellValue === "number") {
				  const col = cell.replace(/[0-9]/g, "");
				const headerCell = `${col}1`;
				const headerValue = worksheet[headerCell]?.v;

				if (headerValue === "Date") {
					const baseDate = new Date(1899, 11, 30);
					const date = new Date(baseDate.getTime() + (cellValue + 1) * 86400000);
					worksheet[cell].w = date.toISOString().split("T")[0]; 
				} else if (headerValue === "Time") {
					const baseDate = new Date(1899, 11, 30);
					const date = new Date(baseDate.getTime() + cellValue * 86400000);
					worksheet[cell].w = date.toTimeString().split(" ")[0]; 
				} else {
					worksheet[cell].w = cellValue.toString(); 
				}
				}
			  });

			  this.importedData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

			  // Processing the extracted Excel Data
			  this.importedData.forEach((data,idx) => {
				if(idx==0){
					this.csvfieldHeaders = Object.keys(data);
					this.csvfieldValues = Object.values(data);
				}
				if(Object.keys(data).length>this.csvfieldHeaders.length){
					this.csvfieldHeaders = Object.keys(data).filter(header => !header.startsWith('__EMPTY'));
				}
				this.toggleOverride = Array(this.csvfieldHeaders.length).fill(false);
				this.displayNameChecked= Array(this.csvfieldHeaders.length).fill(false);
			});
			this.csvfieldHeaders.forEach((x: any) => {
				if (!x.startsWith("__EMPTY")) {
					this.selectedCustomFields.push('');
				} 
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
			}
		}
		
	}
	getFileExtension(filename: string): string {
		return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
	  }




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
			ActuallName: selectedField 
		  };
		  if (!this.mappedFields[i]) {
			this.mappedFields[i] = []; 
		  }
		  this.mappedFields[i][index] = mappedField;
		}

		if(selectedField == "Phone_number") {
			this.identifierColumn = selectedField; 
		}

	  }

	removeUncheck(e: any, ith: any) {
		if(!e.target.checked){
			const val = this.selectedCustomFields[ith];
		this.mappedFields.forEach((item:any)=>{
			for(let i=0;i<item.length;i++){
			if(item[i]?.ActuallName == this.selectedCustomFields[ith]){
				item.splice(i,1);
			}
		}			

		});


		if(val =='Phone_number'){
			this.identifierColumn ='';
		}
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
	  


		for (let i = 0; i < this.mappedFields.length; i++) {
		  const row = this.mappedFields[i];
		  const rowData = [];


		const SPID = {
			displayName: this.spid,
			ActuallName: "SP_ID"
		  };
		  rowData.push(SPID);
	  

		  for (let j = 0; j < row.length; j++) {
			const mapping = row[j];
			if (mapping?.ActuallName !== undefined) {
			const formData = {
			  displayName: this._settingsService.trimText(mapping?.displayName),
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


		  if (rowData.length > 1) {
			this.ContactFormData.result.push(rowData);
		  }
		}
	  
		return this.ContactFormData;
	  }
	  
	  


	onImportContacts(modal:any) {

		const bodyData:importCSVData = {
			field: [], 
			identifier: this.Identifier,
			purpose: this.purpose,
			SP_ID: this.spid,
			messageOptIn: this.messageOptIn,
			importedData: this.importCSVdata,
			user:this.user.name,
			emailId:this.user.email_id
		}



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

importDataLoader! : boolean;
	verifyImportedData() {
		this.importDataLoader = true;
		let importedData = this.constructContactFormData();
		if(importedData && this.userList) importedData = this.findUidForContactOwner(importedData, this.userList);
		const csvData = {
			importedData: importedData.result,
		    identifier: this.identifierColumn,
			purpose: this.purpose,
			SP_ID: this.spid
		}


		this.apiService.updatedDataCount(csvData).subscribe(
		   (data: any)=> {
			if(data) {
				this.countUpdatedData = data.upCont
				this.numberOfNewContact = data.newCon
				this.skipCont = data.skipCont
				this.importCSVdata = data.importData
				this.importDataLoader = false;
			}
	
		}, (error)=> {
			if(error) {
				this.showToaster('Error while verifying Data.','error');
				this.importDataLoader = false;
			}
		});

	}
	findUidForContactOwner(importedData: any, userList: any) {
		importedData.result.forEach((dataArray: any) => {
		  const contactOwner = dataArray.find((item:any) => item.ActuallName === 'ContactOwner');
		  
		  if (contactOwner) {
			const matchedUser = userList.find((user: any) => user.name === contactOwner.displayName);
			
			if (matchedUser) {
			  dataArray.push({
				displayName: matchedUser.uid,
				ActuallName: 'uid'
			  });
			}
		  }
		});
		return importedData;
	  }
	  





	truncateFileName(fileName: string, maxLength: number): string {
		if (fileName.length > maxLength) {
			return fileName.substring(0, maxLength) + '...';
		}
		return fileName;
	}



	// download() {
	// 	this one was for CSV 
	// 	this.apiService.download(this.spid).subscribe((data: any) => {
	// 		const blob = new Blob([data], { type: 'text/csv' });
	// 		const url = window.URL.createObjectURL(blob);
	// 		const fileName = document.createElement('a');
	// 		fileName.href = url;
	// 		fileName.download = 'Sample_Contacts_Import_File.csv'; 
	// 		document.body.appendChild(fileName);
	// 		fileName.click();
	// 		document.body.removeChild(fileName);
	// 		window.URL.revokeObjectURL(url);
	// 	})
	// }
	
	download() {
		this.apiService.download(this.spid).subscribe((data: any) => {
		const blob = new Blob([data], { type: 'text/csv' });
		  convertCsvToXlsx(blob, 'Sample_Contacts_Import_File.xlsx')
			.then(() => console.log('File downloaded successfully'))
			.catch(error => {
				console.error('Error converting CSV to XLSX:', error);
				this.showToaster('Something Went Wrong while downloading. Please try again!', 'error');
			});
		});
	  }
	// downloadERRfile() {
	// 	this.apiService.downloadErrFile().subscribe((data: any) => {
	// 		const blob = new Blob([data], { type: 'text/csv' });
	// 		const url = window.URL.createObjectURL(blob);
	// 		window.open(url);
	// 	})
	// }
	downloadERRfile() {
		this.apiService.downloadErrFile().subscribe((data: any) => {
		const blob = new Blob([data], { type: 'text/csv' });
		convertCsvToXlsx(blob, 'Error_File.xlsx')
			.then(() => console.log('Error file downloaded successfully'))
			.catch(error => {
				console.error('Error converting CSV to XLSX:', error);
				this.showToaster('Something Went Wrong while downloading. Please try again!', 'error');
			});
		});
	  }

	getHeaderArray(csvRecordsArr: any) {
		let headers = (<string>csvRecordsArr[0]).split(',');
		let headerArray = [];
		for (let j = 0; j < headers.length; j++) {
			headerArray.push(headers[j]);
		}

		return headerArray;
	}


	getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
		let csvArr: any = [];
		let errorDataArray: any = [];


		for (let i = 1; i < csvRecordsArray.length - 1; i++) {
			let curruntRecord = (<string>csvRecordsArray[i]).split(',');

			let obj: any = new Object();
			for (let index = 0; index < headerLength.length; index++) {
				const propertyName: string = headerLength[index];

				let val: any = curruntRecord[index];
				if (val === '') {
					val = null;
				}

				  if (propertyName === 'Tag') {

					val = val.trim().replace(/^"(.*)"$/, '$1');

					val = val.split(',').map((tag: string) => tag.trim().replace(/^"(.*)"$/, '$1'));
				  }
			
				obj[propertyName] = val;

			}
			csvArr.push(obj)
		}


		return csvArr;
	}

	getUpdateFields(event: any, data: any) {
		this.fields.push(data);


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
		this.onUpload({ target: { files: files } });
		}
	}


	previous() {
		this.stepper.previous();
	}



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

		})

		this.selectedIdentifier.length = 0;

		this.fields.length = 0;

	}



	onSelected(value: any) {

		this.Identifier = value
		this.selectedIdentifier.length = 0;

		this.selectedIdentifier.push(value);


	}


	onSelectPurpose(value: any) {
		this.purpose = value;
	}


	updatedDataCount() {

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

		})

	}


	getCustomFieldsData() {
		this._settingsService.getNewCustomField(this.spid).subscribe((response:any) => {
			
		  let customFieldData = response.getfields
		  this.customFieldData = customFieldData.filter((field:any) => field.status === 1 && field.ActuallName !="OptInStatus");
		  this.customFieldData.forEach((item:any)=>{
			item.isSelected= false;
		  })

		});	  
	  }


	  selectColumnMapping(value:any) {
		this.selectedColumnMapping = value;
	  }

	  closePopup(){
		this.closeImportPopup.emit('');
	  }

}
