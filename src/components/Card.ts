import { Component } from './base/Component';
import { IProduct } from '../types';
import { categoryMap } from '../utils/categoryMap';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

export class Card extends Component {
    private title: HTMLElement;
    private price: HTMLElement;
    private image: HTMLImageElement;
    private category: HTMLElement;
    private button: HTMLButtonElement | null;

    constructor(container: HTMLElement, private events: EventEmitter) {
        super(container);
        this.title = ensureElement<HTMLElement>('.card__title', this.container);
        this.price = ensureElement<HTMLElement>('.card__price', this.container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.category = ensureElement<HTMLElement>('.card__category', this.container);
    }

    render(product: IProduct, inBasket: boolean): void {
        this.setText(this.title, product.title);
        
        if (product.price === null) {
            this.setText(this.price, 'Бесценно');
            if (this.button) {
                this.setText(this.button, 'Недоступно');
                this.setDisabled(this.button, true);
            }
        } else {
            this.setText(this.price, `${product.price} синапсов`);
            if (this.button) {
                this.setText(this.button, inBasket ? 'Удалить из корзины' : 'В корзину');
                this.setDisabled(this.button, false);
            }
        }
        
        this.setImage(this.image, product.image, product.title);
        this.setText(this.category, product.category);
        
        const categoryClass = categoryMap[product.category] || 'other';
        this.category.className = `card__category card__category_${categoryClass}`;

        // Установка обработчиков
        if (this.button) {
            this.button.addEventListener('click', () => {
                if (inBasket) {
                    this.events.emit('basket:remove', { productId: product.id });
                } else {
                    this.events.emit('basket:add', { product });
                }
                this.events.emit('modal:close', {});
            });
        }

        // Обработчик клика по карточке
        this.container.addEventListener('click', (event) => {
            if (!this.button || !(event.target as Element).closest('.card__button')) {
                this.events.emit('card:select', { product });
            }
        });
    }
}