import {
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ViewChildren,
    QueryList,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FeatureCollection } from 'geojson';

import { GncProgramsService } from '../../../api/gnc-programs.service';
import { Program } from '../../programs.models';
import { AreaModalFlowService } from '../modalflow/modalflow.service';
import { AreaService } from '../areas.service';
import { AreasMapComponent } from '../../areas/areas/map/areamap.component';
import { AreasListComponent } from '../areas/list/list.component';
import { AreaModalFlowComponent } from '../modalflow/modalflow.component';
import { ProgramBaseComponent } from '../../base/program-base.component';

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
    title = 'Areas';
    areas: FeatureCollection;
    userDashboard = false;
    @ViewChild(AreasMapComponent, { static: true }) areasMap: AreasMapComponent;
    @ViewChild(AreasListComponent, { static: true })
    areasList: AreasListComponent;
    @ViewChildren(AreaModalFlowComponent)
    modalFlow: QueryList<AreaModalFlowComponent>;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        public flowService: AreaModalFlowService,
        public areaService: AreaService
    ) {
        super();
        this.route.params.subscribe(
            (params) => (this.program_id = params['id'])
        );
        this.route.fragment.subscribe((fragment) => {
            this.fragment = fragment;
        });
        this.areaService.newAreaCreated.subscribe((newAreaFeature) => {
            this.loadAreas();
        });
    }

    ngOnInit() {
        this.route.data.subscribe((data: { programs: Program[] }) => {
            // TODO: merge observables
            this.programs = data.programs;
            this.program = this.programs.find(
                (p) => p.id_program == this.program_id
            );
            this.loadAreas();
            this.programService
                .getProgram(this.program_id)
                .subscribe((program) => (this.programFeature = program));
        });
    }

    loadAreas() {
        this.programService
            .getProgramAreas(this.program_id)
            .subscribe((areas) => {
                this.areas = areas;
            });
    }

    addAreaClicked() {
        this.modalFlow.first.clicked();
    }
}
