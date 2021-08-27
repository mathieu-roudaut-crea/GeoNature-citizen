import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { UserService } from '../../../../auth/user-dashboard/user.service.service';
import { AppConfig } from '../../../../../conf/app.config';

@Component({
    selector: 'observers-list',
    templateUrl: './observers-list.component.html',
    styleUrls: ['./observers-list.component.css'],
})
export class ObserversListComponent implements OnChanges {
    @Input('observers') observersCollection: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @Input('program_id') program_id: number;
    observers: Feature[] = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;
    page = 1;
    pageSize = 4;
    collectionSize = 0;

    ngOnChanges() {
        if (this.observersCollection) {
            this.collectionSize = this.observersCollection['count'];
            this.refreshList();
        }
    }

    refreshList() {
        this.observers = this.observersCollection['features'].slice(
            (this.page - 1) * this.pageSize,
            (this.page - 1) * this.pageSize + this.pageSize
        );
    }
}
