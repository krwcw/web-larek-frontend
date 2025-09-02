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

## 1. Класс `Component`

Базовый класс для всех UI компонентов. Реализует основные методы работы с DOM:

```
setText() - установка текста элемента

setImage() - установка изображения

setDisabled() - управление состоянием disabled

toggleClass() - управление CSS классами
```

## 2. Класс `Modal`

Базовый класс модального окна. Управляет открытием и закрытием модальных окон, обработкой кликов вне области, устанавливает контент внутри модального окна.

```
open() - открыть модальное окно

close() - закрыть модальное окно

setContent() - установить содержание модального окна

handeOutsideClick() - обработчик кликов снаружи
```

## 3. Класс `Card`

Класс, отображающий карточку товара в каталоге. Генерирует событие `card:click` при клике.

## 4. Класс `Basket`

Класс, отображающий список товаров в корзине, общую сумму и кнопку оформления заказа. Отвечает за создание элемента товара в корзине.

```
protected createBasketItem(item: IBasketItem): HTMLLIElement

```

## 5. Класс `ProductPreview`

Класс, отображающий детальную информацию о товаре, а так же кнопку добавить/удалить из корзины

## 6. Класс `OrderForm` - Форма заказа

Первый шаг оформления: выбор способа оплаты и адреса доставки.

## 7. Класс  `ContactsForm` - Форма контактов

Второй шаг оформления: ввод email и телефона с валидацией.


# Ключевые события

```
'card:click'        // Клик по карточке товара
'basket:add'        // Добавление товара в корзину  
'basket:remove'     // Удаление товара из корзины
'order:open'        // Открытие формы заказа
'order:success'     // Успешное оформление заказа
```
# Ключевые типы данных

```
// Товар
interface IProduct {
    id: number;
    title: string;
    price: number | null;
    category: string;
    image: string;
    description?: string;
}

// Элемент корзины
interface IBasketItem {
    product: IProduct;
    index: number;
}

// Заказ
interface IOrder {
    payment: 'online' | 'cash';
    address: string;
    email: string;
    phone: string;
    total: number;
    items: string[];
}

// Ответы API
interface IOrderResponse {
    id: string;
    total: number;
}

interface IProductsResponse {
    total: number;
    items: IProduct[];
}
```

# Размещение в сети

Рабочая версия приложения доступна по адресу: 

