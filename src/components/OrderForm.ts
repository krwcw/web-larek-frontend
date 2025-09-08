import { EventEmitter } from './base/events';
import { ensureElement, ensureAllElements } from '../utils/utils';
import { IOrder } from '../types';
import { Form } from './base/Form';

export class OrderForm extends Form<IOrder> {
    protected _paymentButtons: HTMLButtonElement[];
    protected _addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);

        this._paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);

        // Обработчики способов оплаты
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this._paymentButtons.forEach(btn => {
                    btn.classList.remove('button_active');
                    btn.classList.remove('button_alt-active');
                });
                
                button.classList.add('button_active');
                button.classList.add('button_alt-active');
                this.validateForm();
            });
        });
        
        // Обработчик изменения адреса
        this._addressInput.addEventListener('input', () => {
            this.validateForm();
        });
    }

    validateForm(): boolean {
        const errors: string[] = [];
        const address = this._addressInput.value.trim();
        
        // Проверка адреса
        if (address.length < 5) {
            errors.push('Адрес должен содержать не менее 5 символов');
        }
        
        // Проверка способа оплаты
        const paymentSelected = Array.from(this._paymentButtons).some(btn => 
            btn.classList.contains('button_active')
        );
        
        if (!paymentSelected) {
            errors.push('Выберите способ оплаты');
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

    get payment(): Partial<IOrder> {
        const selectedPayment = Array.from(this._paymentButtons).find(btn => 
            btn.classList.contains('button_active')
        )?.name as 'online' | 'cash';
        
        return {
            payment: selectedPayment
        }
    }

    get address(): Partial<IOrder> {
        return this._addressInput.value.trim()
    };


    render(data: Partial<IOrder>): HTMLElement {
        super.render(data);
        
        // Установить выбранный способ оплаты
        this._paymentButtons.forEach(button => {
            const isActive = button.name === data.payment;
            button.classList.toggle('button_active', isActive);
            button.classList.toggle('button_alt-active', isActive);
        });
        
        // Установить адрес
        if (data.address) {
            this._addressInput.value = data.address;
        }
        
        this.validateForm();
        return this.container;
    }
}