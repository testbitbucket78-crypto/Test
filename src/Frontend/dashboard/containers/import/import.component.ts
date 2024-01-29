import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
import Stepper from 'bs-stepper';
import { Router } from '@angular/router';
declare var $: any;


@Component({
	selector: 'sb-import',
	changeDetection: ChangeDetectionStrategy.Default,
	templateUrl: './import.component.html',
	styleUrls: ['./import.component.scss']
})

export class ImportComponent implements OnInit {


	showMore = false;
	text = [`Upload a CSV file with the contacts and details that you would like to import. Ensure the CSV file fulfills the Following requirements:  Only CSV files are accepted for import. File size must be 10 MB The file must contain at least column with Contact Numbers. Ensure the first row contains NO data and just column headings with proper labels to help in variables mapping. Data in the first row is not imported. The file must contain atleast 2 columns. One of them should contain Contact Numbers and the other Name of the Contacts If your import purpose is Update Existing Contacts Only, you can also select Contact ID as an identifier.`];

	@Output() getContact = new EventEmitter<string> ();
	spid!:number;
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
	customFieldData:[] = [];
	importCSVdata = []=[];
	toggleOverride!: boolean[];
	displayNameChecked!: boolean[]
	selectedColumnMapping:any;
	selectedValue: any;
	

	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService,private _settingsService:SettingsService,private router:Router) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
	ngOnInit() {
		this.spid = Number(sessionStorage.getItem('SP_ID'));
		// this.routerGuard();
		this.showTopNav = false;
		this.stepper = new Stepper($('.bs-stepper')[0], {
			linear: true,
			animation: true
		});
		this.getCustomFieldsData();
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

	 //**** incorrect file format popup ****//
	incorrectFile = (content:any) => {	
		const currentfileformat = this.file?.name.split(".").pop();
		if(currentfileformat) {
			if(currentfileformat !== this.fileformat && currentfileformat!=='CSV') {
				$("#importmodal").modal('hide');
				this.modalService.open(content);
			}
			else {
				this.stepper.next();
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
			this.modalService.open(importfailed);
		}
	}

//*********After upload read file *********/
	onUpload(event: any) {
		this.file = event.target.files[0];
		this.fileName = this.truncateFileName(this.file.name, 25);
		let reader: FileReader = new FileReader();
		reader.readAsText(this.file);
		reader.onload = () => {
			let csvData = reader.result;
			let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
			let headersRow = this.getHeaderArray(csvRecordsArray);
			this.headers = headersRow;
			this.importedData = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow);

			this.importedData.forEach((data) => {
				this.csvfieldHeaders = Object.keys(data);
				this.csvfieldValues = Object.values(data);
				this.toggleOverride = Array(this.csvfieldHeaders.length).fill(false);
				this.displayNameChecked= Array(this.csvfieldHeaders.length).fill(false);
				console.log(this.csvfieldHeaders);
				console.log(this.csvfieldValues);
			  });
		}
	}

//*********Truncate fileName *********//

	truncateFileName(fileName: string, maxLength: number): string {
		if (fileName.length > maxLength) {
			return fileName.substring(0, maxLength) + '...';
		}
		return fileName;
	}

//*********Download Sample file****************/

	download() {
		this.apiService.download().subscribe((data: any) => {
			const blob = new Blob([data], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			window.open(url);
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
			"mapping": this.columnMapping,
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
		this.columnMapping = {
	
		}
		var csvdata = {
			"field": this.fields,
			"identifier": this.selectedIdentifier,
			"purpose": this.purpose,
			"mapping": this.columnMapping,
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
		this._settingsService.getNewCustomField(this.spid).subscribe(response => {
		  this.customFieldData = response.getfields
		  console.log(this.customFieldData);  
		})
	  }


	  selectColumnMapping(value:any) {
		this.selectedColumnMapping = value;
	  }


	  onSelect(event: any): void {
		this.selectedValue = event.target.value;
		console.log('Selected Value:', this.selectedValue);
	  }
}
