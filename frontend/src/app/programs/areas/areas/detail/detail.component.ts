import { Component, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { GncProgramsService } from '../../../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { AreaModalFlowService } from '../../modalflow/modalflow.service';
import { AppConfig } from '../../../../../conf/app.config';
import { HttpClient } from '@angular/common/http';
import {
    BaseDetailComponent,
    markerIcon,
} from '../../../base/detail/detail.component';
import { Location } from '@angular/common';

declare let $: any;

@Component({
    selector: 'app-area-detail',
    templateUrl: '../../../base/detail/detail.component.html',
    styleUrls: [
        '../../../observations/obs.component.css', // for observation_form modal only
        '../../../base/detail/detail.component.css',
    ],
    encapsulation: ViewEncapsulation.None,
})
export class AreaDetailComponent
    extends BaseDetailComponent
    implements AfterViewInit
{
    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        private location: Location,
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
            if (Array.isArray(this.photos)) {
                for (let i = 0; i < this.photos.length; i++) {
                    this.photos[i]['url'] =
                        AppConfig.API_ENDPOINT + this.photos[i]['url'];
                }
            }

            // setup map
            const map = L.map('map');
            L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'OpenStreetMap',
            }).addTo(map);

            const leafletArea = L.geoJSON(this.area).addTo(map);

            const maxBounds = leafletArea.getBounds();
            map.fitBounds(maxBounds);
            map.setMaxBounds(maxBounds);

            // prepare data
            if (this.area.properties) {
                const data = this.area.properties.json_data;
                const that = this;
                this.loadJsonSchema().subscribe((json_schema: any) => {
                    const schema = json_schema.schema.properties;
                    const layout = json_schema.layout;
                    for (const item of layout) {
                        const v = data[item.key];
                        if (v !== undefined) {
                            that.attributes.push({
                                name: schema[item.key].title,
                                value: v.toString(),
                            });
                        }
                    }
                });
            }
        });
    }

    loadJsonSchema() {
        return this.http.get(`${this.URL}/areas/${this.area_id}/jsonschema`);
    }

    addAreaSpeciesSite() {
        this.flowService.addAreaSpeciesSite(this.area_id);
    }
}
