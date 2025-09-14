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
                
                // Отправляем событие обновления
                this.events.emit(Events.ORDER_UPDATE, { 
                    payment: this._payment 
                });
            });
        });
        
        // валидация ввода адреса
        this._addressInput.addEventListener('input', () => {
            this.events.emit(Events.ORDER_UPDATE, { 
                address: this._addressInput.value 
            });
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(Events.ORDER_UPDATE, {
                payment: this.payment,
                address: this.address
            });
            this.events.emit(Events.ORDER_SUBMIT);
        });

        this.events.on(Events.ORDER_ERRORS, (errors: { [field in keyof IOrder]?: string }) => {
            const errorMessages = [];
            if (errors.address) errorMessages.push(errors.address);
            if (errors.payment) errorMessages.push(errors.payment);
            this.errors = errorMessages.join('. ');
            this.valid = errorMessages.length === 0;
        });
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

    render(state: Partial<IOrder> & { valid: boolean; errors: string }): HTMLFormElement {
        super.render(state);
        return this.container;
    }
}