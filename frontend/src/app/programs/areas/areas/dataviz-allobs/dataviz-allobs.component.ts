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
	public colors = ['#7d9e18', '#892132'];
	public Highcharts = Highcharts;
	public chartConstructor = "chart";
  	public chartCallback;
	public chartOptions = {
    chart: {
			  plotBackgroundImage: 'assets/dataviz2/mountain_background.png'
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
			},
			tooltip: {
			  formatter: function () { 
					return `<b>${this.point.day}/${this.point.month}/${this.point.year}</b><br>
									${this.point.y} mètre(s) </br>
									Observé par ${this.point.observers.concat(',')} </br>
									à ${this.point.commune}`
				}
			},
			plotOptions: {
			  series: {
				marker: {
				  enabled: true
				}
			  }
			},
			colors: ['#7d9e18', '#7d9e18', '#892132', '#892132'],
			title: {
        text: ''
    	},
			// legend: {
      //   enabled: false
    	// },
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
			.subscribe((species:any) => {
				this.species = species.features;
				this.set_species_list();
			});
		this.programService
			.getProgramYears(this.program_id)
			.toPromise()
			.then((years:any) => {
				this.years = years.years;
				this.set_years_list();
			});

		this.programService
			.getProgramStages(this.program_id)
			.toPromise()
			.then((stages:any) => {
				this.stages = stages.features;
				this.set_stages_list();
				console.log(localStorage.getItem('username'));
			});
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

	getObsFor2Years() {
		this.programService
				.getObservationsFor2Years(this.onData.years[0], this.onData.years[1], this.onData.stages[0])
				.subscribe((data) => {
					this.dataToDisplay = data;
					this.displayYearsBiplot(this.dataToDisplay);
					this.applyFilters();
				});
	}

	getObsFor2Stages() {
		this.programService
				.getObservationsFor2Stages(this.onData.stages[0], this.onData.stages[1])
				.subscribe((data) => {
					this.dataToDisplay = data;
					console.log(this.dataToDisplay);
					this.displayStagesBiplot(this.dataToDisplay);
					this.applyFilters();
				});
	}

	getObsFor2Departments() {
		console.log(this.onData)
		let selectedMountain0 = this.AppConfig.mountains.find(e => e.name === this.onData.mountains[0]);
		let selectedMountain1 = this.AppConfig.mountains.find(e => e.name === this.onData.mountains[1]);
		this.programService
				.getObservationsFor2Department(selectedMountain0.postalCodes, selectedMountain1.postalCodes, this.onData.stages[0])
				.subscribe((data) => {
					this.dataToDisplay = data;
					console.log(this.dataToDisplay);
					this.displayMountainsBiplot(this.dataToDisplay);
					this.applyFilters();
				});
	}

	function(chart) {
		chart.series({names: 'names'});
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
		if (this.checkYearsNumber === 2) {
			this.getObsFor2Years();
			this.modalService.close();
		}
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
		if (this.checkStagesNumber === 2) {
			this.getObsFor2Stages();
			this.modalService.close();
		}
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
		if (this.checkMountainsNumber === 2){
			this.getObsFor2Departments();
			this.modalService.close();
		} 
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
		this.datavizForm.controls['stages'].setValue(this.stagesList[4].stage.name);
		this.onData.stages.push(this.stagesList[4].stage.name);
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
				windowClass: 'dataviz2',
				centered: true,
				backdrop  : 'static',
				keyboard  : false
			}
		);
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
				windowClass: 'dataviz2',
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
				windowClass: 'dataviz2',
				centered: true,
				backdrop  : 'static',
				keyboard  : false
			}
		);
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
				windowClass: 'dataviz2',
				centered: true,
				backdrop  : 'static',
				keyboard  : false
			});
	}

	set_species_list() {
		this.speciesList = this.species.map(e => ({'species': e.properties, "isChecked": false}))
	}

	set_years_list() {
		this.yearsList = this.years.map(e => ({'year': e, "isChecked": false}))
	}

	set_stages_list() {
		this.stagesList = this.stages
												.map(e => ({'stage': e.properties, 'isChecked': false}))
												.filter((e, i, self) => i === self.findIndex((t) => t.stage.name === e.stage.name))
												.filter((e) => !["Chute des feuilles moitié", "Chute des feuilles fin"].includes(e.stage.name))
	}

	set_mountains_list() {
		this.mountainsList = this.mountains.map(e => ({'name': e.name, "isChecked": false}))
	}

	onSpeciesSelect(event) {
		this.onData.species = event.target.value !== '' ? [event.target.value] : [];
		this.comparedType !== 'species' && this.applyFilters();
	}

	onYearsSelect(event) {
		this.onData.years = event.target.value !== '' ? [event.target.value] : [];
		this.comparedType !== 'years' && this.applyFilters();
	}

	onStagesSelect(event) {
		this.onData.stages = event.target.value !== '' ? [event.target.value] : [];
		this.comparedType === 'species' ? this.getObsFor2Species() :
		this.comparedType === 'years' ? this.getObsFor2Years() : 
		this.comparedType === 'mountains' ? this.getObsFor2Departments() : 
																				console.log()
	}

	onMountainsSelect(event) {
		this.onData.mountains = event.target.value !== '' ? [event.target.value] : [];
		this.comparedType !== 'mountains' && this.applyFilters();
	}

	applyFilters() {
		// apply year and mountain filter to data to display
		let filteredDataToDisplay = this.dataToDisplay
		
		if (this.comparedType !== 'mountains' && this.onData.mountains.length !== 0) {
			// trouver les dep 'postCodes' du massif selectionne
			let selectedMountain = this.AppConfig.mountains.find(
				(item) => {return item.name == this.onData.mountains[0]}
			);
			// filtrer si dans liste
			filteredDataToDisplay = filteredDataToDisplay.filter(
				(item) => {return selectedMountain.postalCodes.includes(item.dep)}
			)
		}
	
		// filtrer dataToDisplay sur les annees
		if (this.comparedType !== 'years' && this.onData.years.length !== 0) {
			filteredDataToDisplay = filteredDataToDisplay.filter(
				(item) => {return new Date(item.date).getUTCFullYear() == this.onData.years[0]}
			)
		}

		if (this.comparedType !== 'species' && this.onData.species.length !== 0) {
			filteredDataToDisplay = filteredDataToDisplay.filter(
				(item) => {return item.specie == this.onData.species[0]}
			)
		}

		if (this.comparedType !== 'stages' && this.onData.stages.length !== 0) {
			filteredDataToDisplay = filteredDataToDisplay.filter(
				(item) => {return item.stage == this.onData.stages[0]}
			)
		}

		this.comparedType === 'species' ? this.displaySpeciesBiplot(filteredDataToDisplay) :
		this.comparedType === 'years' ? this.displayYearsBiplot(filteredDataToDisplay) : 
		this.comparedType === 'stages' ? this.displayStagesBiplot(filteredDataToDisplay):
		this.comparedType === 'mountains' ? this.displayMountainsBiplot(filteredDataToDisplay):console.log("")
		
	}

	getStyles(index) {
		return {'backgroundColor': this.colors[index]}
	}

	displaySpeciesBiplot(data) {
		this.chartOptions.series = []
		let speciesName0 = this.getSpeciesNames(this.onData.species[0]);
		let speciesName1 = this.getSpeciesNames(this.onData.species[1]);
		const serie_user = data
				.filter(e => e.specie === Number(this.onData.species[0]))
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie = data
				.filter(e => e.specie === Number(this.onData.species[0]))
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2 = data
				.filter(e => e.specie === Number(this.onData.species[1]))
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2_user = data
				.filter(e => e.specie === Number(this.onData.species[1]))
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${speciesName0.nom_vern}`,
			data: serie,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${speciesName0.nom_vern}`,
			data: serie_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${speciesName1.nom_vern}`,
			data: serie2,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${speciesName1.nom_vern}`,
			data: serie2_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.updateFlag = true
	}

	displayYearsBiplot(data) {
		this.chartOptions.series = []
		let yearsName0 = this.onData.years[0];
		let yearsName1 = this.onData.years[1];
		const serie_user = data
				.filter(e => e.date.includes(yearsName0))
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie = data
				.filter(e => e.date.includes(yearsName0))
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2 = data
				.filter(e => e.date.includes(yearsName1))
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2_user = data
				.filter(e => e.date.includes(yearsName1))
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${yearsName0}`,
			data: serie,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${yearsName0}`,
			data: serie_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})

		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${yearsName1}`,
			data: serie2,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${yearsName1}`,
			data: serie2_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})

		this.updateFlag = true
	}

	displayStagesBiplot(data) {
		this.chartOptions.series = []
		let stagesName0 = this.onData.stages[0];
		let stagesName1 = this.onData.stages[1];
		const serie_user = data
				.filter(e => e.stage === stagesName0)
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie = data
				.filter(e => e.stage === stagesName0)
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2 = data
				.filter(e => e.stage === stagesName1)
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2_user = data
				.filter(e => e.stage === stagesName1)
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${stagesName0}`,
			data: serie,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${stagesName0}`,
			data: serie_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})

		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${stagesName1}`,
			data: serie2,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${stagesName1}`,
			data: serie2_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})

		this.updateFlag = true
	}

	displayMountainsBiplot(data) {
		this.chartOptions.series = []
		let mountainsName0 = this.onData.mountains[0];
		let mountainsName1 = this.onData.mountains[1];
		let selectedMountain0 = this.AppConfig.mountains.find(e => e.name === mountainsName0);
		let selectedMountain1 = this.AppConfig.mountains.find(e => e.name === mountainsName1);
		console.log(selectedMountain0)
		console.log(selectedMountain1)
		const serie_user = data
				.filter(e => selectedMountain0.postalCodes.includes(e.dep))
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie = data
				.filter(e => selectedMountain0.postalCodes.includes(e.dep))
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2 = data
				.filter(e => selectedMountain1.postalCodes.includes(e.dep))
				.filter(e => !e.user.includes('ColinVR'))
				//.filter(e => e.user !== localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		const serie2_user = data
				.filter(e => selectedMountain1.postalCodes.includes(e.dep))
				.filter(e => e.user.includes('ColinVR'))
				//.filter(e => e.user === localStorage.getItem('username'))
				.map(e => {
					const alt = e.altitude === null ? 0 :e.altitude
					const date = e.date.match(/\w{3}, (\d{2}) (\w{3}) (\d{4})/)
					return {x:Date.UTC(2022, this.months[date[2]]-1, Number(date[1])), y:alt, day:Number(date[1]), month:this.months[date[2]], year:Number(date[3]), nb_individues:e.nb, observers:e.user, commune:e.commune}
				})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${mountainsName0}`,
			data: serie,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${mountainsName0}`,
			data: serie_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_green_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Les observations ${mountainsName1}`,
			data: serie2,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circle.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.chartOptions.series.push({
			type: "scatter",
			name: `Mes observations ${mountainsName1}`,
			data: serie2_user,
			marker: {
			symbol: 'url(assets/dataviz2/icon_red_circles.svg)',
			width: this.size_icon,
			height: this.size_icon
			}
		})
		this.updateFlag = true
	}

}