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
import { BaseMapComponent } from './map.component';
import { MapService } from '../../../base/map/map.service';
import { AreaService } from '../../areas.service';
import { MAP_CONFIG } from '../../../../../conf/map.config';
import { GncProgramsService } from '../../../../api/gnc-programs.service';

@Component({
    selector: 'app-areas-dataviz-map',
    template: `
        <div
            [id]="'areasMap'"
            class="obsMap"
            #map
            data-observation-zoom-statement-warning="Veuillez zoomer pour localiser votre zone."
        ></div>
    `,
    styleUrls: [
        '../../../base/map/map.component.css',
        './area-dataviz-map.component.css',
    ],
    encapsulation: ViewEncapsulation.None,
})
export class AreasDatavizMapComponent
    extends BaseMapComponent
    implements OnInit
{
    feature_id_key = 'id_area';
    isDataviz = true;

    constructor(
        @Inject(LOCALE_ID) readonly localeId: string,
        private areaService: AreaService,
        resolver: ComponentFactoryResolver,
        injector: Injector,
        mapService: MapService,
        programService: GncProgramsService
    ) {
        super(resolver, injector, mapService, programService);
    }

    ngOnChanges(changes) {
        super.ngOnChanges(changes);
    }

    ngOnInit() {
        this.options.OBSERVATION_LAYER = () => L.featureGroup();
    }

    getPopupComponentFactory(): any {
        return this.resolver.resolveComponentFactory(
            AreaDatavizMarkerPopupComponent
        );
    }
}

@Component({
    selector: 'popup',
    template: `
        <ng-container>
            <p>
                <span
                    *ngIf="
                        data.creator &&
                        data.creator.properties &&
                        data.creator.properties.is_relay
                    "
                >
                    <b class="title">Relai local de Phénoclim: </b>
                    <b class="title notranslate">{{ data.creator.properties.organism }}</b>
                    <br *ngIf="data.creator.properties.organism" />
                    <a
                        *ngIf="data.creator.properties.email"
                        href="mailto:{{ data.creator.properties.email }}"
                        class="notranslate"
                        >{{ data.creator.properties.email }}</a
                    >
                    <br *ngIf="data.creator.properties.email" />
                    {{ data.creator.properties.phone }}
                    <br *ngIf="data.creator.properties.phone" />
                </span>
                <b class="title">Zone d'observation : </b>
                <b class="title notranslate">{{ data.name }}</b>
                <span
                    *ngIf="
                        (data.linked_users &&
                            data.linked_users.features &&
                            data.linked_users.features.length) ||
                        data.creator
                    "
                >
                    <br />
                    <span class="participants">
                        <b>Participants:</b>
                        <br />
                        <span
                            class="linked-user-container"
                            *ngIf="data.creator"
                        >
                            <img
                                *ngIf="data.creator.properties.avatar"
                                alt="creator avatar"
                                src="{{
                                    appConfig.API_ENDPOINT +
                                        '/media/' +
                                        data.creator.properties.avatar
                                }}"
                            />
                            <span
                                *ngIf="!data.creator.properties.avatar"
                                class="avatar-wrapper"
                            >
                                <span class="profile-pic"> </span>
                            </span>
                            <span class="notranslate">
                                {{ data.creator.properties.username }}
                            </span>
                            <span
                                >Inscrit le
                                {{
                                    data.creator.properties.timestamp_create.substring(
                                        0,
                                        10
                                    ) | date: 'longDate'
                                }}
                            </span>
                        </span>
                        <span
                            class="linked-user-container"
                            *ngFor="
                                let user of data.linked_users
                                    ? data.linked_users.features
                                    : []
                            "
                        >
                            <img
                                *ngIf="user.properties.avatar"
                                alt="linked user avatar"
                                src="{{
                                    appConfig.API_ENDPOINT +
                                        '/media/' +
                                        user.properties.avatar
                                }}"
                            />
                            <span
                                *ngIf="!user.properties.avatar"
                                class="avatar-wrapper"
                            >
                                <span class="profile-pic"> </span>
                            </span>
                            <span class="notranslate">{{
                                user.properties.username
                            }}</span>
                            <span
                                >Inscrit le
                                {{
                                    user.properties.timestamp_create.substring(
                                        0,
                                        10
                                    ) | date: 'longDate'
                                }}
                            </span>
                        </span>
                    </span>
                </span>
            </p>
        </ng-container>
    `,
})
export class AreaDatavizMarkerPopupComponent {
    @Input() data;
    public appConfig = AppConfig;
}
