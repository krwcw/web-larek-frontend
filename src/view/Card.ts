import { View } from './View';
import { IProduct } from '../types';
import { categoryMap } from '../utils/categoryMap';

export class Card extends View {
    private title: HTMLElement;
    private price: HTMLElement;
    private image: HTMLImageElement;
    private category: HTMLElement;
    private button: HTMLButtonElement | null;

    constructor(container: HTMLElement) {
        super(container);
        this.title = this.container.querySelector('.card__title') as HTMLElement;
        this.price = this.container.querySelector('.card__price') as HTMLElement;
        this.image = this.container.querySelector('.card__image') as HTMLImageElement;
        this.category = this.container.querySelector('.card__category') as HTMLElement;
        this.button = this.container.querySelector('.card__button');
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
    }

    setButtonHandler(handler: (isAdding: boolean) => void): void {
        if (this.button) {
            this.button.addEventListener('click', () => {
                const isAdding = this.button.textContent === 'В корзину';
                handler(isAdding);
            });
        }
    }

    // Добавляем метод для установки обработчика клика на всю карточку
    setClickHandler(handler: () => void): void {
    this.container.addEventListener('click', handler);
    }
}