import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http'
import { environment } from '../../../../src/environments/environment';
import {catchError} from 'rxjs/operators'
import { Observable,of } from 'rxjs';

const apiUrl = environment.apiSchemeUrl;
@Injectable({
  providedIn: 'root'
})

export class FundsService {
  private httpOptions: any;
  constructor(private http: HttpClient) { }
  
  getFundSchemeDetails(schemeId){
    return this.http.get<any>(apiUrl + '/mf/' +schemeId, this.httpOptions)
    .pipe(catchError(this.handleError<any>('schemeDetails')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      if (error.status === 400 || error.status === 'FAILURE') {
        console.log('ERROR 400: ', error);
        throw error;
      } else if (error.status === 401) {
        console.log('ERROR 401: ', error);
        throw error;
      } else if (error.status === 404) {
        console.log('ERROR 404: ', error);
        throw error;
      }
      //  TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      //  TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      //  Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
