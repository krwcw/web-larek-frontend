import { EventEmitter } from './events';
import { ensureElement } from '../../utils/utils';
import { Component } from './Component';

export class Modal extends Component {
    private closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, private events: EventEmitter) {
        super(container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        
        this.closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (event) => {
            if (event.target === this.container) {
                this.close();
            }
        });

        // Подписка на события закрытия
        events.on('modal:close', this.close.bind(this));
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
        const contentContainer = ensureElement<HTMLElement>('.modal__content', this.container);
        contentContainer.innerHTML = '';
        contentContainer.appendChild(content);
    }
}