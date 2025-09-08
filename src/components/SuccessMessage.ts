import { Component } from './base/Component';
import { IOrderResult } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

export class SuccessMessage extends Component {
    private title: HTMLElement;
    private description: HTMLElement;
    private closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, private events: EventEmitter) {
        super(container);
        this.title = ensureElement<HTMLElement>('.order-success__title', this.container);
        this.description = ensureElement<HTMLElement>('.order-success__description', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

        this.closeButton.addEventListener('click', () => {
            this.events.emit('modal:close');
        });
    }

    // Отрисовать сообщение
    render(result: IOrderResult): void {
        this.setText(this.description, `Списано ${result.total} синапсов`);
    }
}