import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
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
	text = ` mamammamamamamm amamamamam ammaaamaam amammscwebcjkwebjkqwkllwq lkwkklwdkl  njkbjkbkbk`;

	@Output() getContact = new EventEmitter<string> ();
	active = 1;
	file: any;                                           
	stepper: any;
	fileName: any;                                    
	numberOfNewContact: any;                           
	public headers: any[] = [];                         
	records: any[] = [];
	selectedIdentifier: any[] = [];
	Identifier: any;
	purpose: any;
	fields: any[] = [];                                                       
	countUpdatedData: any;                        
	importCSVdata: any[] = [];
	skipCont: any;
	columnMapping: any;
	importedData: any[] = [];
	fileformat = 'csv';
	content:any;
	isOverrideOn!: boolean; isOverrideOn1!: boolean; isOverrideOn2!: boolean; isOverrideOn3!: boolean; isOverrideOn4!: boolean; isOverrideOn5!: boolean; isOverrideOn6!: boolean; isOverrideOn7!: boolean;
	showTopNav:boolean = true;
	errorMessage='';
	successMessage='';
	warningMessage='';
	currentfileformat:any;

	


	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService , private router:Router) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
	ngOnInit() {

		
		this.routerGuard();
		this.showTopNav = false;
		this.stepper = new Stepper($('.bs-stepper')[0], {
			linear: true,
			animation: true
		
		})
		this.Identifier = "Email id"
		this.purpose = "Add new contact only"
		this.selectedIdentifier.push('emailId')
		console.log(this.selectedIdentifier)

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

	//********csv file upload  *********
	onChange(event: any) {

		this.file = event.target.files[0];

	}

    //********open error dialog boxes *********/
	open(any: any) {
		this.modalService.open(any);
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

	// //**** incorrect file format popup ****/
	incorrectFile = (content:any) => {
		
		const currentfileformat = this.file.name.split(".").pop();
		if(currentfileformat !== this.fileformat) {
			this.modalService.open(content);
			
		}
		else {
			this.stepper.next();
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
		this.fileName = this.file.name
		
		

		let reader: FileReader = new FileReader();
		reader.readAsText(this.file);
		reader.onload = () => {
			let csvData = reader.result;
			let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);


			let headersRow = this.getHeaderArray(csvRecordsArray);
			this.headers = headersRow;
			this.importedData = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow);

		}
	
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
			"Name": '',
			"emailId": '',
			"Mobile_Number": '',
			"Gender": '',
			"Tags": '',
			"Status": '',
			"Country": '',
			"State": ''
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



}