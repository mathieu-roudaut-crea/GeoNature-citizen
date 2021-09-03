import {
    Component,
    ViewEncapsulation,
    OnInit,
    AfterViewInit,
    ViewChild,
    Input,
    ElementRef,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

import { AppConfig } from '../../../../../conf/app.config';

import { GNCFrameworkComponent } from '../../../base/jsonform/framework/framework.component';
import { ngbDateMaxIsToday } from '../../../observations/form/formValidators';
import { AreaService } from '../../areas.service';
import { GncProgramsService } from '../../../../api/gnc-programs.service';

declare let $: any;

@Component({
    selector: 'app-species-site-obs-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class SpeciesSiteObservationFormComponent
    implements OnInit, AfterViewInit
{
    private readonly URL = AppConfig.API_ENDPOINT;
    @Input() species_site_id: number;
    @Input('data') data;

    today = new Date();
    observationForm = new FormGroup({
        date: new FormControl(
            {
                year: this.today.getFullYear(),
                month: this.today.getMonth() + 1,
                day: this.today.getDate(),
            },
            [Validators.required, ngbDateMaxIsToday()]
        ),
        json_data: new FormControl(''),
        species_stage_id: new FormControl(0),
        stages_step_id: new FormControl(0),
        id_species_site_observation: new FormControl(),
    });
    selectedStage = 0;
    selectedStep = 0;
    steps: any[] = [];
    partialLayout: any[] = [];
    advancedMode = false;
    jsonData: object = {};
    speciesSite: any;
    formOptions: any = {
        loadExternalAssets: false,
        debug: false,
        returnEmptyFields: false,
        addSubmit: false,
    };
    jsonSchema: any = {};
    readyToDisplay = false;
    GNCBootstrap4Framework: any = {
        framework: GNCFrameworkComponent,
    };
    formInputObject: object;

    photos: any[] = [];
    apiEndpoint = '';

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        private dateParser: NgbDateParserFormatter,
        public areaService: AreaService
    ) {
        this.apiEndpoint = AppConfig.API_ENDPOINT;
    }

    ngOnInit() {
        console.debug('ngOnInit');
        if (this.data && this.data.obsUpdateData) {
            this.patchForm(this.data.obsUpdateData);
        }

        this.loadJsonSchema().subscribe((data: any) => {
            this.initForm(data);
        });
    }

    patchForm(obsUpdateData): void {
        this.species_site_id = obsUpdateData.id_species_site;
        this.jsonData = obsUpdateData.json_data;

        this.selectedStage = obsUpdateData.stages_step
            ? obsUpdateData.stages_step.id_species_stage
            : 0;
        this.selectedStep = obsUpdateData.id_stages_step;

        this.observationForm.patchValue({
            name: obsUpdateData.name,
            area_id: obsUpdateData.area_id,
            id_stages_step: obsUpdateData.id_stages_step,
            date: this.dateParser.parse(obsUpdateData.date),
            id_species_site_observation:
                obsUpdateData.id_species_site_observation,
        });
    }

    ngAfterViewInit() {
        this.programService
            .getSpeciesSiteDetails(this.species_site_id, true, true)
            .subscribe((speciesSites) => {
                this.speciesSite = speciesSites['features'][0];
            });
    }

    initForm(json_schema) {
        this.jsonSchema = json_schema;
        this.updatePartialLayout();
        this.updateFormInput();
        this.readyToDisplay = true;
    }
    loadJsonSchema() {
        return this.http.get(
            `${this.URL}/areas/species_site/${this.species_site_id}/obs/jsonschema`
        );
    }
    updateFormInput() {
        this.updatePartialLayout();
        this.formInputObject = {
            schema: this.jsonSchema.schema,
            data: this.jsonData,
            layout: this.partialLayout,
        };
    }
    updatePartialLayout() {
        this.partialLayout = this.jsonSchema.layout;
        this.partialLayout[this.partialLayout.length - 1].expanded =
            this.advancedMode;
    }
    yourOnChangesFn(e) {
        this.jsonData = e;
    }
    toogleAdvancedMode() {
        this.advancedMode = !this.advancedMode;
        this.updatePartialLayout();
    }
    addImage(event) {
        this.photos.push(event.file);
    }
    deleteImage(event) {
        for (let i = 0; i < this.photos.length; i++) {
            if (this.photos[i] == event.file) {
                this.photos.splice(i, 1);
            }
        }
    }

    onSelectedStageChange(): void {
        const stages = this.speciesSite.properties.stages.features.filter(
            (stage) => stage.properties.id_species_stage == this.selectedStage
        );

        const newSteps =
            stages.length && Array.isArray(stages[0].properties.steps.features)
                ? stages[0].properties.steps.features
                : [];

        this.steps = newSteps;
    }

    onSelectedStepChange(): void {
        this.observationForm.get('date').setErrors(null);
    }

    stepIsNotSelected() {
        return (
            this.speciesSite.properties.stages.count && this.selectedStep === 0
        );
    }

    getCurrentStepOrder() {
        let stepOrder = 0;
        this.steps.forEach((step) => {
            if (step.properties.id_stages_step === this.selectedStep) {
                stepOrder = step.properties.order;
            }
        });
        return stepOrder;
    }

    stageAlreadyAddedThisYear() {
        const observations = this.speciesSite.properties.observations;
        let sameStageThisYear = false;
        let dateOfStageStep = null;

        observations.features.forEach((observation) => {
            if (
                !sameStageThisYear &&
                observation.properties.stages_step &&
                observation.properties.date.startsWith(
                    this.observationForm.value.date.year + ''
                ) &&
                this.observationForm.value.id_species_site_observation !=
                    observation.properties.id_species_site_observation &&
                (this.observationForm.value.stages_step_id ==
                    observation.properties.stages_step.id_stages_step ||
                    observation.properties.stages_step.order > 1)
            ) {
                dateOfStageStep = observation.properties.date;
                sameStageThisYear = true;
            }
        });

        if (sameStageThisYear && this.getCurrentStepOrder() === 1) {
            const dateParts = dateOfStageStep.split('-');
            const latestStepDate = new Date(
                dateParts[0],
                dateParts[1] - 1,
                dateParts[2]
            );
            const formDate = new Date(
                this.observationForm.value.date.year,
                this.observationForm.value.date.month - 1,
                this.observationForm.value.date.day
            );
            if (latestStepDate > formDate) {
                return false;
            }
        }

        return sameStageThisYear;
    }

    onFormSubmit(): Observable<any> {
        console.debug('formValues:', this.observationForm.value);

        if (this.stepIsNotSelected()) {
            const field = this.selectedStage
                ? 'stages_step_id'
                : 'species_stage_id';
            this.observationForm.get(field).setErrors({
                notSelected: true,
            });
            return new Observable((subscriber) => {
                subscriber.next(null);
            });
        }

        if (this.stageAlreadyAddedThisYear()) {
            this.observationForm.get('date').setErrors({
                stepThisYear: true,
            });

            return new Observable((subscriber) => {
                subscriber.next(null);
            });
        }

        if (this.selectedStep === 0 || this.observationForm.value.stages_step_id === 0) {
            this.observationForm.get('stages_step_id').setValue(null);
        }

        return this.postSpeciesSiteObservation();
    }

    postSpeciesSiteObservation(): Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders({
                Accept: 'application/json',
            }),
        };

        const visitDate = NgbDate.from(
            this.observationForm.controls.date.value
        );

        const formData = this.observationForm.value;
        formData.json_data = JSON.stringify(this.jsonData);
        formData.date = new Date(
            visitDate.year,
            visitDate.month - 1,
            visitDate.day + 1
        )
            .toISOString()
            .match(/\d{4}-\d{2}-\d{2}/)[0];

        if (this.data.obsUpdateData) {
            return this.http.patch<any>(
                `${this.URL}/areas/observations/`,
                formData,
                httpOptions
            );
        } else {
            return this.http.post<any>(
                `${this.URL}/areas/species_sites/${this.species_site_id}/observations`,
                formData,
                httpOptions
            );
        }
    }
}
