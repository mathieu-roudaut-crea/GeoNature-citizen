import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
    ViewChild,
    ElementRef,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AreaModalFlowService } from '../../modalflow/modalflow.service';
import { UserService } from '../../../../auth/user-dashboard/user.service.service';
import { AreaService } from '../../areas.service';
import { AppConfig } from '../../../../../conf/app.config';
import { Point } from 'leaflet';
import { ModalsTopbarService } from '../../../../core/topbar/modalTopbar.service';

@Component({
    selector: 'app-species-sites-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class SpeciesSitesListComponent implements OnChanges {
    @Input('speciesSites') speciesSitesCollection: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @Input('admin') admin = false;
    @Input('program_id') program_id: number;
    @Input('displayForm') display_form: boolean;
    @Output('speciesSiteSelect') speciesSiteSelect: EventEmitter<Feature> =
        new EventEmitter();
    @ViewChild('deleteSpeciesSiteModal', { static: true })
    deleteSpeciesSiteModal: ElementRef;

    municipalities: string[] = [];
    speciesSites = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;
    deletionModalRef;
    selectedSpeciesSiteId = 0;
    selectedProgram = null;
    selectedTaxon = null;
    appConfig = AppConfig;

    constructor(
        public flowService: AreaModalFlowService,
        private userService: UserService,
        private areaService: AreaService,
        private modalService: ModalsTopbarService
    ) {}

    ngOnChanges() {
        if (this.speciesSitesCollection) {
            this.speciesSites = this.speciesSitesCollection['features'];

            this.speciesSites.forEach((speciesSite) => {
                const coords: Point = new Point(
                    speciesSite.geometry.coordinates[0],
                    speciesSite.geometry.coordinates[1]
                );
                speciesSite.properties.coords = coords;
            });

            this.taxa = this.speciesSitesCollection.features
                .map((features) => features.properties.species)
                .filter((species) => species && species.cd_nom)
                .filter(
                    (species, index, array) =>
                        array
                            .map((spec) => spec.cd_nom)
                            .indexOf(species.cd_nom) === index
                );
        }
    }

    onAddSpeciesSiteObservationClick(species_site_id) {
        this.flowService.addSpeciesSiteObservation(species_site_id);
    }

    onDeleteSpeciesSiteModalOpen(selectedSpeciesSiteId: number) {
        this.selectedSpeciesSiteId = selectedSpeciesSiteId;
        this.deletionModalRef = this.modalService.open(
            this.deleteSpeciesSiteModal,
            {
                windowClass: 'delete-modal',
                centered: true,
            }
        );
    }

    onDeleteSpeciesSite() {
        this.areaService
            .deleteSpeciesSite(this.selectedSpeciesSiteId)
            .subscribe(() => {
                this.areaService.speciesSiteDeleted.emit();
                this.selectedSpeciesSiteId = null;
                this.deletionModalRef.close();
            });
    }

    onSpeciesSiteClick(e): void {
        this.speciesSiteSelect.emit(e);
    }

    onFilterChange(): void {
        this.speciesSites = this.speciesSitesCollection['features'].filter(
            (speciesSite) => {
                let sameTaxon = true;
                let sameProgram = true;
                if (this.selectedTaxon) {
                    sameTaxon =
                        speciesSite.properties.cd_nom ==
                        this.selectedTaxon.cd_nom;
                }
                if (this.selectedProgram) {
                    sameProgram =
                        speciesSite.properties.area.program_id ==
                        this.selectedProgram.program_id;
                }
                return sameTaxon && sameProgram;
            }
        );
    }
}
