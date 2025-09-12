import { Component } from './base/Component';
import { EventEmitter, Events } from './base/events';
import { ensureElement } from '../utils/utils';
import { IOrderResult } from '../types';

interface SuccessData extends IOrderResult {
    description: string;
}

export class SuccessMessage extends Component<SuccessData> {
    protected _description: HTMLElement;
    protected _closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._description = ensureElement<HTMLElement>('.order-success__description', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);

        this._closeButton.addEventListener('click', () => {
            events.emit(Events.SUCCESS_CLOSE);
        });
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    render(data: Partial<SuccessData>): HTMLElement {
        super.render(data);
        
        if (data.description) {
            this.description = data.description;
        }
        
        return this.container;
    }
}