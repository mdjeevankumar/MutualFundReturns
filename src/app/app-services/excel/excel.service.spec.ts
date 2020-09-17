import { TestBed } from '@angular/core/testing';

import { ExcelService } from './excel.service';

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelService);
  });

  it('test service data', function() {
    var data = [{ "date": "16-09-2020", "nav": "142.44650" },
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
    service.exportJsonAsExcelFile(data,'docs')
  });
  it('test service error data', function() {
    service.exportTableAsExcelFile( null,'docs')
  });
  

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
