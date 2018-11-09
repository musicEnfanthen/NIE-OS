import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Action } from './action.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MongoActionService {
  private static API_BASE_URL = 'http://localhost:3000/api/action';
  actions: any;

  constructor(
    private http: HttpClient,
  ) {}

  createAction(action: Action): Observable<any> {
    return this.http.post(`${MongoActionService.API_BASE_URL}`, action);
  }

  getAction(id: string): Observable<any> {
    return this.http.get(`${MongoActionService.API_BASE_URL}/${id}`);
  }

  getAllActions(): Observable<any> {
    return this.http.get<{message: string, actions: any}>(`${MongoActionService.API_BASE_URL}`);
  }

  updateAction(action: Action): Observable<any> {
    return this.http.put(`${MongoActionService.API_BASE_URL}`, action);
  }

  deleteAction(id: string): Observable<any> {
    return this.http.delete(`${MongoActionService.API_BASE_URL}/${id}`);
  }

}
