import { Component } from './base/Component';
import { IBasketItem } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement, cloneTemplate } from '../utils/utils';

interface IBasket {
    list: HTMLUListElement;
    total: HTMLElement;
    button: HTMLButtonElement;
}

export class Basket extends Component<IBasket> {
    private list: HTMLUListElement;
    private total: HTMLElement;
    private button: HTMLButtonElement;

    constructor(container: HTMLElement, private events: EventEmitter) {
        super(container);
        this.list = ensureElement<HTMLUListElement>('.basket__list', this.container);
        this.total = ensureElement<HTMLElement>('.basket__price', this.container);
        this.button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        // Обработчик кнопки оформления заказа
        this.button.addEventListener('click', () => {
            this.events.emit('order:open');
        });
    }

    // Отрисовать корзину
    render(items: IBasketItem[], total: number): void {

        this.list.innerHTML = '';
        
        items.forEach(item => {
            const itemElement = this.createBasketItem(item);
            this.list.appendChild(itemElement);
        });
        
        this.setText(this.total, `${total} синапсов`);
        this.setDisabled(this.button, items.length === 0);
    }

    setDeleteHandler(handler: (productId: string) => void): void {
        this.list.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('basket__item-delete')) {
                const itemElement = target.closest('.basket__item') as HTMLElement;
                const productId = itemElement.dataset.id;
                if (productId) {
                    handler(productId);
                }
            }
        });
    }

    // Создать элемент корзины
    private createBasketItem(item: IBasketItem): HTMLLIElement {
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
        
        return element;
    }
}