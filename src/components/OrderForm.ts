import { EventEmitter, Events } from './base/events';
import { ensureElement, ensureAllElements } from '../utils/utils';
import { IOrder } from '../types';
import { Form } from './base/Form';

export class OrderForm extends Form<IOrder> {
    protected _paymentButtons: HTMLButtonElement[];
    protected _addressInput: HTMLInputElement;
    private _payment: 'online' | 'cash' | undefined;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);

        this._paymentButtons = ensureAllElements<HTMLButtonElement>('.button_alt', container);
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);

        // обработчик кнопки способа оплаты
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this._paymentButtons.forEach(btn => {
                    btn.classList.remove('button_active');
                    btn.classList.remove('button_alt-active');
                });
                
                button.classList.add('button_active');
                button.classList.add('button_alt-active');
                this._payment = button.name as 'online' | 'cash';
                this.validateForm();
            });
        });
        
        // валидация ввода адреса
        this._addressInput.addEventListener('input', () => {
            this.validateForm();
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.events.emit(Events.ORDER_SUBMIT);
            }
        });
    }

    validateForm(): boolean {
        const errors: string[] = [];
        const address = this.address;
        
        if (!address || address.length < 5) {
            errors.push('Необходимо указать адрес');
        }
        
        if (!this.payment) {
            errors.push('Выберите способ оплаты');
        }
        
        this.errors = errors.join('. ');
        this.valid = errors.length === 0;
        
        return this.valid;
    }

    get payment(): 'online' | 'cash' | undefined {
        return this._payment;
    }

    set payment(value: 'online' | 'cash' | undefined) {
        this._payment = value;
        if (value) {
            this._paymentButtons.forEach(button => {
                const isActive = button.name === value;
                button.classList.toggle('button_active', isActive);
                button.classList.toggle('button_alt-active', isActive);
            });
        } else {
            this._paymentButtons.forEach(button => {
                button.classList.remove('button_active');
                button.classList.remove('button_alt-active');
            });
        }
    }

    get address(): string {
        return this._addressInput.value.trim();
    }

    set address(value: string) {
        this._addressInput.value = value;
    }

    getFormData(): Partial<IOrder> {
        return {
            payment: this.payment,
            address: this.address
        };
    }

    render(state: Partial<IOrder> & { valid: boolean; errors: string }): HTMLFormElement {
        super.render(state);
        this.validateForm();
        return this.container;
    }
}