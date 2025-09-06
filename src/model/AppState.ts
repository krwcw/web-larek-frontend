import { IProduct, IBasketItem, IOrder, IOrderResult } from '../types';
import { Api } from '../components/base/api';
import { ApiListResponse } from '../components/base/api';
import { CDN_URL } from '../utils/constants';

export class AppState {
    private _products: IProduct[] = [];
    private _basket: IProduct[] = [];
    private _order: IOrder = {
        payment: 'online',
        address: '',
        email: '',
        phone: '',
        items: [],
        total: 0
    };

    constructor(private api: Api) {}

    // Получить список продуктов
    async loadProducts(): Promise<IProduct[]> {
        try {
            const response = await this.api.get('/product') as ApiListResponse<IProduct>;
            
            // Преобразуем пути к изображениям
            this._products = response.items.map(product => ({
                ...product,
                image: product.image ? `${CDN_URL}/${product.image}` : product.image
            }));
            
            return this._products;
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
            throw error;
        }
    }

    // Получить продукты из корзины
    getBasketItems(): IBasketItem[] {
        return this._basket.map((product, index) => ({
            product,
            index: index + 1
        }));
    }

    // Добавить продукт в корзину
    addToBasket(product: IProduct): void {
        this._basket.push(product);
    }

    // Удалить продукт из корзины
    removeFromBasket(productId: string): void {
        this._basket = this._basket.filter(item => item.id !== productId);
    }

    // Очистить корзину
    clearBasket(): void {
        this._basket = [];
    }

    // Получить общую стоимость корзины
    getBasketTotal(): number {
        return this._basket.reduce((total, item) => total + (item.price || 0), 0);
    }

    // Проверить, есть ли товар в корзине
    isInBasket(productId: string): boolean {
        return this._basket.some(item => item.id === productId);
    }

    // Обновить данные заказа
    updateOrder(partialOrder: Partial<IOrder>): void {
        this._order = { ...this._order, ...partialOrder };
    }

    // Отправить заказ
    async submitOrder(): Promise<IOrderResult> {
        const orderData = {
            ...this._order,
            items: this._basket.map(item => item.id),
            total: this.getBasketTotal()
        };

        try {
            const response = await this.api.post('/order', orderData);
            this.clearBasket();
            return response as IOrderResult;
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            throw error;
        }
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