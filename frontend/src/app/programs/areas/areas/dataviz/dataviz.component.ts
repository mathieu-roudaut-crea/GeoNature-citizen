import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { GncProgramsService } from '../../../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../../../../conf/app.config';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-areas-dataviz',
    templateUrl: './dataviz.component.html',
    styleUrls: ['./dataviz.component.css'],
})
export class DatavizComponent implements AfterViewInit {
    appConfig = AppConfig;

    areas;

    speciesList;
    selectedSpecies;

    areasByMountain = {};
    selectedMountain;

    years = [];
    selectedYear;

    observersCategories = [];
    selectedObserversCategory;

    statistics = {};

    program_id;
    requestsInProgress = 0;
    isBrowser: boolean;

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
            .getProgramSpecies(this.program_id)
            .toPromise()
            .then((response) => {
                this.speciesList = response;
            });
        this.programsService
            .getProgramYears(this.program_id)
            .toPromise()
            .then((response) => {
                this.years = response.years;
            });

        return this.getStatisticsFromFilters();
    }

    onChangeMountainFilter(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.selectedMountain = input.value;
        this.getStatisticsFromFilters();
    }

    onChangeSpeciesFilter(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.selectedSpecies = input.value;
        this.getStatisticsFromFilters();
    }

    onChangeYearsFilter(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.selectedYear = input.value;
        this.getStatisticsFromFilters();
    }

    onChangeObserversCategoryFilter(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.selectedObserversCategory = input.value;
        this.getStatisticsFromFilters();
    }

    getStatisticsFromFilters(): void {
        this.requestsInProgress++;
        this.programsService
            .getProgramStatistics(this.program_id, this.getFilters())
            .toPromise()
            .then((response) => {
                this.requestsInProgress--;
                this.statistics = response;
            });

        this.requestsInProgress++;
        this.programsService
            .getProgramAreas(this.program_id, this.getFilters())
            .toPromise()
            .then((response) => {
                this.requestsInProgress--;
                if (!response) {
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
                this.areas = response;
                return response;
            });
    }

    getFilters(): {
        species: string;
        postal_codes: string[];
        year: string;
        observers_category: string;
        'all-data': boolean;
    } {
        return {
            species:
                this.selectedSpecies && this.selectedSpecies !== 'null'
                    ? this.selectedSpecies
                    : null,
            postal_codes:
                this.selectedMountain && this.selectedMountain !== 'null'
                    ? this.appConfig.mountains[this.selectedMountain]
                          .postalCodes
                    : null,
            year:
                this.selectedYear && this.selectedYear !== 'null'
                    ? this.selectedYear
                    : null,
            observers_category:
                this.selectedObserversCategory &&
                this.selectedObserversCategory !== 'null'
                    ? this.selectedObserversCategory
                    : null,
            'all-data': true,
        };
    }
}
