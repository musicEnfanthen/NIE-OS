

/**
 * Manual: How to add an app:
 * 1. Import the Component or Module in nie-OS.module.ts
 * 2. Add the app to the Model "openAppsInThisPage" in this file
 * 3. Add this app to the "Menu to open Apps" - div in nie-OS.component.html
 * 4. Add an app div by copying and pasting one of the existing divs and adjusting the input variables and the selector
 * */

import {AfterViewChecked, ChangeDetectorRef, Component, NgModule, OnInit, VERSION} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Popup} from './popup';
import 'rxjs/add/operator/map';
import { ActivatedRoute } from '@angular/router';
import { ActionService } from '../../shared/nieOS/fake-backend/action/action.service';
import { PageService } from '../apps/page/page.service';
import {GenerateHashService} from "../../shared/nieOS/other/generateHash.service";
import {OpenAppsModel} from '../../shared/nieOS/mongodb/page/open-apps.model';
import {MongoPageService} from '../../shared/nieOS/mongodb/page/page.service';
import {MongoActionService} from '../../shared/nieOS/mongodb/action/action.service';

declare var grapesjs: any; // Important!


@Component({
  selector: 'nie-os',
  templateUrl: `nie-OS.component.html`,
})
export class NIEOSComponent implements OnInit, AfterViewChecked {
  image = {
    '@id' : 'https://www.e-manuscripta.ch/zuz/i3f/v20/1510612/canvas/1510618',
    '@type' : 'knora-api:StillImageFileValue',
    'knora-api:fileValueAsUrl' :
      'https://www.e-manuscripta.ch/zuz/i3f/v21/1510618/full/1304/0/default.jpg',
    'knora-api:fileValueHasFilename' : '1510618',
    'knora-api:fileValueIsPreview' : false,
    'knora-api:stillImageFileValueHasDimX' : 3062,
    'knora-api:stillImageFileValueHasDimY' : 4034,
    'knora-api:stillImageFileValueHasIIIFBaseUrl' : 'https://www.e-manuscripta.ch/zuz/i3f/v20'
  };
  projectIRI: string = 'http://rdfh.ch/projects/0001';
  actionID: string;
  length: number;
  page: any;
  action: any;
  panelsOpen = false;
  viewHashFromURL: string;
  openAppsInThisPage: any;
  pageAsDemo = false;

  constructor(
    private route: ActivatedRoute,
    private actionService: ActionService,
    private pageService: PageService,
    private cdr: ChangeDetectorRef,
    private generateHashService: GenerateHashService,
    private openApps: OpenAppsModel,
    private mongoPageService: MongoPageService,
    private mongoActionService: MongoActionService
  ) {
    this.route.params.subscribe(params => console.log(params));
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
    if ( this.viewHashFromURL !==  this.route.snapshot.queryParams.view ) {
      this.openAppsInThisPage = this.openApps.openApps;
      this.page = {};
      this.actionID = this.route.snapshot.queryParams.actionID;
      this.viewHashFromURL = this.route.snapshot.queryParams.view;
      if ( this.viewHashFromURL ) {
        this.instantiateView( this.viewHashFromURL );
      } else {
        this.checkIfPageExistsForThisAction( this.actionID );
      }
    }
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.openAppsInThisPage = this.openApps.openApps;
    this.page = {};
    this.actionID = this.route.snapshot.queryParams.actionID;
    if( !this.actionID ) {
      this.pageAsDemo = true;
    }
    this.viewHashFromURL = this.route.snapshot.queryParams.view;
    if ( this.viewHashFromURL ) {
      this.instantiateView( this.viewHashFromURL );
    } else {
      this.checkIfPageExistsForThisAction( this.actionID );
    }
  }

  instantiateView( viewHash: string ) {
    console.log( 'ViewHash: ' + viewHash );
    this.updateAppsInView( viewHash );
    this.mongoActionService.getAction(this.actionID)
      .subscribe(
        data => {
          this.action = data;
        },
        error => {
          console.log(error);
          return undefined;
        });
  }

