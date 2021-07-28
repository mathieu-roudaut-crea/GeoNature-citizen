import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AreaModalFlowService } from '../modalflow/modalflow.service';
import { UserService } from '../../../auth/user-dashboard/user.service.service';
import { AreaService } from '../areas.service';
import { AppConfig } from '../../../../conf/app.config';

@Component({
    selector: 'app-areas-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class AreasListComponent implements OnChanges {
    @Input('areas') areasCollection: FeatureCollection;
    @Input('userDashboard') userDashboard: boolean = false;
    @Input('program_id') program_id: number;
    @Input('displayForm') display_form: boolean;
    @Output('areaSelect')
    areaSelect: EventEmitter<Feature> = new EventEmitter();
    municipalities: string[] = [];
    areas: Feature[] = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;

    constructor(
        public flowService: AreaModalFlowService,
        private userService: UserService,
        private areaService: AreaService
    ) {}

    ngOnChanges() {
        if (this.areasCollection) {
            this.areas = this.areasCollection['features'];
            this.municipalities = this.areasCollection.features
                .map((features) => features.properties)
                .map((property) => property.municipality)
                .filter((municipality) =>
                    municipality != null ? <string>municipality : ''
                )
                .filter((v, i, a) => a.indexOf(v) === i);
        }
    }
    addAreaVisit(area_id) {
        this.flowService.addAreaVisit(area_id);
    }

    onAreaClick(e): void {
        this.areaSelect.emit(e);
    }
}
