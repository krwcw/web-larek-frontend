// components/ProductPreview.ts
import { basketItems } from "..";
import { IProduct } from "../types";
import { categoryMap } from "../utils/categoryMap";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/components";

export class ProductPreview extends Component {
    protected title: HTMLElement;
    protected description: HTMLElement;
    protected price: HTMLElement;
    protected image: HTMLImageElement;
    protected category: HTMLElement;
    protected button: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);
        
        this.title = ensureElement<HTMLElement>('.card__title', this.container);
        this.description = ensureElement<HTMLElement>('.card__text', this.container);
        this.price = ensureElement<HTMLElement>('.card__price', this.container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.category = ensureElement<HTMLElement>('.card__category', this.container);
        this.button = ensureElement<HTMLButtonElement>('.card__button', this.container);
    }

    render(product: IProduct, isInBasket: boolean): HTMLElement {
        this.title.textContent = product.title;
        this.description.textContent = product.description;
        this.image.src = product.image;

        if (product.price === null) {
            this.price.textContent = 'Бесценно';
            this.button.textContent = 'Недоступно';
            this.button.disabled = true;
            this.button.classList.add('button__disabled');
        } else {
            this.price.textContent = `${product.price} синапсов`;
            this.button.textContent = isInBasket ? 'Удалить из корзины' : 'В корзину';
            this.button.disabled = false;
            this.button.classList.remove('button__disabled');
        }
        
        this.category.textContent = product.category;
        const englishCategory = categoryMap[product.category] || 'other';
        this.category.className = `card__category card__category_${englishCategory}`;
        
        return this.container;
    }

    setButtonHandler(handler: (isAdding: boolean) => void) {
        this.button.addEventListener('click', () => {
            const isAdding = this.button.textContent === 'В корзину';
            handler(isAdding);
    });
    }
}