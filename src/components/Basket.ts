import { Component } from './base/Component';
import { EventEmitter, Events } from './base/events';
import { ensureElement } from '../utils/utils';

interface BasketData {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<BasketData> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);

        this._button.addEventListener('click', () => {
            events.emit(Events.ORDER_OPEN);
        });
    }

    set items(items: HTMLElement[]) {
        this._list.innerHTML = '';
        
        if (items.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Корзина пуста';
            emptyMessage.classList.add('basket__empty');
            this._list.appendChild(emptyMessage);
            this.setDisabled(this._button, true);
            return;
        }

        this.setDisabled(this._button, false);

        items.forEach(item => {
            this._list.appendChild(item);
        });
    }

    set total(value: number) {
        this.setText(this._total, `${value} синапсов`);
    }

    render(data: Partial<BasketData>): HTMLElement {
        super.render(data);
        return this.container;
    }
}