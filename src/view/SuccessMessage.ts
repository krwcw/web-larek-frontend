import { View } from './View';
import { IOrderResult } from '../types';

export class SuccessMessage extends View {
    private title: HTMLElement;
    private description: HTMLElement;
    private closeButton: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);
        this.title = this.container.querySelector('.order-success__title');
        this.description = this.container.querySelector('.order-success__description');
        this.closeButton = this.container.querySelector('.order-success__close');
    }

    // Отрисовать сообщение
    render(result: IOrderResult): void {
        this.setText(this.description, `Списано ${result.total} синапсов`);
    }

    // Установить обработчик закрытия
    setCloseHandler(handler: () => void): void {
        this.closeButton.addEventListener('click', handler);
    }
}