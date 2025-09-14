# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/categoryMap.ts — файл с маппером для категорий
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

# Архитектура

## Базовый код

Приложение спроектированно с паттернами архитектуры MVP и событиями EventEmmiter. Имеет 3 слоя: модель данных `Model` (товары, корзина, заказ), слой представления (класс корзины `Basket`, карточки товара `Card`, формы контактов `ContactForm` и заказа `OrderForm`, хедер `Header`, галлерея со списком товаров `Gallery`, а так же модальное окно с сообщением о успешном заказе `SuccessMessage`), слой presenter в виде отдельного класса `App`, который обрабатывает события генерирумые внутри слоя презентер, передает данные в модель, и перерисовывает слой view в случае изменения внутри модели данных.

## Model

Отвечает за хранение данных о товарах, корзине, заказе, за их модификацию и взаимодействие с сервером.

```
    private _products: IProduct[] = []; - поле для хранения общего массива товаров
    private _basket: IProduct[] = []; - поле для хранения массива товаров присутствующих в корзине 
    private _order: IOrder = { - объект хранящий информацию о заказе. Способ оплаты, адрес доставки, адрес электронной почты и телефон
        payment: undefined,
        address: '',
        email: '',
        phone: ''
```

Модель данных имеет свои методы для работы с данными:

Метод `setProducts(products: IProduct[]): void` принимает список товаров и устанавливает их в _products, сообщая об изменениях в презентер с помощью события PRODUCT_CHANGED.

Метод `addToBasket(product: IProduct): void` принимает товар и добавляет его в массив _basket, сообщая об изменениях в презентер с помощью события BASKET_CHANGED.

Метод `removeFromBasket(productId: string): void` принимает id товара, находит его в _basket и удаляет из неё, сообщая об изменениях с помощью события BASKET_CHANGED.

Метод `clearBasket(): void` очищает массив данных о товарах в _basket, сообщая об изменениях с помощью события BASKET_CHANGED.

Метод `updateOrder(partialOrder: Partial<IOrder>): void` принимает данных о заказе, устанавливает их в _order, сообщая об изменениях с помощью события ORDER_UPDATED.

Метод `getBasketItems(): IBasketItem[]` получает массив данных с товарами внутри _basket, присваивая порядковый номер (index) каждому товару.

Метод `getBasketTotal(): number` возвращает сумму стоимости товаров из _basket в виде числа.

Метод `isInBasket(productId: string): boolean` проверяет наличие товара внутри корзины и возвращает true или false.

Метод `validateOrder(): { [field in keyof IOrder]?: string }` проверяет данные о заказе _order на валидность, и, в случае невалидности поля, возвращает массив кастомных ошибок в presenter для отрисовки в представлении.

Также имеет геттеры для доступа к данных

```
get products(): IProduct[] { - возвращает общий массив товаров
    return this._products;
}

get basket(): IProduct[] { - возвращает массив товаров из корзины
    return this._basket;
}

get order(): IOrder { - возвращает объект с данными о заказе
        return this._order;
}
```

## View

Слой представления состоящий из следующих классов:

## Component

Базовый абстрактный класс `Component` который наследуется всеми классами компонентов слоя view.

Имеет методы `toggleClass` для переключения класса, 

`setText` для установки текстового содержимого элемента, 

`setImage` для установки изображения и альтернативного описания элементу, 

`setHidden` для скрытия элемента, `setVisible` для показа элемента, 

`setDisabled` для выключения элемента,

публичный метод `getContainer` возвращающий текущий контейнер 

и главный метод `render(data?: Partial<T>): HTMLElement` для отрисовки элемента с учетом полученных данных.

## Form

Базовый класс `Form`, наследует класс `Component`. Имеет внутренний интерфейс, который хранит данные о валидности формы и ошибки. 

В классе записаны элементы кнопки _button и контейнера для показа ошибок _errors.

Методы класса `Form`:

`protected onInputChange(field: keyof T, value: string)` - метод для имитирования события ввода в поле ввода.

`hideErrors` - метод для сброса ошибок валидации при первой отрисовке формы.

Сеттеры устанавливающие валидность кнопки и текст ошибок: 
```
set valid(value: boolean) {
    this._submit.disabled = !value;
}

set errors(value: string) {
    this.setText(this._errors, value);
}
```

Наследуемый метод `render(state: Partial<T> & IForm)` от `Component` для заполнения данных о форме и рендере.

## Modal

Базовый класс `Modal`, отвечает за основные методы для модального окна.

