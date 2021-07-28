import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { GncProgramsService } from '../../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { AreaModalFlowService } from '../modalflow/modalflow.service';
import { AppConfig } from '../../../../conf/app.config';
import { HttpClient } from '@angular/common/http';
import {
    BaseDetailComponent,
    markerIcon,
} from '../../base/detail/detail.component';

declare let $: any;

@Component({
    selector: 'app-area-detail',
    templateUrl: '../../base/detail/detail.component.html',
    styleUrls: [
        './../../observations/obs.component.css', // for form modal only
        '../../base/detail/detail.component.css',
    ],
    encapsulation: ViewEncapsulation.None,
})
export class AreaDetailComponent
    extends BaseDetailComponent
    implements AfterViewInit {
    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        public flowService: AreaModalFlowService
    ) {
        super();
        this.route.params.subscribe((params) => {
            this.area_id = params['area_id'];
            this.program_id = params['program_id'];
        });
        this.module = 'areas';
    }

    ngAfterViewInit() {
        this.programService.getAreaDetails(this.area_id).subscribe((areas) => {
            this.area = areas['features'][0];
            this.photos = this.area.properties.photos;
            for (var i = 0; i < this.photos.length; i++) {
                this.photos[i]['url'] =
                    AppConfig.API_ENDPOINT + this.photos[i]['url'];
            }

            // setup map
            const map = L.map('map');
            L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'OpenStreetMap',
            }).addTo(map);

            let coord = this.area.geometry.coordinates;
            let latLng = L.latLng(coord[1], coord[0]);
            map.setView(latLng, 13);

            L.marker(latLng, { icon: markerIcon }).addTo(map);

            // prepare data
            if (this.area.properties.last_visit) {
                let data = this.area.properties.last_visit.json_data;
                var that = this;
                this.loadJsonSchema().subscribe((jsonschema: any) => {
                    let schema = jsonschema.schema.properties;
                    for (const k in data) {
                        let v = data[k];
                        that.attributes.push({
                            name: schema[k].title,
                            value: v.toString(),
                        });
                    }
                });
            }
        });
    }

    loadJsonSchema() {
        return this.http.get(`${this.URL}/areas/${this.area_id}/jsonschema`);
    }

    addAreaVisit() {
        this.flowService.addAreaVisit(this.area_id);
    }
}
