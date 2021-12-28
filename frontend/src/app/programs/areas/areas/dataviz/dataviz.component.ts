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

    mountains = [
        {
            name: 'Alpes',
            postalCodes: [
                '74',
                '73',
                '38',
                '05',
                '06',
                '04',
                '84',
                '26',
                '13',
                '83',
                'CH',
                'IT',
            ],
        },
        { name: 'Jura', postalCodes: ['01', '39', '25'] },
        {
            name: 'Massif Central',
            postalCodes: [
                '42',
                '43',
                '63',
                '15',
                '07',
                '12',
                '03',
                '48',
                '30',
                '23',
                '19',
                '36',
            ],
        },
        {
            name: 'Pyrénées',
            postalCodes: ['64', '65', '31', '09', '11', '66', 'ES', 'AD'],
        },
        { name: 'Vosges', postalCodes: ['88', '57', '67', '68', '70', '54'] },
        { name: 'Corse', postalCodes: ['2A', '2B'] },
    ];

    constructor(
        private programsService: GncProgramsService,
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe(
            (params) => (this.program_id = params['id'])
        );
    }

    ngOnInit(): void {
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
