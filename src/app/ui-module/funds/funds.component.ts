import { Component, OnInit,ViewChild  } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {FundsService} from '../../app-services/funds/funds.service';
import {ExcelService} from '../../app-services/excel/excel.service';
import { debounceTime, first } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  constructor(private fundsService: FundsService , private excelService : ExcelService) { }
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['month', 'returns', 'calculations','nav','nearestAvailableDate'];
  dataSource: any = [];
  fundDetails: any =[];
  returns: any = {};
  
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
    this.fundReturnsForm.reset();
    this.fundReturnsForm.markAsPristine();
    this.fundReturnsForm.markAsUntouched();
    this.isDataAvailable = false;
  }

  generateData(fundReturnsFormValue,isdownload = false) {    
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
        }
        } else {
          if(this.fundDetails.data.length > 0 ){
          this.excelService.exportJsonAsExcelFile(this.fundDetails.data,this.fundDetails.meta.scheme_name + '-' + this.fundDetails.meta.scheme_code);     
          this.alert.next('Exported Successfully');
          this.isSuccess = true;
           } else {
           this.alert.next('Data not available to export for this scheme Number');
            this.isSuccess = false;
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
        this.calculateNav(this.details.filteredStartDate,true);
        this.calculateNav(this.details.filteredEndDate,false);
        this.details.nav = ((Math.pow(this.details.end/this.details.start,(1/periodOfInvest))-1) * 100).toFixed(2);
        this.details.nav = (this.details.nav === 0) ? 0 : (this.details.nav + '%');
        this.fundDetailedInfo.push(this.details);
      }  
      j++;
   }  
    console.log(this.fundDetailedInfo);  
    this.loadData();  
  }

  //calculate Nav data for specific start and end date checking next and previous date for nav data if not available
  calculateNav(date,isStart){
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
        // navData = 0;
        if(this.details.filteredEndDate!==date){
        this.calculateNav(date,isStart);
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
      this.details.navAvailableEnd = date.split('-')[0] + '-' + this.months[(parseInt((date.split('-')[1])) - 1)]+ '-'+ date.split('-')[2] ;;  
      }
    }
  }

  loadData () {
    this.dataSource = new MatTableDataSource(this.fundDetailedInfo);     
    setTimeout(() => {
    this.dataSource.sort = this.sort;  
    this.dataSource.paginator = this.paginator; 
    }, 10);    
  }

  downloadData(details){
  this.generateData(details,true);
  }
}
