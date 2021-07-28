import { Injectable, EventEmitter, Output } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AreaService {
    @Output() newAreaCreated: EventEmitter<any> = new EventEmitter();
    @Output() areaEdited: EventEmitter<any> = new EventEmitter();
    @Output() deleteArea = new EventEmitter();
}
