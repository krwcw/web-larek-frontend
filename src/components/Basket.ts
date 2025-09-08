import { Component } from './base/Component';
import { EventEmitter } from './base/events';
import { ensureElement, cloneTemplate } from '../utils/utils';
import { IBasketItem } from '../types';

interface BasketData {
    items: IBasketItem[];
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

        // Обработчик кнопки оформления заказа
        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });
    }

    set items(items: IBasketItem[]) {
        this._list.innerHTML = '';
        items.forEach(item => {
            const template = ensureElement<HTMLTemplateElement>('#card-basket');
            const element = cloneTemplate<HTMLLIElement>(template);
            
            const index = ensureElement<HTMLElement>('.basket__item-index', element);
            const title = ensureElement<HTMLElement>('.card__title', element);
            const price = ensureElement<HTMLElement>('.card__price', element);
            const deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', element);
            
            this.setText(index, item.index.toString());
            this.setText(title, item.product.title);
            this.setText(price, `${item.product.price} синапсов`);
            
            // Обработчик удаления товара
            deleteButton.addEventListener('click', () => {
                this.events.emit('basket:remove', { productId: item.product.id });
            });
            
            this._list.appendChild(element);
        });
    }

    set total(value: number) {
        this.setText(this._total, `${value} синапсов`);
    }

    set buttonDisabled(value: boolean) {
        this.setDisabled(this._button, value);
    }

    render(data: Partial<BasketData>): HTMLElement {
        super.render(data);
        return this.container;
    }
}