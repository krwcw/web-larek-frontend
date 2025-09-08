import { Component } from './base/Component';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

interface HeaderData {
    counter: number;
}

export class Header extends Component<HeaderData> {
    protected _counterElement: HTMLElement;
    protected _basketButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._counterElement = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);

        this._basketButton.addEventListener('click', () => {
            events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this.setText(this._counterElement, String(value));
    }

    render(data: Partial<HeaderData>): HTMLElement {
        super.render(data);
        return this.container;
    }
}