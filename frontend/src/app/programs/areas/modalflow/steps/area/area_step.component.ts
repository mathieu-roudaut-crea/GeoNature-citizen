import { Component, Input, ViewChild } from '@angular/core';

import { IFlowComponent } from '../../../../observations/modalflow/flow/flow';
import { AreaFormComponent } from '../../../areaform/areaform.component';
import { AreaService } from '../../../areas.service';

@Component({
    templateUrl: './area_step.component.html',
    styleUrls: ['./area_step.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class AreaStepComponent implements IFlowComponent {
    @Input() data: any;
    @ViewChild(AreaFormComponent, { static: true }) form: AreaFormComponent;

    constructor(public areaService: AreaService) {}

    committed() {
        let resp: any;
        resp = this.form.onFormSubmit();
        console.debug('committed action > data:', this.data);
        // Wait for resolution of http promise "resp"
        // to get new created area's id and pass it to next step as extra_data
        let that = this;
        resp.then(function (result) {
            if (result.features) {
                // Area created
                let area_id = result.features[0].properties.id_area;
                that.areaService.newAreaCreated.emit(result.features[0]);
                that.data.next({ ...that.data, area_id: area_id });
            } else {
                // Area edited
                that.data.next(that.data);
                that.areaService.areaEdited.emit();
                that.closeModal();
            }
        });
    }

    closeModal() {
        this.data.service.closeModal();
    }
}
