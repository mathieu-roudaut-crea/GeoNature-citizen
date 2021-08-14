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

@Component({
    selector: 'app-species-sites-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class SpeciesSitesListComponent implements OnChanges {
    @Input('speciesSites') speciesSitesCollection: FeatureCollection;
    @Input('userDashboard') userDashboard: boolean = false;
    @Input('program_id') program_id: number;
    @Input('displayForm') display_form: boolean;
    @Output('speciesSiteSelect')
    speciesSiteSelect: EventEmitter<Feature> = new EventEmitter();
    municipalities: string[] = [];
    speciesSites: Feature[] = [];
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
        }
    }

    onAddSpeciesSiteObservationClick(species_site_id) {
        this.flowService.addSpeciesSiteObservation(species_site_id);
    }

    onSpeciesSiteClick(e): void {
        this.speciesSiteSelect.emit(e);
    }
}
