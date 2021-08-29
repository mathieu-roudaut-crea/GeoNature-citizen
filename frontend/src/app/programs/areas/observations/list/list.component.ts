import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AppConfig } from '../../../../../conf/app.config';

@Component({
    selector: 'app-species-sites-obs-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class SpeciesSitesObsListComponent implements OnChanges {
    @Input('observations') observationsCollection: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @Input('program_id') program_id: number;
    observations: Feature[] = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;
    page = 1;
    pageSize = 10;
    collectionSize = 0;

    ngOnChanges() {
        if (this.observationsCollection) {
            this.collectionSize = this.observationsCollection['count'];
            this.refreshList();
        }
    }
    refreshList() {
        this.observations = this.observationsCollection['features'].slice(
            (this.page - 1) * this.pageSize,
            (this.page - 1) * this.pageSize + this.pageSize
        );
    }
}
