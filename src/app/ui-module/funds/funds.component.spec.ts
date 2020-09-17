import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { FundsComponent } from './funds.component';
import {FundsService} from '../../app-services/funds/funds.service';
import {ExcelService} from '../../app-services/excel/excel.service';
import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { of } from 'rxjs';

describe('FundsComponent', () => {
  let component: FundsComponent;
  let fixture: ComponentFixture<FundsComponent>;
  let service: FundsService;
  let excelService: ExcelService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundsComponent ],
      imports: [HttpClientTestingModule],
      providers : [FundsService, ExcelService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundsComponent);
    service = TestBed.get(FundsService);
    excelService = TestBed.get(ExcelService);
    component = fixture.componentInstance;
    /* component.fundReturnsForm = new FormGroup({
      schemeNumber: ,
      periodOfInvest: ,
      horizon: 
    });  */
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test except data', function() {
    var fundReturnsFormValue:any = {};    
    var isdownload = true;
    fundReturnsFormValue.schemeNumber = 102885;
    fundReturnsFormValue.periodOfInvest = 5;
    fundReturnsFormValue.horizon = 5;
    var res:any = {};
    res.data = {};
    res.meta = {};
    res.meta.scheme_name = 'sbi';
    res.meta.scheme_code =' 010';
    spyOn(service, 'getFundSchemeDetails').withArgs(102885). and.returnValue(of(res));
    spyOn(excelService, 'exportJsonAsExcelFile').withArgs(res.data, res.meta.scheme_name+ '-' + res.meta.scheme_code). and.returnValue();
    component.generateData(fundReturnsFormValue,isdownload);
    expect(component.returns.schemeNumber).toBe(102885);
    expect(component.fundDetails.meta.scheme_name).toBe('sbi');
  });

  it('test generate data', function() {
    var fundReturnsFormValue:any = {};    
    var isdownload = false;
    fundReturnsFormValue.schemeNumber = 102885;
    fundReturnsFormValue.periodOfInvest = 1;
    fundReturnsFormValue.horizon = 1;
    var res:any = {};
    res.data = {};
    res.meta = {};
    res.meta.scheme_name = 'sbi';
    res.meta.scheme_code =' 010';
    spyOn(service, 'getFundSchemeDetails').withArgs(102885). and.returnValue(of(res));
    component.generateData(fundReturnsFormValue,isdownload);
    expect(component.isDataAvailable).toBe(false);
  });
  it('test fund data', function() {
    var download = false;
    var res:any = {};
    res.data = [{ "date": "16-09-2020", "nav": "142.44650" },
    { "date": "15-09-2020", "nav": "141.71140" },
    { "date": "14-09-2020", "nav": "141.07170" },
    { "date": "11-09-2020", "nav": "140.96200" }, 
    { "date": "10-09-2020", "nav": "140.82000" },
     { "date": "09-09-2020", "nav": "139.54780" }, 
     { "date": "08-09-2020", "nav": "140.34460" }, 
     { "date": "07-09-2020", "nav": "141.33770" }, 
     { "date": "04-09-2020", "nav": "141.82750" }, 
     { "date": "03-09-2020", "nav": "143.66520" }, 
     { "date": "02-09-2020", "nav": "143.83990" }, 
     { "date": "01-09-2020", "nav": "142.92040" }, 
     { "date": "31-08-2020", "nav": "141.56170" }, 
     { "date": "28-08-2020", "nav": "144.80530" }, 
     { "date": "20-10-2019", "nav": "143.60270" }, 
     { "date": "26-08-2020", "nav": "143.41250" }, 
     { "date": "25-08-2020", "nav": "143.22440" }];
     component.returns.schemeNumber = 102885;
     component.returns.horizon = 1;
     component.returns.periodOfInvest = 1;
    spyOn(service, 'getFundSchemeDetails').withArgs(component.returns.schemeNumber). and.returnValue(of(res));
    component.getCalculatedFund(download);
  });
});


