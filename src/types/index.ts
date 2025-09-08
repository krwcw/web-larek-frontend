export interface IProduct {
    id: string;
    title: string;
    description?: string;
    image: string;
    category: string;
    price: number | null;
}

export interface IBasketItem {
    product: IProduct;
    index: number;
}

export interface IOrder {
    payment: 'online' | 'cash';
    address: string;
    email: string;
    phone: string;
}

export interface IOrderRequest extends IOrder {
    items: string[];
    total: number;
}

export interface IOrderResult {
    id: string;
    total: number;
}

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};