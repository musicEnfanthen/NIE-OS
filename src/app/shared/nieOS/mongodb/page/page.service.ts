import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PageService {
  private static API_BASE_URL_PAGE = 'http://localhost:3000/api/pages';
  private static API_BASE_URL_PAGE_SET = 'http://localhost:3000/api/pagesets';

  constructor(
    private http: HttpClient
  ) {}

  createPage(pageSetID: string, page: any): Observable<any> {
    return this.http.post(`${PageService.API_BASE_URL_PAGE_SET}/${pageSetID}/pages`, page);
  }

  getPage(pageId: string): Observable<any> {
    return this.http.get(`${PageService.API_BASE_URL_PAGE}/${pageId}`);
  }

  getAllPages(): Observable<any> {
    return this.http.get(`${PageService.API_BASE_URL_PAGE}`);
  }

  updatePage(page: any): Observable<any> {
    console.log(page);
    const openAppAsStringArray = [];
    for ( const openApp in page.openApps) {
      if( page.openApps[openApp].type !== 'dataChooser' ) {
        openAppAsStringArray[ openAppAsStringArray.length ] = JSON.stringify(page.openApps[openApp]);
      }
    }
    const mappingsAsStringArray = [];
    for (const mapping in page.appInputQueryMapping) {
      page.appInputQueryMapping[mapping][ 'app' ] = mapping;
      mappingsAsStringArray[ mappingsAsStringArray.length ] = JSON.stringify(page.appInputQueryMapping[mapping]);
    }
    page.appInputQueryMapping = mappingsAsStringArray;
    page.openApps = openAppAsStringArray;
    console.log( page );
    return this.http.put(`${PageService.API_BASE_URL_PAGE}/${page._id}`, page);
  }

  updatePageOfPageSet(pageSetID: string, page: any): Observable<any> {
    return this.http.put(`${PageService.API_BASE_URL_PAGE_SET}/${pageSetID}/pages/${page.id}`, page, {observe: 'response'});
  }

  deletePageOfPageSet(pageSetID: string, pageID: string): Observable<any> {
    return this.http.delete(`${PageService.API_BASE_URL_PAGE_SET}/${pageSetID}/pages/${pageID}`, {observe: 'response'});
  }

}
