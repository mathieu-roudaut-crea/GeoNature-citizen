import { Component, Input, ViewChild } from '@angular/core';

import { IFlowComponent } from '../../../../observations/modalflow/flow/flow';
import { SpeciesSiteFormComponent } from '../../../species_sites/species_site_form/species_site_form.component';
import { AreaService } from '../../../areas.service';

@Component({
    templateUrl: './species_site_step.component.html',
    styleUrls: ['./species_site_step.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class SpeciesSiteStepComponent implements IFlowComponent {
    @Input() data: any;
    @ViewChild(SpeciesSiteFormComponent, { static: true })
    form: SpeciesSiteFormComponent;
    closeAfterSending = false;

    constructor(public areaService: AreaService) {}

    committedThenClose() {
        this.closeAfterSending = true;
        this.sendForm();
    }

    committed() {
        this.closeAfterSending = false;
        this.sendForm();
    }

    sendForm() {
        const resp = this.form.onFormSubmit();
        console.debug('committed action > data:', this.data);
        // Wait for resolution of http promise "resp"
        // to get new created species_site's id and pass it to next step as extra_data
        resp.then(
            function (result) {
                if (result.features) {
                    // SpeciesSite created
                    const species_site_id =
                        result.features[0].properties.id_species_site;
                    this.areaService.newSpeciesSiteCreated.emit(
                        result.features[0]
                    );
                    this.data.next({
                        ...this.data,
                        species_site_id: species_site_id,
                    });
                    if (this.closeAfterSending) {
                        this.closeModal();
                    }
                } else {
                    // SpeciesSite edited
                    this.data.next(this.data);
                    this.areaService.speciesSiteEdited.emit();
                    this.closeModal();
                }
            }.bind(this)
        );
    }

    closeModal() {
        this.data.service.closeModal();
    }
}
