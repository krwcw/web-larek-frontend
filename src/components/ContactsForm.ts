import { EventEmitter, Events } from './base/events';
import { ensureElement } from '../utils/utils';
import { Form } from './base/Form';
import { IOrder } from '../types';

export class ContactsForm extends Form<IOrder> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);

        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);

        this._phoneInput.addEventListener('input', (e) => {
            const input = e.target as HTMLInputElement;
            let value = input.value.replace(/\D/g, '');
            
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            if (value.length > 0) {
                if (!value.startsWith('7')) {
                    value = '7' + value;
                    if (value.length > 11) value = value.substring(0, 11);
                }
                
                let formatted = '+7';
                if (value.length > 1) formatted += ` (${value.substring(1, 4)}`;
                if (value.length > 4) formatted += `) ${value.substring(4, 7)}`;
                if (value.length > 7) formatted += `-${value.substring(7, 9)}`;
                if (value.length > 9) formatted += `-${value.substring(9, 11)}`;
                
                input.value = formatted;
            }
        });

        this._emailInput.addEventListener('input', () => {
            this.events.emit(Events.ORDER_UPDATE, { 
                email: this._emailInput.value 
            });
        });

        this._phoneInput.addEventListener('input', () => {
            this.events.emit(Events.ORDER_UPDATE, { 
                phone: this._phoneInput.value 
            });
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(Events.ORDER_UPDATE, {
                email: this.email,
                phone: this.phone
            });
            this.events.emit(Events.CONTACTS_SUBMIT);
        });

        this.events.on(Events.ORDER_ERRORS, (errors: { [field in keyof IOrder]?: string }) => {
            const errorMessages = [];
            if (errors.email) errorMessages.push(errors.email);
            if (errors.phone) errorMessages.push(errors.phone);
            this.errors = errorMessages.join('. ');
            this.valid = errorMessages.length === 0;
        });
    }

    set email(value: string) {
        this._emailInput.value = value;
    }

    set phone(value: string) {
        this._phoneInput.value = value;
    }

    render(state: Partial<IOrder> & { valid: boolean; errors: string }): HTMLFormElement {
        super.render(state);
        return this.container;
    }
}