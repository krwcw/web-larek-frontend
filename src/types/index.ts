export interface IProduct {
    title: string;
    description?: string;
    id: number;
    image: string;
    category: string;
    price: number | null;
}

export interface IBasket {
    products: IBasketItem[];
    totalprice: number;
}

export interface IBasketItem {
    product: IProduct;
    index: number;
}

export interface IOrder {
    products: IBasketItem[];
    total: number;
    address: string;
    email: string;
    phone: string;
    payment: 'online' | 'cash';
}

export type Category = {
    categoryName: string;
}

export interface IOrderResponse {
    id: string;
    total: number;
}

export interface IProductsResponse {
    total: number;
    items: IProduct[];
}

export interface IErrorResponse {
    error: string;
}