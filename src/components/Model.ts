import { IProduct, IBasketItem, IOrder, IOrderResult } from '../types';
import { EventEmitter, Events } from './base/events';
import { Api } from './base/api';

export class Model {
    private _products: IProduct[] = [];
    private _basket: IProduct[] = [];
    private _order: IOrder = {
        payment: undefined,
        address: '',
        email: '',
        phone: ''
    };

    constructor(private events: EventEmitter) {
    }

    // Установить продукты
    setProducts(products: IProduct[]): void {
        this._products = products;
        this.events.emit(Events.PRODUCTS_CHANGED, { products: this._products });
    }

    // Добавить продукт в корзину
    addToBasket(product: IProduct): void {
        if (!this._basket.some(item => item.id === product.id)) {
            this._basket.push(product);
            this.events.emit(Events.BASKET_CHANGED, { basket: this._basket });
        }
    }

    // Удалить продукт из корзины
    removeFromBasket(productId: string): void {
        this._basket = this._basket.filter(item => item.id !== productId);
        this.events.emit(Events.BASKET_CHANGED, { basket: this._basket });
    }

    // Очистить корзину
    clearBasket(): void {
        this._basket = [];
        this.events.emit(Events.BASKET_CHANGED, { basket: this._basket });
    }

    // Обновить данные заказа
    updateOrder(partialOrder: Partial<IOrder>): void {
        this._order = { ...this._order, ...partialOrder };
        const errors = this.validateOrder();
        this.events.emit(Events.ORDER_UPDATED, { order: this._order });
        this.events.emit(Events.ORDER_ERRORS, errors);
    }

    // Валидация заказа
    validateOrder(): { [field in keyof IOrder]?: string } {
        const errors: { [field in keyof IOrder]?: string } = {};
        
        // Валидация адреса
        if (!this._order.address || this._order.address.length < 5) {
            errors.address = 'Необходимо указать адрес';
        }
        
        // Валидация способа оплаты
        if (!this._order.payment) {
            errors.payment = 'Выберите способ оплаты';
        }
        
        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this._order.email || !emailRegex.test(this._order.email)) {
            errors.email = 'Необходимо ввести корректный email';
        }
        
        // Валидация телефона
        const phoneDigits = this._order.phone?.replace(/\D/g, '');
        if (!phoneDigits || phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
            errors.phone = 'Введите телефон в формате +7 (XXX) XXX-XX-XX';
        }
        
        return errors;
    }

    // Эмиттер успешного заказа
    emitOrderSuccess(result: IOrderResult): void {
        this.events.emit(Events.ORDER_SUCCESS, { result });
    }

    // Получить продукты из корзины
    getBasketItems(): IBasketItem[] {
        return this._basket.map((product, index) => ({
            product,
            index: index + 1
        }));
    }

    // Получить общую стоимость корзины
    getBasketTotal(): number {
        return this._basket.reduce((total, item) => total + (item.price || 0), 0);
    }

    // Проверить, есть ли товар в корзине
    isInBasket(productId: string): boolean {
        return this._basket.some(item => item.id === productId);
    }

    // Геттеры для доступа к данным
    get products(): IProduct[] {
        return this._products;
    }

    get basket(): IProduct[] {
        return this._basket;
    }

    get order(): IOrder {
        return this._order;
    }
}