import { Component, OnInit,ViewChild  } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {FundsService} from '../../app-services/funds/funds.service';
import {ExcelService} from '../../app-services/excel/excel.service';
import { debounceTime, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-funds',
  templateUrl: './funds.component.html',
  styleUrls: ['./funds.component.css']
})

export class FundsComponent implements OnInit {
  fundReturnsForm: FormGroup;
  months= ['Jan','Feb','Mar', 'April','May','June','July','Aug','Sep','Oct','Nov','Dec'];
  details: any = {};
  alert = new Subject<string>();
  fundDetailedInfo: any = [];
  alertMessage: string;
  isDataAvailable = false;  
  mutualFundDetails:any ={};
  isSuccess = false;
  constructor(private fundsService: FundsService , private excelService : ExcelService,private spinner: NgxSpinnerService) { }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['month', 'returns', 'calculations','nav','nearestAvailableDate'];
  dataSource: any = [];
  fundDetails: any =[];
  returns: any = {};
  isBreak = false;
  
  ngOnInit() {
      this.fundReturnsForm = new FormGroup({
      schemeNumber: new FormControl('', [Validators.required, Validators.maxLength(15),Validators.pattern("^[0-9]*$")]),
      periodOfInvest: new FormControl('', [Validators.required,Validators.maxLength(3),Validators.pattern("^[0-9]*$")]),
      horizon: new FormControl('', [Validators.required, Validators.maxLength(3),Validators.pattern("^[0-9]*$")])
    }); 
    this.alert.subscribe((message) => this.alertMessage = message);
    this.alert.pipe(
      debounceTime(7000)
    ).subscribe(() => this.alertMessage = null);
  }

  ngAfterViewInit(){
    this.dataSource.sort = this.sort;  
    this.dataSource.paginator = this.paginator; 
  }

  hasError(controlName: string, errorName: string) {
    return this.fundReturnsForm.controls[controlName].hasError(errorName);
  }

  resetData() {
    this.spinner.hide();  
    this.fundReturnsForm.reset();
    this.fundReturnsForm.markAsPristine();
    this.fundReturnsForm.markAsUntouched();
    this.isDataAvailable = false;    
  }

  generateData(fundReturnsFormValue,isdownload = false) {    
    this.spinner.show();
    if (this.fundReturnsForm.valid || isdownload) {
      this.returns = {
        schemeNumber: fundReturnsFormValue.schemeNumber,
        periodOfInvest: fundReturnsFormValue.periodOfInvest,
        horizon: fundReturnsFormValue.horizon
      }   
      this.dataSource.sort = this.sort;  
      this.dataSource.paginator = this.paginator;    
      this.getCalculatedFund(isdownload);
    }
  }

  getCalculatedFund(isdownload){
    this.fundDetailedInfo  = [];    
    this.fundsService.getFundSchemeDetails(this.returns.schemeNumber).pipe(first()).subscribe(
      data => {  
        this.fundDetails = data;          
        if(!isdownload) {
         this.isDataAvailable = true;
         if(this.fundDetails.data.length > 0 ){
         this.fundCalculation();
         } else {
          this.alert.next('Details not available for the scheme No ' + '-' + this.returns.schemeNumber);
          this.isSuccess = false;
          this.dataSource = [];
          this.spinner.hide();
        }
        } else {
          if(this.fundDetails.data.length > 0 ){
          this.excelService.exportJsonAsExcelFile(this.fundDetails.data,this.fundDetails.meta.scheme_name + '-' + this.fundDetails.meta.scheme_code);     
          this.alert.next('Exported Successfully');
          this.isSuccess = true;
          this.spinner.hide(); 
           } else {
           this.alert.next('Data not available to export for this scheme Number');
            this.isSuccess = false;
            this.spinner.hide(); 
          }
        }
        });    
  }

  fundCalculation(){    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();  
    const currentYear =  currentDate.getFullYear();  
    const date =  (currentDate.getDate().toString().length === 1) ? ('0'+currentDate.getDate()) : (currentDate.getDate());  
    const horizon = parseInt(this.returns.horizon);  
    const month = currentMonth + 1;  
    const horizonStart = currentYear- horizon;  
    const periodOfInvest = parseInt(this.returns.periodOfInvest);  
    let j = 0;  
    let monthEvaluate;  
    let length; 
    console.log(currentYear);
    console.log(horizon);
    console.log(horizonStart);
    // to start from current month for the first year in period of invest
    for(let i=horizonStart; i<=currentYear;i++){  
      if(j === 0) {  
        monthEvaluate = month;        
      } else {  
        monthEvaluate = 0  
      }  
      if(i === currentYear){  
      length = currentMonth  
      }  
      else {  
      length = this.months.length;  
      }
      // determine the data to load in grid based on horizon and period of invest
      for(let k = monthEvaluate; k<length; k++){      
        this.details = {};      
        this.details.month = this.months[k] + '-' + i;  
        this.details.startDate = date + '-' + this.months[k] + '-' + (i - periodOfInvest);  
        this.details.endDate = date + '-' + this.months[k] + '-' + i;  
        this.details.filteredStartDate = date + '-' + ((k.toString().length === 1 && k !== 9)? ('0'+ (k+1)): (k+1)) + '-' + (i - periodOfInvest);  
        this.details.filteredEndDate = date + '-' + ((k.toString().length === 1 && k !== 9)? ('0'+(k+1)): (k+1)) +  '-' + i;  
        this.details.limitStartDate = new Date(this.details.filteredStartDate.split('-')[1] + '-' + this.details.filteredStartDate.split('-')[0]
        + '-' + this.details.filteredStartDate.split('-')[2]);  
        this.details.limitEndDate =  new Date(this.details.filteredEndDate.split('-')[1] + '-' + this.details.filteredEndDate.split('-')[0]
        + '-' + this.details.filteredEndDate.split('-')[2]);  
        this.calculateNav(this.details.filteredStartDate,true);
        this.calculateNav(this.details.filteredEndDate,false);
        this.details.nav = (this.details.nav !== 0) ? ((((Math.pow(this.details.end/this.details.start,(1/periodOfInvest))-1) * 100).toFixed(2)) +'%') : 0;
        // this.details.nav = (this.details.nav === 0) ? 0 : (this.details.nav + '%'); 
        this.fundDetailedInfo.push(this.details);
      }  
      j++;
   }  
    console.log(this.fundDetailedInfo);  
    this.loadData();  
  }

