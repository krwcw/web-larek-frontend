import { Model } from './Model';
import { Api } from './base/api';
import { EventEmitter } from './base/events';
import { Modal } from './base/Modal';
import { Card } from './Card';
import { Basket } from './Basket';
import { OrderForm } from './OrderForm';
import { ContactsForm } from './ContactsForm';
import { SuccessMessage } from './SuccessMessage';
import { IProduct, IOrder, IOrderResult, IOrderRequest } from '../types';
import { ensureElement, cloneTemplate } from '../utils/utils';
import { API_URL, CDN_URL } from '../utils/constants';

export class App {
    private events: EventEmitter;
    private api: Api;
    private model: Model;
    private modal: Modal;
    private productCard: Card;
    private basket: Basket;
    private orderForm: OrderForm;
    private contactsForm: ContactsForm;
    private successMessage: SuccessMessage;

    constructor() {
        this.events = new EventEmitter();
        this.api = new Api(API_URL);
        this.model = new Model(this.events);
        this.initViews();
        this.initEventHandlers();
        this.loadProducts();
    }

    // Инициализация представлений
    private initViews(): void {
        const modalContainer = ensureElement<HTMLElement>('#modal-container');
        this.modal = new Modal(modalContainer, this.events);
        
        const productTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
        this.productCard = new Card(cloneTemplate<HTMLElement>(productTemplate), this.events);
        
        const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
        this.basket = new Basket(cloneTemplate<HTMLElement>(basketTemplate), this.events);
        
        const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
        this.orderForm = new OrderForm(cloneTemplate<HTMLElement>(orderTemplate), this.events);
        
        const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        this.contactsForm = new ContactsForm(cloneTemplate<HTMLElement>(contactsTemplate), this.events);
        
        const successTemplate = ensureElement<HTMLTemplateElement>('#success');
        this.successMessage = new SuccessMessage(cloneTemplate<HTMLElement>(successTemplate), this.events);
    }

    // Инициализация обработчиков событий
    private initEventHandlers(): void {
   
        const basketButton = ensureElement<HTMLButtonElement>('.header__basket');
        basketButton.addEventListener('click', () => {
            this.openBasket();
        });

        // Изменение продуктов
        this.events.on('products:changed', (data: { products: IProduct[] }) => {
            this.renderProducts(data.products);
        });

        // Изменение корзины
        this.events.on('basket:changed', (data: { basket: IProduct[] }) => {
            this.updateBasketCounter();
            this.renderProducts(this.model.products);
        });

        // Выбор карточки для просмотра
        this.events.on('card:select', (data: { product: IProduct }) => {
            this.openProductPreview(data.product);
        });

        // Добавление в корзину
        this.events.on('basket:add', (data: { product: IProduct }) => {
            this.events.emit('products:set', { products: this.model.products });
        });

        // Удаление из корзины
        this.events.on('basket:remove', (data: { productId: string }) => {
            this.events.emit('products:set', { products: this.model.products });
        });

        // Открытие формы заказа
        this.events.on('order:open', () => {
            this.openOrderForm();
        });

        // Отправка первого шага заказа
        this.events.on('order:submit:step1', (data: Partial<IOrder>) => {
            this.processOrderStep1(data);
        });

        // Отправка второго шага заказа
        this.events.on('order:submit:step2', (data: Partial<IOrder>) => {
            this.processOrderStep2(data);
        });

        // Успешное оформление заказа
        this.events.on('order:success', (result: IOrderResult) => {
            this.showSuccess(result);
        });
    }

    // Загрузка продуктов через API
    private async loadProducts(): Promise<void> {
        try {
            const response = await this.api.get('/product') as { items: IProduct[] };
            const products = response.items.map(product => ({
                ...product,
                image: product.image ? `${CDN_URL}/${product.image}` : product.image
            }));
        
            // Устанавливаем продукты в модель
            this.events.emit('products:set', { products });
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
        }
    }

    // Отрисовка продуктов
    private renderProducts(products: IProduct[]): void {
        const gallery = ensureElement<HTMLElement>('.gallery');
        gallery.innerHTML = '';
        
        const template = ensureElement<HTMLTemplateElement>('#card-catalog');
        
        products.forEach(product => {
            const element = cloneTemplate<HTMLElement>(template);
            const card = new Card(element, this.events);
            
            card.render(product, this.model.isInBasket(product.id));
            gallery.appendChild(element);
        });
    }

    // Открытие предпросмотра товара
    private openProductPreview(product: IProduct): void {
        this.productCard.render(product, this.model.isInBasket(product.id));
        this.modal.setContent(this.productCard.element);
        this.modal.open();
    }

    // Обновление счетчика корзины
    private updateBasketCounter(): void {
        const counter = ensureElement<HTMLElement>('.header__basket-counter');
        this.setText(counter, this.model.basket.length.toString());
    }

    // Вспомогательный метод для установки текста
    private setText(element: HTMLElement, text: string): void {
        element.textContent = text;
    }

    // Открытие корзины
    private openBasket(): void {
        const basketItems = this.model.getBasketItems();
        const total = this.model.getBasketTotal();
        
        this.basket.render(basketItems, total);
        this.modal.setContent(this.basket.element);
        this.modal.open();
    }

    // Открытие формы заказа
    private openOrderForm(): void {
        this.orderForm.render(this.model.order);
        this.modal.setContent(this.orderForm.element);
    }

    // Обработка первого шага заказа
    private processOrderStep1(data: Partial<IOrder>): void {
        this.events.emit('order:update', data);
        this.openContactsForm();
    }

    // Открытие формы контактов
    private openContactsForm(): void {
        this.contactsForm.render(this.model.order);
        this.modal.setContent(this.contactsForm.element);
    }

    // Обработка второго шага заказа
    private async processOrderStep2(data: Partial<IOrder>): Promise<void> {
        this.events.emit('order:update', { partialOrder: data });
        
        try {
            // Собираем полный объект заказа для отправки
            const orderRequest: IOrderRequest = {
                ...this.model.order,
                items: this.model.basket.map(item => item.id),
                total: this.model.getBasketTotal()
            };

            const response = await this.api.post('/order', orderRequest) as IOrderResult;
            this.events.emit('basket:clear', {});
            this.events.emit('order:success', { result: response });
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
        }
    }

    // Показ успешного оформления заказа
    private showSuccess(result: IOrderResult): void {
        this.successMessage.render(result);
        this.modal.setContent(this.successMessage.element);
    }
}
