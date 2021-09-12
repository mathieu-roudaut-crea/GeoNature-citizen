import * as L from 'leaflet';
import { AppConfig } from '../../../../../conf/app.config';

import {
    Component,
    ComponentFactoryResolver,
    Injector,
    Input,
    ViewEncapsulation,
    Inject,
    LOCALE_ID,
    OnInit,
} from '@angular/core';
import { BaseMapComponent, conf } from './map.component';
import { MapService } from '../../../base/map/map.service';
import { AreaService } from '../../areas.service';

@Component({
    selector: 'app-areas-map',
    template: `
        <div
            [id]="'areasMap'"
            class="obsMap"
            #map
            data-observation-zoom-statement-warning="Veuillez zoomer pour localiser votre zone."
        ></div>
    `,
    styleUrls: ['../../../base/map/map.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class AreasMapComponent extends BaseMapComponent implements OnInit {
    feature_id_key = 'id_area';

    constructor(
        @Inject(LOCALE_ID) readonly localeId: string,
        private areaService: AreaService,
        resolver: ComponentFactoryResolver,
        injector: Injector,
        mapService: MapService
    ) {
        super(resolver, injector, mapService);
    }

    ngOnInit() {
        this.areaService.newSpeciesSiteCreated.subscribe((speciesSite) => {
            this.observationMap.addLayer(
                L.geoJSON(speciesSite, {
                    pointToLayer: (_feature, latlng): L.Marker => {
                        const marker: L.Marker<any> = L.marker(latlng, {
                            icon: conf.OBS_MARKER_ICON(),
                        });
                        return marker;
                    },
                })
            );
        });
    }

    getPopupComponentFactory(): any {
        return this.resolver.resolveComponentFactory(AreaMarkerPopupComponent);
    }
}

@Component({
    selector: 'popup',
    template: `
        <ng-container>
            <img
                [src]="
                    data.photo
                        ? appConfig.API_ENDPOINT + data.photo.url
                        : 'assets/no_photo_light.png'
                "
            />
            <p>
                <b>{{ data.name }}</b
                ><br />
                <span
                    >Ajoutée par {{ data.obs_txt }}<br />
                    le
                    {{
                        data.timestamp_create.substring(0, 10)
                            | date: 'longDate'
                    }} </span
                ><br />
            </p>
            <div
                [routerLink]="[
                    '/programs',
                    data.id_program,
                    'areas',
                    data.id_area
                ]"
                style="cursor:pointer"
                title="Voir les détails de cette zone"
            >
                <img class="icon" src="assets/binoculars.png" />
            </div>
        </ng-container>
    `,
})
export class AreaMarkerPopupComponent {
    @Input() data;
    public appConfig = AppConfig;
}
