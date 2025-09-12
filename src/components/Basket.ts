import { Component } from './base/Component';
import { EventEmitter, Events } from './base/events';
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

        this._button.addEventListener('click', () => {
            events.emit(Events.ORDER_OPEN);
        });
    }

    set items(items: IBasketItem[]) {
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
            const template = ensureElement<HTMLTemplateElement>('#card-basket');
            const element = cloneTemplate<HTMLLIElement>(template);
            
            const index = ensureElement<HTMLElement>('.basket__item-index', element);
            const title = ensureElement<HTMLElement>('.card__title', element);
            const price = ensureElement<HTMLElement>('.card__price', element);
            const deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', element);
            
            this.setText(index, item.index.toString());
            this.setText(title, item.product.title);
            
            const priceText = item.product.price === null 
                ? 'Бесценно' 
                : `${item.product.price} синапсов`;
            this.setText(price, priceText);
            
            deleteButton.addEventListener('click', () => {
                this.events.emit(Events.BASKET_REMOVE, { productId: item.product.id });
            });
            
            this._list.appendChild(element);
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