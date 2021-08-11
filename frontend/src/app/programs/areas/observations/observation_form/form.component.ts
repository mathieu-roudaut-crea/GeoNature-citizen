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
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

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
        data: new FormControl(''),
        species_stage_id: new FormControl(0),
        stages_step_id: new FormControl(0),
    });
    selectedStage = 0;
    selectedStep = 0;
    steps: any[] = [];
    currentStep = 1;
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
    formInputObject: object = {};

    photos: any[] = [];

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private programService: GncProgramsService,
        public areaService: AreaService
    ) {}

    ngOnInit() {
        console.debug('ngOnInit');
        console.debug('species_site_id:', this.species_site_id);
        // const that = this;
        this.loadJsonSchema().subscribe((data: any) => {
            this.initForm(data);
        });
    }

    ngAfterViewInit() {
        this.programService
            .getSpeciesSiteDetails(this.species_site_id)
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
            data: this.jsonData[this.currentStep],
            layout: this.partialLayout,
        };
    }
    nextStep() {
        this.currentStep += 1;
        this.updateFormInput();
    }
    previousStep() {
        this.currentStep -= 1;
        this.updateFormInput();
    }
    updatePartialLayout() {
        if (this.jsonSchema.steps) {
            this.partialLayout =
                this.jsonSchema.steps[this.currentStep - 1].layout;
        } else {
            this.partialLayout = this.jsonSchema.layout;
        }
        this.partialLayout[this.partialLayout.length - 1].expanded =
            this.advancedMode;
    }
    isFirstStep() {
        return this.currentStep === 1;
    }
    isLastStep() {
        return this.currentStep === this.totalSteps();
    }
    totalSteps() {
        return this.jsonSchema.steps ? this.jsonSchema.steps.length : 1;
    }
    invalidStep() {
        return (
            this.currentStep === 1 && this.observationForm.get('date').invalid
        );
    }
    yourOnChangesFn(e) {
        this.jsonData[this.currentStep] = e;
    }
    getTotalJsonData() {
        let resp = {};
        for (const key of Object.keys(this.jsonData)) {
            resp = { ...resp, ...this.jsonData[key] };
        }
        return resp;
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

    stepIsNotSelected() {
        return (
            this.speciesSite.properties.stages.count && this.selectedStep === 0
        );
    }

    onFormSubmit(): boolean {
        console.debug('formValues:', this.observationForm.value);

        if (this.stepIsNotSelected()) {
            const field = this.selectedStage
                ? 'stages_step_id'
                : 'species_stage_id';
            this.observationForm.get(field).setErrors({
                notSelected: true,
            });
            return false;
        }
        if (this.selectedStep === 0) {
            this.observationForm.get('stages_step_id').setValue(null);
        }


        this.postSpeciesSiteObservation().subscribe(
            (data) => {
                console.debug(data);
            },
            (err) => console.error(err),
            () => console.log('done')
            // TODO: queue obs in list
        );
        return true;
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
        this.observationForm.patchValue({
            data: this.getTotalJsonData(),
            date: new Date(visitDate.year, visitDate.month, visitDate.day)
                .toISOString()
                .match(/\d{4}-\d{2}-\d{2}/)[0],
        });
        return this.http.post<any>(
            `${this.URL}/areas/species_sites/${this.species_site_id}/observations`,
            this.observationForm.value,
            httpOptions
        );
    }
}
