import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { categoryMap } from '../utils/categoryMap';
import { EventEmitter } from './base/events';
import { IProduct } from '../types';

interface CardData extends IProduct {
    isInBasket: boolean;
}

export class Card extends Component<CardData> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._button = container.querySelector('.card__button');

        // Обработчик клика по кнопке
        if (this._button) {
            this._button.addEventListener('click', () => {
                if (this.data.isInBasket) {
                    events.emit('basket:remove', { productId: this.data.id });
                } else {
                    events.emit('basket:add', { product: this.data });
                }
            });
        }

        // Обработчик клика по карточке
        container.addEventListener('click', (event) => {
            if (!this._button || !(event.target as Element).closest('.card__button')) {
                events.emit('card:select', { product: this.data });
            }
        });
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number | null) {
        if (value === null) {
            this.setText(this._price, 'Бесценно');
            if (this._button) {
                this.setText(this._button, 'Недоступно');
                this.setDisabled(this._button, true);
            }
        } else {
            this.setText(this._price, `${value} синапсов`);
            if (this._button) {
                this.setDisabled(this._button, false);
            }
        }
    }

    set image(value: string) {
        this.setImage(this._image, value, this._title.textContent || '');
    }

    set category(value: string) {
        this.setText(this._category, value);
        const categoryClass = categoryMap[value] || 'other';
        this._category.className = `card__category card__category_${categoryClass}`;
    }

    set isInBasket(value: boolean) {
        if (this._button) {
            this.setText(this._button, value ? 'Удалить из корзины' : 'В корзину');
        }
    }

    get data(): CardData {
        return this.data;
    }

    set data(value: CardData) {
        this.data = value;
    }

    render(data: Partial<CardData>): HTMLElement {
        this.data = { ...this.data, ...data } as CardData;

        if (data.title) this.title = data.title;
        if (data.price !== undefined) this.price = data.price;
        if (data.image) this.image = data.image;
        if (data.category) this.category = data.category;
        if (data.isInBasket !== undefined) this.isInBasket = data.isInBasket;
        
        return this.container;
    }
}