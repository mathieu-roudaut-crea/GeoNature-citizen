import { Component, Inject, Input, LOCALE_ID, ViewChild } from '@angular/core';

import { IFlowComponent } from '../../../../observations/modalflow/flow/flow';
import { SpeciesSiteObservationFormComponent } from '../../../observations/observation_form/form.component';
import { Router } from '@angular/router';

@Component({
    templateUrl: './species_site_obs_step.component.html',
    styleUrls: ['./species_site_obs_step.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class SpeciesSiteObsStepComponent implements IFlowComponent {
    @Input() data: any;
    @ViewChild(SpeciesSiteObservationFormComponent, { static: true })
    form: SpeciesSiteObservationFormComponent;
    program_id: number;

    constructor(private router: Router) {}

    committedAndShowObs() {
        console.log('response', this.form.onFormSubmit());
        this.form.onFormSubmit().subscribe(
            function (result) {
                this.router.navigate([
                    `/programs/${result.features[0].program_id}/areas-observations`,
                ]);
            }.bind(this)
        );
    }

    committed() {
        if (this.form.onFormSubmit() !== null) {
            console.debug('committed action > data:', this.data);
            this.data.service.close(null);
        }
    }

    closeModal() {
        this.data.service.closeModal();
    }
}
