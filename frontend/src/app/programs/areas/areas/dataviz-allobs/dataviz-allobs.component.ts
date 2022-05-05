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
//import { ThrowStmt } from '@angular/compiler';
import * as Highcharts from 'highcharts';
import { datavizSelection } from './dataviz-allobs.interface';


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
	public size_icon = 20;
	public Highcharts = Highcharts;
	public chartConstructor = "chart";
  	public chartCallback;
	public chartOptions = {
    chart: {
			  plotBackgroundImage: 'assets/dataviz2/mountain_background.png'
			},
			title: {
			  text: 'Dataviz 2'
			},
			xAxis: {
			  type: 'datetime',
			  dateTimeLabelFormats: {
				month: '%B'
			  }
			},
			yAxis: {
			  title: {
				text: 'Altitude'
			  },
			  min: 0,
			  max: 2000
			},
			tooltip: {
			  headerFormat: '<b>{series.name}</b><br>',
			  pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
			},
		  
			plotOptions: {
			  series: {
				marker: {
				  enabled: true
				}
			  }
			},
		  
			colors: ['#7DA014', '#7DA014', '#7DA014'],
		  
			series: [],
		  
			responsive: {
			  rules: [{
				condition: {
				  maxWidth: 500
				},
				chartOptions: {
				  plotOptions: {
					series: {
					  marker: {
						radius: 2.5
					  }
					}
				  }
				}
			  }]
			}
  };
	// {
	// 		  type: "scatter",
	// 		  name: "Winter 2014-2015",
	// 		  data: [
	// 			[Date.UTC(1970, 7, 25), 100],
	// 			[Date.UTC(1970, 9, 6), 200],
	// 			[Date.UTC(1970, 10, 20), 300],
	// 			[Date.UTC(1970, 11, 25), 1500],
	// 		  ],
	// 		  marker: {
	// 			symbol: 'url(assets/dataviz2/icon_green_circle.svg)',
	// 			width: this.size_icon,
	// 			height: this.size_icon
	// 		  }
	// 		}, {
	// 		  type: "scatter",
	// 		  name: "Winter 2014-2015",
	// 		  data: [
	// 			[Date.UTC(1970, 10, 25), 200],
	// 			[Date.UTC(1970, 11, 6), 300],
	// 			[Date.UTC(1970, 11, 20), 600],
	// 			[Date.UTC(1970, 11, 25), 1000],
	// 		  ],
	// 		  marker: {
	// 			symbol: 'url(assets/dataviz2/icon_green_circles.svg)',
	// 			width: this.size_icon,
	// 			height: this.size_icon
	// 		  }
	// 		}, {
	// 		  type: "scatter",
	// 		  name: "Winter 2015-2016",
	// 		  data: [
	// 			[Date.UTC(1970, 10, 9), 200],
	// 			[Date.UTC(1970, 10, 15), 300],
	// 			[Date.UTC(1970, 10, 20), 500],
	// 			[Date.UTC(1970, 10, 25), 400],
	// 			[Date.UTC(1970, 10, 30), 1000],
	// 		  ],
	// 		  marker: {
	// 			symbol: 'url(assets/dataviz2/icon_green_cross.svg)',
	// 			width: this.size_icon,
	// 			height: this.size_icon
	// 		  }
	// 		}
	public mountains: any;
	public speciesList = [];
	public yearsList = [];
	public stagesList = [];
	public mountainsList = [];
	public checkSpeciesNumber = 0;
	public checkYearsNumber = 0;
	public checkStagesNumber = 0;
	public checkMountainsNumber = 0;
	public graph;
	public datavizForm: FormGroup;
	public control: FormArray;
	public isSpeciesCompared: Boolean = false;
	public onData: datavizSelection = {
		species: [],
		years: [],
		stages: [],
		mountains: []
	};
	public updateFlag = false;
	public comparedType;
	public dataToDisplay: any;

	public months = {
		"Jan": 1,
		"Feb": 2,
		"Mar": 3,
		"Apr": 4,
		"May": 5,
		"Jun": 6,
		"Jul": 7,
		"Aug": 8,
		"Sep": 9,
		"Oct": 10,
		"Nov": 11,
		"Dec": 12,
	}

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
		this.datavizForm.disable();
	}

	loadData() {
		if (!this.program_id) {
			return;
		}
		this.mountains = this.appConfig.mountains;
		this.set_mountains_list();
		this.programService
			.getProgramSpecies(this.program_id)
			.subscribe((species) => {
				this.species = species;
				this.set_species_list();
			});
		this.programService
			.getProgramYears(this.program_id)
			.toPromise()
			.then((years:any) => {
				this.years = years;
				this.set_years_list();
			});

		this.programService
			.getProgramStages(this.program_id)
			.toPromise()
			.then((stages:any) => {
				this.stages = stages;
				this.set_stages_list();
				console.log(localStorage);
			});
	}

	checkSelection() {
		console.log(this.onData);
	}

	getSpeciesNames(cdNom) {
		let taxon = this.speciesList.find(
			(item) => {return item.species.cd_nom == Number(cdNom)}
		);
		return {
			nom_complet: taxon.species.nom_complet,
			nom_vern: taxon.species.nom_vern
		}
	}

	getObsFor2Species() {
		this.programService
				.getObservationsFor2Species(this.onData.species[0], this.onData.species[1], this.onData.stages[0])
				.subscribe((data) => {
					this.dataToDisplay = data;
					this.displaySpeciesBiplot(this.dataToDisplay);
					this.applyFilters();
				});
	}

	check_species_number(item) {
		this.onData.years = []
		//this.onData.stages = []
		this.onData.mountains = []
		if (item.isChecked) {
			this.checkSpeciesNumber++;
			this.onData.species.push(String(item.species.cd_nom));
		} else {
			this.checkSpeciesNumber--;
			this.onData.species = this.onData.species.filter(obj =>obj !== String(item.species.cd_nom));
		}
		if (this.checkSpeciesNumber === 2) {
			this.getObsFor2Species();
			this.modalService.close();
		};
	}

	check_years_number(item) {
		this.onData.species = []
		//this.onData.stages = []
		this.onData.mountains = []
		if (item.isChecked) {
			this.checkYearsNumber++;
			this.onData.years.push(String(item.year));
		} else {
			this.checkYearsNumber--;
			this.onData.years = this.onData.years.filter(obj =>obj !== String(item.year));
		}
		if (this.checkYearsNumber === 2) this.modalService.close();
	}

	check_stages_number(item) {
		this.onData.species = []
		this.onData.years = []
		this.onData.mountains = []
		if (item.isChecked) {
			this.checkStagesNumber++;
			this.onData.stages.push(item.stage.name);
		} else {
			this.checkStagesNumber--;
			this.onData.stages = this.onData.stages.filter(obj =>obj !== item.stage.name);
		}
		if (this.checkStagesNumber === 2) this.modalService.close();
	}

	check_mountains_number(item) {
		this.onData.species = []
		this.onData.years = []
		//this.onData.stages = []
		if (item.isChecked) {
			this.checkMountainsNumber++;
			this.onData.mountains.push(item.name);
		} else {
			this.checkMountainsNumber--;
			this.onData.mountains = this.onData.mountains.filter(obj =>obj !== item.name);
		}
		if (this.checkMountainsNumber === 2) this.modalService.close();
	}

	disableFilter(control) {
		this.datavizForm.controls['species'].enable();
		this.datavizForm.controls['years'].enable();
		this.datavizForm.controls['stages'].enable();
		this.datavizForm.controls['mountains'].enable();
		this.datavizForm.controls[control].disable();
	}

	resetAll() {
		this.resetSeletedItems();
		this.resetCheckItems();
		this.datavizForm.reset();
	}

	resetFilterDefaultValue() {
		this.datavizForm.controls['species'].setValue('');
		this.datavizForm.controls['years'].setValue('');
		this.datavizForm.controls['stages'].setValue('');
		this.datavizForm.controls['stages'].setValue('');
		this.datavizForm.controls['mountains'].setValue('');
	}

	resetSeletedItems() {
		this.onData.species = [];
		this.onData.years = [];
		this.onData.stages = [];
		this.onData.mountains = [];
	}

	resetCheckItems() {
		this.checkSpeciesNumber = 0;
		this.checkYearsNumber = 0;
		this.checkStagesNumber = 0;
		this.checkMountainsNumber = 0;
	}

	setDefaultStage() {
		// default stage = name of first stage of this.stagesList
		this.datavizForm.controls['stages'].setValue(this.stagesList[0].stage.name);
		this.onData.stages.push(this.stagesList[0].stage.name);
	}

	onSetSpecies(event, modal) {
		this.comparedType = 'species';
		this.set_species_list();
		this.resetAll();
		this.resetFilterDefaultValue();
		this.setDefaultStage();
		this.disableFilter('species');

		//open modal
		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
				backdrop  : 'static',
   				keyboard  : false
            });
	}

	onSetYears(event, modal) {
		this.comparedType = 'years';
		this.set_years_list();
		this.resetAll();
		this.resetFilterDefaultValue();
		this.setDefaultStage();
		this.disableFilter('years');

		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
				backdrop  : 'static',
   				keyboard  : false
            });

	}

	onSetStages(event, modal) {
		this.comparedType = 'stages';
		this.set_stages_list();
		this.resetAll();
		this.resetFilterDefaultValue();
		this.disableFilter('stages');

		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
				backdrop  : 'static',
   				keyboard  : false
            });
	}

	onSetMountains(event, modal) {
		this.comparedType = 'mountains';
		this.set_mountains_list();
		this.resetAll();
		this.resetFilterDefaultValue();
		this.setDefaultStage();
		this.disableFilter('mountains');

		this.modalService.open(
			modal, {
                size: 'lg',
                windowClass: 'add-obs-modal',
                centered: true,
				backdrop  : 'static',
   				keyboard  : false
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
			let index = this.stagesList.map(x => x.stage.name).indexOf(stage.properties.name);
			if (index === -1) this.stagesList.push({'stage': stage.properties, 'isChecked': false});
		}
	}

	set_mountains_list() {
		this.mountainsList = []
		for (let mountain of this.mountains) {
			this.mountainsList.push({'name': mountain.name, 'isChecked': false})
		}
	}

	onSpeciesSelect(event) {
		this.onData.species = []
		this.onData.species.push(event.target.value);
	}

	onYearsSelect(event) {
		this.onData.years = []
		if (event.target.value !== '') this.onData.years.push(event.target.value);
		if (this.comparedType === 'species') this.applyFilters();
	}

	onStagesSelect(event) {
		this.onData.stages = []
		this.onData.stages.push(event.target.value);
		if (this.comparedType === 'species') {
			this.getObsFor2Species();
		}
	}

	onMountainsSelect(event) {
		this.onData.mountains = []
		if (event.target.value !== '') this.onData.mountains.push(event.target.value);
		//this.onData.mountains.push(event.target.value);
		if (this.comparedType === 'species') {
			this.applyFilters();
		}
	}

	applyFilters() {
		// apply year and mountain filter to data to display
		let filteredDataToDisplay = this.dataToDisplay
		
		if (this.onData.mountains.length !== 0) {
			// trouver les dep 'postCodes' du massif selectionne
			let selectedMountain = this.AppConfig.mountains.find(
				(item) => {return item.name == this.onData.mountains[0]}
			);
			// filtrer si dans liste
			filteredDataToDisplay = filteredDataToDisplay.filter(
				(item) => {return selectedMountain.postalCodes.includes(item.dep)}
			)
			console.log(filteredDataToDisplay);
		}
	
		// filtrer dataToDisplay sur les annees
		if (this.onData.years.length !== 0) {
			filteredDataToDisplay = filteredDataToDisplay.filter(
				(item) => {return new Date(item.date).getUTCFullYear() == this.onData.years[0]}
			)
		}

		this.displaySpeciesBiplot(filteredDataToDisplay);
	}

	displaySpeciesBiplot(data) {
		this.chartOptions.series = []
		let speciesName0 = this.getSpeciesNames(this.onData.species[0]);
		let speciesName1 = this.getSpeciesNames(this.onData.species[1]);
		const serie = data
				.filter(e => e.specie === Number(this.onData.species[0]))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return [Date.UTC(2022, this.months[date[2]], Number(date[1])), alt]
				})
		const serie2 = data
				.filter(e => e.specie === Number(this.onData.species[1]))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return [Date.UTC(2022, this.months[date[2]], Number(date[1])), alt]
				})
		this.chartOptions.series.push({
			type: "scatter",
			name: speciesName0.nom_complet + " / " + speciesName0.nom_vern,
			data: serie,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: speciesName1.nom_complet + " / " + speciesName1.nom_vern,
			data: serie2,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.updateFlag = true
	}

}