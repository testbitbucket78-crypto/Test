import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { holidayData, monthData, workingData, workingDataResponse, workingDataResponsePost, workingFormData } from '../../models/settings.model';
import { time } from 'console';
import { SettingsService } from '../../services/settings.service';
import { isNullOrUndefined } from 'is-what';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $:any;

@Component({
  selector: 'sb-working-hours',
  templateUrl: './working-hours.component.html',
  styleUrls: ['./working-hours.component.scss'],
  encapsulation:ViewEncapsulation.Emulated
})
export class WorkingHoursComponent implements OnInit {
  daysList=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  //daysList=[{day:'Monday',isDisabled: false},{day:'Tuesday',isDisabled: false},{day:'Wednesday',isDisabled: false},{day:'thursday',isDisabled: false},{day:'Friday',isDisabled: false},{day:'Saturday',isDisabled: false},{day:'Saturday',isDisabled: false}];
  dropdownSettings = {
    singleSelection: false,
    idField: 'day',
    textField: 'day',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3
};

totalmonths:monthData[]=[{monthName:'Jaunary',values:[]},{monthName:'Febraury',values:[]},{monthName:'March',values:[]},{monthName:'April',values:[]},{monthName:'May',values:[]},{monthName:'June',values:[]},{monthName:'July',values:[]},{monthName:'August',values:[]},{monthName:'September',values:[]},{monthName:'October',values:[]},{monthName:'November',values:[]},{monthName:'December',values:[]}];
sp_Id:number;
workingData:workingData[]=[];
workingFormData:workingFormData[]=[];
workingHourForm!:FormGroup;
selectedMonth!:number;
selectedYear:number = 0;
monthDates:any[] =[];
selectedDates:number[] =[];
yearList:number[] =[];
selectedPeriods: string[] = ['AM', 'PM'];
holidayTooltip!: boolean;
errorMessage = '';
successMessage = '';
warningMessage = '';
    constructor(private _settingsService: SettingsService, private datepipe: DatePipe, private modalService: NgbModal) { 
    this.sp_Id = Number(sessionStorage.getItem('SP_ID'));
    this.selectedYear =new Date().getFullYear();
   }

  ngOnInit(): void {
    this.workingHourForm = this.prepareCompanyForm();
    this.getWorkingDetails();
    this.getHolidayDetails();
    this.getYearData();
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
    this.workingFormData.push({day:[],startTime:'',endTime:'', selectedPeriod: ''})
  }

  removeWorkingHours(index:any){
    this.workingFormData.splice(index,1);
  }

  getWorkingDetails(){
    this._settingsService.getWorkingData(this.sp_Id)
    .subscribe(result =>{
      if(result){
        this.workingData = result?.result;
        console.log(result);
        
      }

    })
  }

  getHolidayDetails(){
    let fromDate = new Date(this.selectedYear,0,1);
    let toDate = new Date(this.selectedYear,12,0);
    this._settingsService.getHolidayData(this.sp_Id,'2024-1-1','2024-12-31')
    .subscribe((result:any) =>{
      if(result){
        let HolidayList = result?.HolidayList;
        HolidayList.forEach((item:any)=>{
          let month  = new Date(item.holiday_date).getMonth();
          console.log(item.holiday_date);
          console.log(month);
          this.totalmonths[month].values.push(item?.holiday_date);
        })
        console.log(this.totalmonths);
        
      }

    })
  }

  saveWorkingDetails(){
    let workingResponse = this.copyFormValues();
    this._settingsService.saveWorkingData(workingResponse)
    .subscribe(result =>{
      if(result){
        console.log(result);
        this.getWorkingDetails();
        $("#workingHourModal").modal('hide');
        //this.workingData = result?.result;
      }
    })
  }

  deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (let key of keys1) {
      if (!keys2.includes(key) || !this.deepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
  }
  
  haveCommonObjects(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let item1 of arr1) {
      let foundMatch = false;
      for (let item2 of arr2) {
        if (this.deepEqual(item1, item2)) {
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) return false;
    }
    return true;
  }

  ValidateWorkingDetails(){
    let newData = this.copyFormValues()["days"];
    let oldData = this.workingData;
    const mapData = (data: any[], isNewData = false) =>
      data.map(item => ({
        start_time: isNewData ? item.startTime : item.start_time,
        end_time: isNewData ? item.endTime : item.end_time,
        working_days: isNewData ? item.day : item.working_days
      }));
    const filteredOlderData = mapData(oldData);
    const filteredNewData = mapData(newData, true);
    const isSame = this.haveCommonObjects(
      filteredOlderData,
      filteredNewData
    )
    // If data is updated
    if(!isSame){
      $("#confirmModal").modal('show');
      $("#workingHourModal").modal('hide');
    } else{
      $("#workingHourModal").modal('hide');
    }
  }
  openModal(): void {
    $("#workingHourModal").modal('show');
  }

    saveHolidayDetails(){
    let holidayResponse = this.copyHolidayData();
    this._settingsService.saveHolidayData(holidayResponse)
    .subscribe(result =>{
      if(result){
          console.log(result);
         this.totalmonths.forEach(month => month.values = []);
        this.getHolidayDetails();
        $("#holidayModal").modal('hide');
      }
    })
  }


  copyHolidayData(){
    let holidayResponse:holidayData =<holidayData>{};
    holidayResponse.SP_ID = this.sp_Id;
    holidayResponse.holiday_date =[];
    this.monthDates.forEach(item =>{
      if(item.selected)
      holidayResponse.holiday_date.push(item.completeDate);
    })
    return holidayResponse
  }

  copyFormValues(){
    let workingResponse:workingDataResponsePost = <workingDataResponsePost>{};
    workingResponse.SP_ID = this.sp_Id;
    workingResponse.days = [];
    this.workingFormData.forEach(item=>{
      if(item.day?.length >0){
        let st = this.datepipe.transform(new Date(new Date(new Date().setHours(Number(item?.startTime.split(':')[0]),Number(item?.startTime.split(':')[1])))),'HH:mm a');
        let et = this.datepipe.transform(new Date(new Date(new Date().setHours(Number(item?.endTime.split(':')[0]),Number(item?.endTime.split(':')[1])))),'HH:mm a');
      workingResponse.days.push({day:item.day.toString(),startTime:st ? st :'',endTime:et ? et :''});
      }
    });
    return workingResponse;
  }

  manageWorkingHour(){
    this.workingFormData =[];
    if(isNullOrUndefined(this.workingData) || this.workingData.length==0)
    this.addWorkingHours();
    else
    this.workingData.forEach(item=>{
        this.workingFormData.push({ day: item.working_days != '' ? item.working_days.split(',') : [], startTime: item.start_time.split(' ')[0], endTime: item.end_time.split(' ')[0],selectedPeriod:item.selectedPeriod})
    })
  }
    createDynamicDate(month: any) {
     if (!this.validation(month)) {
         this.showToaster('You can Add or Edit holidays only for the future dates.', 'error');
         return;
     }

    this.monthDates =[];
    this.selectedMonth = month;
    let endDate = new Date(this.selectedYear,this.selectedMonth,0);
    let startDate = new Date(this.selectedYear,this.selectedMonth-1,1);
    this.addEmptyDate(1,startDate.getDay());
    for(let i=1;i<=endDate.getDate(); i++){
      let date = `${this.selectedYear}-${this.selectedMonth}-${i}`
      this.monthDates.push({onlyDate:i,completeDate:date,selected:false});
        }
        this.getselectedDataByMonth(month);
        this.addEmptyDate(endDate.getDay(), 7);
        $("#holidayModal").modal('show');
    }

    validation(month: any) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        if (this.selectedYear < currentYear) {
            return false;
        } else if (this.selectedYear == currentYear && month < currentMonth) {
            return false;
        }
        return true;
    }
    getselectedDataByMonth(month: any) {
        const monthIndex = month - 1;
        const choosedMonth = this.totalmonths[monthIndex];
        this.monthDates.forEach((date: any) => {
            if (date.completeDate != 0) { 
            const dateStringParts = date.completeDate.split('-');
            const dateString = `${dateStringParts[0]}-${dateStringParts[1].padStart(2, '0')}-${dateStringParts[2].padStart(2, '0')}`;
            let foundMatch = false;

            choosedMonth.values.forEach((value: any) => {
                const valueDate = new Date(value).toISOString().substr(0, 10);

                if (dateString === valueDate) {
                    date.selected = true;
                    foundMatch = true;
                }
            });

            if (!foundMatch) {
                date.selected = false;
            }
        }
        });
    }

   addEmptyDate(start:any,end:any){
    for(let i =start;i<end; i++){
      this.monthDates.push({onlyDate:0,completeDate:0,selected:false});
    }
   }

    selectDates(idx: number) {
        if (!this.validatedate(idx)) {
            this.showToaster('You can Add or Edit holidays only for the future dates.', 'error');
            return;
        }

      this.monthDates[idx].selected = !this.monthDates[idx].selected;
    }
    validatedate(idx: any) {
        const selectedDate = new Date(this.monthDates[idx].completeDate); 
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (selectedDate < currentDate) {
            return false; 
        }
        return true;
    }
  
   getYearData(){
    for(let i=2024;i<=2050;i++){
      this.yearList.push(i);
    }
    }
    closeUtility() {
        this.holidayTooltip = false;
    }
    timinginfo(event: any) {
        this.holidayTooltip = !this.holidayTooltip;
    }
    stopPropagation(event: Event) {
        event.stopPropagation();
    }

    showToaster(message: any, type: any) {
        if (type == 'success') {
            this.successMessage = message;
        } else if (type == 'error') {
            this.errorMessage = message;
        } else {
            this.warningMessage = message;
        }
        setTimeout(() => {
            this.hideToaster()
        }, 5000);

    }
    hideToaster() {
        this.successMessage = '';
        this.errorMessage = '';
        this.warningMessage = '';
    }
    
}
