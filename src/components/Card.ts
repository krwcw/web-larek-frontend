import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { categoryMap } from '../utils/categoryMap';
import { EventEmitter, Events } from './base/events';
import { IProduct } from '../types';

interface ICardData extends IProduct {
  isInBasket: boolean;
}

export class Card extends Component<ICardData> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected _button: HTMLButtonElement | null;
  protected _description: HTMLElement | null;
  
  private _product: IProduct;

  constructor(container: HTMLElement, protected events: EventEmitter) {
    super(container);

    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._image = ensureElement<HTMLImageElement>('.card__image', container);
    this._category = ensureElement<HTMLElement>('.card__category', container);
    
    this._button = container.querySelector('.card__button');
    this._description = container.querySelector('.card__text');

    if (this.container.classList.contains('gallery__item')) {
      container.addEventListener('click', () => {
        if (this._product) {
          events.emit(Events.CARD_SELECT, { product: this._product });
        }
      });
    }

    if (this._button) {
      this._button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (this._product) {
          if (this._button.textContent === 'Удалить из корзины') {
            events.emit(Events.BASKET_REMOVE, { productId: this._product.id });
          } else {
            events.emit(Events.BASKET_ADD, { product: this._product });
          }
        }
      });
    }
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
        
        this._category.classList.remove(...Object.values(categoryMap).map(cls => `card__category_${cls}`));
        this._category.classList.add(`card__category_${categoryClass}`);
    }

    set description(value: string) {
        if (this._description) {
            this.setText(this._description, value);
        }
    }

    set isInBasket(value: boolean) {
        if (this._button) {
            this.setText(this._button, value ? 'Удалить из корзины' : 'В корзину');
        }
    }

    render(data: Partial<ICardData>): HTMLElement {
        super.render(data);
        
        // Сохраняем продукт для использования в обработчиках
        if (data.id && data.title && data.image && data.category && data.price !== undefined) {
            this._product = {
                id: data.id,
                title: data.title,
                image: data.image,
                category: data.category,
                price: data.price,
            };
        }
        
        return this.container;
    }
}