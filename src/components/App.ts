import { EventEmitter } from '../components/base/events';
import { Card } from '../components/Card';
import { Basket } from '../components/Basket';
import { OrderForm } from '../components/OrderForm';
import { ContactsForm } from '../components/ContactsForm';
import { SuccessMessage } from '../components/SuccessMessage';
import { Header } from '../components/Header';
import { IProduct, IOrder, IOrderRequest, IOrderResult } from '../types';
import { ensureElement, cloneTemplate } from '../utils/utils';
import { API_URL, CDN_URL } from '../utils/constants';
import { Modal } from './base/Modal';
import { Api } from './base/api';
import { Model } from './Model';
import { Gallery } from './Gallery';

export class App {
    private events: EventEmitter;
    private api: Api;
    private model: Model;
    private modal: Modal;
    private header: Header;
    private gallery: Gallery;
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
        
        const headerContainer = ensureElement<HTMLElement>('.header');
        this.header = new Header(headerContainer, this.events);
        
        const productTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
        this.productCard = new Card(cloneTemplate<HTMLElement>(productTemplate), this.events);

        const galleryContainer = ensureElement<HTMLElement>('.gallery');
        this.gallery = new Gallery(galleryContainer, this.events);
        
        const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
        this.basket = new Basket(cloneTemplate<HTMLElement>(basketTemplate), this.events);
        
        const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
        this.orderForm = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), this.events);
        
        const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        this.contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsTemplate), this.events);
        
        const successTemplate = ensureElement<HTMLTemplateElement>('#success');
        this.successMessage = new SuccessMessage(cloneTemplate<HTMLElement>(successTemplate), this.events);
    }

    // Инициализация обработчиков событий
    private initEventHandlers(): void {
        // События от модели
        this.events.on('products:changed', (data: { products: IProduct[] }) => {
            this.renderProducts(data.products);
        });

        this.events.on('basket:changed', (data: { basket: IProduct[] }) => {
            this.updateBasketCounter();
            this.renderProducts(this.model.products);
        });

        // События от представлений
        this.events.on('card:select', (data: { product: IProduct }) => {
            this.openProductPreview(data.product);
        });

        this.events.on('basket:add', (data: { product: IProduct }) => {
            this.model.addToBasket(data.product);
        });

        this.events.on('basket:remove', (data: { productId: string }) => {
            this.model.removeFromBasket(data.productId);
        });

        this.events.on('basket:open', () => {
            this.openBasket();
        });

        this.events.on('order:open', () => {
            this.openOrderForm();
        });

        this.events.on('order:submit:step1', (data: { order: Partial<IOrder> }) => {
            this.processOrderStep1(data.order);
        });

        this.events.on('order:submit:step2', (data: { order: Partial<IOrder> }) => {
            this.processOrderStep2(data.order);
        });

        this.events.on('order:success', (data: { result: IOrderResult }) => {
            this.showSuccess(data.result);
        });

        this.events.on('modal:close', () => {
            this.modal.close();
        });
    }

    // Загрузка продуктов через API
    private async loadProducts(): Promise<void> {
        try {
            const response = await this.api.get('/product') as { items: IProduct[] };
            
            // Преобразуем пути к изображениям
            const products = response.items.map(product => ({
                ...product,
                image: product.image ? `${CDN_URL}/${product.image}` : product.image
            }));
            
            // Устанавливаем продукты в модель
            this.model.setProducts(products);
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
        }
    }

    // Отрисовка продуктов
    private renderProducts(products: IProduct[]): void {
        const template = ensureElement<HTMLTemplateElement>('#card-catalog');
        const items: HTMLElement[] = [];
        
        products.forEach(product => {
            const element = cloneTemplate<HTMLElement>(template);
            const card = new Card(element, this.events);
            
            card.render({
                ...product,
                isInBasket: this.model.isInBasket(product.id)
            });
            
            items.push(element);
        });
        
        this.gallery.render({ items });
    }


    // Открытие предпросмотра товара
    private openProductPreview(product: IProduct): void {
        this.productCard.render({
            ...product,
            isInBasket: this.model.isInBasket(product.id)
        });
        
        this.modal.content = this.productCard.render();
        this.modal.open();
    }

    // Обновление счетчика корзины
    private updateBasketCounter(): void {
        this.header.counter = this.model.basket.length;
    }

    // Открытие корзины
    private openBasket(): void {
        const basketItems = this.model.getBasketItems();
        const total = this.model.getBasketTotal();
        
        this.basket.render({
            items: basketItems,
            total: total
        });
        
        this.modal.content = this.basket.render();
        this.modal.open();
    }

    // Открытие формы заказа
    private openOrderForm(): void {
    this.orderForm.render({ ...this.model.order, valid: false, errors: '' });
    this.modal.content = this.orderForm.container;
}
    // Обработка первого шага заказа
    private processOrderStep1(data: Partial<IOrder>): void {
        this.model.updateOrder(data);
        this.openContactsForm();
    }

    // Открытие формы контактов
    private openContactsForm(): void {
    this.contactsForm.render({ ...this.model.order, valid: false, errors: '' });
    this.modal.content = this.contactsForm.container;
}

    // Обработка второго шага заказа
    private async processOrderStep2(data: Partial<IOrder>): Promise<void> {
        this.model.updateOrder(data);
        
        try {
            // Собираем полный объект заказа для отправки
            const orderRequest: IOrderRequest = {
                ...this.model.order,
                items: this.model.basket.map(item => item.id),
                total: this.model.getBasketTotal()
            };

            const response = await this.api.post('/order', orderRequest) as IOrderResult;
            this.model.clearBasket();
            this.events.emit('order:success', { result: response });
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
        }
    }

    // Показ успешного оформления заказа
    private showSuccess(result: IOrderResult): void {
        this.successMessage.render({
            ...result,
            description: `Списано ${result.total} синапсов`,
            onClose: () => {
                this.modal.close();
            }
        });
        
        this.modal.content = this.successMessage.render();
    }
}