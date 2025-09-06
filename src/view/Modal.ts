/**
 * Представление модального окна - отвечает за отображение и управление модальными окнами
 */
import { View } from './View';

export class Modal extends View {
    private closeButton: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);
        this.closeButton = this.container.querySelector('.modal__close') as HTMLButtonElement;
        
        this.closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) {
                this.close();
            }
        });
    }

    // Открыть модальное окно
    open(): void {
        this.container.classList.add('modal_active');
    }

    // Закрыть модальное окно
    close(): void {
        this.container.classList.remove('modal_active');
    }

    // Установить содержимое
    setContent(content: HTMLElement): void {
        const contentContainer = this.container.querySelector('.modal__content');
        contentContainer.innerHTML = '';
        contentContainer.appendChild(content);
    }
}