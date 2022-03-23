import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { GncProgramsService } from '../../../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../../../../conf/app.config';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-areas-dataviz-myobs',
    templateUrl: './dataviz-myobs.component.html',
    styleUrls: ['./dataviz-myobs.component.css'],
})
export class DatavizMyObsComponent implements AfterViewInit {

    obsList;
    speciesList;
    program_id;
    isBrowser: boolean;
    selectedSpecies;


    constructor(
        private programsService: GncProgramsService,
        private route: ActivatedRoute,
        @Inject(PLATFORM_ID) platformId: any
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
        this.route.params.subscribe(
            (params) => (this.program_id = params['id'])
        );
    }

    ngAfterViewInit(): void {

        if (!this.isBrowser) {
            return;
        }

        this.programsService
            .getUserSpecies(this.program_id)
            .toPromise()
            .then((response) => {
                this.speciesList = response;
                console.log(this.speciesList);
            });

        this.programsService
            .getProgramSpeciesSitesObservations(this.program_id)
            .toPromise()
            .then((response) => {
                this.obsList = response;
                console.log(this.obsList);
            });
    }

    onChangeSpeciesFilter(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.selectedSpecies = input.value;
        //this.getStatisticsFromFilters();
    }

}