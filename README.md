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

## Model

Отвечает за хранение данных, их модификацию и взаимодействие с сервером.

`AppState` - центральный класс модели, управляет состоянием приложения:

```
products: IProduct[] - список товаров

basket: IProduct[] - товары в корзине

order: IOrder - данные заказа
```

Методы: 

```
loadProducts()

addToBasket()

removeFromBasket()

submitOrder() 
```
и др.

# Ключевые типы данных

Типы данных:

IProduct - описание товара:

```
interface IProduct {
    id: string;
    title: string;
    description?: string;
    image: string;
    category: string;
    price: number | null;
}
```

IBasketItem - товар в корзине с индексом:

```
interface IBasketItem {
    product: IProduct;
    index: number;
}
```

IOrder - данные заказа:

```
interface IOrder {
    payment: 'online' | 'cash';
    address: string;
    email: string;
    phone: string;
    items: string[];
    total: number;
}
```

## View

Отвечает за отображение данных и взаимодействие с пользователем. Все классы представлений наследуются от базового класса View.

Классы:

`View` - базовый класс для всех представлений

Содержит общие методы: 
```
setText(), setImage(), setDisabled(), toggleClass()
```

`Card` - отображение карточки товара

`Basket` - отображение корзины товаров

`Modal` - управление модальными окнами

`OrderForm` - форма оформления заказа

`ContactsForm` - форма контактных данных

`SuccessMessage` - сообщение об успешном заказе


## Presenter

Связывает модель и представление, обрабатывает пользовательские действия и управляет бизнес-логикой.

`App` - главный класс презентера. Инициализирует модель и представления, управляет обработчиками событий, кординирует взаимодействие между компонентами.

## Взаимодейтсвие компонентов

Инициализация: `App` создает экземпляры `AppState` и всех представлений

Загрузка товаров: `App` вызывает `model.loadProducts()`, затем обновляет представление

Действия пользователя:

Клик по товару -> `Card` -> `App.openProductPreview()`

Добавление в корзину -> `App` -> `model.addToBasket()`

Оформление заказа -> `OrderForm` -> `App.processOrder()`

Обновление UI: При изменении данных в модели, презентер обновляет представления

# Паттерны

MVP - основная архитектура
Observer - обработка событий

# Размещение в сети

Рабочая версия приложения доступна по адресу:  https://krwcw.github.io/web-larek-frontend/

