import { Component } from './base/Component';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';
import { IOrderResult } from '../types';

interface SuccessData extends IOrderResult {
    onClose: () => void;
}

export class SuccessMessage extends Component<SuccessData> {
    protected _title: HTMLElement;
    protected _description: HTMLElement;
    protected _closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._title = ensureElement<HTMLElement>('.order-success__title', container);
        this._description = ensureElement<HTMLElement>('.order-success__description', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);

        this._closeButton.addEventListener('click', () => {
            if (this._data.onClose) {
                this._data.onClose();
            }
        });
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set onClose(value: () => void) {
        this._data.onClose = value;
    }

    render(data: Partial<SuccessData>): HTMLElement {
        super.render(data);
        return this.container;
    }
}
