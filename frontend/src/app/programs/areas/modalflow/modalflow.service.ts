import { Injectable } from '@angular/core';

import { FlowItem } from '../../observations/modalflow/flow/flow-item';
import { FlowComponent } from '../../observations/modalflow/flow/flow.component';
import { OnboardComponent } from '../../observations/modalflow/steps/onboard/onboard.component';
import { AreaStepComponent } from './steps/area/area_step.component';
import { VisitStepComponent } from './steps/visit/visit_step.component';
import { AreaCongratsComponent } from './steps/congrats/congrats.component';
import { RewardComponent } from '../../observations/modalflow/steps/reward/reward.component';
import { ModalFlowService } from '../../observations/modalflow/modalflow.service';

@Injectable({
    providedIn: 'root',
})
export class AreaModalFlowService extends ModalFlowService {
    getFlowItems(init_data: any) {
        const items = [];
        items.push(
            new FlowItem(OnboardComponent, { ...init_data, service: this })
        );
        if (!init_data.area_id) {
            items.push(
                new FlowItem(AreaStepComponent, { ...init_data, service: this })
            );
            items.push(
                new FlowItem(AreaCongratsComponent, {
                    service: this,
                    date: new Date().toLocaleDateString(),
                })
            );
        }
        if (!init_data.updateData) {
            items.push(new FlowItem(VisitStepComponent));
        } // else user only edits the area and do not attach visit
        // items.push(new FlowItem(RewardComponent, {service: this}));
        return items;
    }

    addAreaVisit(area_id) {
        const init_data = { area_id: area_id };
        this.openFormModal(init_data);
    }

    openFormModal(init_data) {
        const flowitems = this.getFlowItems(init_data);
        const modalRef = this.open(FlowComponent);
        modalRef.componentInstance.flowItems = flowitems;
    }
}
