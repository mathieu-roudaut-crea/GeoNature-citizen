import { Component, Input, ViewChild } from '@angular/core';

import { IFlowComponent } from '../../../../observations/modalflow/flow/flow';
import { SpeciesSiteObservationFormComponent } from '../../../observations/observation_form/form.component';

@Component({
    templateUrl: './species_site_obs_step.component.html',
    styleUrls: ['./species_site_obs_step.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class SpeciesSiteObsStepComponent implements IFlowComponent {
    @Input() data: any;
    @ViewChild(SpeciesSiteObservationFormComponent, { static: true })
    form: SpeciesSiteObservationFormComponent;

    committed() {
        this.form.onFormSubmit();
        console.debug('committed action > data:', this.data);
        // this.data.next();
        this.data.service.close(null);
    }

    closeModal() {
        this.data.service.closeModal();
    }
}
