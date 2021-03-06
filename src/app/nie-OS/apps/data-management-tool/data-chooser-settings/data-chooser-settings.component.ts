import { Component, OnInit, Inject } from '@angular/core';
import {Router} from '@angular/router';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatFormField
} from '@angular/material';
import { KnoraV1RequestService } from '../../../../shared/knora/knora-v1-request.service';
import { environment } from '../../../../../environments/environment';
import { SendGravSearchQueryService } from '../../../../shared/knora/gravsearch/sendGravSearchQuery.service';
import {ApiServiceError, Project, ProjectsService, User} from '@knora/core';

@Component({
  selector: 'app-data-chooser-settings',
  templateUrl: './data-chooser-settings.component.html',
  styleUrls: ['./data-chooser-settings.component.scss']
})
export class DataChooserSettingsComponent implements OnInit {
  appsInView: Array<any>;
  loading = false;
  allProjects: Array<any>;
  selectedProject: any;
  resourceTypes: Array<any>;
  selectedResourceType: any;
  selectedPrefixes: any;
  selectedProperties: Array<any>;
  queryResults: any;
  requestSend: boolean;
  gravSearchString = '';
  gravSearchResponse: any;
  gravSearchJson: any;
  resourceTypeProperties: any;
  propertySet = new Set();
  assignedInputData: boolean;
  appTypes = {};
  i = 0;
  j = 0;
  gravSearchSets =
    {
      'PREFIXES': new Set(),
      'constructOpener': 'CONSTRUCT {',
      'CONSTRUCT': new Set(),
      'constructClosure': '}',
      'whereOpener': 'WHERE {',
      'WHERE': new Set(),
      'whereClosure': '} OFFSET 0'
    };
  dataChooserSettingOutput = {
    'gravSearchQuery': new Set(),
    'appModel': {},
    'dataChooserLabel': new Set()
  };
  constructor(
    public dialogRef: MatDialogRef<DataChooserSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private router: Router,
    private knoraV1RequestService: KnoraV1RequestService,
    private sendGravSearchQueryService: SendGravSearchQueryService
  ) {
    this.appTypes = data;
    this.appsInView = [];
    for ( const type in data ) {
      if ( data[ type ].model.length && type !== 'dataChooser' ) {
        console.log( data[ type ] );
        for ( const openApp of data[ type ].model ) {
          const length = this.appsInView.length;
          this.appsInView[ length ] = openApp;
          this.appsInView[ length ].inputs = data[ type ].inputs;
        }
      }
    }
    console.log( this.appsInView );
  }
  ngOnInit() {
    console.log('Load all projects');
    this.knoraV1RequestService.getProjects()
      .subscribe(
        data => {
          this.allProjects = (data as any).projects;
          console.log(this.allProjects);
        },
        error => {
          console.log(error);
        });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  register() {
    this.loading = true;
    console.log('register');
  }
  getAllVocabuliares( project: any) {
    console.log( project );
    this.knoraV1RequestService
      .getResourcesOfVocabulary( project.ontologies[ 0 ] ) // TODO make this dynamical for more than one ontology per project
      .subscribe(
        data => {
          this.resourceTypes = ( data as any ).resourcetypes;
          console.log(data);
        },
        error => {
          console.log(error);
        });
  }
  getAllInstancesOfChosenResourceClass( resourceType: any ) {
    console.log('Get all Instances for: ');
    console.log(resourceType);
    this.resourceTypeProperties = resourceType.properties;
  }

  generateGravsearchPrefixes(project: any) {
    this.selectedPrefixes = [];
    this.selectedPrefixes[ 0 ] = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>';
    this.selectedPrefixes[ 1 ] = 'PREFIX '
      + project.shortname +
      ': <http://0.0.0.0:3333/ontology/'
      + project.shortcode
      + '/'
      + project.shortname
      + '/simple/v2#>';
  }

  returnWHERE(project: string) {
    return project + ':' + this.parseResourceTypeShortName();
  }

  parseResourceTypeShortName() {
    return this.selectedResourceType.split('#', 2)[ 1 ];
  }

  sendRequest() {
    this.requestSend = true;
    this.generateGravSearchString();
    console.log('send request');
  }
  generatePropertyPhrase( project: string, property: string) {
    return '?myVariable ' + project + ':' + property + ' ?' + property + ' .';
  }

  generateGravSearchString() {
    this.gravSearchString = '';
    this.gravSearchSets.PREFIXES = new Set();
    this.gravSearchSets.CONSTRUCT = new Set();
    this.gravSearchSets.WHERE = new Set();
    console.log(this.selectedPrefixes);
    this.gravSearchSets.PREFIXES.add( this.selectedPrefixes[ 0 ] );
    this.gravSearchSets.PREFIXES.add( this.selectedPrefixes[ 1 ] );
    this.gravSearchSets.CONSTRUCT.add('?myVariable knora-api:isMainResource true .');
    for ( const property of this.selectedProperties ) {
      const phrase = this.generatePropertyPhrase(
        this.selectedProject,
        property
      );
      this.gravSearchSets.CONSTRUCT.add(
        phrase
      );
      this.gravSearchSets.WHERE.add(
        phrase
      );
    }

    this.gravSearchSets.WHERE.add(
      '?myVariable a '
      + this.returnWHERE( this.selectedProject )
      + ' .'
    );
    // console.log(this.gravSearchSets);
    // console.log('Generate Gravsearch string');
    // console.log('Loop through PREFIXES');
    this.gravSearchSets.PREFIXES.forEach((value: string, key: string) => {
      // console.log(value);
      this.gravSearchString += value;
      this.gravSearchString += ' ';
    });
    this.gravSearchString += this.gravSearchSets.constructOpener + ' ';
    this.gravSearchSets.CONSTRUCT.forEach((value: string, key: string) => {
      // console.log(value);
      this.gravSearchString += value;
      this.gravSearchString += ' ';
    });
    this.gravSearchString += this.gravSearchSets.constructClosure + ' ';
    this.gravSearchString += this.gravSearchSets.whereOpener + ' ';
    this.gravSearchSets.WHERE.forEach((value: string, key: string) => {
      // console.log(value);
      this.gravSearchString += value;
      this.gravSearchString += ' ';
    });
    this.gravSearchString += this.gravSearchSets.whereClosure + ' ';
    // console.log( this.gravSearchString );
    this.sendGravSearchQueryService.sendRequest( this.gravSearchString )
      .subscribe(
        data => {
          console.log(data);
          this.gravSearchJson = [];
          this.gravSearchJson = data;
          this.gravSearchResponse = data['@graph'];
        },
        error => {
          console.log(error);
        });
  }

  addPropertyToGravSearchQuery(property: any) {
    console.log(property);
    const shortName = property.id.split('#', 2)[ 1 ];
    if ( this.propertySet.has( shortName ) ) {
      this.propertySet.delete( shortName );
    } else {
      this.propertySet.add( shortName );
    }
    this.selectedProperties = [];
    console.log('Add Property to Gravsearch - Query');
    console.log( this.propertySet );
    this.propertySet.forEach((value: string, key: string) => {
      this.selectedProperties[ this.selectedProperties.length ] = value;
      console.log( this.selectedProperties[ this.selectedProperties.length - 1] );
    });
  }

  returngravSearchJson() {
    // console.log('Check if data is assigned');
    // console.log(this.gravSearchJson)
    if ( this.gravSearchJson ) {
      return true;
    }
  }

  assignPropertyToApp( property: string, inputName: string, app: any ) {
    console.log('Property und App:');
    console.log(property);
    console.log(app);
    console.log(this.appsInView);
    for ( const input of app.inputs ) {
      if ( inputName === input.inputName ) {
        app.propertyArray = [];
        app.propertyArray[ inputName ] = this.selectedProject + ':' + property;
      }
    }
    console.log( this.appsInView );
  }

  createDialogOutputData() {
    // console.log('Next: update appTypes from chosen properties');
    // console.log(this.appTypes);
    // console.log(this.appsInView);
    for ( const type in this.appTypes ) {
      if ( this.appTypes[ type ].model.length && type !== 'dataChooser' ) {
        // console.log( this.appTypes[ type ].model );
        for ( const app of this.appTypes[ type ].model ) {
          for ( const updatedApp of this.appsInView ) {
            if ( app.hash === updatedApp.hash ) {
              this.appTypes[ type ].model[ app ] = updatedApp;
              // console.log('App updated:');
              // console.log(this.appTypes[ type ].model[ app ]);
            }
          }
        }
      }
    }
    this.dataChooserSettingOutput.appModel = this.appTypes;
    this.dataChooserSettingOutput.gravSearchQuery = new Set();
    this.dataChooserSettingOutput.gravSearchQuery.add( this.gravSearchString );
    return this.dataChooserSettingOutput;
  }
  assignDataChooserLabel( property: string ) {
    this.dataChooserSettingOutput.dataChooserLabel.add( property );
  }
}
