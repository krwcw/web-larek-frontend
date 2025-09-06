/**
 * Базовый класс представления - отвечает за работу с DOM элементами
 * Содержит общие методы для работы с элементами
 */
export class View {
    protected container: HTMLElement;

    constructor(container: HTMLElement | string) {
        if (typeof container === 'string') {
            this.container = document.querySelector(container) as HTMLElement;
        } else {
            this.container = container;
        }
    }

    // Публичный геттер для доступа к контейнеру извне
    get element(): HTMLElement {
        return this.container;
    }

    // Установить текст элемента
    setText(element: HTMLElement, text: string): void {
        element.textContent = text;
    }

    // Установить изображение
    setImage(element: HTMLImageElement, src: string, alt: string): void {
        element.src = src;
        element.alt = alt;
    }

    // Установить состояние disabled
    setDisabled(element: HTMLElement, state: boolean): void {
        if (state) {
            element.setAttribute('disabled', 'true');
        } else {
            element.removeAttribute('disabled');
        }
    }

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, state: boolean): void {
        element.classList.toggle(className, state);
    }

    // Скрыть элемент
    hide(element: HTMLElement): void {
        element.style.display = 'none';
    }

    // Показать элемент
    show(element: HTMLElement): void {
        element.style.display = '';
    }
}