import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
    ViewChild,
    OnInit,
    ElementRef,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AreaModalFlowService } from '../../modalflow/modalflow.service';
import { UserService } from '../../../../auth/user-dashboard/user.service.service';
import { AreaService } from '../../areas.service';
import { AppConfig } from '../../../../../conf/app.config';
import * as L from 'leaflet';
import { ModalsTopbarService } from '../../../../core/topbar/modalTopbar.service';

@Component({
    selector: 'app-areas-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class AreasListComponent implements OnChanges {
    @Input('areas') areasCollection: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @Input('admin') admin = false;
    @Input('program_id') program_id: number;
    @Input('displayForm') display_form: boolean;
    @Output('areaSelect') areaSelect: EventEmitter<Feature> =
        new EventEmitter();
    @ViewChild('deleteAreaModal', { static: true }) deleteAreaModal: ElementRef;

    municipalities: string[] = [];
    areas = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;
    deletionModalRef;
    selectedAreaId = 0;

    selectedProgram = null;
    selectedMunicipality = null;

    constructor(
        public flowService: AreaModalFlowService,
        private userService: UserService,
        private modalService: ModalsTopbarService,
        private areaService: AreaService
    ) {}

    onDeleteAreaModalOpen(selectedAreaId: number) {
        this.selectedAreaId = selectedAreaId;
        this.deletionModalRef = this.modalService.open(this.deleteAreaModal, {
            windowClass: 'delete-modal',
            centered: true,
        });
    }

    onDeleteArea() {
        this.areaService.deleteArea(this.selectedAreaId).subscribe(() => {
            this.areaService.areaDeleted.emit();
            this.selectedAreaId = null;
            this.deletionModalRef.close();
        });
    }

    ngOnChanges() {
        if (this.areasCollection) {
            this.areas = this.areasCollection['features'];

            this.areas.forEach((area) => {
                const areaCenter = L.geoJSON(area).getBounds().getCenter();
                area.properties.coords = new L.Point(
                    areaCenter.lng,
                    areaCenter.lat
                );
            });

            this.municipalities = this.areasCollection.features
                .map((area) => area.properties.municipality_data)
                .filter(
                    (municipality) => municipality && municipality.area_name
                )
                .filter(
                    (municipality, index, array) =>
                        array
                            .map((city) => city.area_name)
                            .indexOf(municipality.area_name) === index
                );
        }
    }

    onAddSpeciesSiteClick(area_id) {
        this.flowService.addAreaSpeciesSite(area_id);
    }

    onAreaClick(e): void {
        this.areaSelect.emit(e);
    }

    onFilterChange(): void {
        this.areas = this.areasCollection['features'].filter((obs) => {
            let sameMunicipality = true;
            let sameProgram = true;
            if (this.selectedMunicipality) {
                sameMunicipality =
                    obs.properties.municipality_data.area_code ==
                    this.selectedMunicipality.area_code;
            }
            if (this.selectedProgram) {
                sameProgram =
                    obs.properties.cd_nom == this.selectedProgram.program_id;
            }
            return sameMunicipality && sameProgram;
        });
    }
}
