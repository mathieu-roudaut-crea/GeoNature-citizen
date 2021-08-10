import {
    Component,
    ViewEncapsulation,
    AfterViewInit,
    ViewChild,
    ElementRef,
    Input,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
// import { map, tap } from 'rxjs/operators';

import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { Position, Point, FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import { LeafletMouseEvent } from 'leaflet';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen';
import 'leaflet-gesture-handling';

import { AppConfig } from '../../../../../conf/app.config';
import { MAP_CONFIG } from '../../../../../conf/map.config';
import { MapService } from '../../../base/map/map.service';
import { GNCFrameworkComponent } from '../../../base/jsonform/framework/framework.component';
import { TaxonomyList } from '../../../observations/observation.model';
import {
    debounceTime,
    distinctUntilChanged,
    map,
    share,
    tap,
} from 'rxjs/operators';
import { GncProgramsService } from '../../../../api/gnc-programs.service';

// declare let $: any;

const SPECIES_SITE_STYLE = {
    fillColor: 'transparent',
    weight: 2,
    opacity: 0.8,
    color: 'red',
    dashArray: '4',
};

// TODO: migrate to conf
const taxonSelectInputThreshold = AppConfig.taxonSelectInputThreshold;
const taxonAutocompleteInputThreshold =
    AppConfig.taxonAutocompleteInputThreshold;
const taxonAutocompleteFields = AppConfig.taxonAutocompleteFields;
const taxonAutocompleteMaxResults = 10;

export const speciesSiteFormMarkerIcon = L.icon({
    iconUrl: 'assets/pointer-blue2.png', // TODO: Asset path should be normalized, conf ?
    iconAnchor: [16, 42],
});

export const myMarkerTitle =
    '<i class="fa fa-eye"></i> Partagez votre observation';

@Component({
    selector: 'app-species-site-form',
    templateUrl: './species_site_form.component.html',
    styleUrls: ['./species_site_form.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SpeciesSiteFormComponent implements AfterViewInit {
    private readonly URL = AppConfig.API_ENDPOINT;
    @Input('data') data;
    @Input('coords') coords: L.Point;
    @Input('area_id') area_id: number;
    @ViewChild('photo', { static: true }) photo: ElementRef;
    area: any;
    formMap: L.Map;
    speciesSiteForm = new FormGroup({
        name: new FormControl('', Validators.required),
        geometry: new FormControl('', Validators.required),
        cd_nom: new FormControl(),
        id_area: new FormControl(),
        id_species_site: new FormControl(),
    });
    MAP_CONFIG = MAP_CONFIG;
    hasZoomAlert: boolean;
    zoomAlertTimeout: any;
    mapVars: any = {};

    jsonData: object = {};
    formOptions: any = {
        loadExternalAssets: false,
        debug: false,
        returnEmptyFields: false,
        addSubmit: false,
    };
    jsonSchema: any = {};
    GNCBootstrap4Framework: any = {
        framework: GNCFrameworkComponent,
    };
    formInputObject: object = {};
    readyToDisplay = false;
    partialLayout: any[] = [];
    advancedMode = false;

    taxonSelectInputThreshold = taxonSelectInputThreshold;
    taxonAutocompleteInputThreshold = taxonAutocompleteInputThreshold;
    autocomplete = 'isOff';
    // taxonomyListID: number;
    taxa: TaxonomyList;
    surveySpecies$: Observable<TaxonomyList>;
    species: Object[] = [];
    taxaCount: number;
    selectedTaxon: any;

    constructor(
        private http: HttpClient,
        private mapService: MapService,
        private dateParser: NgbDateParserFormatter,
        private programService: GncProgramsService
    ) {}

    ngOnInit(): void {
        if (this.data.updateData) {
            this.patchForm(this.data.updateData);
        }

        this.mapService.coordsChange.subscribe((value) => {
            this.coords = value;
            const geo_coords = <Point>{
                type: 'Point',
                coordinates: <Position>[this.coords.x, this.coords.y],
            };
            this.speciesSiteForm.patchValue({ geometry: geo_coords });
            if (this.mapVars.minimapMarker)
                this.formMap.removeLayer(this.mapVars.minimapMarker);
            this.mapVars.minimapMarker = L.marker(
                [this.coords.y, this.coords.x],
                {
                    icon: speciesSiteFormMarkerIcon,
                }
            ).addTo(this.formMap);
        });

        this.loadJsonSchema().subscribe((data: any) => {
            this.initForm(data);
        });
    }

    initForm(json_schema) {
        this.jsonSchema = json_schema;
        this.updatePartialLayout();
        this.updateFormInput();
        this.readyToDisplay = true;
    }
    loadJsonSchema() {
        return this.http.get(
            `${this.URL}/areas/${this.area_id}/species_site/jsonschema`
        );
    }
    updateFormInput() {
        this.updatePartialLayout();
        this.formInputObject = {
            schema: this.jsonSchema.schema,
            data: this.jsonData,
            layout: this.partialLayout,
        };
    }
    updatePartialLayout() {
        this.partialLayout = this.jsonSchema.layout;
        this.partialLayout[this.partialLayout.length - 1].expanded =
            this.advancedMode;
    }
    yourOnChangesFn(e) {
        this.jsonData = e;
    }

    ngAfterViewInit(): void {
        this.http
            .get(`${AppConfig.API_ENDPOINT}/areas/${this.area_id}`)
            .subscribe((result) => {
                this.area = result;

                this.surveySpecies$ = this.programService
                    .getProgramTaxonomyList(
                        this.area.features[0].properties.id_program
                    )
                    .pipe(
                        tap((species) => {
                            this.taxa = species;
                            this.taxaCount = Object.keys(this.taxa).length;
                            if (
                                this.taxaCount >=
                                this.taxonAutocompleteInputThreshold
                            ) {
                                this.inputAutoCompleteSetup();
                            } else if (this.taxaCount == 1) {
                                this.onTaxonSelected(this.taxa[0]);
                            }
                        }),
                        share()
                    );
                this.surveySpecies$.subscribe();

                console.debug('speciesSiteForm', this.speciesSiteForm);

                // build map control
                const formMap = L.map('formMap', {
                    gestureHandling: true,
                } as any);
                this.formMap = formMap;

                L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'OpenStreetMap',
                }).addTo(formMap);

                L.control['fullscreen']({
                    position: 'topright',
                    title: {
                        false: 'View Fullscreen',
                        true: 'Exit Fullscreen',
                    },
                }).addTo(formMap);

                const ZoomViewer = L.Control.extend({
                    onAdd: () => {
                        const container = L.DomUtil.create('div');
                        const gauge = L.DomUtil.create('div');
                        container.style.width = '200px';
                        container.style.background = 'rgba(255,255,255,0.5)';
                        container.style.textAlign = 'left';
                        container.className = 'mb-0';
                        formMap.on('zoomstart zoom zoomend', function (_e) {
                            gauge.innerHTML =
                                'Zoom level: ' + formMap.getZoom();
                        });
                        container.appendChild(gauge);

                        return container;
                    },
                });
                const zv = new ZoomViewer();
                zv.addTo(formMap);
                zv.setPosition('bottomleft');

                //TODO: use polygon for areas instead of point
                const coords = this.area.features[0].geometry.coordinates;
                const lower_latitude =
                    coords[0] - (0.6 / 6378) * (180 / Math.PI);
                const lower_longitude =
                    coords[1] -
                    ((0.4 / 6378) * (180 / Math.PI)) /
                        Math.cos((coords[0] * Math.PI) / 180);
                const higher_latitude =
                    coords[0] + (0.6 / 6378) * (180 / Math.PI);
                const higher_longitude =
                    coords[1] +
                    ((0.4 / 6378) * (180 / Math.PI)) /
                        Math.cos((coords[0] * Math.PI) / 180);

                this.area.features[0].geometry = {
                    coordinates: [
                        [
                            [lower_latitude, lower_longitude],
                            [higher_latitude, lower_longitude],
                            [higher_latitude, higher_longitude],
                            [lower_latitude, higher_longitude],
                            [lower_latitude, lower_longitude],
                        ],
                    ],
                    type: 'Polygon',
                };
                const leafletArea = L.geoJSON(this.area, {
                    style: function (_feature) {
                        return SPECIES_SITE_STYLE;
                    },
                }).addTo(formMap);

                const maxBounds = leafletArea.getBounds();
                formMap.fitBounds(maxBounds);
                formMap.setMaxBounds(maxBounds);

                // Set initial observation marker from main map if already spotted
                let myMarker = null;
                if (this.coords) {
                    const geo_coords = <Point>{
                        type: 'Point',
                        coordinates: <Position>[this.coords.x, this.coords.y],
                    };
                    this.speciesSiteForm.patchValue({ geometry: geo_coords });

                    myMarker = L.marker([this.coords.y, this.coords.x], {
                        icon: speciesSiteFormMarkerIcon,
                    }).addTo(formMap);
                }

                // Update marker on click event
                formMap.on('click', (e: LeafletMouseEvent) => {
                    const z = formMap.getZoom();

                    if (z < MAP_CONFIG.ZOOM_LEVEL_RELEVE) {
                        // this.hasZoomAlert = true;
                        console.debug('ZOOM ALERT', formMap);
                        L.DomUtil.addClass(
                            formMap.getContainer(),
                            'observation-zoom-statement-warning'
                        );
                        if (this.zoomAlertTimeout) {
                            clearTimeout(this.zoomAlertTimeout);
                        }
                        this.zoomAlertTimeout = setTimeout(() => {
                            L.DomUtil.removeClass(
                                formMap.getContainer(),
                                'observation-zoom-statement-warning'
                            );
                            console.debug('Deactivating overlay', formMap);
                        }, 2000);
                        return;
                    }
                    // PROBLEM: if program speciesSite is a concave polygon: one can still put a marker in the cavities.
                    // POSSIBLE SOLUTION: See ray casting algorithm for inspiration at https://stackoverflow.com/questions/31790344/determine-if-a-point-reside-inside-a-leaflet-polygon
                    if (maxBounds.contains([e.latlng.lat, e.latlng.lng])) {
                        if (myMarker) {
                            // TODO: update marker coods inplace.
                            // Implement draggable marker
                            formMap.removeLayer(myMarker);
                        }
                        myMarker = L.marker(e.latlng, {
                            icon: speciesSiteFormMarkerIcon,
                        }).addTo(formMap);
                        this.coords = L.point(e.latlng.lng, e.latlng.lat);
                        // this.speciesSiteForm.patchValue({ geometry: this.coords });
                        const coords = <Point>{
                            type: 'Point',
                            coordinates: <Position>[e.latlng.lng, e.latlng.lat],
                        };
                        this.speciesSiteForm.patchValue({ geometry: coords });
                    }
                });
                this.mapVars = {
                    minimapMarker: myMarker,
                };
            });
    }

    patchForm(updateData): void {
        this.speciesSiteForm.patchValue({
            name: updateData.name,
            geometry: this.data.coords ? this.coords : '',
            area_id: updateData.area_id,
            id_species_site: updateData.id_species_site,
        });
    }

    onFormSubmit(): Promise<object> {
        console.debug('formValues:', this.speciesSiteForm.value);

        const formData = this.speciesSiteForm.value;
        if (this.jsonData) {
            formData.json_data = JSON.stringify(this.jsonData);
        }
        return this.postSpeciesSite(formData)
            .toPromise()
            .then(
                (data) => {
                    return data;
                },
                (err) => console.error(err)
            );
    }

    postSpeciesSite(formData): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                Accept: 'application/json',
            }),
        };
        if (this.data.updateData) {
            return this.http.patch<any>(
                `${this.URL}/areas/species_sites/`,
                formData,
                httpOptions
            );
        } else {
            formData.id_area = this.area_id;
            return this.http.post<any>(
                `${this.URL}/areas/species_sites/`,
                formData,
                httpOptions
            );
        }
    }

    inputAutoCompleteSetup = () => {
        for (const taxon in this.taxa) {
            for (const field of taxonAutocompleteFields) {
                if (this.taxa[taxon]['taxref'][field]) {
                    this.species.push({
                        name:
                            field === 'cd_nom'
                                ? `${this.taxa[taxon]['taxref']['cd_nom']} - ${this.taxa[taxon]['taxref']['nom_complet']}`
                                : this.taxa[taxon]['taxref'][field],
                        cd_nom: this.taxa[taxon]['taxref']['cd_nom'],
                        icon:
                            this.taxa[taxon]['medias'].length >= 1
                                ? // ? this.taxa[taxon]["medias"][0]["url"]
                                  AppConfig.API_TAXHUB +
                                  '/tmedias/thumbnail/' +
                                  this.taxa[taxon]['medias'][0]['id_media'] +
                                  '?h=20'
                                : 'assets/default_image.png',
                    });
                }
            }
        }
        this.autocomplete = 'isOn';
    };

    inputAutoCompleteSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map((term) =>
                term === '' // term.length < n
                    ? []
                    : this.species
                          .filter(
                              (v) =>
                                  v['name']
                                      .toLowerCase()
                                      .indexOf(term.toLowerCase()) > -1
                              // v => new RegExp(term, "gi").test(v["name"])
                          )
                          .slice(0, taxonAutocompleteMaxResults)
            )
        );

    inputAutoCompleteFormatter = (x: { name: string }) => x.name;

    onTaxonSelected(taxon: any): void {
        this.selectedTaxon = taxon;
        this.speciesSiteForm.controls['cd_nom'].patchValue(
            taxon.taxref['cd_nom']
        );
    }

    isSelectedTaxon(taxon: any): boolean {
        if (this.selectedTaxon)
            return this.selectedTaxon.taxref.cd_nom === taxon.taxref.cd_nom;
    }
}
