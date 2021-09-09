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
import { AreaService } from '../../areas.service';

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
        private areaService: AreaService,
        public location: Location,
        public flowService: AreaModalFlowService
    ) {
        super();
        this.route.params.subscribe((params) => {
            this.area_id = params['area_id'];
            this.program_id = params['program_id'];
        });
        this.module = 'areas';
        this.areaService.newSpeciesSiteCreated.subscribe(() => {
            this.programService
                .getAreaDetails(this.area_id)
                .subscribe((areas) => {
                    this.area = areas['features'][0];
                });
        });
    }

    ngAfterViewInit() {
        this.programService.getAreaDetails(this.area_id).subscribe((areas) => {
            this.area = areas['features'][0];

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
                this.loadJsonSchema().subscribe(
                    function (json_schema: any) {
                        const schema = json_schema.schema.properties;
                        const layout = json_schema.layout;
                        for (const item of layout) {
                            const v = data[item.key];
                            if (v !== undefined) {
                                this.attributes.push({
                                    name: schema[item.key].title,
                                    value: v.toString(),
                                });
                            }
                        }
                    }.bind(this)
                );
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
