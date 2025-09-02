import { IBasketItem  } from "../types";
import { cloneTemplate, ensureElement } from "../utils/utils";
import { Component } from "./base/components";
import { EventEmitter } from "./base/events";

export class Basket extends Component {
    protected itemlist: HTMLUListElement;
    protected totalprice: HTMLElement;
    protected orderbutton: HTMLButtonElement;
    protected deletebutton: HTMLButtonElement;

    constructor (container: HTMLElement, protected events: EventEmitter) {
        super(container);
        this.itemlist = ensureElement<HTMLUListElement>('.basket__list', this.container);
        this.totalprice = ensureElement<HTMLElement>('.basket__price', this.container);
        this.orderbutton = ensureElement<HTMLButtonElement>('.button', this.container);

        this.orderbutton.addEventListener('click', () => {
            this.events.emit('order:open');
        });
    }

    protected createBasketItem(item: IBasketItem): HTMLLIElement {
        const template = ensureElement<HTMLTemplateElement>('#card-basket');
        const basketitem = cloneTemplate<HTMLLIElement>(template);

        const basketitemtitle = ensureElement<HTMLElement>('.card__title', basketitem);
        const basketitemprice = ensureElement<HTMLElement>('.card__price', basketitem);
        const basketitembutton = ensureElement<HTMLButtonElement>('.basket__item-delete', basketitem);
        const basketitemindex = ensureElement<HTMLElement>('.basket__item-index', basketitem);

        basketitemtitle.textContent = item.product.title;
        basketitemprice.textContent = `${item.product.price} синапсов`;
        basketitemindex.textContent = `${item.index}`;

        basketitembutton.addEventListener('click', () => {
            this.events.emit('basket:remove', { productId: item.product.id });
        });

        return basketitem
    }

    render(items: IBasketItem[], totalprice: number) {
        this.itemlist.innerHTML = '';

        items.forEach(item => {
            const itemElement = this.createBasketItem(item);
            this.itemlist.appendChild(itemElement);
        });

        this.totalprice.textContent = `${totalprice} синапсов`;

        if (items.length === 0) {
            this.orderbutton.classList.add('button__disabled');
            this.orderbutton.disabled = true;
        } else {
            this.orderbutton.classList.remove('button__disabled');
            this.orderbutton.disabled = false;
        }
    }
}