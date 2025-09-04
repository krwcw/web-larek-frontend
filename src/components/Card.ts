import { Component } from "./base/Component";
import { IProduct } from "../types";
import { ensureElement } from "../utils/utils";
import { EventEmitter } from "./base/events";
import { categoryMap } from "../utils/categoryMap";

export class Card extends Component {
    protected title: HTMLElement;
    protected price: HTMLElement;
    protected image: HTMLImageElement;
    protected category: HTMLElement;

    constructor (container: HTMLElement, protected events: EventEmitter) {
        super(container);
        this.title = ensureElement<HTMLElement>('.card__title', this.container);
        this.price = ensureElement<HTMLElement>('.card__price', this.container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.category = ensureElement<HTMLElement>('.card__category', this.container);
    }

    render(data: IProduct) {
        this.title.textContent = data.title;
        if (data.price === null) {
            this.price.textContent = 'Бесценно';
        } else {
            this.price.textContent = `${data.price} синапсов`;
        }
        this.image.src = data.image;
        this.category.textContent = data.category;
        const englishCategory = categoryMap[data.category] || 'other';
        this.category.className = `card__category card__category_${englishCategory}`
        
        this.container.addEventListener('click', () => {
            this.events.emit('card:click', { productId: data.id })
        })
    }
}