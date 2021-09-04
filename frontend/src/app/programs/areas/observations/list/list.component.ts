import {
    Component,
    OnChanges,
    Input,
    EventEmitter,
    Output,
    Inject,
    LOCALE_ID,
} from '@angular/core';

import { FeatureCollection, Feature } from 'geojson';
import { AppConfig } from '../../../../../conf/app.config';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ModalsTopbarService } from '../../../../core/topbar/modalTopbar.service';
import { AuthService } from '../../../../auth/auth.service';
import { PhotosModalComponent } from '../photos_modal/photos_modal.component';

@Component({
    selector: 'app-species-sites-obs-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css'],
})
export class SpeciesSitesObsListComponent implements OnChanges {
    @Input('observations') observationsCollection: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @Input('program_id') program_id: number;
    @Output() refreshListEvent = new EventEmitter<string>();
    observations: Feature[] = [];
    taxa: any[] = [];
    apiEndpoint = AppConfig.API_ENDPOINT;
    page = 1;
    pageSize = 10;
    collectionSize = 0;

    constructor(private modalService: ModalsTopbarService) {}

    ngOnChanges() {
        if (this.observationsCollection) {
            if (this.observationsCollection['maximum_count']) {
                this.collectionSize =
                    this.observationsCollection['maximum_count'];
                this.observations = this.observationsCollection['features'];
            } else {
                this.collectionSize = this.observationsCollection['count'];
                this.observations = this.observationsCollection[
                    'features'
                ].slice(
                    (this.page - 1) * this.pageSize,
                    (this.page - 1) * this.pageSize + this.pageSize
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
            this.observations = this.observationsCollection['features'].slice(
                (this.page - 1) * this.pageSize,
                (this.page - 1) * this.pageSize + this.pageSize
            );
        }
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
