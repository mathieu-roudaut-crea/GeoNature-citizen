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
    selector: 'app-species-sites-map',
    template: ` <div [id]="'speciesSitesMap'" class="obsMap" #map></div> `,
    styleUrls: ['../../../base/map/map.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SpeciesSitesMapComponent extends BaseMapComponent {
    feature_id_key = 'id_species_site';

    constructor(
        @Inject(LOCALE_ID) readonly localeId: string,
        resolver: ComponentFactoryResolver,
        injector: Injector,
        mapService: MapService
    ) {
        super(resolver, injector, mapService);
    }

    getPopupComponentFactory(): any {
        return this.resolver.resolveComponentFactory(
            SpeciesSiteMarkerPopupComponent
        );
    }
}

@Component({
    selector: 'popup',
    template: `
        <ng-container>
            <img
                [src]="
                    data.photos && data.photos.length
                        ? appConfig.API_ENDPOINT + data.photos[0].url
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
                    data.area.id_program,
                    'species_sites',
                    data.id_species_site
                ]"
                style="cursor:pointer"
                title="Voir les détails de cet individu"
            >
                <img class="icon" src="assets/binoculars.png" />
            </div>
        </ng-container>
    `,
})
export class SpeciesSiteMarkerPopupComponent {
    @Input() data;
    public appConfig = AppConfig;

    constructor() {
        console.log('daaatata', this.data);
    }
}
