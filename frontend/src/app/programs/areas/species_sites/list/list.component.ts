import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AreaModalFlowService } from '../../modalflow/modalflow.service';
import { UserService } from '../../../../auth/user-dashboard/user.service.service';
import { AreaService } from '../../areas.service';
import { AppConfig } from '../../../../../conf/app.config';
import { Point } from 'leaflet';

@Component({
    selector: 'app-species-sites-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class SpeciesSitesListComponent implements OnChanges {
    @Input('speciesSites') speciesSitesCollection: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @Input('program_id') program_id: number;
    @Input('displayForm') display_form: boolean;
    @Output('speciesSiteSelect')
    speciesSiteSelect: EventEmitter<Feature> = new EventEmitter();
    municipalities: string[] = [];
    speciesSites = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;

    constructor(
        public flowService: AreaModalFlowService,
        private userService: UserService,
        private areaService: AreaService
    ) {}

    ngOnChanges() {
        if (this.speciesSitesCollection) {
            this.speciesSites = this.speciesSitesCollection['features'];

            this.speciesSites.forEach((speciesSite) => {
                const coords: Point = new Point(
                    speciesSite.geometry.coordinates[0],
                    speciesSite.geometry.coordinates[1]
                );
                speciesSite.properties.coords = coords;
            });
        }
    }

    onAddSpeciesSiteObservationClick(species_site_id) {
        this.flowService.addSpeciesSiteObservation(species_site_id);
    }

    onSpeciesSiteClick(e): void {
        this.speciesSiteSelect.emit(e);
    }
}
