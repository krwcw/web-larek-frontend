import { EventEmitter, Events } from '../components/base/events';
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
import { CardBasket } from './CardBasket';

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
        // создание экземпляров событий, апи и данных
        this.events = new EventEmitter();
        this.api = new Api(API_URL);
        this.model = new Model(this.events);
        
        // все инициализации
        this.initViews();
        this.initModelHandlers();
        this.initEventHandlers();
        this.loadProducts();
    }

    // инициализируем слой view
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
        const basketElement = cloneTemplate<HTMLElement>(basketTemplate);
        this.basket = new Basket(basketElement, this.events);
        
        const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
        this.orderForm = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), this.events);
        
        const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        this.contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsTemplate), this.events);
        
        const successTemplate = ensureElement<HTMLTemplateElement>('#success');
        this.successMessage = new SuccessMessage(cloneTemplate<HTMLElement>(successTemplate), this.events);
    }

    // инициализируем обработчики событий модели
    private initModelHandlers(): void {
        this.events.on(Events.PRODUCTS_CHANGED, (data: { products: IProduct[] }) => {
            this.renderProducts(data.products);
        });

        this.events.on(Events.BASKET_CHANGED, (data: { basket: IProduct[] }) => {
            this.updateBasketCounter();
            this.renderBasket();
        });

        this.events.on(Events.ORDER_SUCCESS, (data: { result: IOrderResult }) => {
            this.showSuccess(data.result);
        });
    }

    // инициализируем обработчики событий от view
    private initEventHandlers(): void {
        this.events.on(Events.CARD_SELECT, (data: { product: IProduct }) => {
            this.openProductPreview(data.product);
        });

        this.events.on(Events.BASKET_ADD, (data: { product: IProduct }) => {
            this.model.addToBasket(data.product);
            this.modal.close();
        });

        this.events.on(Events.BASKET_REMOVE, (data: { productId: string, fromPreview?: boolean }) => {
            this.model.removeFromBasket(data.productId);
            if (data.fromPreview) {
                this.modal.close();
            } else {
                this.renderBasket();
            }
        });

        this.events.on(Events.BASKET_OPEN, () => {
            this.renderBasket();
            this.modal.open();
        });

        this.events.on(Events.ORDER_OPEN, () => {
            this.openOrderForm();
        });

        this.events.on(Events.ORDER_SUBMIT, () => {
            this.model.updateOrder(this.model.order);
            this.openContactsForm();
        });

        this.events.on(Events.CONTACTS_SUBMIT, () => {
            this.processOrder(this.model.order);
        });

        this.events.on(Events.ORDER_UPDATE, (data: Partial<IOrder>) => {
            this.model.updateOrder(data);
        });

        this.events.on(Events.ORDER_SUCCESS, (data: { result: IOrderResult }) => {
            this.showSuccess(data.result);
        });

        this.events.on(Events.SUCCESS_CLOSE, () => {
            this.modal.close();
        });

        this.events.on(Events.MODAL_CLOSE, () => {
            this.modal.content = null;
        });
    }

    // загружаем продукты в модель
    private async loadProducts(): Promise<void> {
        try {
            const response = await this.api.get('/product') as { items: IProduct[] };
            const products = response.items
                .filter(product => product && product.id)
                .map(product => ({
                    ...product,
                    image: product.image ? `${CDN_URL}/${product.image}` : product.image
                }));
            
            // устанавливаем продукты в модель
            this.model.setProducts(products);
        } catch (error) {
            console.error('Невозможно загрузить каталог:', error);
        }
    }

    // выводим товары в каталог
    private renderProducts(products: IProduct[]): void {
        const template = ensureElement<HTMLTemplateElement>('#card-catalog');
        const items: HTMLElement[] = [];
        
        products.forEach(product => {
            const element = cloneTemplate<HTMLElement>(template);
            const card = new Card(element, this.events);
            
            card.render({
                id: product.id,
                title: product.title,
                image: product.image,
                category: product.category,
                price: product.price,
                isInBasket: this.model.isInBasket(product.id)
            });
            
            items.push(element);
        });
        
        this.gallery.render({ items });
    }

    // открытие превью товара
    private openProductPreview(product: IProduct): void {
        const previewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
        const previewElement = cloneTemplate<HTMLElement>(previewTemplate);
        const previewCard = new Card(previewElement, this.events);
        
        previewCard.render({
            ...product,
            isInBasket: this.model.isInBasket(product.id)
        });
        
        this.modal.content = previewElement;
        this.modal.open();

        this.productCard = previewCard
    }

    // обновление количества товаров в корзине
    private updateBasketCounter(): void {
        this.header.counter = this.model.basket.length;
    }

    // рендер корзины
    private renderBasket(): void {
        const basketItems = this.model.getBasketItems();
        const total = this.model.getBasketTotal();

        const basketElements = basketItems.map(item => {
            const template = ensureElement<HTMLTemplateElement>('#card-basket');
            const element = cloneTemplate<HTMLElement>(template);
            const cardBasket = new CardBasket(element, this.events);
            
            cardBasket.render({
                product: item.product,
                index: item.index
            });
            
            return element;
        });

        this.basket.render({
            items: basketElements,
            total: total
        });
        
        this.modal.content = this.basket.getContainer();
    }

    // открытие формы заказов
    private openOrderForm(): void {
        this.orderForm.render({ ...this.model.order, valid: false, errors: '' });
        this.orderForm.hideErrors();

        this.modal.content = this.orderForm.getContainer();
    }

    // открытие формы контактов
    private openContactsForm(): void {
        this.contactsForm.render({ ...this.model.order, valid: false, errors: '' });
        this.contactsForm.hideErrors();

        this.modal.content = this.contactsForm.getContainer();
    }

    // обработка заказа
    private async processOrder(data: Partial<IOrder>): Promise<void> {
        this.model.updateOrder(data);
        
        try {
            const orderRequest: IOrderRequest = {
                ...this.model.order,
                items: this.model.basket.map(item => item.id),
                total: this.model.getBasketTotal()
            };

            const response = await this.api.post('/order', orderRequest) as IOrderResult;
            this.model.clearBasket();
            this.model.emitOrderSuccess(response);
        } catch (error) {
            console.error('Не удалось оформить заказ:', error);
        }
    }

    // успешный заказ
    private showSuccess(result: IOrderResult): void {
        this.successMessage.render({
            ...result,
            description: `Списано ${result.total} синапсов`
        });
        
        this.modal.content = this.successMessage.getContainer();
    }
}