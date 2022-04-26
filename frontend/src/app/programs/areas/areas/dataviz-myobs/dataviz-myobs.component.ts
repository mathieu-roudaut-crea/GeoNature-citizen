import { Component, Inject, Input, OnInit, PLATFORM_ID, QueryList } from '@angular/core';
import { GncProgramsService } from '../../../../api/gnc-programs.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { ProgramBaseComponent } from 'src/app/programs/base/program-base.component';
import { AreaModalFlowService } from '../../modalflow/modalflow.service';
import { AreaService } from '../../areas.service';
import { ModalsTopbarService } from 'src/app/core/topbar/modalTopbar.service';
import { AreaModalFlowComponent } from '../../modalflow/modalflow.component';
import { Program } from 'src/app/programs/programs.models';
import { FeatureCollection } from 'geojson';
import { AppConfig } from '../../../../../conf/app.config';

@Component({
    selector: 'app-areas-dataviz-myobs',
    templateUrl: './dataviz-myobs.component.html',
    styleUrls: ['./dataviz-myobs.component.css'],
})
export class DatavizMyObsComponent extends ProgramBaseComponent implements OnInit {

    obsList;
    speciesList;
    program_id;
    isBrowser: boolean;
    selectedAreas;
    selectedSpecies;
    selectedStages;
    obs;
    individues= [];
    years;
    months;
    weeks;
    dataTable= [];
    title = 'Areas';
    @Input('areas') areas: FeatureCollection;
    @Input('species') species: any;
    @Input('stages') stages: any;
    @Input('userDashboard') userDashboard = false;
    modalFlow: QueryList<AreaModalFlowComponent>;
    Months = {
        "01": "Janvier",
        "02": "Février",
        "03": "Mars",
        "04": "Avril",
        "05": "Mai",
        "06": "Juin",
        "07": "Juillet",
        "08": "Aout",
        "09": "Septembre",
        "10": "Octobre",
        "11": "Novembre",
        "12": "Décembre",
    }

    colors = [
        "#0D74A6",
        "#5DC4E5",
        "#4B750E",
        "#AFCA19",
        "#EF7D0F",
        "#EABC00",
        "#6F2282",
        "#C7017F",
        "#8E3414",
        "#D1954E"
    ]

    tranfos = [
        "invert(50%) sepia(94%) saturate(2038%) hue-rotate(159deg) brightness(92%) contrast(101%)",
        "invert(77%) sepia(6%) saturate(4118%) hue-rotate(160deg) brightness(93%) contrast(93%)",
        "invert(40%) sepia(75%) saturate(4890%) hue-rotate(63deg) brightness(87%) contrast(89%)",
        "invert(90%) sepia(15%) saturate(3074%) hue-rotate(14deg) brightness(92%) contrast(80%)",
        "invert(49%) sepia(32%) saturate(2341%) hue-rotate(1deg)  brightness(103%) contrast(88%)",
        "invert(83%) sepia(50%) saturate(6588%) hue-rotate(17deg) brightness(110%) contrast(110%)",
        "invert(18%) sepia(65%) saturate(1982%) hue-rotate(266deg) brightness(94%) contrast(101%)",
        "invert(15%) sepia(92%) saturate(4813%) hue-rotate(312deg) brightness(79%) contrast(106%)",
        "invert(21%) sepia(25%) saturate(4936%) hue-rotate(355deg) brightness(97%) contrast(89%)",
        "invert(62%) sepia(100%) saturate(296%) hue-rotate(346deg) brightness(87%) contrast(87%)"
    ]

    icons = {
        "no_floraison":"stage_absence_floraison.svg",
        "Changement couleur début":"stage_Changement_couleur_debut.svg",
        "Changement couleur moitié":"stage_Changement_couleur_moitie.svg",
        "Débourrement":"stage_debourrement.svg",
        "Feuillaison":"stage_Feuillaison.svg",
        "Floraison":"stage_floraison.svg"
    }

    good_obs = {
        "Débourrement":["environ 10% des bourgeons sont ouverts"],
        "Feuillaison":["environ 10% des feuilles sont étalées"],
        "Floraison":["environ 10% des fleurs s’épanouissent","cet individu n’a pas fleuri cette année"],
        "Changement couleur début":["environ 10% des feuilles sont en partie jaunes ou marron"],
        "Changement couleur moitié":["environ 50% des feuilles sont en partie jaunes ou marron"]
    }

