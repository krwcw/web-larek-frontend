import { Component } from './base/Component';
import { IOrder } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement, ensureAllElements } from '../utils/utils';

export class OrderForm extends Component {
    private paymentButtons: HTMLButtonElement[];
    private addressInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;

    constructor(container: HTMLElement, private events: EventEmitter) {
        super(container);
        this.paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);

        this.setHandlers();
    }

    // Отрисовать форму заказа
    render(order: Partial<IOrder>): void {
        // Установить выбранный способ оплаты
        this.paymentButtons.forEach(button => {
            this.toggleClass(button, 'button_active', button.name === order.payment);
            this.toggleClass(button, 'button_alt-active', button.name === order.payment);
        });
        
        // Установить адрес
        if (order.address) {
            this.addressInput.value = order.address;
        }
        
        // Сбрасываем ошибки при открытии формы
        this.hideErrors();
        this.validateForm();
    }

    // Валидация формы
    validateForm(): boolean {
        const errors: string[] = [];
        const address = this.addressInput.value.trim();
        
        // Проверка адреса
        if (address.length < 5) {
            errors.push('Адрес должен содержать не менее 5 символов');
        }
        
        // Проверка способа оплаты
        const paymentSelected = Array.from(this.paymentButtons).some(btn => 
            btn.classList.contains('button_active')
        );
        
        if (!paymentSelected) {
            errors.push('Выберите способ оплаты');
        }
        
        // Показать ошибки
        if (errors.length > 0) {
            this.showErrors(errors);
            this.setDisabled(this.submitButton, true);
            return false;
        } else {
            this.hideErrors();
            this.setDisabled(this.submitButton, false);
            return true;
        }
    }

    // Установить обработчики событий
    private setHandlers(): void {
        // Обработчики способов оплаты
        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.paymentButtons.forEach(btn => {
                    this.toggleClass(btn, 'button_active', false);
                    this.toggleClass(btn, 'button_alt-active', false);
                });
                
                this.toggleClass(button, 'button_active', true);
                this.toggleClass(button, 'button_alt-active', true);
                this.validateForm();
            });
        });
        
        // Обработчик изменения адреса
        this.addressInput.addEventListener('input', () => {
            this.validateForm();
        });

        // Обработчик отправки формы
        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this.validateForm()) {
                this.events.emit('order:submit:step1', this.getFormData());
            }
        });
    }

    // Получить данные формы
    getFormData(): Partial<IOrder> {
        const selectedPayment = Array.from(this.paymentButtons).find(btn => 
            btn.classList.contains('button_active')
        )?.name as 'online' | 'cash';
        
        return {
            payment: selectedPayment,
            address: this.addressInput.value.trim()
        };
    }

    // Показать ошибки
    private showErrors(errors: string[]): void {
        this.errorsContainer.textContent = errors.join('. ');
        this.show(this.errorsContainer);
    }

    // Скрыть ошибки
    private hideErrors(): void {
        this.errorsContainer.textContent = '';
        this.hide(this.errorsContainer);
    }
}