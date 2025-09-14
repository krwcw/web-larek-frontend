import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { EventEmitter, Events } from './base/events';
import { IProduct } from '../types';

interface CardBasketData {
    product: IProduct;
    index: number;
}

export class CardBasket extends Component<CardBasketData> {
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _deleteButton: HTMLButtonElement;

    private _product: IProduct;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container);

        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

        // обработчик удаления товара
        this._deleteButton.addEventListener('click', () => {
            events.emit(Events.BASKET_REMOVE, { 
                productId: this._product.id,
                fromPreview: false
            });
        });
    }

    set index(value: number) {
        this.setText(this._index, value.toString());
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number | null) {
        const priceText = value === null ? 'Бесценно' : `${value} синапсов`;
        this.setText(this._price, priceText);
    }

    render(data: CardBasketData): HTMLElement {
        super.render(data);
        
        this._product = data.product;

        this.index = data.index;
        this.title = data.product.title;
        this.price = data.product.price;
        
        return this.container;
    }
}