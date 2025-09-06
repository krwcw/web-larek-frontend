/**
 * Presenter приложения - связывает Model и View
 * Управляет бизнес-логикой, обрабатывает пользовательские действия
 * Координирует взаимодействие между компонентами
 */
import { AppState } from '../model/AppState';
import { Modal } from '../view/Modal';
import { Card } from '../view/Card';
import { Basket } from '../view/Basket';
import { OrderForm } from '../view/OrderForm';
import { ContactsForm } from '../view/ContactsForm';
import { SuccessMessage } from '../view/SuccessMessage';
import { IProduct, IOrderResult } from '../types';

export class App {
    private modal: Modal;
    private productCard: Card;
    private basket: Basket;
    private orderForm: OrderForm;
    private contactsForm: ContactsForm;
    private successMessage: SuccessMessage;
    private currentPreviewProduct: IProduct | null = null;

    constructor(private model: AppState) {
        this.initViews();
        this.initEventHandlers();
        this.loadProducts();
    }

    // Инициализация представлений
    private initViews(): void {
        this.modal = new Modal(document.querySelector('#modal-container'));
        
        const productTemplate = document.querySelector('#card-preview') as HTMLTemplateElement;
        this.productCard = new Card(productTemplate.content.querySelector('.card'));
        
        const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
        this.basket = new Basket(basketTemplate.content.querySelector('.basket'));
        
        const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
        this.orderForm = new OrderForm(orderTemplate.content.querySelector('.form'));
        
        const contactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
        this.contactsForm = new ContactsForm(contactsTemplate.content.querySelector('.form'));
        
        const successTemplate = document.querySelector('#success') as HTMLTemplateElement;
        this.successMessage = new SuccessMessage(successTemplate.content.querySelector('.order-success'));
    }

    // Инициализация обработчиков событий
    private initEventHandlers(): void {
        // Обработчик открытия корзины
        document.querySelector('.header__basket').addEventListener('click', () => {
            this.openBasket();
        });

        // Обработчики форм
        this.orderForm.setHandlers();
        this.orderForm.setSubmitHandler((event) => {
            event.preventDefault();
            this.processOrderStep1();
        });

        this.contactsForm.setHandlers();
        this.contactsForm.setSubmitHandler((event) => {
            event.preventDefault();
            this.processOrderStep2();
        });

        // Обработчик успешного оформления заказа
        this.successMessage.setCloseHandler(() => {
            this.modal.close();
        });

        // Обработчик для карточки предпросмотра
        this.productCard.setButtonHandler((isAdding) => {
            if (this.currentPreviewProduct) {
                if (isAdding) {
                    this.model.addToBasket(this.currentPreviewProduct);
                } else {
                    this.model.removeFromBasket(this.currentPreviewProduct.id);
                }
                this.updateBasketCounter();
                this.renderProducts();
            }
        });
    }

    // Загрузка продуктов
    private async loadProducts(): Promise<void> {
        try {
            await this.model.loadProducts();
            this.renderProducts();
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
        }
    }

    // Отрисовка продуктов
    private renderProducts(): void {
        const gallery = document.querySelector('.gallery');
        gallery.innerHTML = '';
        
        const template = document.querySelector('#card-catalog') as HTMLTemplateElement;
        
        this.model.products.forEach(product => {
            const element = template.content.cloneNode(true) as HTMLElement;
            const cardElement = element.querySelector('.card') as HTMLElement;
            const card = new Card(cardElement);
            
            card.render(product, this.model.isInBasket(product.id));
            
            // Добавляем обработчик клика на карточку
            card.setClickHandler(() => {
                this.openProductPreview(product);
            });
            
            // Добавляем обработчик кнопки для каталога
            card.setButtonHandler((isAdding) => {
                if (isAdding) {
                    this.model.addToBasket(product);
                } else {
                    this.model.removeFromBasket(product.id);
                }
                this.updateBasketCounter();
                this.renderProducts();
            });
            
            gallery.appendChild(element);
        });
        
        this.updateBasketCounter();
    }

    // Открытие предпросмотра товара
    private openProductPreview(product: IProduct): void {
        this.currentPreviewProduct = product;
        this.productCard.render(product, this.model.isInBasket(product.id));
        this.modal.setContent(this.productCard.element);
        this.modal.open();
    }

    // Обновление счетчика корзины
    private updateBasketCounter(): void {
        const counter = document.querySelector('.header__basket-counter') as HTMLElement;
        counter.textContent = this.model.basket.length.toString();
    }

    // Открытие корзины
    private openBasket(): void {
        const basketItems = this.model.getBasketItems();
        const total = this.model.getBasketTotal();
        
        this.basket.render(basketItems, total);
        this.basket.setOrderHandler(() => {
            this.openOrderForm();
        });
        this.basket.setDeleteHandler((productId) => {
            this.model.removeFromBasket(productId);
            this.openBasket();
            this.updateBasketCounter();
            this.renderProducts();
        });
        
        this.modal.setContent(this.basket.element);
        this.modal.open();
    }

    // Открытие формы заказа
    private openOrderForm(): void {
        this.orderForm.render(this.model.order);
        this.modal.setContent(this.orderForm.element);
    }

    // Обработка первого шага заказа
    private processOrderStep1(): void {
        const formData = this.orderForm.getFormData();
        this.model.updateOrder(formData);
        this.openContactsForm();
    }

    // Открытие формы контактов
    private openContactsForm(): void {
        this.contactsForm.render(this.model.order);
        this.modal.setContent(this.contactsForm.element);
    }

    // Обработка второго шага заказа
    private async processOrderStep2(): Promise<void> {
        const formData = this.contactsForm.getFormData();
        this.model.updateOrder(formData);
        
        try {
            const result = await this.model.submitOrder();
            this.showSuccess(result);
            this.updateBasketCounter();
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
