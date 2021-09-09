import { Injectable, EventEmitter, Output } from '@angular/core';
import { AppConfig } from '../../../conf/app.config';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class AreaService {
    constructor(private http: HttpClient) {}

    @Output() newAreaCreated: EventEmitter<any> = new EventEmitter();
    @Output() areaEdited: EventEmitter<any> = new EventEmitter();
    @Output() areaDeleted = new EventEmitter();

    @Output() newSpeciesSiteCreated: EventEmitter<any> = new EventEmitter();
    @Output() speciesSiteEdited: EventEmitter<any> = new EventEmitter();
    @Output() speciesSiteDeleted = new EventEmitter();

    @Output() newSpeciesSiteObsCreated: EventEmitter<any> = new EventEmitter();
    @Output() speciesSiteObsEdited: EventEmitter<any> = new EventEmitter();
    @Output() speciesSiteObsDeleted = new EventEmitter();

    deleteArea(areaId) {
        return this.http.delete(`${AppConfig.API_ENDPOINT}/areas/${areaId}`);
    }
    deleteSpeciesSite(speciesSiteId) {
        return this.http.delete(
            `${AppConfig.API_ENDPOINT}/areas/species_sites/${speciesSiteId}`
        );
    }
    deleteObservation(observationId) {
        return this.http.delete(
            `${AppConfig.API_ENDPOINT}/areas/observations/${observationId}`
        );
    }
}
