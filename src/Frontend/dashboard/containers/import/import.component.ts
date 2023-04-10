import { Component, OnInit } from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardService } from './../../services';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CSVRecord } from './../../models'
import Stepper from 'bs-stepper';
declare var $: any;

@Component({
	selector: 'sb-import',
	templateUrl: './import.component.html',
	styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
	active = 1;
	file: any;
	stepper: any;
	fileName: any;
	numberOfNewContact: any;
	data: any;
	headers: any[] = [];
	records: any[] = [];
	checkedConatct: any;
	checkboxArray = [];
	selectedIdentifier: any[] = [];
	defaultSelectedIdentifier: any = "";
	Identifier: any = "email"
	fields: any[] = [];
	countUpdatedData: any;
	constructor(config: NgbModalConfig, private modalService: NgbModal, private apiService: DashboardService) {
		// customize default values of modals used by this component tree
		config.backdrop = 'static';
		config.keyboard = false;
	}
	ngOnInit() {
		this.stepper = new Stepper($('.bs-stepper')[0], {
			linear: false,
			animation: true
		})
		this.defaultSelectedIdentifier = "emailId"
		this.selectedIdentifier.push(this.defaultSelectedIdentifier)
		
	}
	next() {
		this.stepper.next();
	}
	openinstruction(instruction: any) {
		this.modalService.open(instruction);
	}

	onChange(event: any) {

		this.file = event.target.files[0];

	}


	onUpload() {

	
		this.fileName = this.file.name
		
		let reader: FileReader = new FileReader();
		reader.readAsText(this.file);
		reader.onload = () => {
			
			let csvData = reader.result;
			let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
			this.data = csvRecordsArray
			
			this.numberOfNewContact = (csvRecordsArray.length) - 2;
		
			let headersRow = this.getHeaderArray(csvRecordsArray);
			this.headers = headersRow;
			this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
			


		}
	}

	

	download() {
		this.apiService.download().subscribe((data: any) => {
			const blob = new Blob([data], { type: 'text/csv' });
			const url = window.URL.createObjectURL(blob);
			window.open(url);
		})
	}

	getHeaderArray(csvRecordsArr: any) {
		let headers = (<string>csvRecordsArr[0]).split(',');
		let headerArray: never[] = [];
	
		return headerArray;
	}

	getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
		let csvArr: any = [];

		for (let i = 1; i < csvRecordsArray.length; i++) {
			let curruntRecord = (<string>csvRecordsArray[i]).split(',');
			if (curruntRecord.length == headerLength) {
				let csvRecord: CSVRecord = new CSVRecord();
				csvRecord.Name = curruntRecord[0].trim();
				csvRecord.Phone_number = curruntRecord[2].trim();
				csvRecord.emailId = curruntRecord[1].trim();
				csvRecord.status = curruntRecord[4].trim();
				csvRecord.sex = curruntRecord[3].trim();
				csvRecord.state = curruntRecord[6].trim();
				csvRecord.Country = curruntRecord[7].trim();
				csvRecord.tag = curruntRecord[5].trim()
				csvRecord.uid = curruntRecord[8].trim();
				csvRecord.sp_account_id = curruntRecord[12].trim();
				csvRecord.age = curruntRecord[14].trim();
				csvRecord.address = curruntRecord[11].trim();
				csvRecord.pincode = curruntRecord[9].trim();
				csvRecord.city = curruntRecord[10].trim();
				csvRecord.OptInStatus = curruntRecord[13].trim();
				csvRecord.facebookId = curruntRecord[15].trim();
				csvRecord.InstagramId = curruntRecord[16].trim();
				csvArr.push(csvRecord);
			}

			

		}
		return csvArr;
	}

	getUpdateFields(event: any, data: any) {
		
		this.fields.push(data);
		
	}
	previous() {
		this.stepper.previous();
	}
	updateAndSave() {
		
		var Data = {
			data: this.records,
			field: this.fields,
			identifier: this.selectedIdentifier
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


	updatedDataCount() {
		console.log("update count" +this.records.length)
		this.apiService.updatedDataCount(this.records).subscribe((data: any) => {
			this.countUpdatedData = data.count
			console.log(" get data " + data.count)

		})

	}


}