  //calculate Nav data for specific start and end date checking next and previous date for nav data if not available
  calculateNav(date,isStart){
    this.isBreak = false;
    const i = 0;
    let existingData =this.fundDetails.data.filter(x =>x.date === date);
    let navData;
    if(existingData.length > 0){
      navData = existingData[i].nav;
      } else {
      let newDate;let newFormatDate; let splitDate;
      splitDate = date.split('-');
      newDate = (splitDate.length === 3) ? (splitDate[1] + '-' + splitDate[0] + '-' + splitDate[2]) : 'error';
      newFormatDate = new Date(newDate);
      if(isStart){             
      newFormatDate.setDate(newFormatDate.getDate() + 1);    
    } else {      
       newFormatDate.setDate(newFormatDate.getDate() - 1);      
       }    
       let newFormatMonth =  newFormatDate.getMonth();
       date = ((newFormatDate.getDate().toString().length ===1) ? ('0'+ newFormatDate.getDate()) : (newFormatDate.getDate())) 
       + '-' + ((newFormatMonth.toString().length === 1 && newFormatMonth !==9)? ('0'+(newFormatDate.getMonth() +1)): (newFormatDate.getMonth() +1))+ '-' + newFormatDate.getFullYear();
       console.log(date);
     if(newDate!=='error' && newDate!== undefined){
       let newFilteredData =this.fundDetails.data.filter(x =>x.date === date);
       if(newFilteredData.length > 0) {
         navData = newFilteredData[i].nav;         
        } else {
        // check the first available date start date from excel and validate accordingly if nav is start nav directly assign the first value in excel
        //if date lies in range and less than start date in excel eg - 2000 - 2010 -> excel start date is 2008 donot loop it from 2000 to 2008 for available
        //nav just set the first start date as date and validating in the scenerio
          let limitDate = new Date(date.split('-')[1] + '-' +date.split('-')[0] + '-' + date.split('-')[2]);
          if(limitDate >= this.details.limitStartDate && limitDate <=this.details.limitEndDate){
          let availableStart = this.fundDetails.data[0].date//data be available as method is triggerred if dat is available
          let availableEnd = this.fundDetails.data[this.fundDetails.data.length - 1].date;
          let dateFormatStart = new Date(availableStart.split('-')[1] + '-' + availableStart.split('-')[0] + '-' + availableStart.split('-')[2]);
          let dateFormatEnd= new Date(availableEnd.split('-')[1] + '-' + availableEnd.split('-')[0] + '-' + availableEnd.split('-')[2]);
          let fixedStartDate = dateFormatEnd < dateFormatStart ? dateFormatEnd : dateFormatStart;
          if((fixedStartDate > limitDate)) {
            if(isStart){
            limitDate = fixedStartDate;
            date = ((fixedStartDate.getDate().toString().length ===1) ? ('0'+ fixedStartDate.getDate()) : (fixedStartDate.getDate())) 
            + '-' + ((fixedStartDate.getMonth().toString().length === 1 && fixedStartDate.getMonth() !==9)? ('0'+(fixedStartDate.getMonth() +1)): (fixedStartDate.getMonth() +1))+ '-' + fixedStartDate.getFullYear();
            console.log(date);            
          } else {
            this.alert.next('Data not available for given horizon and the data is only available from ' + fixedStartDate + ' ' + 'onwards.');
            this.isSuccess = false;
            this.isDataAvailable = false;
            return;
          } 
        }
          this.calculateNav(date,isStart);
        } 
        else{
          this.details.nav = 0;
          this.details.start = 0;
          this.details.end = 0;
          this.details.navAvailableStart = 'NA';          
          this.details.navAvailableEnd = 'NA'; 
          return;
        }
        }         
       }
   } 
   
   if(isStart) {
     if(navData!=undefined){
     this.details.start = (parseFloat(navData)).toFixed(2); 
     this.details.navAvailableStart = date.split('-')[0] + '-' +this.months[(parseInt((date.split('-')[1])) - 1)]+ '-'+date.split('-')[2] ;
     }
    } else {
      if(navData!=undefined){
      this.details.end = (parseFloat(navData)).toFixed(2);
      this.details.navAvailableEnd = date.split('-')[0] + '-' + this.months[(parseInt((date.split('-')[1])) - 1)]+ '-'+ date.split('-')[2] ;  
      }
    }  
}

  loadData () {
    this.dataSource = new MatTableDataSource(this.fundDetailedInfo); 
    this.spinner.hide();    
    setTimeout(() => {
    this.dataSource.sort = this.sort;  
    this.dataSource.paginator = this.paginator; 
    }, 10);    
  }

  downloadData(details){
  this.generateData(details,true);
  }
}