    constructor(
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        public flowService: AreaModalFlowService,
        public areaService: AreaService,
        protected modalService: ModalsTopbarService,
        authService: AuthService
    ) {
        super(authService);
        // this.isBrowser = isPlatformBrowser(platformId);
        this.route.params.subscribe(
            (params) => (this.program_id = params['id'])
        );
        this.route.fragment.subscribe((fragment) => {
            this.fragment = fragment;
        });
    }
    ngOnInit(): void {
        this.route.data.subscribe((data: { programs: Program[] }) => {
            if (this.userDashboard) {
                return;
            }
            this.loadData();
        });        
    }

    ngAfterViewInit(): void {
        this.verifyProgramPrivacyAndUser();
    }

    extractMonth(listObs) {
        let temp = listObs
            .map(e => e.properties.date.split("-")[1])
        temp = temp.filter((c, index) => temp.indexOf(c) === index);
        return temp.sort();
    }

    extractWeek(listObs) {
        let temp = listObs
            .map(e => e.properties.date.split("-")[1])
        temp = temp.filter((c, index) => temp.indexOf(c) === index);
        const weeks = []
        temp.forEach(m => {
            weeks.push(`${m}-01`)
            weeks.push(`${m}-02`)
            weeks.push(`${m}-03`)
            weeks.push(`${m}-04`)
            weeks.push(`${m}-05`)
            weeks.push(`${m}-06`)
            weeks.push(`${m}-07`)
            weeks.push(`${m}-08`)
            weeks.push(`${m}-09`)
            weeks.push(`${m}-10`)
            weeks.push(`${m}-11`)
            weeks.push(`${m}-12`)
            weeks.push(`${m}-13`)
            weeks.push(`${m}-14`)
            weeks.push(`${m}-15`)
            weeks.push(`${m}-16`)
            weeks.push(`${m}-17`)
            weeks.push(`${m}-18`)
            weeks.push(`${m}-19`)
            weeks.push(`${m}-20`)
            weeks.push(`${m}-21`)
            weeks.push(`${m}-22`)
            weeks.push(`${m}-23`)
            weeks.push(`${m}-24`)
            weeks.push(`${m}-25`)
            weeks.push(`${m}-26`)
            weeks.push(`${m}-27`)
            weeks.push(`${m}-28`)
            weeks.push(`${m}-29`)
            weeks.push(`${m}-30`)
        })
        return weeks.sort();
    }

    extractYear(listObs) {
        let temp = listObs
                .filter(e => e.properties.species_site.id_area === this.selectedAreas )
                .map(e => e.properties.date.split("-")[0])
        temp = temp.filter((c, index) => temp.indexOf(c) === index);
        return temp;
    }

    extractStage(listObs) {
        return listObs[0].properties.stages_step.species_stage.name
    }

    extractIndividu(listObs) {
        let temp = listObs
            .map(e => e.properties.species_site.name)
        temp = temp.filter((c, index) => temp.indexOf(c) === index);
        return temp.map((ind, i) => { return { name: ind, color: this.colors[i % this.colors.length], transfo: this.tranfos[i % this.tranfos.length] } });
    }

    displayPopup(e, obs) {
        if(obs.displayPopup){
            obs.displayPopup = false
        } else {
            this.dataTable.forEach(year => {
                year.months.forEach(month => {
                    month.data.forEach(d => {
                        d.displayPopup = false
                    })
                })
            })
            obs.displayPopup = true
        }
        
    }

    over(e) {
        e.target.style.transform="scale(1.2)"
    }

    out(e) {
        e.target.style.transform="scale(1)"
    }

