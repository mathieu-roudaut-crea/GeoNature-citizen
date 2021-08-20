import {
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ViewChildren,
    QueryList, Input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FeatureCollection } from 'geojson';

import { GncProgramsService } from '../../../api/gnc-programs.service';
import { Program } from '../../programs.models';
import { AreaModalFlowService } from '../modalflow/modalflow.service';
import { AreaService } from '../areas.service';
import { SpeciesSitesMapComponent } from './map/species_sites_map.component';
import { SpeciesSitesListComponent } from './list/list.component';
import { AreaModalFlowComponent } from '../modalflow/modalflow.component';
import { ProgramBaseComponent } from '../../base/program-base.component';
import { AuthService } from '../../../auth/auth.service';

@Component({
    selector: 'app-species-sites',
    templateUrl: './species_sites.component.html',
    styleUrls: [
        '../../observations/obs.component.css',
        '../../../home/home.component.css',
        './species_sites.component.css',
    ],
    encapsulation: ViewEncapsulation.None,
})
export class SpeciesSitesComponent
    extends ProgramBaseComponent
    implements OnInit
{
    title = 'SpeciesSites';
    @Input('speciesSites') speciesSites: FeatureCollection;
    @Input('userDashboard') userDashboard = false;
    @ViewChild(SpeciesSitesMapComponent, { static: true })
    speciesSitesMap: SpeciesSitesMapComponent;
    @ViewChild(SpeciesSitesListComponent, { static: true })
    speciesSitesList: SpeciesSitesListComponent;
    @ViewChildren(AreaModalFlowComponent)
    modalFlow: QueryList<AreaModalFlowComponent>;
    area_id: number;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        public flowService: AreaModalFlowService,
        public areaService: AreaService,
        authService: AuthService
    ) {
        super(authService);

        this.route.params.subscribe((params) => {
            this.program_id = params['program_id'];
        });
        this.route.fragment.subscribe((fragment) => {
            this.fragment = fragment;
        });
        this.areaService.newSpeciesSiteCreated.subscribe(
            (newSpeciesSiteFeature) => {
                this.loadData();
            }
        );
    }

    ngOnInit() {
        this.route.data.subscribe((data: { programs: Program[] }) => {
            if (this.userDashboard) {
                return;
            }

            this.programs = data.programs;
            this.program = this.programs.find(
                (p) => p.id_program == this.program_id
            );

            this.verifyProgramPrivacyAndUser();

            this.programService
                .getProgram(this.program_id)
                .subscribe((program) => (this.programFeature = program));

            this.loadData();
        });
    }

    loadData() {
        this.programService
            .getProgramSpeciesSites(this.program_id)
            .subscribe((speciesSites) => {
                this.speciesSites = speciesSites;
            });
    }
}
