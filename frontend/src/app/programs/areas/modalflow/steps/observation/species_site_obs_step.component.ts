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
        this.form.onFormSubmit().subscribe(
            function (result) {
                if (result) {
                    this.router.navigate([
                        `/programs/${result.features[0].program_id}/areas-observations`,
                    ]);
                }
            }.bind(this)
        );
    }

    committed() {
        this.form.onFormSubmit().subscribe(
            function (result) {
                if (result) {
                    console.debug('committed action > data:', this.data);
                    this.data.service.close(null);
                }
            }.bind(this)
        );
    }

    closeModal() {
        this.data.service.closeModal();
    }
}
