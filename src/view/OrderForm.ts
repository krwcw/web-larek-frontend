import { View } from './View';
import { IOrder } from '../types';

export class OrderForm extends View {
    private paymentButtons: NodeListOf<HTMLButtonElement>;
    private addressInput: HTMLInputElement;
    private submitButton: HTMLButtonElement;
    private errorsContainer: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.paymentButtons = this.container.querySelectorAll('.button_alt');
        this.addressInput = this.container.querySelector('input[name="address"]') as HTMLInputElement;
        this.submitButton = this.container.querySelector('button[type="submit"]') as HTMLButtonElement;
        this.errorsContainer = this.container.querySelector('.form__errors') as HTMLElement;
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
        this.validateForm();
        this.hideErrors();

    }

    // Валидация формы
    validateForm(): boolean {
        const errors: string[] = [];
        const address = this.addressInput.value.trim();
        
        // Проверка адреса
        if (address.length < 5) {
            errors.push('Необходимо указать адрес');
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
    setHandlers(): void {
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