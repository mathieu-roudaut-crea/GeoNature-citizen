import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
    Inject,
    LOCALE_ID,
    ViewChild,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AppConfig } from '../../../../../conf/app.config';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ModalsTopbarService } from '../../../../core/topbar/modalTopbar.service';
import { AuthService } from '../../../../auth/auth.service';
import { PhotosModalComponent } from '../photos_modal/photos_modal.component';
import { UserService } from '../../../../auth/user-dashboard/user.service.service';
import { AreaService } from '../../areas.service';

@Component({
    selector: 'app-species-sites-obs-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class SpeciesSitesObsListComponent implements OnChanges {
    @Input('observations') observationsCollection: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @Input('admin') admin = false;
    @Input('program_id') program_id: number;
    @Output() refreshListEvent = new EventEmitter<string>();

    @ViewChild('deleteObservationModal', { static: true })
    deleteObservationModal;

    observations: Feature[] = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;
    page = 1;
    pageSize = 10;
    collectionSize = 0;
    deletionModalRef;
    selectedObservationId = 0;

    constructor(
        private modalService: ModalsTopbarService,
        private areaService: AreaService,
        private userService: UserService
    ) {}

    ngOnChanges() {
        if (this.observationsCollection) {
            if (this.observationsCollection['maximum_count']) {
                this.collectionSize =
                    this.observationsCollection['maximum_count'];
                this.updateVisibleObservations(
                    this.observationsCollection['features']
                );
            } else {
                this.collectionSize = this.observationsCollection['count'];
                this.updateVisibleObservations(
                    this.observationsCollection['features'].slice(
                        (this.page - 1) * this.pageSize,
                        (this.page - 1) * this.pageSize + this.pageSize
                    )
                );
            }
        } else {
            this.refreshListEvent.emit(
                '{"page": ' + this.page + ', "pageSize": ' + this.pageSize + '}'
            );
        }
    }

    refreshList() {
        if (this.observationsCollection['maximum_count']) {
            this.refreshListEvent.emit(
                '{"page": ' + this.page + ', "pageSize": ' + this.pageSize + '}'
            );
        } else {
            this.updateVisibleObservations(
                this.observationsCollection['features'].slice(
                    (this.page - 1) * this.pageSize,
                    (this.page - 1) * this.pageSize + this.pageSize
                )
            );
        }
    }

    updateVisibleObservations(visibleObservations) {
        this.observations = visibleObservations.filter(
            (observation) =>
                observation &&
                observation.properties &&
                observation.properties.species_site
        );
    }

    getStateInfo(stateKey) {
        let stateToReturn = {};
        AppConfig.validationStates.forEach((state) => {
            if (state.key === stateKey) {
                stateToReturn = state;
            }
        });
        return stateToReturn;
    }

    onDeleteObservationModalOpen(selectedObservationId: number) {
        this.selectedObservationId = selectedObservationId;
        this.deletionModalRef = this.modalService.open(
            this.deleteObservationModal,
            {
                windowClass: 'delete-modal',
                centered: true,
            }
        );
    }

    onDeleteObservation() {
        this.areaService
            .deleteObservation(this.selectedObservationId)
            .subscribe(() => {
                this.areaService.speciesSiteObsDeleted.emit();
                this.selectedObservationId = null;
                this.deletionModalRef.close();
            });
    }

    showPhotos(photos) {
        const modalRef = this.modalService.open(PhotosModalComponent, {
            size: 'lg',
            windowClass: 'add-obs-modal',
            centered: true,
        });
        modalRef.componentInstance.photos = photos;
    }
}
