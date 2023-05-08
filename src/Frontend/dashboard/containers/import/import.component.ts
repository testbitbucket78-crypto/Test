import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CSVRecord } from './../../models'
import Stepper from 'bs-stepper';
import { Content } from '@angular/compiler/src/render3/r3_ast';
declare var $: any;


@Component({
	selector: 'sb-import',
	changeDetection: ChangeDetectionStrategy.Default,
	templateUrl: './import.component.html',
	styleUrls: ['./import.component.scss']
})


export class ImportComponent implements OnInit {

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
	isOverrideOn!:boolean;
	showTopNav:boolean = true;

	


	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
	ngOnInit() {

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
	openinstruction(instruction: any) {
		this.modalService.open(instruction);
	}

	//********csv file upload  *********
	onChange(event: any) {

		this.file = event.target.files[0];

	}

    //********open error dialog boxes *********/
	open(any: any) {
		this.modalService.open(any);
	}



	//**** incorrect file format popup ****/
	incorrectFile = (content:any) => {
	
		const currentfileformat = this.file.name.split(".").pop();
		if(currentfileformat !== this.fileformat) {
	
			this.modalService.open(content);
			
		}

		else {
			this.next();
		}
	}

	/***** import started in background popup and function ****/

	importStrated = (imports:any) => {
		if (this.numberOfNewContact !== 0 && this.countUpdatedData !== 0) {
			this.updateAndSave();
			this.modalService.open(imports);
		}

		else {
			this.next();
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
			//console.log(csvRecordsArray)
			//this.data = csvRecordsArray


			let headersRow = this.getHeaderArray(csvRecordsArray);
			this.headers = headersRow;
			//console.log(csvRecordsArray)
			this.importedData = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow);

			// console.log("this.records")
			// console.log(this.importedData)


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
			//let values = dataRows[i].split(',');
			// if (curruntRecord.length != headerLength.length) {

			// 	let errObj: any = new Object();
			// 	for (let index = 0; index < headerLength.length; index++) {
			// 		const propertyName: string = headerLength[index];

			// 		let val: any = curruntRecord[index];
			// 		if (val === '') {
			// 			val = null;
			// 		}
			// 		errObj[propertyName] = val;

			// 	} 
			// 	errorDataArray.push(errObj)
			// }
			// else {
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
		//}
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
		console.log("onSelected"+this.selectedIdentifier)

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
			"importedData": this.importedData

		}
		this.apiService.updatedDataCount(csvdata).subscribe((data: any) => {
			this.countUpdatedData = data.upCont
			this.numberOfNewContact = data.newCon
			this.skipCont = data.skipCont
			this.importCSVdata = data.importData
			console.log(" get data ")
			console.log(this.importCSVdata)

		})

	}


}