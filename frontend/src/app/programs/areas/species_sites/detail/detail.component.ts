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

declare let $: any;

@Component({
    selector: 'app-species-site-detail',
    templateUrl: '../../../base/detail/detail.component.html',
    styleUrls: [
        '../../../observations/obs.component.css', // for observation_form modal only
        '../../../base/detail/detail.component.css',
    ],
    encapsulation: ViewEncapsulation.None,
})
export class SpeciesSiteDetailComponent
    extends BaseDetailComponent
    implements AfterViewInit
{
    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        public flowService: AreaModalFlowService
    ) {
        super();
        this.route.params.subscribe((params) => {
            this.species_site_id = params['species_site_id'];
        });
        this.module = 'species_sites';
    }

    ngAfterViewInit() {
        this.programService
            .getSpeciesSiteDetails(this.species_site_id)
            .subscribe((speciesSites) => {
                this.speciesSite = speciesSites['features'][0];
                this.photos = this.speciesSite.properties.photos;
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

                const coord = this.speciesSite.geometry.coordinates;
                const latLng = L.latLng(coord[1], coord[0]);
                map.setView(latLng, 13);

                L.circle(latLng, { radius: 500 }).addTo(map);

                // prepare data
                if (this.speciesSite.properties) {
                    const data = this.speciesSite.properties.json_data;
                    const that = this;
                    this.loadJsonSchema().subscribe((jsonschema: any) => {
                        const schema = jsonschema.schema.properties;
                        for (const k in data) {
                            const v = data[k];

                            that.attributes.push({
                                name: schema[k].title,
                                value: v.toString(),
                            });
                            console.log('added', that.attributes);
                        }
                    });
                }
            });
    }

    loadJsonSchema() {
        return this.http.get(
            `${this.URL}/areas/${this.speciesSite.id_area}/species_site/jsonschema`
        );
    }

    addSpeciesSiteObservation() {
        this.flowService.addSpeciesSiteObservation(this.species_site_id);
    }
}
