import { Component, OnInit } from '@angular/core';

/**
 * This component shows the use of the module CreateResourceModule.
 * It can be deleted after development.
 */
@Component({
  selector: 'app-create-resource-view',
  templateUrl: './create-resource-view.component.html',
  styleUrls: ['./create-resource-view.component.scss']
})
export class CreateResourceViewComponent implements OnInit {

  projectIRI = 'http://rdfh.ch/projects/0041';
  constructor() { }

  ngOnInit() {
  }

  interpretPostedIRI(e) {
    alert(e);
  }

}
