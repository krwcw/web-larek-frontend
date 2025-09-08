import { IProduct, IBasketItem, IOrder, IOrderResult } from '../types';
import { EventEmitter } from './base/events';

export class Model {
    private _products: IProduct[] = [];
    private _basket: IProduct[] = [];
    private _order: IOrder = {
        payment: 'online',
        address: '',
        email: '',
        phone: ''
    };

    constructor(private events: EventEmitter) {
        // Подписка на события для изменения состояния
        events.on('products:set', (data: { products: IProduct[] }) => {
            this.setProducts(data.products);
        });
        
        events.on('basket:add', (data: { product: IProduct }) => {
            this.addToBasket(data.product);
        });
        
        events.on('basket:remove', (data: { productId: string }) => {
            this.removeFromBasket(data.productId);
        });
        
        events.on('order:update', (data: { partialOrder: Partial<IOrder> }) => {
            this.updateOrder(data.partialOrder);
        });
        
        events.on('basket:clear', () => {
            this.clearBasket();
        });
    }

    // Установить продукты
    setProducts(products: IProduct[]): void {
        this._products = products;
        this.events.emit('products:changed', this._products);
    }

    // Добавить продукт в корзину
    addToBasket(product: IProduct): void {
        this._basket.push(product);
        this.events.emit('basket:changed', this._basket);
    }

    // Удалить продукт из корзины
    removeFromBasket(productId: string): void {
        this._basket = this._basket.filter(item => item.id !== productId);
        this.events.emit('basket:changed', this._basket);
    }

    // Очистить корзину
    clearBasket(): void {
        this._basket = [];
        this.events.emit('basket:changed', this._basket);
    }

    // Обновить данные заказа
    updateOrder(partialOrder: Partial<IOrder>): void {
        Object.assign(this._order, partialOrder);
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