```
protected _closeButton: HTMLButtonElement; - элемент кнопки закрытия модального окна
protected _content: HTMLElement; - элемент внутри модального окна для контента
private _currentContent: HTMLElement | null = null; - элемент с текущим контентом
```

`open()` и `close()` методы для открытия и закрытия модального окна. Внутри метода создается событие открытия и закрытия окна.

`set content(value: HTMLElement)` сеттер устанавливающий контент внутрь модального окна

`get content(): HTMLElement | null` геттер возвращающий контент внутри модального окна

## Card 

Класс `Card` отвечает за отображение карточки товара. Наследуется от базового компонента, имеет свой интерфейс ICardData расширяющий инетрфейс IProduct полем isInBasket для проверки наличия товара в корзине.

```
protected _title: HTMLElement; - элемент с названием товара
protected _price: HTMLElement; - элемент с ценой товара
protected _image: HTMLImageElement; - элемент с изображением товара
protected _category: HTMLElement; - элемент с категорией товара
protected _button: HTMLButtonElement | null; - элемент кнопки добавления в корзину
protected _description: HTMLElement | null; - элемент с расширенным описанием товара
```

Сеттеры: title, price, image, category, button, description устанавливают текст и данные внутри элемента карточки товара. 

Наследуемый метод `render` для заполенения данных и отрисовки товара.

Кнопка _button меняется в зависимости от наличия товара в корзине (добавить или удалить из корзины). При нажатии создает событие BASKET_ADD/BASKET_REMOVE.

## Basket

Класс `Basket` наследуется от базового компонента, отвечает за отображение корзины. 

```
protected _list: HTMLElement; - элемент списка для товаров в корзине
protected _total: HTMLElement; - элемент для показа итоговой суммы
protected _button: HTMLButtonElement; - элемент кнопки для оформления заказа
```

Имеет свой интерфейс:

interface BasketData {
    items: IBasketItem[];
    total: number;
}

`set items(items: IBasketItem[])` - сеттер создает теплейт для каждого товара и устанавливает товары в корзину

`set total(value: number)` - сеттер устанавливает общую стоимость корзины

Наследуемый метод `render` для заполенения данных и отрисовки корзины.

## CardBasket

Класс `CardBasket` наследуется от базового компонента, отвечает за отображение товара в корзине. Имеет свой интерфейс `CardBasketData`:

```
interface CardBasketData {
    product: IProduct; - товар
    index: number; - порядковый номер товара
}
```

```
protected _index: HTMLElement; - элемент корзины обозначающий порядковый номер 
protected _title: HTMLElement; - элемент корзины обозначающий название товара
protected _price: HTMLElement; - элемент корзины обозначающий стоимость товара
protected _deleteButton: HTMLButtonElement; - элемент корзины (кнопка) отвечающий за удаление товара из корзины
```

Сеттеры устанавливающие значения индекса, названия и стоймости:

```
set index(value: number) { - установить порядковый номер товара в корзине
    this.setText(this._index, value.toString());
}

set title(value: string) { - установить название товара
    this.setText(this._title, value);
}

set price(value: number | null) { - установить цену товара в корзине, если она есть
    const priceText = value === null ? 'Бесценно' : `${value} синапсов`;
    this.setText(this._price, priceText);
}
```

Наследуемый метод `render` для заполенения данных и отрисовки товара в корзине.

## ContactsForm 

Класс `ContactsForm` отвечает за отображение формы контаков при оформлении заказа. Наследуется от базового класса `Form`. Валидация формы проходит в модели данных, а форма в свою очередь имеет слушатель ORDER_ERRORS для отрисовки ошибок валидации.

```
protected _emailInput: HTMLInputElement; - элемент поля ввода электронной почты
protected _phoneInput: HTMLInputElement; - элемент поля ввода номера телефона
```

```
get email(): string { - геттер для получения электронной почты
    return this._emailInput.value.trim();
}

set email(value: string) { - сеттер для установки электронной почты
    this._emailInput.value = value;
}

get phone(): string { - геттер для получения номера телефона
    return this._phoneInput.value
}

set phone(value: string) { - сеттер для установки номера телефона
    this._phoneInput.value = value;
}
```

Класс имеет маску для поля ввода номера телефона в формате +7 (ХХХ) ХХХ-ХХ-ХХ.

Наследуемый метод `render` для заполенения данных и отрисовки формы.


## OrderForm

Класс `OrderForm` отвечает за отображение формы заказов при оформлении заказа. Наследуется от базового класса `Form`. Валидация формы проходит в модели данных, а форма в свою очередь имеет слушатель ORDER_ERRORS для отрисовки ошибок валидации.

