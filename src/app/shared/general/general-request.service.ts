import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QueryService } from '../nieOS/mongodb/query/query.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralRequestService {
  params: any;
  constructor(private http: HttpClient, private queryService: QueryService) { }

  request(queryID) {
    return this.queryService.getQuery(queryID)
      .flatMap(data => {
          const query = data.query;

          switch (query.method) {
            case 'GET':
              return this.get(query.serverUrl, data.query.params, query.header);
            case 'POST':
              return this.post(query.serverUrl, data.query.params, query.header, query.body);
            case 'PUT':
              return this.put(query.serverUrl, data.query.params, query.header, query.body);
            case 'DELETE':
              return this.delete(query.serverUrl, data.query.params, query.header);
          }
      });
  }

  transformParam(parameter: any[]) {
    let param = new HttpParams();
    for (const i of parameter) {
      param = param.append(i.key, i.value);
    }
    return param;
  }

  get(url: string, parameter?: any, header?: any): Observable<any> {
    // console.log('GET Request', url, parameter, header);
    return this.http.get(url, {headers: header, params : this.transformParam(parameter), observe: 'response'});
  }

  post(url: string, parameter?: any, header?: any, body?: string): Observable<any> {
    // console.log('POST Request', url, parameter, header, body);
    return this.http.post(url, body, {params: this.transformParam(parameter), headers: header, observe: 'response'});
  }

  put(url: string, parameter?: any, header?: any, body?: string): Observable<any> {
    // console.log('PUT Request', url, parameter, header, body);
    return this.http.put(url, body, {params: this.transformParam(parameter), headers: header, observe: 'response'});
  }

  delete(url: string, parameter?: any, header?: any): Observable<any> {
    // console.log('DELETE Request', url, parameter, header);
    return this.http.delete(url, {params: this.transformParam(parameter), headers: header, observe: 'response'});
  }
}
