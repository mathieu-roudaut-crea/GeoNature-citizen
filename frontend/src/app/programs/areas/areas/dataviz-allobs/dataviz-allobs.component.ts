import { Component, Inject, Input, OnInit, PLATFORM_ID, QueryList } from '@angular/core';
import { GncProgramsService } from '../../../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { ProgramBaseComponent } from '../../../../programs/base/program-base.component';
import { AreaModalFlowService } from '../../modalflow/modalflow.service';
import { AreaService } from '../../areas.service';
import { ModalsTopbarService } from '../../../../core/topbar/modalTopbar.service';
import { Program } from '../../../../programs/programs.models';
import { AppConfig } from '../../../../../conf/app.config';
import { FormGroup, FormBuilder } from "@angular/forms";


@Component({
    selector: 'app-areas-dataviz-allobs',
    templateUrl: './dataviz-allobs.component.html',
    styleUrls: ['./dataviz-allobs.component.css'],
})
export class DatavizAllObsComponent extends ProgramBaseComponent implements OnInit {
	appConfig = AppConfig;

	selectedSpecies;
	selectedYear;
	program_id;
	@Input('species') species: any;
	@Input('stages') stages: any;
	@Input('years') years: any;
	@Input('userDashboard') userDashboard = false;
	public speciesList = [];
	public checkSpeciesNumber = 0;

	constructor(
		private route: ActivatedRoute,
		private programService: GncProgramsService,
		public flowService: AreaModalFlowService,
		public areaService: AreaService,
		protected modalService: ModalsTopbarService,
		authService: AuthService,
		private fb: FormBuilder
	) {
		super(authService);
		this.route.params.subscribe(
			(params) => (this.program_id = params['id'])
		);
		// this.route.fragment.subscribe((fragment) => {
		// 	this.fragment = fragment;
		// });
	}
  
	ngOnInit(): void {
		this.route.data.subscribe((data: { programs: Program[] }) => {
			if (this.userDashboard) {
				return;
			}
			this.loadData();
		});  
	}

	loadData() {
		if (!this.program_id) {
			return;
		}
		console.log(this.appConfig.mountains)
		this.programService
			.getProgramSpecies(this.program_id)
			.subscribe((species) => {
				this.species = species;
				console.log(this.species);
			});
		this.programService
			.getProgramYears(this.program_id)
			.toPromise()
			.then((years:any) => {
				this.years = years;
				console.log(this.years);
			});

		this.programService
			.getProgramStages(this.program_id)
			.toPromise()
			.then((stages:any) => {
				this.stages = stages;
				console.log(this.stages);
			});
	}

	onSetSpecies(event, modal) {
		this.set_species_list()
		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
            });
	}

	check_species_number(item) {
		if (item.isChecked) {
			this.checkSpeciesNumber++;
		} else {
			this.checkSpeciesNumber--;
		}
	}

	onSetYears() {
		this.get_years();
	}

	onSetStages() {
		this.get_stages();
	}

	set_species_list() {
		for (let sp of this.species.features) {
			this.speciesList.push({'species': sp.properties, 'isChecked': false})
		}
	}

	get_years() {
		this.programService
			.getProgramYears(this.program_id)
			.toPromise()
			.then((years:any) => {
				this.years = years;
				console.log(this.years);
			});
	}

	get_stages() {
		console.log('test');
	}

	onChangeSpecies(val) {
		console.log(val);
	}

}