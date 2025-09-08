import { Component } from './base/Component';
import { IOrder } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

export class ContactsForm extends Component {
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;

    constructor(container: HTMLElement, private events: EventEmitter) {
        super(container);
        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);

        this.setHandlers();
    }

    // Отрисовать форму контактов
    render(order: Partial<IOrder>): void {
        if (order.email) this.emailInput.value = order.email;
        if (order.phone) this.phoneInput.value = order.phone;
        
        // Сбрасываем ошибки при открытии формы
        this.hideErrors();
        this.validateForm();
    }

    // Валидация формы
    validateForm(): boolean {
        const errors: string[] = [];
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        
        // Проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Введите корректный email');
        }
        
        // Проверка телефона - теперь проверяем только цифры
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
            errors.push('Введите телефон в формате +7 (XXX) XXX-XX-XX');
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
        // Маска для телефона с ограничением длины
        this.phoneInput.addEventListener('input', (e) => {
            const input = e.target as HTMLInputElement;
            let value = input.value.replace(/\D/g, '');
            
            // Ограничиваем длину до 11 цифр (7XXXXXXXXXX)
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            // Форматируем только если есть цифры
            if (value.length > 0) {
                // Убеждаемся, что номер начинается с 7
                if (!value.startsWith('7')) {
                    value = '7' + value;
                    if (value.length > 11) value = value.substring(0, 11);
                }
                
                // Форматируем номер
                let formatted = '+7';
                if (value.length > 1) formatted += ` (${value.substring(1, 4)}`;
                if (value.length > 4) formatted += `) ${value.substring(4, 7)}`;
                if (value.length > 7) formatted += `-${value.substring(7, 9)}`;
                if (value.length > 9) formatted += `-${value.substring(9, 11)}`;
                
                input.value = formatted;
            }
            
            this.validateForm();
        });
        
        // Валидация при вводе
        this.emailInput.addEventListener('input', () => this.validateForm());
        this.phoneInput.addEventListener('input', () => this.validateForm());

        // Обработчик отправки формы
        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this.validateForm()) {
                this.events.emit('order:submit:step2', this.getFormData());
            }
        });
    }

    // Получить данные формы
    getFormData(): Partial<IOrder> {
        return {
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.replace(/\D/g, '')
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