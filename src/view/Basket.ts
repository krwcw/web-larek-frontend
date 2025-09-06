import { View } from './View';
import { IBasketItem } from '../types';

export class Basket extends View {
    private list: HTMLUListElement;
    private total: HTMLElement;
    private button: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);
        this.list = this.container.querySelector('.basket__list') as HTMLUListElement;
        this.total = this.container.querySelector('.basket__price') as HTMLElement;
        this.button = this.container.querySelector('.basket__button') as HTMLButtonElement;
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

    // Создать элемент корзины
    private createBasketItem(item: IBasketItem): HTMLLIElement {
        const template = document.querySelector('#card-basket') as HTMLTemplateElement;
        const element = template.content.cloneNode(true) as DocumentFragment;
        
        const liElement = element.querySelector('.basket__item') as HTMLLIElement;
        const index = element.querySelector('.basket__item-index') as HTMLElement;
        const title = element.querySelector('.card__title') as HTMLElement;
        const price = element.querySelector('.card__price') as HTMLElement;
        const deleteButton = element.querySelector('.basket__item-delete') as HTMLButtonElement;
        
        this.setText(index, item.index.toString());
        this.setText(title, item.product.title);
        this.setText(price, `${item.product.price} синапсов`);
        
        // Устанавливаем data-id на элемент списка
        liElement.dataset.id = item.product.id;
        
        return liElement;
    }

    // Установить обработчик на кнопку оформления заказа
    setOrderHandler(handler: (event: MouseEvent) => void): void {
        this.button.addEventListener('click', handler);
    }

    // Установить обработчик удаления товара
    setDeleteHandler(handler: (productId: string) => void): void {
        this.list.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains('basket__item-delete')) {
                const itemElement = target.closest('.basket__item') as HTMLElement;
                const productId = itemElement.dataset.id;
                handler(productId);
            }
        });
    }
}