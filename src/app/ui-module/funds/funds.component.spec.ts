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
    fundReturnsFormValue.periodOfInvest = 5;
    fundReturnsFormValue.horizon = 5;
    var res:any = {};
    res.data = {};
    res.meta = {};
    res.meta.scheme_name = 'sbi';
    res.meta.scheme_code =' 010';
    spyOn(service, 'getFundSchemeDetails').withArgs(102885). and.returnValue(of(res));
    // spyOn(excelService, 'exportJsonAsExcelFile').withArgs(res.data, res.meta.scheme_name+ '-' + res.meta.scheme_code). and.returnValue();
    // component.getCalculatedFund(false);
    component.fundCalculation();
    component.calculateNav("29-02-2012",true);
    // component.calculateNav("25-02-2020",true);
    // component.loadData();
    expect(component.isDataAvailable).toBe(false);
  });
});


