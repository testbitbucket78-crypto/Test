import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { workingData } from '../../models/settings.model';
import { time } from 'console';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'sb-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss']
})
export class WorkingHoursComponent implements OnInit {

  daysList=[{day:'Monday',isDisabled: false},{day:'Tuesday',isDisabled: false},{day:'Wednesday',isDisabled: false},{day:'thursday',isDisabled: false},{day:'Friday',isDisabled: false},{day:'Saturday',isDisabled: false},{day:'Saturday',isDisabled: false}];
  dropdownSettings = {
    singleSelection: false,
    idField: 'day',
    textField: 'day',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3
};
sp_Id:number;
workingData:workingData[]=[];
workingHourForm!:FormGroup;

  constructor(private _settingsService:SettingsService) { 
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
   }

  ngOnInit(): void {
    this.workingHourForm = this.prepareCompanyForm();
    this.addWorkingHours();
    this.getWorkingDetails();
  }

  prepareCompanyForm(){
    return new FormGroup({
    days:new FormControl(),
    startTime:new FormControl(),
    endTime:new FormControl()
    });
  }

  addWorkingHours(){
    console.log(this.workingData);
    this.workingData.push({days:[],startTime:'',endTime:''})
  }

  removeWorkingHours(index:any){
    this.workingData.splice(index,1);
  }

  getWorkingDetails(){
    this._settingsService.getWorkingData(this.sp_Id)
    .subscribe(result =>{
      if(result){
        console.log(result);
        //this.workingData = result;
      }

    })
  }

}