  checkIfPageExistsForThisAction(actionID: string) {
    this.mongoActionService.getAction( actionID )
      .subscribe(
        data => {
          this.action = ( data as any ).action;
          console.log('This action: ');
          console.log(this.action);
          if ( this.action && this.action.hasPages[ 0 ] ) {
            this.updateAppsInView( this.action.hasPages[ 0 ] );
          } else {
            this.createEmptyPageInMongoDB();
            return undefined;
          }
        },
        error => {
          console.log(error);
          return undefined;
        });
  }
  createEmptyPageInMongoDB() {
    console.log('Hier weiter');
    this.mongoPageService.createPage()
      .subscribe( response => {
        console.log(response);
        this.page.hash = (response as any).page._id;
        this.action.hasPages.push(
          (response as any)
            .page
            ._id
        );
        console.log('Current action:');
        console.log(this.action);
        console.log('Next: Implement Update action in mongodb');
        this.mongoActionService.updateAction( this.action )
          .subscribe(response1 => {
            console.log(response1);
          }, error1 => {
            console.log(error1);
          });
      },
      error => {
        console.log('Page could not be saved;');
        console.log(error);
      });
    console.log( this.page );
  }
  deletePage() {
    console.log('Delete page');
  }

  updateAppCoordinates(app: any) {
    console.log('x: ' + app.x);
    console.log('y: ' + app.y);
    console.log('type: ' + app.type);
    console.log('hash: ' + app.hash );
    if ( this.page.openApps[ app.hash ] === null ) {
      this.page.openApps[ app.hash ] = [];
    }
    this.page.openApps[ app.hash ] = app;
    console.log( this.page );
  }

  updateAppsInView( viewHash: string ) {
    console.log( '07112018 Hier weiter update apps in View' );
    console.log(viewHash);
    this.mongoPageService.getPage( viewHash )
      .subscribe(
        data => {
          this.page = ( data as any).page;
          console.log(this.page);
          console.log(this.page.openApps);
          const appHelperArray = [];
          for ( let app of this.page.openApps ) {
            console.log(JSON.parse(app));
            appHelperArray[JSON.parse(app).hash] = JSON.parse(app);
          }
          this.page.openApps = appHelperArray;
          console.log(appHelperArray);
          console.log(this.page);
            console.log('Start updating page');
            console.log(this.page);
            for ( const app in this.page.openApps ) {
              console.log(app);
              for ( const appType in this.openAppsInThisPage ) {
                this.initiateUpdateApp(
                  this.page.openApps[ app ],
                  this.openAppsInThisPage[ appType ].type,
                  this.openAppsInThisPage[ appType ].model
                );
              }
            }
        },
        error => {
          console.log(error);
        });
  }

  initiateUpdateApp(
    appFromViewModel: any,
    appType: string,
    appModel: any
  ) {
    if ( appFromViewModel.type === appType ) {
      this.updateApp(
        appType,
        appModel,
        appFromViewModel
      );
    }
  }

  updateApp(
    appType: string,
    appModel: any,
    appFromViewModel: any
  ) {
    const length = appModel.length;
    appModel[ length ] = {};
    appModel[ length ].x = appFromViewModel.x;
    appModel[ length ].y = appFromViewModel.y;
    appModel[ length ].hash = appFromViewModel.hash;
    appModel[ length ].type = appType;
    appModel[ length ].initialized = true;
  }

  createTooltip() {
    if ( this.action ) {
      return 'Aktion: ' + this.action.title + ', Beschreibung: ' + this.action.description;
    } else {
      return null;
    }
  }
  updatePage() {
    console.log('update page for this action');
    this.mongoPageService.updatePage( this.page )
      .subscribe(
        data => {
          console.log(data);
        },
        error => {
          console.log(error);
        });
  }
  addAnotherApp (
    appModel: any,
    generateHash: boolean
  ): Array<any> {
    console.log('add another app');
    const length = appModel.length;
    appModel[ length ] = {};
    console.log('Add type and Id here');
    if ( generateHash ) {
      appModel[ length ].hash = this.generateHashService.generateHash();
    }
    return appModel;
  }

  closeApp(
    appModel: Array<any>,
    i: number
  ) {
    console.log(appModel);
    console.log(this.page);
    console.log(this.page.openApps[appModel[ i ].hash]);
    delete this.page.openApps[appModel[ i ].hash];
    appModel.splice(
      i,
      1);
    console.log(this.page);
    console.log(this.openAppsInThisPage);
  }

  updateAppTypesFromDataChooser( openAppsInThisPageFromDataChooser: any ) {
    console.log( this.openAppsInThisPage );
    console.log( openAppsInThisPageFromDataChooser );
    this.openAppsInThisPage = openAppsInThisPageFromDataChooser;
    console.log('updateAppTypesFromDataChooser');
  }

  expandPanels() {
    this.panelsOpen = !this.panelsOpen;
  }
}