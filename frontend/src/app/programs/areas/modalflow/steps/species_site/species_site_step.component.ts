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
    @ViewChild(SpeciesSiteFormComponent, { static: true }) form: SpeciesSiteFormComponent;

    constructor(public areaService: AreaService) {}

    committed() {
        let resp: any;
        resp = this.form.onFormSubmit();
        console.debug('committed action > data:', this.data);
        // Wait for resolution of http promise "resp"
        // to get new created species_site's id and pass it to next step as extra_data
        let that = this;
        resp.then(function (result) {
            if (result.features) {
                // SpeciesSite created
                let species_site_id = result.features[0].properties.id_species_site;
                that.areaService.newSpeciesSiteCreated.emit(result.features[0]);
                that.data.next({ ...that.data, species_site_id: species_site_id });
            } else {
                // SpeciesSite edited
                that.data.next(that.data);
                that.areaService.speciesSiteEdited.emit();
                that.closeModal();
            }
        });
    }

    closeModal() {
        this.data.service.closeModal();
    }
}