    displayTable(listObs) {
        let stage = this.extractStage(listObs.features)
        let good_initule = this.good_obs[stage]
        listObs.features = listObs.features.filter(obs => {
            return good_initule.some(gi => obs.properties.stages_step.name.includes(gi)) 
        })
        listObs.features.forEach(obs => {
            good_initule.forEach(gi => {
                if(obs.properties.stages_step.name.includes(gi)){
                    obs.properties.stages_step.name = gi
                }
            })
        })
        this.years = this.extractYear(listObs.features)
        this.months = this.extractMonth(listObs.features)
        this.weeks = this.extractWeek(listObs.features)
        this.individues = this.extractIndividu(listObs.features)
        this.dataTable = this.years.map(y => {
            const ms = this.weeks.map((m,i) => {
                const dataOfMonth = []
                let date_min = `${y}-${m}`
                let date_max = `${y}-${this.weeks[i+1]}`
                listObs.features.forEach(obs => {
                    if (obs.properties.date.localeCompare(date_min)>=0 && obs.properties.date.localeCompare(date_max)<0) {
                        const good_indiv = this.individues.filter(indiv => indiv.name === obs.properties.species_site.name)[0]
                        dataOfMonth.push({id:obs.properties.id_species_site_observation,
                                          date: obs.properties.date,
                                          obs_name: obs.properties.stages_step.name,
                                          src: obs.properties.stages_step.name === "cet individu n’a pas fleuri cette année" ? `assets/${this.icons["no_floraison"]}` : `assets/${this.icons[stage]}`,
                                          name:good_indiv.name,
                                          color:good_indiv.color,
                                          transfo:good_indiv.transfo,
                                          year: y,
                                          month: m,
                                          displayPopup: false
                                        })
                    }
                })
                return {month:this.Months[m], data:dataOfMonth}
            })
            return {year:y, months:ms}
        })
    }

    loadData() {
        if (!this.program_id) {
            return;
        }
        this.programService
            .getProgramAreas(this.program_id)
            .subscribe((areas) => {
                this.areas = areas;
                this.selectedAreas = this.areas.features[0].properties.id_area
                this.programService
                    .getCurrentUserAreaSpecies(this.selectedAreas)
                    .toPromise()
                    .then((species:any) => {
                        this.species = species
                        this.selectedSpecies = this.species.features[0].properties.cd_nom
                        this.programService
                            .getCurrentUserAreaSpeciesStages(this.selectedAreas, this.selectedSpecies)
                            .toPromise()
                            .then((stages:any) => {
                                this.stages = stages
                                this.selectedStages = this.stages.features[0].properties.id_species_stage
                                this.programService
                                .getStageObservations(this.selectedAreas, this.selectedStages)
                                .toPromise()
                                .then((obs:any) => {
                                    obs.features.length !== 0 && this.displayTable(obs)
                                })
                            });
                    });
            });
    }

    onChangeAreasFilter(event: Event): void {
        this.dataTable = []
        this.individues = []
        this.programService
            .getCurrentUserAreaSpecies(this.selectedAreas)
            .toPromise()
            .then((species:any) => {
                this.species = species
                if(this.species.features.length != 0 ) {
                    this.selectedSpecies = this.species.features[0].properties.cd_nom
                    this.programService
                        .getCurrentUserAreaSpeciesStages(this.selectedAreas, this.selectedSpecies)
                        .toPromise()
                        .then((stages:any) => {
                            this.stages = stages
                            this.selectedStages = this.stages.features[0].properties.id_species_stage
                            this.programService
                                .getStageObservations(this.selectedAreas, this.selectedStages)
                                .toPromise()
                                .then((obs:any) => {
                                    obs.features.length !== 0 && this.displayTable(obs)
                                })
                        });
                } else {
                    this.stages = []
                }
            });
    }

    onChangeSpeciesFilter(event: Event): void {
        this.dataTable = []
        this.individues = []
        this.programService
            .getCurrentUserAreaSpeciesStages(this.selectedAreas, this.selectedSpecies)
            .toPromise()
            .then((stages:any) => {
                this.stages = stages
                this.selectedStages = this.stages.features[0].properties.id_species_stage
                this.programService
                .getStageObservations(this.selectedAreas, this.selectedStages)
                .toPromise()
                .then((obs:any) => {
                   obs.features.length !== 0 && this.displayTable(obs)
                })
            });
    }

    onChangeStagesFilter(event: Event): void {
        this.dataTable = []
        this.individues = []
        this.programService
            .getStageObservations(this.selectedAreas, this.selectedStages)
            .toPromise()
            .then((obs:any) => {
                obs.features.length !== 0 && this.displayTable(obs)
            })
    }
}