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
} from '@angular/core';
import { BaseMapComponent } from './map.component';
import { MapService } from '../../../base/map/map.service';

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
export class AreasMapComponent extends BaseMapComponent {
    feature_id_key = 'id_area';

    constructor(
        @Inject(LOCALE_ID) readonly localeId: string,
        resolver: ComponentFactoryResolver,
        injector: Injector,
        mapService: MapService
    ) {
        super(resolver, injector, mapService);
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
                title="Voir les détails sur cette area"
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
