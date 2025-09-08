import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';
import { Form, IForm } from './base/Form';
import { IOrder } from '../types';

export class ContactsForm extends Form<IOrder> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);

        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);

        // Маска для телефона
        this._phoneInput.addEventListener('input', (e) => {
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
        this._emailInput.addEventListener('input', () => this.validateForm());
        this._phoneInput.addEventListener('input', () => this.validateForm());
    }

    validateForm(): boolean {
        const errors: string[] = [];
        const email = this._emailInput.value.trim();
        const phone = this._phoneInput.value.trim();
        
        // Проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Введите корректный email');
        }
        
        // Проверка телефона
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length !== 11 || !phoneDigits.startsWith('7')) {
            errors.push('Введите телефон в формате +7 (XXX) XXX-XX-XX');
        }
        
        // Показать ошибки
        if (errors.length > 0) {
            this.errors = errors.join('. ');
            this.valid = false;
            return false;
        } else {
            this.errors = '';
            this.valid = true;
            return true;
        }
    }

    get email(): Partial<IOrder> {
        return this._emailInput.value.trim()
    }

    get phone(): Partial<IOrder> {
        return this._phoneInput.value.replace(/\D/g, '')
    }

    render(data: Partial<IOrder> & IForm): HTMLElement {
        // Вызываем render базового класса
        super.render(data);

        // Устанавливаем значения в DOM элементы
        if (data.email !== undefined) {
            this._emailInput.value = data.email;
        }
        if (data.phone !== undefined) {
            this._phoneInput.value = data.phone;
        }

        // Валидируем форму
        this.validateForm();

        return this.container;
    }
}