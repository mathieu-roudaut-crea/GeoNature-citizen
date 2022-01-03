import { Component, OnInit } from '@angular/core';
import { GncProgramsService } from '../../../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../../../../conf/app.config';

@Component({
    selector: 'app-areas-dataviz',
    templateUrl: './dataviz.component.html',
    styleUrls: ['./dataviz.component.css'],
})
export class DatavizComponent implements OnInit {
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
    loading = false;

    mountains = AppConfig.mountains;

    constructor(
        private programsService: GncProgramsService,
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe(
            (params) => (this.program_id = params['id'])
        );
    }

    ngOnInit(): void {
        this.loading = true;
    }

    ngAfterViewInit(): void {
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

        this.getStatisticsFromFilters();
    }

    onChangeMountainFilter(event) {
        this.selectedMountain = event.target.value;
        this.getStatisticsFromFilters();
    }

    onChangeSpeciesFilter(event) {
        this.selectedSpecies = event.target.value;
        this.getStatisticsFromFilters();
    }

    onChangeYearsFilter(event) {
        this.selectedYear = event.target.value;
        this.getStatisticsFromFilters();
    }
    onChangeObserversCategoryFilter(event) {
        this.selectedObserversCategory = event.target.value;
        this.getStatisticsFromFilters();
    }

    getStatisticsFromFilters() {
        this.loading = true;
        this.programsService
            .getProgramStatistics(this.program_id, this.getFilters())
            .toPromise()
            .then((response) => {
                this.statistics = response;
            });

        this.programsService
            .getProgramAreas(this.program_id, this.getFilters())
            .toPromise()
            .then((response) => {
                this.areas = response;
                this.loading = false;
            });
    }

    getFilters() {
        return {
            species:
                this.selectedSpecies && this.selectedSpecies !== 'null'
                    ? this.selectedSpecies
                    : null,
            postal_codes:
                this.selectedMountain && this.selectedMountain !== 'null'
                    ? this.mountains[this.selectedMountain].postalCodes
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
