import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
    ViewChild,
    ElementRef,
    OnInit,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AreaModalFlowService } from '../../modalflow/modalflow.service';
import { UserService } from '../../../../auth/user-dashboard/user.service.service';
import { AreaService } from '../../areas.service';
import { AppConfig } from '../../../../../conf/app.config';
import { Point } from 'leaflet';
import { ModalsTopbarService } from '../../../../core/topbar/modalTopbar.service';
import { GncProgramsService } from '../../../../api/gnc-programs.service';

@Component({
    selector: 'app-species-sites-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class SpeciesSitesListComponent implements OnChanges, OnInit {
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
    areas: any[] = [];
    programs: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;
    deletionModalRef;
    selectedSpeciesSiteId = 0;
    selectedProgram = null;
    selectedTaxon = null;
    selectedArea = null;
    appConfig = AppConfig;

    constructor(
        public flowService: AreaModalFlowService,
        private userService: UserService,
        private areaService: AreaService,
        private programService: GncProgramsService,
        private modalService: ModalsTopbarService
    ) {}

    ngOnInit() {
        this.programService
            .getAllPrograms()
            .subscribe((programs) => (this.programs = programs));
    }

    ngOnChanges() {
        if (this.speciesSitesCollection) {
            this.speciesSites = this.speciesSitesCollection['features'].filter(
                (speciesSite) => {
                    return (
                        speciesSite.properties.json_data &&
                        speciesSite.properties.json_data.state !== true
                    );
                }
            );

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

            this.areas = this.speciesSitesCollection.features
                .map((features) => features.properties.area)
                .filter((area) => area && area.id_area)
                .filter(
                    (area, index, array) =>
                        array
                            .map((area) => area.id_area)
                            .indexOf(area.id_area) === index
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
                const sameTaxon =
                    !this.selectedTaxon ||
                    speciesSite.properties.cd_nom === this.selectedTaxon.cd_nom;

                const sameArea =
                    !this.selectedArea ||
                    speciesSite.properties.id_area ===
                        this.selectedArea.id_area;

                const sameProgram =
                    !this.selectedProgram ||
                    speciesSite.properties.area.id_program ===
                        this.selectedProgram.id_program;

                return sameTaxon && sameProgram && sameArea;
            }
        );
    }
}
