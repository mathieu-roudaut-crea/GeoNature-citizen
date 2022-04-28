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
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from "@angular/forms";



@Component({
    selector: 'app-areas-dataviz-allobs',
    templateUrl: './dataviz-allobs.component.html',
    styleUrls: ['./dataviz-allobs.component.css'],
})
export class DatavizAllObsComponent extends ProgramBaseComponent implements OnInit {
	appConfig = AppConfig;

	program_id;
	@Input('species') species: any;
	@Input('stages') stages: any;
	@Input('years') years: any;
	@Input('userDashboard') userDashboard = false;
	public mountains: any;
	public speciesList = [];
	public yearsList = [];
	public stagesList = [];
	public mountainsList = [];
	public checkSpeciesNumber = 0;
	public checkYearsNumber = 0;
	public checkStagesNumber = 0;
	public checkMountainsNumber = 0;
	public datavizForm: FormGroup;
	public control: FormArray;
	public isSpeciesCompared: Boolean = false;
	//public isSpeciesFiltered: Boolean = false;
	//public disableSpeciesFilter: Boolean = false;
	//public disableMountainFilter: Boolean = false;
	//public disableYearsFilter: Boolean = false;
	//public disableStagesFilter: Boolean = false;
	public selectedSpeciesList = []
	public selectedYearsList = []
	public selectedStagesList = []
	public selectedMountainsList = []


	constructor(
		private route: ActivatedRoute,
		private programService: GncProgramsService,
		public flowService: AreaModalFlowService,
		public areaService: AreaService,
		protected modalService: ModalsTopbarService,
		private fb: FormBuilder,
		authService: AuthService
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
		this.initForm();  
	}

	initForm(): void {
		this.datavizForm = this.fb.group({
		  species: [null],
		  years: [null],
		  stages: [null],
		  mountains: [null]
		});
	}

	loadData() {
		if (!this.program_id) {
			return;
		}
		console.log(this.appConfig.mountains)
		this.mountains = this.appConfig.mountains
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

	check_species_number(item) {
		this.selectedYearsList = []
		this.selectedStagesList = []
		this.selectedMountainsList = []
		if (item.isChecked) {
			this.checkSpeciesNumber++;
			this.selectedSpeciesList.push(item.species.cd_nom);
		} else {
			this.checkSpeciesNumber--;
			this.selectedSpeciesList = this.selectedSpeciesList.filter(obj =>obj !== item.species.cd_nom);
		}
		console.log(this.selectedSpeciesList);
	}

	check_years_number(item) {
		this.selectedSpeciesList = []
		this.selectedStagesList = []
		this.selectedMountainsList = []
		if (item.isChecked) {
			this.checkYearsNumber++;
			this.selectedYearsList.push(item.year);
		} else {
			this.checkYearsNumber--;
			this.selectedYearsList = this.selectedYearsList.filter(obj =>obj !== item.year);
		}
		console.log(this.selectedYearsList);
	}

	check_stages_number(item) {
		this.selectedSpeciesList = []
		this.selectedYearsList = []
		this.selectedMountainsList = []
		if (item.isChecked) {
			this.checkStagesNumber++;
			this.selectedStagesList.push(item.stage.id_species_stage);
		} else {
			this.checkStagesNumber--;
			this.selectedStagesList = this.selectedStagesList.filter(obj =>obj !== item.stage.id_species_stage);
		}
		console.log(this.selectedStagesList);
	}

	check_mountains_number(item) {
		this.selectedSpeciesList = []
		this.selectedYearsList = []
		this.selectedStagesList = []
		if (item.isChecked) {
			this.checkMountainsNumber++;
			this.selectedMountainsList.push(item.name);
		} else {
			this.checkMountainsNumber--;
			this.selectedMountainsList = this.selectedMountainsList.filter(obj =>obj !== item.name);
		}
		console.log(this.selectedMountainsList);
	}

	onSetSpecies(event, modal) {
		this.set_species_list();
		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
            });
	}

	onSetYears(event, modal) {
		this.set_years_list();
		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
            });
	}

	onSetStages(event, modal) {
		this.set_stages_list();
		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
            });
	}

	onSetMountains(event, modal) {
		this.set_mountains_list();
		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
            });
	}

	set_species_list() {
		this.speciesList = [];
		for (let sp of this.species.features) {
			this.speciesList.push({'species': sp.properties, 'isChecked': false})
		}
	}

	set_years_list() {
		this.yearsList = [];
		for (let y of this.years.years) {
			this.yearsList.push({'year': y, 'isChecked': false})
		}
	}

	set_stages_list() {
		this.stagesList = [];
		for (let stage of this.stages.features) {
			let index = this.stagesList.findIndex(x => {
				x.stage.id_species_stage == stage.properties.id_species_stage
			});
			index === -1 ? this.stagesList.push({'stage': stage.properties, 'isChecked': false}) : console.log('existe déjà');
		}
	}

	set_mountains_list() {
		this.mountainsList = []
		for (let mountain of this.mountains) {
			this.mountainsList.push({'mountain': mountain.name, 'isChecked': false})
		}
	}

	onSpeciesSelect(event) {
		this.selectedSpeciesList = []
		this.selectedSpeciesList.push(event.target.value);
		console.log(this.selectedSpeciesList);
	}

	onYearsSelect(event) {
		this.selectedYearsList = []
		this.selectedYearsList.push(event.target.value);
		console.log(this.selectedYearsList);
	}

	onStagesSelect(event) {
		this.selectedStagesList = []
		this.selectedStagesList.push(event.target.value);
		console.log(this.selectedStagesList);
	}

	onMountainsSelect(event) {
		this.selectedMountainsList = []
		this.selectedMountainsList.push(event.target.value);
		console.log(this.selectedMountainsList);
	}

}