```
protected _paymentButtons: HTMLButtonElement[]; - элемент массива кнопок отвечающих за способ оплаты
protected _addressInput: HTMLInputElement; - элемент поля ввода для адреса доставки
private _payment: 'online' | 'cash' | undefined; - выбранный тип оплаты
```

`set payment(value: 'online' | 'cash' | undefined)` - сеттер устанавливает тип оплаты в зависимости от нажатой кнопки.

`get payment(): 'online' | 'cash' | undefined`  - геттер возвращает выбранный тип оплаты.

`get address(): string` - геттер для получения адреса доставки.

`set address(value: string)` - сеттер устанавливает адрес доставки.

Наследуемый метод `render` для заполенения данных и отрисовки формы.

## SuccessMessage

Класс `SuccessMessage` отвечает за отображение сообщения, оповещающего об успешном заказе. В окне указвыаются данные полученные от сервера (сумма заказа). Наследуется от базового компонента. Имеет внутренний интерфейс класса расширяющий интерфейс IOrderResult:

```
interface SuccessData extends IOrderResult {
    description: string;
}
```

`set description(value: string)` - сеттер устанавливающий в сообщение текст с суммой заказа.

Наследуемый метод `render` для заполенения данных и отрисовки сообщения.

## Gallery

Класс `Gallery` отвечает за отрисовку каталога товаров. Наследуется от базового компонента, есть собственный интерфейс:

```
interface GalleryData {
    items: HTMLElement[];
}
```

`set items(items: HTMLElement[])` - сеттер устанавливает карточки товара в каталоге.

Наследуемый метод `render` для заполенения данных и отрисовки каталога.

## Header

Класс `Header` отвечает за оглавление сайта, обработку кнопки открытия корзины и счетчика товаров в корзине. Имеет `set counter`, который устанавливает текст с количеством товаров в корзине в элемент и `render` для отрисовки.

## Presenter

`App` главный класс презентера. Инициализирует модель и представления, управляет обработчиками событий, кординирует взаимодействие между компонентами.

```
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
```

Инициализация:

```
this.events = new EventEmitter(); - инициализация брокера событий
this.api = new Api(API_URL); - инициализация api с URL WebLarek
this.model = new Model(this.events); - инициализация модели данных

initViews(); - инициализация слоя view
initModelHandlers(); - инициализация слушателей событий от модели данных
initEventHandlers(); - инициализация слушателей событий от представления
loadProducts(); - инициализация товаров в модель данных (запрос к api и вызов метода модели setProducts)
```

Презентер имеет следующие методы:

`renderProducts` - для вывода товаров в каталог

`openProductPreview` - для открытия подробного описания товара

`updateBasketCounter` - для обновления счетчика товаров в корзине

`renderBasket` - для отрисовки товаров в корзине

`openOrderForm` и `openContactsForm` - для открытия форм контактов и заказа

`processOrder` - для обработки заказа, отправки на сервер

`showSuccess` - для показа окна успешного заказа

`App` реагирует на события поступаемые от компонентов слоя view, использует методы модели данных и слушает события генерируемые моделью. В случае изменения данных использует методы представления для перерисовки элементов DOM.

## Точка входа

Точкой входа в приложение является index.ts в корне, который инициализирует экземпляр класса `App`.


## Типы данных

IProduct - описание товара:
```
export interface IProduct {
    id: string;
    title: string;
    description?: string;
    image: string;
    category: string;
    price: number | null;
}
```

IBasketItem - товар в корзине с порядковым номером:
```
export interface IBasketItem {
    product: IProduct;
    index: number;
}
```

IOrder - интерфейс заказа:
```
export interface IOrder {
    payment: 'online' | 'cash';
    address: string;
    email: string;
    phone: string;
}
```

IOrderResult - интерфейс результата запроса по заказу:
```
export interface IOrderResult {
    id: string;
    total: number;
}
```

ApiResponse - типизация ответа апи
```
export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};
```


## Взаимодейтсвие компонентов

Инициализация: `App` создает экземпляры `Model` и всех представлений

Загрузка товаров: `App` вызывает `model.loadProducts()`, затем обновляет представление

Действия пользователя:

Клик по товару -> `Card` -> `App.openProductPreview()`

Добавление в корзину -> `App` -> `model.addToBasket()`

Удаление из корзины -> `App` -> `model.removeFromBasket()`

Оформление заказа -> `OrderForm` -> `App.processOrder()`

Обновление UI: При изменении данных в модели, презентер обновляет представления

# Паттерны

MVP - основная архитектура

Observer - обработка событий

# Размещение в сети

Рабочая версия приложения доступна по адресу:  https://krwcw.github.io/web-larek-frontend/

