import { View } from './View';
import { IOrder } from '../types';

export class ContactsForm extends View {
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.emailInput = this.container.querySelector('input[name="email"]') as HTMLInputElement;
        this.phoneInput = this.container.querySelector('input[name="phone"]') as HTMLInputElement;
        this.submitButton = this.container.querySelector('button[type="submit"]') as HTMLButtonElement;
        this.errorsContainer = this.container.querySelector('.form__errors') as HTMLElement;
    }

    // Отрисовать форму контактов
    render(order: Partial<IOrder>): void {
        if (order.email) this.emailInput.value = order.email;
        if (order.phone) this.phoneInput.value = order.phone;
        
        // Сбрасываем ошибки при открытии формы
        this.validateForm();
        this.hideErrors();

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
    setHandlers(): void {
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
    }

    // Получить данные формы
    getFormData(): Partial<IOrder> {
        return {
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.replace(/\D/g, '') // Сохраняем только цифры
        };
    }

    // Установить обработчик отправки формы
    setSubmitHandler(handler: (event: SubmitEvent) => void): void {
        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            if (this.validateForm()) {
                handler(event);
            }
        });
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