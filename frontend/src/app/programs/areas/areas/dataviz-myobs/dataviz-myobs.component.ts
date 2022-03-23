import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { GncProgramsService } from '../../../../api/gnc-programs.service';
//import { ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../../../../conf/app.config';
//import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-areas-dataviz-myobs',
    templateUrl: './dataviz-myobs.component.html',
    styleUrls: ['./dataviz-myobs.component.css'],
})
export class DatavizMyObsComponent implements AfterViewInit {

    constructor(
        private programsService: GncProgramsService
    ) {}

    ngAfterViewInit(): void {
        console.log('my_test');
    }

   
}